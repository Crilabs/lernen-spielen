//! Test-Protokoll des Spielfortschritts (docs/testprotokoll.md).
//!
//! Die Seite notiert jeden Eintrag sofort in `testprotokoll.jsonl` im Tagesbrief-Ordner des
//! Profils (nur Anhängen, schnell). Gesendet wird gebündelt an `/protokoll` des Dienstes, mit
//! dem Geräteschlüssel des Tagesbriefs: vor dem Senden wird die Datei in `testprotokoll.senden.jsonl`
//! umbenannt, damit Notieren nie auf das Netz wartet. Ohne Netz bleibt alles liegen.

use serde_json::Value;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

/// Wird die Datei größer, fallen die ältesten Einträge weg (behalten wird die jüngere Hälfte).
const DATEI_MAX_BYTES: u64 = 20_000_000;
/// Höchstens so viele Einträge je Stapel (Dienst: 2000).
const EINTRAEGE_JE_STAPEL: usize = 1000;
/// Höchste Stapelgröße in Bytes (Dienst: 900 KB, Caddy: 1 MB).
const STAPEL_MAX_BYTES: usize = 700_000;

/// Schützt das Anhängen und das Umbenennen vor dem Senden (kurz, nie während einer Anfrage).
static DATEI_SPERRE: Mutex<()> = Mutex::new(());
/// Nur ein Sendevorgang zur Zeit.
static SENDE_SPERRE: Mutex<()> = Mutex::new(());

fn neu_datei(dir: &Path) -> PathBuf {
    dir.join("testprotokoll.jsonl")
}

fn sende_datei(dir: &Path) -> PathBuf {
    dir.join("testprotokoll.senden.jsonl")
}

/// Hängt einen Eintrag an. Wird die Datei zu groß, bleibt nur die jüngere Hälfte.
pub fn notieren(dir: &Path, eintrag: &Value) -> Result<(), String> {
    if !eintrag.is_object() {
        return Err("Eintrag ist kein Objekt".into());
    }
    let zeile = format!("{eintrag}\n");
    let _sperre = DATEI_SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let pfad = neu_datei(dir);
    let mut o = fs::OpenOptions::new();
    o.create(true).append(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        o.mode(0o600);
    }
    let mut f = o.open(&pfad).map_err(|e| e.to_string())?;
    f.write_all(zeile.as_bytes()).map_err(|e| e.to_string())?;
    drop(f);
    if fs::metadata(&pfad).map(|m| m.len()).unwrap_or(0) > DATEI_MAX_BYTES {
        kuerze(&pfad)?;
    }
    Ok(())
}

/// Behält die jüngere Hälfte der Zeilen.
fn kuerze(pfad: &Path) -> Result<(), String> {
    let text = fs::read_to_string(pfad).map_err(|e| e.to_string())?;
    let zeilen: Vec<&str> = text.lines().collect();
    let rest = zeilen[zeilen.len() / 2..].join("\n");
    fs::write(pfad, if rest.is_empty() { rest } else { rest + "\n" }).map_err(|e| e.to_string())
}

/// Nimmt neu notierte Einträge in die Sendedatei (hinten an); kurz unter der Dateisperre.
fn uebernimm(dir: &Path) -> Result<(), String> {
    let _sperre = DATEI_SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let neu = neu_datei(dir);
    if !neu.exists() {
        return Ok(());
    }
    let senden = sende_datei(dir);
    if !senden.exists() {
        return fs::rename(&neu, &senden).map_err(|e| e.to_string());
    }
    let text = fs::read_to_string(&neu).map_err(|e| e.to_string())?;
    let mut f = fs::OpenOptions::new()
        .append(true)
        .open(&senden)
        .map_err(|e| e.to_string())?;
    f.write_all(text.as_bytes()).map_err(|e| e.to_string())?;
    drop(f);
    fs::remove_file(&neu).map_err(|e| e.to_string())
}

/// So viele Zeilen vom Anfang bilden einen Stapel (mindestens eine).
fn stapelgroesse(zeilen: &[&str]) -> usize {
    let mut bytes = 2;
    let mut n = 0;
    for z in zeilen.iter().take(EINTRAEGE_JE_STAPEL) {
        bytes += z.len() + 1;
        if n > 0 && bytes > STAPEL_MAX_BYTES {
            break;
        }
        n += 1;
    }
    n
}

