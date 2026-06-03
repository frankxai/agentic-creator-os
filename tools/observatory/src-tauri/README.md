# Agent Observatory — Tauri shell (Phase 3)

Wraps the live monitor (`../web` + `../server.mjs`) as a lightweight native
desktop app with a menu-bar/tray icon showing the live agent count.

> Status: **scaffold only.** Building requires the Rust toolchain + `tauri-cli`,
> which aren't part of the repo's Node setup. The `web/` dashboard already runs
> standalone at `localhost:4317`; this is purely a packaging convenience.

## Why Tauri (not Electron)
- ~10× smaller bundles (uses the OS WebView, no bundled Chromium)
- Rust core, lower memory, native tray + notifications
- Signed auto-updates

## Build (once Rust + tauri-cli are installed)

```bash
cargo install create-tauri-app --locked   # or: npm create tauri-app
cd tools/observatory
cargo tauri dev      # dev
cargo tauri build    # production bundle
```

## Plan
1. **Sidecar**: bundle `server.mjs` as a Tauri sidecar; spawn on app launch,
   kill on quit (`tauri.conf.json → bundle.externalBin`).
2. **Window**: load `http://localhost:4317` (the existing dashboard).
3. **Tray**: poll `/events/recent` (or subscribe to `/stream`) and render the
   active-agent count as the tray title; click to show/hide the window.
4. **Notifications**: native toast when an agent errors (`PostToolUse` with
   `success:false`).

`tauri.conf.json` in this folder is a minimal starting point — adjust
`build.frontendDist` / `build.devUrl` and `bundle.externalBin` when wiring the
sidecar.
