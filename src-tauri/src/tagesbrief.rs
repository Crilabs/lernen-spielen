//! Tagesbrief: Geräteschlüssel, Warteschlange und Aufrufe des Dienstes.
//!
//! Die Logik steckt in freien Funktionen mit Ordner und Basis-URL (testbar gegen einen
//! Fake-Server); die Tauri-Befehle in `lib.rs` sind nur dünne Hüllen.
//! Protokolliert werden nur Befehlsname und HTTP-Status – nie Schlüssel, Adresse oder Inhalte.

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

/// Adresse des Dienstes.
pub const BASIS_URL: &str = "https://lernen-spielen.crilabs.de";
/// Öffentlicher App-Schlüssel (hält nur Bots ab).
const APP_KOPF: &str = "lernen-spielen-1";
/// Obergrenze des Dienstes je Push.
const EREIGNISSE_JE_PUSH: usize = 200;
/// Höchste Größe eines Push-Pakets in Bytes (der Dienst lehnt über 300 KB mit 413 ab).
const PAKET_MAX_BYTES: usize = 250_000;
/// Zeitgrenze für Aufrufe an den Dienst in Sekunden.
const ZEIT_NORMAL: u64 = 15;
/// Zeitgrenze für `/anmelden`: der Dienst wartet dabei auf Graph (bis zu 30 s).
const ZEIT_EINRICHTEN: u64 = 45;
/// Ältere Ereignisse darüber hinaus fallen weg, damit die Datei nicht unbegrenzt wächst.
const WARTESCHLANGE_MAX: usize = 1000;

/// Verhindert, dass zwei Aufrufe gleichzeitig an denselben Dateien arbeiten.
static SPERRE: Mutex<()> = Mutex::new(());

#[derive(Serialize, Deserialize, Clone)]
struct Zustand {
    /// "aus", "wartet", "aktiv", "abbestellt"
    #[serde(default = "aus")]
    zustand: String,
    #[serde(default)]
    adresse: String,
    #[serde(default)]
    uhrzeit: String,
    #[serde(default)]
    name: String,
    #[serde(default)]
    anfrage: String,
    #[serde(default)]
    schluessel: String,
    #[serde(default)]
    nummer: u64,
    /// Zufällige Geräte-Kennung (8 Hex-Zeichen) für die Ereignis-IDs.
    #[serde(default)]
    geraet: String,
}

fn aus() -> String {
    "aus".to_string()
}

impl Default for Zustand {
    fn default() -> Self {
        Self {
            zustand: aus(),
            adresse: String::new(),
            uhrzeit: String::new(),
            name: String::new(),
            anfrage: String::new(),
            schluessel: String::new(),
            nummer: 0,
            geraet: String::new(),
        }
    }
}

fn datei(dir: &Path) -> PathBuf {
    dir.join("tagesbrief.json")
}

fn warteschlange_datei(dir: &Path) -> PathBuf {
    dir.join("tagesbrief-warteschlange.json")
}

/// Ordner für Profil (`tagesbrief/<profil>`) oder Gerät (`tagesbrief/_geraet`), getrennt
/// vom Lernstand-Ordner, damit die Seite den Schlüssel nicht über `lernstand_*` erreicht.
pub fn ordner(app_daten: &Path, profil: Option<&str>) -> Result<PathBuf, String> {
    let name = match profil {
        Some(p) => {
            crate::lernstand::pruefe_id(p)?;
            p
        }
        None => "_geraet",
    };
    Ok(app_daten.join("tagesbrief").join(name))
}

fn lege_ordner_an(ordner: &Path) -> std::io::Result<()> {
    let mut b = fs::DirBuilder::new();
    b.recursive(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::DirBuilderExt;
        b.mode(0o700);
    }
    b.create(ordner)
}

fn schreibe_atomar(pfad: &Path, text: &str) -> Result<(), String> {
    use std::io::Write;
    if let Some(eltern) = pfad.parent() {
        lege_ordner_an(eltern).map_err(|e| e.to_string())?;
    }
    let tmp = pfad.with_extension("json.tmp");
    let mut o = fs::OpenOptions::new();
    o.write(true).create(true).truncate(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        o.mode(0o600);
    }
    let mut f = o.open(&tmp).map_err(|e| e.to_string())?;
    f.write_all(text.as_bytes()).map_err(|e| e.to_string())?;
    drop(f);
    fs::rename(&tmp, pfad).map_err(|e| e.to_string())
}

fn lade(dir: &Path) -> Zustand {
    fs::read_to_string(datei(dir))
        .ok()
        .and_then(|t| serde_json::from_str(&t).ok())
        .unwrap_or_default()
}

fn sichere(dir: &Path, z: &Zustand) -> Result<(), String> {
    schreibe_atomar(
        &datei(dir),
        &serde_json::to_string(z).map_err(|e| e.to_string())?,
    )
}

fn lade_schlange(dir: &Path) -> Vec<Value> {
    fs::read_to_string(warteschlange_datei(dir))
        .ok()
        .and_then(|t| serde_json::from_str(&t).ok())
        .unwrap_or_default()
}