/// Schreibt die noch nicht gesendeten Zeilen zurück (oder löscht die Sendedatei).
fn behalte(pfad: &Path, zeilen: &[&str]) -> Result<(), String> {
    if zeilen.is_empty() {
        return fs::remove_file(pfad).or_else(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                Ok(())
            } else {
                Err(e.to_string())
            }
        });
    }
    let tmp = pfad.with_extension("jsonl.tmp");
    fs::write(&tmp, zeilen.join("\n") + "\n").map_err(|e| e.to_string())?;
    fs::rename(&tmp, pfad).map_err(|e| e.to_string())
}

/// Sendet alles Notierte. Liefert die Zahl der angenommenen Einträge; ohne eingerichteten
/// Tagesbrief passiert nichts (die Einträge bleiben liegen). `Err` nur ohne Verbindung oder
/// bei einem Dateifehler; 401/403/410/429/5xx brechen ab und behalten den Rest.
pub fn senden(dir: &Path, basis: &str) -> Result<usize, String> {
    let _sende = SENDE_SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let Some(schluessel) = crate::tagesbrief::aktiver_schluessel(dir) else {
        return Ok(0);
    };
    uebernimm(dir)?;
    let pfad = sende_datei(dir);
    let text = match fs::read_to_string(&pfad) {
        Ok(t) => t,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(0),
        Err(e) => return Err(e.to_string()),
    };
    // Kaputte Zeilen (z. B. nach einem Absturz mitten im Schreiben) fallen weg.
    let mut zeilen: Vec<&str> = text
        .lines()
        .filter(|z| serde_json::from_str::<Value>(z).is_ok_and(|v| v.is_object()))
        .collect();
    let mut angenommen = 0;
    while !zeilen.is_empty() {
        let n = stapelgroesse(&zeilen);
        let stapel: Value = serde_json::from_str(&format!("[{}]", zeilen[..n].join(",")))
            .map_err(|e| e.to_string())?;
        let status = crate::tagesbrief::protokoll_senden(basis, &schluessel, &stapel);
        match status {
            Ok(200) => {
                angenommen += n;
                zeilen.drain(..n);
            }
            // Ungültiger oder zu großer Stapel: verwerfen, sonst hinge er für immer.
            Ok(400) | Ok(413) => {
                log::warn!("testprotokoll: Stapel mit {n} Einträgen verworfen");
                zeilen.drain(..n);
            }
            Ok(status) => {
                behalte(&pfad, &zeilen)?;
                log::info!("testprotokoll: abgebrochen mit {status}");
                return Ok(angenommen);
            }
            Err(e) => {
                behalte(&pfad, &zeilen)?;
                return Err(e);
            }
        }
        behalte(&pfad, &zeilen)?;
    }
    Ok(angenommen)
}

