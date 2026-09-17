#!/usr/bin/env node
// Starlight Fleet Pet Auto-Hook
const http = require('http');
let input = '';
process.stdin.on('data', c => input += c);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const payload = JSON.stringify({
      harness: 'claude',
      event: 'status_update',
      sessionId: data.session_id || 'claude-session',
      model: data.model?.display_name,
      workspace: data.workspace?.current_dir,
      contextRemainingPct: data.context_window?.remaining_percentage
    });
    const req = http.request({
      hostname: 'localhost',
      port: 9224,
      path: '/api/hook',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
    });
    req.on('error', () => {}); // silent
    req.write(payload);
    req.end();
  } catch {}
});