fn sichere_schlange(dir: &Path, liste: &[Value]) -> Result<(), String> {
    schreibe_atomar(
        &warteschlange_datei(dir),
        &serde_json::to_string(liste).map_err(|e| e.to_string())?,
    )
}

fn zufalls_id() -> String {
    use std::hash::{BuildHasher, Hasher};
    let zahl = std::collections::hash_map::RandomState::new()
        .build_hasher()
        .finish();
    format!("{:08x}", zahl as u32)
}

/// Eine Anfrage an den Dienst. `Ok((status, Körper))` auch bei HTTP-Fehlerstatus;
/// `Err` nur, wenn der Dienst nicht erreichbar war. Protokolliert Befehl und Status.
fn anfrage(
    befehl: &str,
    methode: &str,
    url: &str,
    schluessel: Option<&str>,
    body: Option<&Value>,
) -> Result<(u16, Value), String> {
    anfrage_mit_zeit(befehl, methode, url, schluessel, body, ZEIT_NORMAL)
}

/// Wie `anfrage`, mit eigener Zeitgrenze in Sekunden.
fn anfrage_mit_zeit(
    befehl: &str,
    methode: &str,
    url: &str,
    schluessel: Option<&str>,
    body: Option<&Value>,
    zeit_s: u64,
) -> Result<(u16, Value), String> {
    let agent = ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(zeit_s))
        .build();
    let mut req = agent.request(methode, url).set("X-App", APP_KOPF);
    if let Some(s) = schluessel {
        req = req.set("Authorization", &format!("Bearer {s}"));
    }
    let ergebnis = match body {
        Some(b) => req.send_json(b),
        None => req.call(),
    };
    let (status, antwort) = match ergebnis {
        Ok(r) => (r.status(), Some(r)),
        Err(ureq::Error::Status(code, r)) => (code, Some(r)),
        Err(_) => {
            log::warn!("tagesbrief {befehl}: Dienst nicht erreichbar");
            return Err("Dienst nicht erreichbar".to_string());
        }
    };
    log::info!("tagesbrief {befehl}: {status}");
    let json = antwort
        .and_then(|r| r.into_json::<Value>().ok())
        .unwrap_or(Value::Null);
    Ok((status, json))
}

/// Meldet das Gerät an; der Dienst schickt einen Bestätigungslink. Liefert die Anfrage-ID.
pub fn einrichten(
    dir: &Path,
    basis: &str,
    adresse: &str,
    name: &str,
    uhrzeit: &str,
) -> Result<String, String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let (status, antwort) = anfrage_mit_zeit(
        "einrichten",
        "POST",
        &format!("{basis}/anmelden"),
        None,
        Some(&json!({ "adresse": adresse, "name": name, "uhrzeit": uhrzeit })),
        ZEIT_EINRICHTEN,
    )?;
    if status != 200 {
        return Err(format!("Anmeldung nicht möglich (Status {status})"));
    }
    let id = antwort["anfrageId"]
        .as_str()
        .ok_or("Antwort ohne Anfrage-ID")?
        .to_string();
    let alt = lade(dir);
    let neu = Zustand {
        zustand: "wartet".into(),
        adresse: adresse.into(),
        uhrzeit: uhrzeit.into(),
        name: name.into(),
        anfrage: id.clone(),
        schluessel: String::new(),
        nummer: alt.nummer,
        geraet: if alt.geraet.is_empty() {
            zufalls_id()
        } else {
            alt.geraet
        },
    };
    sichere(dir, &neu)?;
    Ok(id)
}

fn status_json(z: &Zustand) -> Value {
    json!({ "zustand": z.zustand, "adresse": z.adresse, "uhrzeit": z.uhrzeit })
}

/// Stand der Einrichtung; im Zustand „wartet“ fragt es den Dienst und speichert einen erhaltenen Schlüssel.
pub fn status(dir: &Path, basis: &str) -> Result<Value, String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let mut z = lade(dir);
    if z.zustand == "wartet" && !z.schluessel.is_empty() {
        // Schlüssel ist schon gesichert (früherer Abruf), nur der Zustand fehlt noch.
        z.zustand = "aktiv".into();
        z.anfrage = String::new();
        sichere(dir, &z)?;
    } else if z.zustand == "wartet" && !z.anfrage.is_empty() {
        let url = format!("{basis}/status?anfrage={}", z.anfrage);
        match anfrage("status", "GET", &url, None, None) {
            Ok((200, k)) if k["bestaetigt"] == true => {
                if let Some(s) = k["schluessel"].as_str() {
                    // Erst den Schlüssel sichern (Dienst gibt ihn nur einmal heraus), dann aktivieren.
                    z.schluessel = s.to_string();
                    sichere(dir, &z)?;
                    z.zustand = "aktiv".into();
                    z.anfrage = String::new();
                    sichere(dir, &z)?;
                } else {
                    // Schlüssel wurde schon abgeholt und ist verloren: neu einrichten.
                    z.zustand = "aus".into();
                    z.anfrage = String::new();
                    sichere(dir, &z)?;
                    let mut antwort = status_json(&z);
                    antwort["hinweis"] = json!("Schluessel verloren, bitte neu einrichten");
                    return Ok(antwort);
                }
            }
            Ok((404, _)) => {
                // Anfrage abgelaufen oder unbekannt: zurück auf „aus“.
                z.zustand = "aus".into();
                z.anfrage = String::new();
                sichere(dir, &z)?;
            }
            _ => {}
        }
    }
    Ok(status_json(&z))
}

