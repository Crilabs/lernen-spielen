mod lernstand;

use std::sync::atomic::{AtomicBool, Ordering};
use std::time::Duration;

use tauri::{Manager, WebviewWindowBuilder, WindowEvent};

/// Gesetzt, sobald die App beendet wird oder ein Update installiert: dann holt der
/// Wachhund das Fenster nicht mehr zurück.
static KIOSK_PAUSE: AtomicBool = AtomicBool::new(false);
/// Verhindert, dass mehrere Wachhund-Prüfungen gleichzeitig laufen.
static PRUEFUNG_LAEUFT: AtomicBool = AtomicBool::new(false);
const WACHHUND_VERZOEGERUNG: Duration = Duration::from_millis(1500);

fn lernstand_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|d| d.join("lernstand"))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn lernstand_lesen(
    app: tauri::AppHandle,
    profil: Option<String>,
    spiel: String,
) -> Result<Option<String>, String> {
    lernstand::lesen(&lernstand_dir(&app)?, profil.as_deref(), &spiel)
}

#[tauri::command]
fn lernstand_schreiben(
    app: tauri::AppHandle,
    profil: Option<String>,
    spiel: String,
    daten: String,
) -> Result<(), String> {
    lernstand::schreiben(&lernstand_dir(&app)?, profil.as_deref(), &spiel, &daten)
}

/// Betriebssystem der App: "macos", "windows", "linux", "android" oder "ios".
#[tauri::command]
fn plattform() -> String {
    std::env::consts::OS.to_string()
}

/// Vom Elternbereich vor „App beenden“ und vor der Update-Installation aufgerufen
/// (`pause: true`); schlägt das fehl, wieder mit `pause: false`.
#[tauri::command]
fn kiosk_pause(pause: bool) {
    KIOSK_PAUSE.store(pause, Ordering::SeqCst);
    log::info!(
        "Kiosk-Wachhund {}",
        if pause { "pausiert" } else { "aktiv" }
    );
}

/// Wachhund: Wird das Hauptfenster minimiert oder versteckt (z. B. Drei-Finger-Wischen nach
/// unten), holt er es nach kurzer Zeit zurück. Ein bloßer Fokusverlust bei sichtbarem Fenster
/// wird nicht bekämpft, damit der Task-Manager (Notausgang für Erwachsene) bedienbar bleibt.
fn wachhund(window: &tauri::Window, event: &WindowEvent) {
    if cfg!(debug_assertions) || window.label() != "main" {
        return;
    }
    if !matches!(event, WindowEvent::Focused(false) | WindowEvent::Resized(_)) {
        return;
    }
    if KIOSK_PAUSE.load(Ordering::SeqCst) || PRUEFUNG_LAEUFT.swap(true, Ordering::SeqCst) {
        return;
    }
    let window = window.clone();
    std::thread::spawn(move || {
        std::thread::sleep(WACHHUND_VERZOEGERUNG);
        PRUEFUNG_LAEUFT.store(false, Ordering::SeqCst);
        if KIOSK_PAUSE.load(Ordering::SeqCst) {
            return;
        }
        let minimiert = window.is_minimized().unwrap_or(false);
        let sichtbar = window.is_visible().unwrap_or(true);
        if !minimiert && sichtbar {
            return;
        }
        log::info!(
            "Kiosk-Wachhund: Fenster zurückgeholt (minimiert: {minimiert}, sichtbar: {sichtbar})"
        );
        let schritte = [
            ("unminimize", window.unminimize()),
            ("show", window.show()),
            (
                "fullscreen",
                if window.is_fullscreen().unwrap_or(true) {
                    Ok(())
                } else {
                    window.set_fullscreen(true)
                },
            ),
            ("set_focus", window.set_focus()),
        ];
        for (name, ergebnis) in schritte {
            if let Err(e) = ergebnis {
                log::warn!("Kiosk-Wachhund {name}: {e}");
            }
        }
    });
}

/// Nur die eigene App-Oberfläche darf geladen werden (keine neuen Fenster, keine Fremdseiten).
fn navigation_erlaubt(url: &tauri::Url) -> bool {
    match url.scheme() {
        "tauri" => true,
        "http" | "https" => url.host_str() == Some("tauri.localhost"),
        _ => false,
    }
}

#[cfg(windows)]
fn webview_einstellungen(window: &tauri::WebviewWindow) -> tauri::Result<()> {
    use webview2_com::Microsoft::Web::WebView2::Win32::{
        ICoreWebView2Settings3, ICoreWebView2Settings5, ICoreWebView2Settings6,
    };
    use windows::core::Interface;

    window.with_webview(|webview| {
        // Jede Einstellung für sich: scheitert eine, werden die anderen trotzdem gesetzt.
        fn melde(name: &str, ergebnis: windows::core::Result<()>) {
            if let Err(e) = ergebnis {
                log::error!("WebView2-Einstellung {name} fehlgeschlagen: {e}");
            }
        }
        let settings = match unsafe { webview.controller().CoreWebView2() }
            .and_then(|core| unsafe { core.Settings() })
        {
            Ok(s) => s,
            Err(e) => {
                log::error!("WebView2-Einstellungen nicht erreichbar: {e}");
                return;
            }
        };
        melde("Wischnavigation", unsafe {
            settings
                .cast::<ICoreWebView2Settings6>()
                .and_then(|s| s.SetIsSwipeNavigationEnabled(false))
        });
        melde("Pinch-Zoom", unsafe {
            settings
                .cast::<ICoreWebView2Settings5>()
                .and_then(|s| s.SetIsPinchZoomEnabled(false))
        });
        melde("Zoom", unsafe { settings.SetIsZoomControlEnabled(false) });
        melde("Statusleiste", unsafe {
            settings.SetIsStatusBarEnabled(false)
        });
        if !cfg!(debug_assertions) {
            melde("Kontextmenü", unsafe {
                settings.SetAreDefaultContextMenusEnabled(false)
            });
            melde("Browser-Tastenkürzel", unsafe {
                settings
                    .cast::<ICoreWebView2Settings3>()
                    .and_then(|s| s.SetAreBrowserAcceleratorKeysEnabled(false))
            });
        }
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            lernstand_lesen,
            lernstand_schreiben,
            plattform,
            kiosk_pause
        ])
        .on_window_event(wachhund)
        .setup(|app| {
            // Logging in allen Builds: Datei im App-Log-Ordner, im Debug zusätzlich Stdout.
            let mut log = tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .max_file_size(1_000_000)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepOne)
                .clear_targets()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir { file_name: None },
                ));
            if cfg!(debug_assertions) {
                log = log.target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ));
            }
            app.handle().plugin(log.build())?;
            log::info!(
                "Einhorn-Lernspiele {} gestartet",
                app.package_info().version
            );
            // Fenster aus tauri.conf.json übernehmen, aber Navigation einschränken.
            let config = app.config().app.windows[0].clone();
            let _window = WebviewWindowBuilder::from_config(app.handle(), &config)?
                .on_navigation(navigation_erlaubt)
                .on_new_window(|_url, _features| tauri::webview::NewWindowResponse::Deny)
                .build()?;
            #[cfg(windows)]
            if let Err(e) = webview_einstellungen(&_window) {
                log::error!("WebView2-Einstellungen nicht anwendbar: {e}");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
