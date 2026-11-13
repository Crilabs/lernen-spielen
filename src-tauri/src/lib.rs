mod lernstand;

use tauri::{Manager, WebviewWindowBuilder};

fn lernstand_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|d| d.join("lernstand"))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn lernstand_lesen(app: tauri::AppHandle, spiel: String) -> Result<Option<String>, String> {
    lernstand::lesen(&lernstand_dir(&app)?, &spiel)
}

#[tauri::command]
fn lernstand_schreiben(app: tauri::AppHandle, spiel: String, daten: String) -> Result<(), String> {
    lernstand::schreiben(&lernstand_dir(&app)?, &spiel, &daten)
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
        let einstellen = || -> windows::core::Result<()> {
            unsafe {
                let settings = webview.controller().CoreWebView2()?.Settings()?;
                settings
                    .cast::<ICoreWebView2Settings6>()?
                    .SetIsSwipeNavigationEnabled(false)?;
                settings
                    .cast::<ICoreWebView2Settings5>()?
                    .SetIsPinchZoomEnabled(false)?;
                settings.SetIsZoomControlEnabled(false)?;
                settings.SetIsStatusBarEnabled(false)?;
                if !cfg!(debug_assertions) {
                    settings.SetAreDefaultContextMenusEnabled(false)?;
                    settings
                        .cast::<ICoreWebView2Settings3>()?
                        .SetAreBrowserAcceleratorKeysEnabled(false)?;
                }
            }
            Ok(())
        };
        if let Err(e) = einstellen() {
            log::error!("WebView2-Einstellungen fehlgeschlagen: {e}");
        }
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            lernstand_lesen,
            lernstand_schreiben
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
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