/// So viele Ereignisse vom Anfang gehen in ein Paket: höchstens `EREIGNISSE_JE_PUSH` und
/// `PAKET_MAX_BYTES` (mindestens eines, damit die Schlange nie hängt).
fn paketgroesse(schlange: &[Value]) -> usize {
    let mut bytes = 2;
    let mut n = 0;
    for e in schlange.iter().take(EREIGNISSE_JE_PUSH) {
        bytes += e.to_string().len() + 1;
        if n > 0 && bytes > PAKET_MAX_BYTES {
            break;
        }
        n += 1;
    }
    n
}

/// Nimmt Ereignisse (`{art, daten}`) in die Warteschlange und sendet sie. Bleibt der Versand
/// aus, bleiben sie in der Datei und gehen beim nächsten Push mit.
pub fn pushen(dir: &Path, basis: &str, ereignisse: Vec<Value>) -> Result<Value, String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let mut z = lade(dir);
    match z.zustand.as_str() {
        "aktiv" => {}
        "abbestellt" => return Ok(json!({ "zustand": "abbestellt" })),
        _ => return Ok(json!({ "verschickt": [] })),
    }
    let mut schlange = lade_schlange(dir);
    for mut e in ereignisse {
        z.nummer += 1;
        if let Some(o) = e.as_object_mut() {
            o.insert("id".into(), json!(format!("{}-{}", z.geraet, z.nummer)));
        }
        // Der Dienst behält nur das letzte „naechstes“; ältere (mit Foto) würden nur das Paket sprengen.
        if e["art"] == "naechstes" {
            schlange.retain(|alt| alt["art"] != "naechstes");
        }
        schlange.push(e);
    }
    if schlange.len() > WARTESCHLANGE_MAX {
        schlange.drain(..schlange.len() - WARTESCHLANGE_MAX);
    }
    sichere(dir, &z)?;
    sichere_schlange(dir, &schlange)?;

    let mut letzte = json!({ "verschickt": [] });
    while !schlange.is_empty() {
        let n = paketgroesse(&schlange);
        let paket = Value::Array(schlange[..n].to_vec());
        let (status, antwort) = anfrage(
            "pushen",
            "POST",
            &format!("{basis}/ereignisse"),
            Some(&z.schluessel),
            Some(&paket),
        )?;
        match status {
            200 => {
                schlange.drain(..n);
                sichere_schlange(dir, &schlange)?;
                letzte = json!({ "verschickt": antwort["verschickt"].clone() });
            }
            410 => {
                z.zustand = "abbestellt".into();
                z.schluessel = String::new();
                sichere(dir, &z)?;
                sichere_schlange(dir, &[])?;
                return Ok(json!({ "zustand": "abbestellt" }));
            }
            401 => {
                // Schlüssel unbekannt: verwerfen, sonst bliebe der Push endlos hängen.
                z.zustand = "aus".into();
                z.schluessel = String::new();
                sichere(dir, &z)?;
                sichere_schlange(dir, &[])?;
                return Ok(json!({ "zustand": "aus" }));
            }
            403 => return Ok(json!({ "zustand": "gesperrt" })),
            400 | 413 => {
                // Ungültiger Stapel: verwerfen, sonst bliebe er für immer hängen.
                schlange.drain(..n);
                sichere_schlange(dir, &schlange)?;
            }
            _ => return Err(format!("Versand nicht möglich (Status {status})")),
        }
    }
    Ok(letzte)
}

/// Aufruf mit Schlüssel; 410 setzt den Zustand auf „abbestellt“, 401 auf „aus“.
fn mit_schluessel_antwort(
    dir: &Path,
    befehl: &str,
    methode: &str,
    url: &str,
    body: Option<&Value>,
) -> Result<(u16, Value), String> {
    let mut z = lade(dir);
    if z.zustand != "aktiv" {
        return Err("Tagesbrief ist nicht eingerichtet".to_string());
    }
    let (status, antwort) = anfrage(befehl, methode, url, Some(&z.schluessel), body)?;
    if status == 410 || status == 401 {
        z.zustand = if status == 410 { "abbestellt" } else { "aus" }.into();
        z.schluessel = String::new();
        sichere(dir, &z)?;
        sichere_schlange(dir, &[])?;
    }
    Ok((status, antwort))
}

