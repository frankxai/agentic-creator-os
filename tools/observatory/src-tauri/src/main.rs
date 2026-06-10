// Prevents an extra console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

//! Agent Observatory — Tauri 2 desktop shell.
//!
//! Boots the zero-dependency Node SSE server (`server.mjs`) as a child process,
//! shows the dashboard window (which the server serves on :4317 same-origin),
//! and exposes a tray menu. The child server is killed when the app exits.
//!
//! Requires `node` on PATH. Build with `cargo tauri dev` / `cargo tauri build`.

use std::process::{Child, Command, Stdio};
use std::sync::Mutex;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager, RunEvent, WindowEvent,
};

/// Holds the spawned Node server so we can kill it on exit.
struct ServerProcess(Mutex<Option<Child>>);

/// Spawn `node observatory/server.mjs` from the app's bundled resources.
fn spawn_server(app: &tauri::App) -> Option<Child> {
    let server = app
        .path()
        .resource_dir()
        .ok()?
        .join("observatory")
        .join("server.mjs");

    Command::new("node")
        .arg(server)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .ok()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ServerProcess(Mutex::new(None)))
        .setup(|app| {
            // Boot the local monitor server.
            let child = spawn_server(app);
            *app.state::<ServerProcess>().0.lock().unwrap() = child;

            // Tray menu: show window / quit.
            let show = MenuItem::with_id(app, "show", "Show Observatory", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &quit])?;

            TrayIconBuilder::with_id("main")
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Agent Observatory")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => app.exit(0),
                    "show" => {
                        if let Some(win) = app.get_webview_window("main") {
                            let _ = win.show();
                            let _ = win.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        // Hide (don't kill) on window close so the tray keeps the monitor alive.
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building Agent Observatory")
        .run(|app, event| {
            // Kill the Node server when the app fully exits.
            if let RunEvent::Exit = event {
                if let Some(state) = app.try_state::<ServerProcess>() {
                    if let Some(mut child) = state.0.lock().unwrap().take() {
                        let _ = child.kill();
                    }
                }
            }
        });
}
