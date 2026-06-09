# Agent Observatory — Tauri 2 desktop shell

A lightweight native window + menu-bar/tray wrapper around the live monitor
(`../web` + `../server.mjs`). Chosen over Electron: OS WebView instead of a
bundled Chromium → ~3–10 MB bundles vs ~100 MB+, Rust core, native tray, lower
idle memory for an always-on monitor.

## What's wired
- **`src/main.rs`** — on launch, spawns `node observatory/server.mjs` (bundled as
  a resource) as a child process; shows the dashboard window (served by that
  process on `:4317`, same-origin so the SSE + `/catalog` fetches just work);
  adds a tray menu (Show / Quit). Closing the window hides to tray; the Node
  server is killed only on full app exit.
- **`Cargo.toml`** — Tauri 2 + `tauri-plugin-shell`, size-optimized release profile.
- **`tauri.conf.json`** — window loads `http://localhost:4317`; bundles
  `server.mjs`, `web/`, and `public/catalog.json` as resources.
- **`capabilities/default.json`** — minimal window + shell permissions.

> **Status: scaffold.** These files are idiomatic Tauri 2 but have **not** been
> compiled here (the repo's CI is Node-only; Tauri needs the Rust toolchain +
> platform WebView libs). Finalize on a dev machine with the steps below.

## Prerequisites
- [Rust](https://rustup.rs) + `cargo`
- Tauri CLI: `cargo install tauri-cli --version "^2"`
- `node` on PATH (the app spawns the server with it)
- Platform WebView deps — see https://tauri.app/start/prerequisites/

## Build
```bash
# 1. Generate the catalog + app icons (one-time)
npm run observatory:catalog
cargo tauri icon path/to/logo.png        # writes src-tauri/icons/*

# 2. Run / build  (from tools/observatory)
cargo tauri dev                          # dev window
cargo tauri build                        # signed native bundle
```

## Next enhancements (tracked, not yet built)
- Tray title shows the **live active-agent count** (poll `/events/recent` or
  subscribe to `/stream` from Rust and call `tray.set_title`).
- Native notification on `PostToolUse { success:false }` (agent error).
- Auto-updater via `tauri-plugin-updater`.

Icons and `target/`, `gen/` are gitignored — generate locally.