/// Wie `mit_schluessel_antwort`, nur der Status.
fn mit_schluessel(
    dir: &Path,
    befehl: &str,
    methode: &str,
    url: &str,
    body: Option<&Value>,
) -> Result<u16, String> {
    mit_schluessel_antwort(dir, befehl, methode, url, body).map(|(status, _)| status)
}

/// Zustand nach 401/410 als Antwort, sonst `None`; die Seite zeichnet dann den neuen Zustand.
fn zustand_verloren(dir: &Path, status: u16) -> Option<Value> {
    matches!(status, 401 | 410).then(|| json!({ "zustand": lade(dir).zustand }))
}

/// Empfänger der Familie: `{ uhrzeit, name, empfaenger: [{ adresse, bestaetigt }] }`.
/// Wurde das Gerät inzwischen abgemeldet (410/401), kommt `{ zustand }` zurück.
pub fn empfaenger_liste(dir: &Path, basis: &str) -> Result<Value, String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let (status, antwort) = mit_schluessel_antwort(
        dir,
        "empfaenger",
        "GET",
        &format!("{basis}/empfaenger"),
        None,
    )?;
    if let Some(v) = zustand_verloren(dir, status) {
        return Ok(v);
    }
    if status != 200 {
        return Err(format!("Empfänger nicht abrufbar (Status {status})"));
    }
    Ok(antwort)
}

/// Fügt eine Adresse hinzu (der Dienst schickt den Bestätigungslink). `{ ok: true }` oder
/// `{ fehler: "voll" | "vorhanden" | "zu-viele" | "ungueltig" }`; `Err` nur bei Netz- und Dienstfehlern.
pub fn empfaenger_hinzufuegen(dir: &Path, basis: &str, adresse: &str) -> Result<Value, String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let (status, antwort) = mit_schluessel_antwort(
        dir,
        "empfaenger-hinzufuegen",
        "POST",
        &format!("{basis}/empfaenger"),
        Some(&json!({ "adresse": adresse })),
    )?;
    if let Some(v) = zustand_verloren(dir, status) {
        return Ok(v);
    }
    match status {
        200 => Ok(json!({ "ok": true })),
        409 => Ok(
            json!({ "fehler": if antwort["fehler"] == "vorhanden" { "vorhanden" } else { "voll" } }),
        ),
        429 => Ok(json!({ "fehler": "zu-viele" })),
        400 => Ok(json!({ "fehler": "ungueltig" })),
        _ => Err(format!("Adresse nicht hinzufügbar (Status {status})")),
    }
}

/// Entfernt eine Adresse. `{ ok: true }`, `{ familieGeloescht: true }` (dann ist der Tagesbrief lokal
/// „aus“; Gerätekennung und Zähler bleiben) oder `{ fehler: "unbekannt" }`.
pub fn empfaenger_entfernen(dir: &Path, basis: &str, adresse: &str) -> Result<Value, String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let (status, antwort) = mit_schluessel_antwort(
        dir,
        "empfaenger-entfernen",
        "DELETE",
        &format!("{basis}/empfaenger"),
        Some(&json!({ "adresse": adresse })),
    )?;
    if let Some(v) = zustand_verloren(dir, status) {
        return Ok(v);
    }
    match status {
        200 if antwort["familieGeloescht"] == true => {
            let alt = lade(dir);
            sichere(
                dir,
                &Zustand {
                    nummer: alt.nummer,
                    geraet: alt.geraet,
                    ..Zustand::default()
                },
            )?;
            sichere_schlange(dir, &[])?;
            Ok(json!({ "familieGeloescht": true }))
        }
        200 => Ok(json!({ "ok": true })),
        404 => Ok(json!({ "fehler": "unbekannt" })),
        _ => Err(format!("Adresse nicht entfernbar (Status {status})")),
    }
}

/// Ändert Name und Uhrzeit im Dienst und lokal.
pub fn einstellen(dir: &Path, basis: &str, name: &str, uhrzeit: &str) -> Result<(), String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let status = mit_schluessel(
        dir,
        "einstellen",
        "POST",
        &format!("{basis}/einstellungen"),
        Some(&json!({ "name": name, "uhrzeit": uhrzeit })),
    )?;
    if status != 200 {
        return Err(format!("Einstellung nicht möglich (Status {status})"));
    }
    let mut z = lade(dir);
    z.name = name.into();
    z.uhrzeit = uhrzeit.into();
    sichere(dir, &z)
}

/// Lässt den Dienst sofort einen Probebrief schicken.
pub fn probebrief(dir: &Path, basis: &str) -> Result<(), String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let status = mit_schluessel(
        dir,
        "probebrief",
        "POST",
        &format!("{basis}/probebrief"),
        Some(&json!({})),
    )?;
    if status == 200 {
        Ok(())
    } else {
        Err(format!("Probebrief nicht möglich (Status {status})"))
    }
}

/// Schlüssel des Geräts, solange der Tagesbrief eingerichtet ist; das Test-Protokoll
/// (`testprotokoll.rs`) meldet sich damit beim Dienst an.
pub fn aktiver_schluessel(dir: &Path) -> Option<String> {
    let z = lade(dir);
    (z.zustand == "aktiv" && !z.schluessel.is_empty()).then_some(z.schluessel)
}

