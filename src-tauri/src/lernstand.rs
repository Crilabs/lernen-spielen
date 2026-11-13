//! Lernstand-Dateien: je Spiel eine JSON-Datei mit `.bak`-Sicherung.

use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};

fn pruefe_id(spiel: &str) -> Result<(), String> {
    let ok = (1..=40).contains(&spiel.len())
        && spiel
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-');
    if ok {
        Ok(())
    } else {
        Err(format!("Ungültige Spiel-ID: {spiel:?}"))
    }
}

fn ist_gueltig(text: &str) -> bool {
    serde_json::from_str::<serde_json::Value>(text).is_ok()
}

fn pfad(dir: &Path, spiel: &str, endung: &str) -> PathBuf {
    dir.join(format!("{spiel}.json{endung}"))
}

fn gueltigen_inhalt(datei: &Path) -> Option<String> {
    fs::read_to_string(datei).ok().filter(|t| ist_gueltig(t))
}

pub fn lesen(dir: &Path, spiel: &str) -> Result<Option<String>, String> {
    pruefe_id(spiel)?;
    Ok(gueltigen_inhalt(&pfad(dir, spiel, ""))
        .or_else(|| gueltigen_inhalt(&pfad(dir, spiel, ".bak"))))
}

pub fn schreiben(dir: &Path, spiel: &str, daten: &str) -> Result<(), String> {
    pruefe_id(spiel)?;
    if !ist_gueltig(daten) {
        return Err("Daten sind kein gültiges JSON".to_string());
    }
    let fehler = |e: std::io::Error| e.to_string();
    fs::create_dir_all(dir).map_err(fehler)?;
    let haupt = pfad(dir, spiel, "");
    let tmp = pfad(dir, spiel, ".tmp");
    let schreib = || -> std::io::Result<()> {
        let mut f = File::create(&tmp)?;
        f.write_all(daten.as_bytes())?;
        f.sync_all()?;
        if haupt.exists() {
            fs::rename(&haupt, pfad(dir, spiel, ".bak"))?;
        }
        fs::rename(&tmp, &haupt)
    };
    schreib().map_err(|e| {
        let _ = fs::remove_file(&tmp);
        e.to_string()
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn schreiben_dann_lesen() {
        let d = tempdir().unwrap();
        schreiben(d.path(), "wimmelbild", r#"{"a":1}"#).unwrap();
        assert_eq!(
            lesen(d.path(), "wimmelbild").unwrap(),
            Some(r#"{"a":1}"#.to_string())
        );
    }

    #[test]
    fn zweites_schreiben_legt_bak_an() {
        let d = tempdir().unwrap();
        schreiben(d.path(), "wimmelbild", r#"{"a":1}"#).unwrap();
        schreiben(d.path(), "wimmelbild", r#"{"a":2}"#).unwrap();
        assert_eq!(
            fs::read_to_string(d.path().join("wimmelbild.json")).unwrap(),
            r#"{"a":2}"#
        );
        assert_eq!(
            fs::read_to_string(d.path().join("wimmelbild.json.bak")).unwrap(),
            r#"{"a":1}"#
        );
    }

    #[test]
    fn lesen_faellt_auf_bak_zurueck() {
        let d = tempdir().unwrap();
        fs::write(d.path().join("wimmelbild.json"), "").unwrap();
        fs::write(d.path().join("wimmelbild.json.bak"), r#"{"a":1}"#).unwrap();
        assert_eq!(
            lesen(d.path(), "wimmelbild").unwrap(),
            Some(r#"{"a":1}"#.to_string())
        );
    }

    #[test]
    fn lesen_ignoriert_kaputte_dateien() {
        let d = tempdir().unwrap();
        fs::write(d.path().join("wimmelbild.json"), r#"{"a":"#).unwrap();
        fs::write(d.path().join("wimmelbild.json.bak"), r#"{"a":"#).unwrap();
        assert_eq!(lesen(d.path(), "wimmelbild").unwrap(), None);
    }

    #[test]
    fn unbekanntes_spiel_ist_none() {
        let d = tempdir().unwrap();
        assert_eq!(lesen(d.path(), "neu").unwrap(), None);
    }

    #[test]
    fn ungueltige_id_wird_abgelehnt() {
        let d = tempdir().unwrap();
        for id in ["../x", "A B"] {
            assert!(lesen(d.path(), id).is_err());
            assert!(schreiben(d.path(), id, "{}").is_err());
        }
    }

    #[test]
    fn kaputte_daten_werden_nicht_geschrieben() {
        let d = tempdir().unwrap();
        assert!(schreiben(d.path(), "x", "{").is_err());
        assert!(!d.path().join("x.json").exists());
        assert!(!d.path().join("x.json.tmp").exists());
    }
}
