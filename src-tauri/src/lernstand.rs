//! Lernstand-Dateien: je Spiel eine JSON-Datei mit `.bak`-Sicherung.

use std::fs::{self, File};
use std::io::{ErrorKind, Write};
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

/// Inhalt einer Lernstand-Datei, wenn sie gültiges JSON enthält.
/// `Ok(None)`: Datei fehlt oder ist kaputt (kein JSON, kein UTF-8).
/// `Err`: Datei ist da, lässt sich aber nicht lesen (gesperrt, keine Rechte, …).
/// Dann darf niemand so tun, als gäbe es keinen Lernstand.
fn gueltigen_inhalt(datei: &Path) -> std::io::Result<Option<String>> {
    match fs::read_to_string(datei) {
        Ok(t) => Ok(Some(t).filter(|t| ist_gueltig(t))),
        Err(e) if matches!(e.kind(), ErrorKind::NotFound | ErrorKind::InvalidData) => Ok(None),
        Err(e) => Err(e),
    }
}

/// Ordner für Profil (`dir/<profil>/`) oder Gerät (`dir/`). Kein Rückgriff dazwischen.
fn ordner(dir: &Path, profil: Option<&str>) -> Result<PathBuf, String> {
    match profil {
        Some(p) => {
            pruefe_id(p)?;
            Ok(dir.join(p))
        }
        None => Ok(dir.to_path_buf()),
    }
}

pub fn lesen(dir: &Path, profil: Option<&str>, spiel: &str) -> Result<Option<String>, String> {
    pruefe_id(spiel)?;
    let dir = &ordner(dir, profil)?;
    let fehler = |e: std::io::Error| format!("Lernstand {spiel} nicht lesbar: {e}");
    if let Some(t) = gueltigen_inhalt(&pfad(dir, spiel, "")).map_err(fehler)? {
        return Ok(Some(t));
    }
    gueltigen_inhalt(&pfad(dir, spiel, ".bak")).map_err(fehler)
}