/// Schickt einen Stapel Protokolleinträge an `/protokoll`. `Ok(status)`, `Err` nur ohne Verbindung.
/// Ändert nichts am Zustand des Tagesbriefs (auch nicht bei 401/410).
pub fn protokoll_senden(basis: &str, schluessel: &str, stapel: &Value) -> Result<u16, String> {
    anfrage(
        "protokoll",
        "POST",
        &format!("{basis}/protokoll"),
        Some(schluessel),
        Some(stapel),
    )
    .map(|(status, _)| status)
}

/// Löst das Gerät im Dienst und setzt die lokale Einrichtung zurück (Gerätekennung und
/// Zähler bleiben, damit Ereignis-IDs eindeutig bleiben).
pub fn abmelden(dir: &Path, basis: &str) -> Result<(), String> {
    let _sperre = SPERRE.lock().unwrap_or_else(|e| e.into_inner());
    let alt = lade(dir);
    if alt.zustand == "aktiv" {
        let (status, _) = anfrage(
            "abmelden",
            "DELETE",
            &format!("{basis}/geraet"),
            Some(&alt.schluessel),
            None,
        )?;
        if !matches!(status, 200 | 401 | 410) {
            return Err(format!("Abmeldung nicht möglich (Status {status})"));
        }
    }
    sichere(
        dir,
        &Zustand {
            nummer: alt.nummer,
            geraet: alt.geraet,
            ..Zustand::default()
        },
    )?;
    sichere_schlange(dir, &[])
}

#[cfg(test)]
pub(crate) mod tests {
    use super::*;
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::sync::{Arc, Once};

    static LOG: Mutex<Vec<String>> = Mutex::new(Vec::new());
    struct Sammler;
    impl log::Log for Sammler {
        fn enabled(&self, _: &log::Metadata) -> bool {
            true
        }
        fn log(&self, r: &log::Record) {
            if r.target().starts_with("lernen_spielen_lib") {
                LOG.lock().unwrap().push(r.args().to_string());
            }
        }
        fn flush(&self) {}
    }
    fn log_einrichten() {
        static EINMAL: Once = Once::new();
        EINMAL.call_once(|| {
            log::set_logger(&Sammler).unwrap();
            log::set_max_level(log::LevelFilter::Trace);
        });
    }

    /// Fake-Dienst: beantwortet nacheinander jede Anfrage mit der nächsten Antwort und
    /// merkt sich Kopf und Körper der Anfragen.
    pub(crate) fn fake(antworten: Vec<(u16, &'static str)>) -> (String, Arc<Mutex<Vec<String>>>) {
        let l = TcpListener::bind("127.0.0.1:0").unwrap();
        let basis = format!("http://{}", l.local_addr().unwrap());
        let gesehen = Arc::new(Mutex::new(Vec::new()));
        let kopie = gesehen.clone();
        std::thread::spawn(move || {
            for (code, text) in antworten {
                let Ok((mut s, _)) = l.accept() else { return };
                let mut puffer = Vec::new();
                let mut chunk = [0u8; 4096];
                loop {
                    let n = s.read(&mut chunk).unwrap_or(0);
                    if n == 0 {
                        break;
                    }
                    puffer.extend_from_slice(&chunk[..n]);
                    let t = String::from_utf8_lossy(&puffer).to_string();
                    if let Some(i) = t.find("\r\n\r\n") {
                        let laenge = t[..i]
                            .to_lowercase()
                            .lines()
                            .find_map(|z| {
                                z.strip_prefix("content-length:")
                                    .map(|v| v.trim().parse().unwrap_or(0))
                            })
                            .unwrap_or(0usize);
                        if t.len() >= i + 4 + laenge {
                            break;
                        }
                    }
                }
                kopie
                    .lock()
                    .unwrap()
                    .push(String::from_utf8_lossy(&puffer).to_string());
                let antwort = format!(
                    "HTTP/1.1 {code} X\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{text}",
                    text.len()
                );
                let _ = s.write_all(antwort.as_bytes());
            }
        });
        (basis, gesehen)
    }

    /// Adresse, auf der nichts lauscht.
    pub(crate) fn tote_basis() -> String {
        let l = TcpListener::bind("127.0.0.1:0").unwrap();
        format!("http://{}", l.local_addr().unwrap())
    }

    pub(crate) fn aktiv(dir: &Path) {
        sichere(
            dir,
            &Zustand {
                zustand: "aktiv".into(),
                adresse: "mama@example.org".into(),
                uhrzeit: "18:00".into(),
                schluessel: "GEHEIMER-SCHLUESSEL".into(),
                geraet: "abcd1234".into(),
                ..Zustand::default()
            },
        )
        .unwrap();
    }

    #[test]
    fn warteschlange_haelt_bei_fehler() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let r = pushen(
            dir.path(),
            &tote_basis(),
            vec![json!({"art":"a","daten":{"x":1}})],
        );
        assert!(r.is_err());
        assert_eq!(lade_schlange(dir.path()).len(), 1);
        assert_eq!(lade_schlange(dir.path())[0]["id"], "abcd1234-1");

        let (basis, gesehen) = fake(vec![(
            200,
            r#"{"verschickt":[{"anleitung":"m1","am":"2026-11-17"}]}"#,
        )]);
        let r = pushen(dir.path(), &basis, vec![json!({"art":"b","daten":{}})]).unwrap();
        assert_eq!(r["verschickt"][0]["anleitung"], "m1");
        assert!(lade_schlange(dir.path()).is_empty());
        let anfrage = gesehen.lock().unwrap()[0].clone();
        assert!(anfrage.contains("abcd1234-1") && anfrage.contains("abcd1234-2"));
        assert!(anfrage.to_lowercase().contains("x-app: lernen-spielen-1"));
        assert!(anfrage.contains("Bearer GEHEIMER-SCHLUESSEL"));
        assert_eq!(lade(dir.path()).nummer, 2);
    }