/// Sendet für alle Profile, die Einträge liegen haben (Zeitgeber der App).
pub fn senden_alle(tagesbrief_wurzel: &Path, basis: &str) {
    let Ok(ordner) = fs::read_dir(tagesbrief_wurzel) else {
        return;
    };
    for o in ordner.flatten() {
        let dir = o.path();
        if neu_datei(&dir).exists() || sende_datei(&dir).exists() {
            let _ = senden(&dir, basis);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tagesbrief::tests::{aktiv, fake, tote_basis};
    use serde_json::json;

    fn zeilen(pfad: &Path) -> Vec<Value> {
        fs::read_to_string(pfad)
            .unwrap_or_default()
            .lines()
            .map(|z| serde_json::from_str(z).unwrap())
            .collect()
    }

    #[test]
    fn notieren_haengt_an() {
        let dir = tempfile::tempdir().unwrap();
        notieren(dir.path(), &json!({"art":"a","t":"1"})).unwrap();
        notieren(dir.path(), &json!({"art":"b","t":"2"})).unwrap();
        let z = zeilen(&neu_datei(dir.path()));
        assert_eq!(z.len(), 2);
        assert_eq!(z[1]["art"], "b");
        assert!(notieren(dir.path(), &json!([1])).is_err());
    }

    #[test]
    fn ohne_tagesbrief_bleibt_alles_liegen() {
        let dir = tempfile::tempdir().unwrap();
        notieren(dir.path(), &json!({"art":"a","t":"1"})).unwrap();
        assert_eq!(senden(dir.path(), &tote_basis()).unwrap(), 0);
        assert_eq!(zeilen(&neu_datei(dir.path())).len(), 1);
    }

    #[test]
    fn ohne_netz_bleibt_alles_und_geht_spaeter_mit() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        notieren(dir.path(), &json!({"art":"a","t":"1"})).unwrap();
        assert!(senden(dir.path(), &tote_basis()).is_err());
        notieren(dir.path(), &json!({"art":"b","t":"2"})).unwrap();

        let (basis, gesehen) = fake(vec![(200, r#"{"angenommen":2}"#)]);
        assert_eq!(senden(dir.path(), &basis).unwrap(), 2);
        let anfrage = gesehen.lock().unwrap()[0].clone();
        assert!(anfrage.starts_with("POST /protokoll"));
        assert!(anfrage.contains("Bearer GEHEIMER-SCHLUESSEL"));
        let a = anfrage.find("\"art\":\"a\"").unwrap();
        let b = anfrage.find("\"art\":\"b\"").unwrap();
        assert!(a < b, "Reihenfolge bleibt");
        assert!(!neu_datei(dir.path()).exists());
        assert!(!sende_datei(dir.path()).exists());
    }

    #[test]
    fn abgelehnt_bleibt_liegen_ungueltig_wird_verworfen() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        notieren(dir.path(), &json!({"art":"a","t":"1"})).unwrap();
        let (basis, _) = fake(vec![(401, r#"{"fehler":"schluessel"}"#)]);
        assert_eq!(senden(dir.path(), &basis).unwrap(), 0);
        assert_eq!(zeilen(&sende_datei(dir.path())).len(), 1);
        // Tagesbrief-Zustand bleibt unberührt
        assert!(crate::tagesbrief::aktiver_schluessel(dir.path()).is_some());

        let (basis, _) = fake(vec![(400, r#"{"fehler":"ungueltig"}"#)]);
        assert_eq!(senden(dir.path(), &basis).unwrap(), 0);
        assert!(!sende_datei(dir.path()).exists());
    }

    #[test]
    fn grosse_mengen_gehen_in_mehreren_stapeln() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let gross = "x".repeat(300_000);
        for i in 0..3 {
            notieren(
                dir.path(),
                &json!({"art":"stand","t":"1","i":i,"daten":gross}),
            )
            .unwrap();
        }
        let (basis, gesehen) = fake(vec![(200, "{}"), (200, "{}"), (200, "{}")]);
        assert_eq!(senden(dir.path(), &basis).unwrap(), 3);
        let g = gesehen.lock().unwrap();
        assert!(g.len() >= 2);
        assert!(g.iter().all(|a| a.len() < 900_000));
    }

    #[test]
    fn kaputte_zeilen_fallen_weg() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        fs::write(
            neu_datei(dir.path()),
            "{\"art\":\"a\",\"t\":\"1\"}\n{\"art\":\"b\n",
        )
        .unwrap();
        let (basis, gesehen) = fake(vec![(200, "{}")]);
        assert_eq!(senden(dir.path(), &basis).unwrap(), 1);
        assert!(!gesehen.lock().unwrap()[0].contains("\"b"));
    }

    #[test]
    fn zu_grosse_datei_behaelt_die_juengere_haelfte() {
        let dir = tempfile::tempdir().unwrap();
        let pfad = neu_datei(dir.path());
        let text: String = (0..10).map(|i| format!("{{\"i\":{i}}}\n")).collect();
        fs::write(&pfad, text).unwrap();
        kuerze(&pfad).unwrap();
        let z = zeilen(&pfad);
        assert_eq!(z.len(), 5);
        assert_eq!(z[0]["i"], 5);
    }

    #[test]
    fn senden_alle_findet_profile_mit_eintraegen() {
        let wurzel = tempfile::tempdir().unwrap();
        let profil = wurzel.path().join("kind-1");
        aktiv(&profil);
        notieren(&profil, &json!({"art":"a","t":"1"})).unwrap();
        fs::create_dir_all(wurzel.path().join("leer")).unwrap();
        let (basis, gesehen) = fake(vec![(200, "{}")]);
        senden_alle(wurzel.path(), &basis);
        assert_eq!(gesehen.lock().unwrap().len(), 1);
        assert!(!neu_datei(&profil).exists());
    }
}