pub fn schreiben(dir: &Path, profil: Option<&str>, spiel: &str, daten: &str) -> Result<(), String> {
    pruefe_id(spiel)?;
    let dir = &ordner(dir, profil)?;
    if !ist_gueltig(daten) {
        return Err("Daten sind kein gültiges JSON".to_string());
    }
    let fehler = |e: std::io::Error| e.to_string();
    fs::create_dir_all(dir).map_err(fehler)?;
    let haupt = pfad(dir, spiel, "");
    let tmp = pfad(dir, spiel, ".tmp");
    // Lässt sich die bisherige Hauptdatei nicht lesen, nichts anfassen:
    // sonst würde ein echter Lernstand überschrieben.
    let haupt_gueltig = gueltigen_inhalt(&haupt).map_err(fehler)?.is_some();
    let schreib = || -> std::io::Result<()> {
        let mut f = File::create(&tmp)?;
        f.write_all(daten.as_bytes())?;
        f.sync_all()?;
        if haupt_gueltig {
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
        schreiben(d.path(), None, "wimmelbild", r#"{"a":1}"#).unwrap();
        assert_eq!(
            lesen(d.path(), None, "wimmelbild").unwrap(),
            Some(r#"{"a":1}"#.to_string())
        );
    }

    #[test]
    fn zweites_schreiben_legt_bak_an() {
        let d = tempdir().unwrap();
        schreiben(d.path(), None, "wimmelbild", r#"{"a":1}"#).unwrap();
        schreiben(d.path(), None, "wimmelbild", r#"{"a":2}"#).unwrap();
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
    fn kaputte_hauptdatei_ueberschreibt_bak_nicht() {
        let d = tempdir().unwrap();
        fs::write(d.path().join("wimmelbild.json"), r#"{"a":"#).unwrap();
        fs::write(d.path().join("wimmelbild.json.bak"), r#"{"a":1}"#).unwrap();
        schreiben(d.path(), None, "wimmelbild", r#"{"a":2}"#).unwrap();
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
            lesen(d.path(), None, "wimmelbild").unwrap(),
            Some(r#"{"a":1}"#.to_string())
        );
    }

    #[test]
    fn lesen_ignoriert_kaputte_dateien() {
        let d = tempdir().unwrap();
        fs::write(d.path().join("wimmelbild.json"), r#"{"a":"#).unwrap();
        fs::write(d.path().join("wimmelbild.json.bak"), r#"{"a":"#).unwrap();
        assert_eq!(lesen(d.path(), None, "wimmelbild").unwrap(), None);
    }

    #[test]
    fn unbekanntes_spiel_ist_none() {
        let d = tempdir().unwrap();
        assert_eq!(lesen(d.path(), None, "neu").unwrap(), None);
    }

    #[test]
    fn ungueltige_id_wird_abgelehnt() {
        let d = tempdir().unwrap();
        for id in ["../x", "A B"] {
            assert!(lesen(d.path(), None, id).is_err());
            assert!(schreiben(d.path(), None, id, "{}").is_err());
        }
    }

    #[test]
    fn verzeichnis_statt_datei_ist_fehler() {
        let d = tempdir().unwrap();
        fs::create_dir(d.path().join("wimmelbild.json")).unwrap();
        fs::write(d.path().join("wimmelbild.json.bak"), r#"{"a":1}"#).unwrap();
        assert!(lesen(d.path(), None, "wimmelbild").is_err());
        assert!(schreiben(d.path(), None, "wimmelbild", r#"{"a":2}"#).is_err());
        assert!(d.path().join("wimmelbild.json").is_dir());
        assert_eq!(
            fs::read_to_string(d.path().join("wimmelbild.json.bak")).unwrap(),
            r#"{"a":1}"#
        );
        assert!(!d.path().join("wimmelbild.json.tmp").exists());
    }

    #[test]
    fn kein_utf8_gilt_als_kaputt() {
        let d = tempdir().unwrap();
        fs::write(d.path().join("wimmelbild.json"), [0xff, 0xfe, 0x00]).unwrap();
        fs::write(d.path().join("wimmelbild.json.bak"), r#"{"a":1}"#).unwrap();
        assert_eq!(
            lesen(d.path(), None, "wimmelbild").unwrap(),
            Some(r#"{"a":1}"#.to_string())
        );
    }

    #[cfg(unix)]
    #[test]
    fn unlesbare_hauptdatei_wird_nicht_ueberschrieben() {
        use std::os::unix::fs::PermissionsExt;
        let d = tempdir().unwrap();
        let haupt = d.path().join("wimmelbild.json");
        fs::write(&haupt, r#"{"echt":1}"#).unwrap();
        fs::write(d.path().join("wimmelbild.json.bak"), r#"{"alt":1}"#).unwrap();
        fs::set_permissions(&haupt, fs::Permissions::from_mode(0o000)).unwrap();
        if fs::read_to_string(&haupt).is_ok() {
            return; // läuft als root, Rechte greifen nicht
        }
        assert!(lesen(d.path(), None, "wimmelbild").is_err());
        assert!(schreiben(d.path(), None, "wimmelbild", r#"{"neu":1}"#).is_err());
        fs::set_permissions(&haupt, fs::Permissions::from_mode(0o644)).unwrap();
        assert_eq!(fs::read_to_string(&haupt).unwrap(), r#"{"echt":1}"#);
        assert_eq!(
            fs::read_to_string(d.path().join("wimmelbild.json.bak")).unwrap(),
            r#"{"alt":1}"#
        );
    }

    #[test]
    fn kaputte_daten_werden_nicht_geschrieben() {
        let d = tempdir().unwrap();
        assert!(schreiben(d.path(), None, "x", "{").is_err());
        assert!(!d.path().join("x.json").exists());
        assert!(!d.path().join("x.json.tmp").exists());
    }

    #[test]
    fn profil_und_geraet_getrennt() {
        let d = tempdir().unwrap();
        schreiben(d.path(), Some("kind-1"), "x", r#"{"a":1}"#).unwrap();
        assert!(d.path().join("kind-1").join("x.json").exists());
        assert!(!d.path().join("x.json").exists());
        assert_eq!(lesen(d.path(), None, "x").unwrap(), None);
        assert_eq!(
            lesen(d.path(), Some("kind-1"), "x").unwrap(),
            Some(r#"{"a":1}"#.to_string())
        );
        schreiben(d.path(), None, "eltern", r#"{"b":2}"#).unwrap();
        assert!(d.path().join("eltern.json").exists());
        assert!(!d.path().join("kind-1").join("eltern.json").exists());
        assert_eq!(lesen(d.path(), Some("kind-1"), "eltern").unwrap(), None);
    }

    #[test]
    fn ungueltiges_profil_wird_abgelehnt() {
        let d = tempdir().unwrap();
        for p in ["../x", "A B", ""] {
            assert!(lesen(d.path(), Some(p), "x").is_err());
            assert!(schreiben(d.path(), Some(p), "x", "{}").is_err());
        }
    }
}