    #[test]
    fn nur_das_letzte_naechstes_bleibt_in_der_schlange() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let foto = "x".repeat(50_000);
        for i in 0..8 {
            let r = pushen(
                dir.path(),
                &tote_basis(),
                vec![json!({"art":"naechstes","daten":{"foto":foto,"i":i}})],
            );
            assert!(r.is_err());
        }
        let (basis, gesehen) = fake(vec![(200, r#"{"verschickt":[]}"#)]);
        pushen(
            dir.path(),
            &basis,
            vec![json!({"art":"gekonnt","daten":{"name":"Achterreihe"}})],
        )
        .unwrap();
        assert!(lade_schlange(dir.path()).is_empty());
        let anfrage = gesehen.lock().unwrap()[0].clone();
        assert!(anfrage.contains("Achterreihe"));
        assert_eq!(anfrage.matches("\"naechstes\"").count(), 1);
        assert!(anfrage.contains("\"i\":7"));
    }

    #[test]
    fn pakete_bleiben_unter_der_bytegrenze() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let gross = "y".repeat(100_000);
        let ereignisse = (0..3)
            .map(|i| json!({"art":"dabei","daten":{"text":gross,"i":i}}))
            .collect();
        let (basis, gesehen) = fake(vec![
            (200, r#"{"verschickt":[]}"#),
            (200, r#"{"verschickt":[]}"#),
        ]);
        pushen(dir.path(), &basis, ereignisse).unwrap();
        let g = gesehen.lock().unwrap();
        assert_eq!(g.len(), 2);
        assert!(g.iter().all(|a| a.len() < 260_000));
        assert!(lade_schlange(dir.path()).is_empty());
    }

    #[test]
    fn pushen_ohne_einrichtung_tut_nichts() {
        let dir = tempfile::tempdir().unwrap();
        let r = pushen(
            dir.path(),
            &tote_basis(),
            vec![json!({"art":"a","daten":{}})],
        )
        .unwrap();
        assert_eq!(r, json!({"verschickt": []}));
        assert!(!warteschlange_datei(dir.path()).exists());
        assert!(!datei(dir.path()).exists());
    }

    #[test]
    fn antwort_410_setzt_abbestellt() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, _) = fake(vec![(410, r#"{"fehler":"abgemeldet"}"#)]);
        let r = pushen(dir.path(), &basis, vec![json!({"art":"a","daten":{}})]).unwrap();
        assert_eq!(r, json!({"zustand": "abbestellt"}));
        let z = lade(dir.path());
        assert_eq!(z.zustand, "abbestellt");
        assert!(z.schluessel.is_empty());
        assert!(lade_schlange(dir.path()).is_empty());
        // Danach pusht nichts mehr.
        let r = pushen(
            dir.path(),
            &tote_basis(),
            vec![json!({"art":"a","daten":{}})],
        )
        .unwrap();
        assert_eq!(r, json!({"zustand": "abbestellt"}));
    }

    #[test]
    fn antwort_400_verwirft_den_stapel() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, _) = fake(vec![(400, r#"{"fehler":"ungueltig"}"#)]);
        let r = pushen(dir.path(), &basis, vec![json!({"art":"a","daten":{}})]).unwrap();
        assert_eq!(r, json!({"verschickt": []}));
        assert!(lade_schlange(dir.path()).is_empty());
    }

    #[test]
    fn antwort_403_behaelt_die_warteschlange() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, _) = fake(vec![(403, r#"{"fehler":"gesperrt"}"#)]);
        let r = pushen(dir.path(), &basis, vec![json!({"art":"a","daten":{}})]).unwrap();
        assert_eq!(r, json!({"zustand": "gesperrt"}));
        assert_eq!(lade_schlange(dir.path()).len(), 1);
    }

    #[test]
    fn einrichten_und_status_speichern_den_schluessel() {
        let dir = tempfile::tempdir().unwrap();
        let (basis, gesehen) = fake(vec![
            (200, r#"{"anfrageId":"A1"}"#),
            (200, r#"{"bestaetigt":false}"#),
            (200, r#"{"bestaetigt":true,"schluessel":"S3"}"#),
        ]);
        assert_eq!(
            einrichten(dir.path(), &basis, "mama@example.org", "Lena", "18:00").unwrap(),
            "A1"
        );
        let z = lade(dir.path());
        assert_eq!(z.geraet.len(), 8);
        assert!(z.geraet.bytes().all(|b| b.is_ascii_hexdigit()));
        assert_eq!(status(dir.path(), &basis).unwrap()["zustand"], "wartet");
        let s = status(dir.path(), &basis).unwrap();
        assert_eq!(
            s,
            json!({"zustand":"aktiv","adresse":"mama@example.org","uhrzeit":"18:00"})
        );
        assert_eq!(lade(dir.path()).schluessel, "S3");
        assert!(gesehen.lock().unwrap()[1].contains("GET /status?anfrage=A1"));
    }

    #[test]
    fn abmelden_setzt_zurueck_und_behaelt_zaehler() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let mut z = lade(dir.path());
        z.nummer = 7;
        sichere(dir.path(), &z).unwrap();
        let (basis, gesehen) = fake(vec![(200, "{}")]);
        abmelden(dir.path(), &basis).unwrap();
        assert!(gesehen.lock().unwrap()[0].starts_with("DELETE /geraet"));
        let z = lade(dir.path());
        assert_eq!(
            (z.zustand.as_str(), z.nummer, z.geraet.as_str()),
            ("aus", 7, "abcd1234")
        );
        assert!(z.schluessel.is_empty());
    }

    #[test]
    fn schluessel_wird_nicht_ins_log_geschrieben() {
        log_einrichten();
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, _) = fake(vec![
            (200, r#"{"verschickt":[]}"#),
            (200, r#"{"uhrzeit":"19:00"}"#),
            (410, "{}"),
        ]);
        pushen(
            dir.path(),
            &basis,
            vec![json!({"art":"a","daten":{"geheim":"INHALT-GEHEIM"}})],
        )
        .unwrap();
        einstellen(dir.path(), &basis, "NAME-GEHEIM", "19:00").unwrap();
        probebrief(dir.path(), &basis).unwrap_err();
        let _ = pushen(dir.path(), &tote_basis(), vec![]);
        let log = LOG.lock().unwrap().join("\n");
        assert!(!log.is_empty());
        for geheim in [
            "GEHEIMER-SCHLUESSEL",
            "mama@example.org",
            "INHALT-GEHEIM",
            "NAME-GEHEIM",
            "127.0.0.1",
        ] {
            assert!(!log.contains(geheim), "Log enthält {geheim}: {log}");
        }
    }

    #[test]
    fn antwort_401_setzt_aus() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, _) = fake(vec![(401, "{}")]);
        let r = pushen(dir.path(), &basis, vec![json!({"art":"a","daten":{}})]).unwrap();
        assert_eq!(r, json!({"zustand": "aus"}));
        let z = lade(dir.path());
        assert_eq!(z.zustand, "aus");
        assert!(z.schluessel.is_empty());
        assert!(lade_schlange(dir.path()).is_empty());
    }

    #[test]
    fn bestaetigt_ohne_schluessel_setzt_aus_mit_hinweis() {
        let dir = tempfile::tempdir().unwrap();
        let (basis, _) = fake(vec![
            (200, r#"{"anfrageId":"A1"}"#),
            (200, r#"{"bestaetigt":true}"#),
        ]);
        einrichten(dir.path(), &basis, "mama@example.org", "Lena", "18:00").unwrap();
        let s = status(dir.path(), &basis).unwrap();
        assert_eq!(s["zustand"], "aus");
        assert!(s["hinweis"].is_string());
        assert_eq!(lade(dir.path()).zustand, "aus");
    }

    #[test]
    fn gesicherter_schluessel_wird_ohne_dienst_aktiv() {
        let dir = tempfile::tempdir().unwrap();
        let mut z = Zustand::default();
        z.zustand = "wartet".into();
        z.anfrage = "A1".into();
        z.schluessel = "S9".into();
        sichere(dir.path(), &z).unwrap();
        let s = status(dir.path(), &tote_basis()).unwrap();
        assert_eq!(s["zustand"], "aktiv");
    }

    #[test]
    fn tagesbrief_ordner_liegt_getrennt_vom_lernstand() {
        let app = tempfile::tempdir().unwrap();
        let t = ordner(app.path(), None).unwrap();
        aktiv(&t);
        let lernstand = app.path().join("lernstand");
        assert!(!t.starts_with(&lernstand));
        assert_eq!(
            crate::lernstand::lesen(&lernstand, None, "tagesbrief").unwrap(),
            None
        );
        assert_eq!(
            crate::lernstand::lesen(&lernstand, Some("kind1"), "tagesbrief").unwrap(),
            None
        );
        assert!(ordner(app.path(), Some("../x")).is_err());
    }

    #[test]
    fn empfaenger_liste_kommt_vom_dienst() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, gesehen) = fake(vec![(
            200,
            r#"{"uhrzeit":"18:00","name":"Lena","empfaenger":[{"adresse":"a@example.org","bestaetigt":true},{"adresse":"b@example.org","bestaetigt":false}]}"#,
        )]);
        let r = empfaenger_liste(dir.path(), &basis).unwrap();
        assert_eq!(r["name"], "Lena");
        assert_eq!(r["empfaenger"][1]["bestaetigt"], false);
        let a = gesehen.lock().unwrap()[0].clone();
        assert!(a.starts_with("GET /empfaenger") && a.contains("Bearer GEHEIMER-SCHLUESSEL"));
    }

    #[test]
    fn empfaenger_liste_bei_410_meldet_abbestellt() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, _) = fake(vec![(410, r#"{"fehler":"abgemeldet"}"#)]);
        assert_eq!(
            empfaenger_liste(dir.path(), &basis).unwrap(),
            json!({"zustand": "abbestellt"})
        );
        assert_eq!(lade(dir.path()).zustand, "abbestellt");
        let (basis, _) = fake(vec![(401, "{}")]);
        aktiv(dir.path());
        assert_eq!(
            empfaenger_liste(dir.path(), &basis).unwrap(),
            json!({"zustand": "aus"})
        );
    }

    #[test]
    fn empfaenger_hinzufuegen_bildet_fehler_ab() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, gesehen) = fake(vec![
            (200, r#"{"ok":true}"#),
            (409, r#"{"fehler":"voll"}"#),
            (409, r#"{"fehler":"vorhanden"}"#),
            (429, r#"{"fehler":"zu-oft"}"#),
            (503, r#"{"fehler":"aus"}"#),
        ]);
        let neu = |a| empfaenger_hinzufuegen(dir.path(), &basis, a);
        assert_eq!(neu("x@example.org").unwrap(), json!({"ok": true}));
        assert_eq!(neu("y@example.org").unwrap(), json!({"fehler": "voll"}));
        assert_eq!(
            neu("y@example.org").unwrap(),
            json!({"fehler": "vorhanden"})
        );
        assert_eq!(neu("y@example.org").unwrap(), json!({"fehler": "zu-viele"}));
        assert!(neu("y@example.org").is_err());
        let a = gesehen.lock().unwrap()[0].clone();
        assert!(a.starts_with("POST /empfaenger") && a.contains("x@example.org"));
        assert!(empfaenger_hinzufuegen(dir.path(), &tote_basis(), "z@example.org").is_err());
    }

    #[test]
    fn empfaenger_entfernen_und_letzte_adresse_setzt_aus() {
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let mut z = lade(dir.path());
        z.nummer = 5;
        sichere(dir.path(), &z).unwrap();
        let (basis, gesehen) = fake(vec![
            (200, r#"{"ok":true}"#),
            (404, r#"{"fehler":"unbekannt"}"#),
            (200, r#"{"familieGeloescht":true}"#),
        ]);
        assert_eq!(
            empfaenger_entfernen(dir.path(), &basis, "a@example.org").unwrap(),
            json!({"ok": true})
        );
        assert_eq!(lade(dir.path()).zustand, "aktiv");
        assert!(gesehen.lock().unwrap()[0].starts_with("DELETE /empfaenger"));
        assert_eq!(
            empfaenger_entfernen(dir.path(), &basis, "q@example.org").unwrap(),
            json!({"fehler": "unbekannt"})
        );
        assert_eq!(
            empfaenger_entfernen(dir.path(), &basis, "a@example.org").unwrap(),
            json!({"familieGeloescht": true})
        );
        let z = lade(dir.path());
        assert_eq!(
            (z.zustand.as_str(), z.nummer, z.geraet.as_str()),
            ("aus", 5, "abcd1234")
        );
        assert!(z.schluessel.is_empty());
    }

    #[test]
    fn empfaenger_adressen_stehen_nicht_im_log() {
        log_einrichten();
        let dir = tempfile::tempdir().unwrap();
        aktiv(dir.path());
        let (basis, _) = fake(vec![(200, r#"{"ok":true}"#), (200, r#"{"ok":true}"#)]);
        empfaenger_hinzufuegen(dir.path(), &basis, "LOG-GEHEIM@example.org").unwrap();
        empfaenger_entfernen(dir.path(), &basis, "LOG-GEHEIM@example.org").unwrap();
        assert!(!LOG.lock().unwrap().join("\n").contains("LOG-GEHEIM"));
    }

    #[cfg(unix)]
    #[test]
    fn dateien_nur_fuer_den_besitzer() {
        use std::os::unix::fs::PermissionsExt;
        let app = tempfile::tempdir().unwrap();
        let t = ordner(app.path(), Some("kind1")).unwrap();
        aktiv(&t);
        let modus = |p: &Path| fs::metadata(p).unwrap().permissions().mode() & 0o777;
        assert_eq!(modus(&datei(&t)), 0o600);
        assert_eq!(modus(&t), 0o700);
    }
}
