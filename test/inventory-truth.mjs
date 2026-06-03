#!/usr/bin/env node
// Inventory-truth + frontmatter-validity pass for ACOS.
// Counts canonical assets and validates every SKILL.md has usable frontmatter.
// Prints claimed-vs-verified deltas. Exit non-zero only on invalid frontmatter.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, pred) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, pred));
    else if (pred(p)) out.push(p);
  }
  return out;
}
const countTop = (dir, ext) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(ext)).length : 0;

// --- Counts (canonical install locations) ---
const skillFiles = walk(path.join(ROOT, ".claude/skills"), (p) => p.endsWith("SKILL.md"));
const cmdTop = countTop(path.join(ROOT, ".claude/commands"), ".md");
const cmdAll = walk(path.join(ROOT, ".claude/commands"), (p) => p.endsWith(".md")).length;
const agentTopMd = countTop(path.join(ROOT, ".claude/agents"), ".md");
const agentTopJson = countTop(path.join(ROOT, ".claude/agents"), ".json");
const agentAll = walk(path.join(ROOT, ".claude/agents"), (p) => p.endsWith(".md") || p.endsWith(".json")).length;
const pluginManifests = walk(ROOT, (p) =>
  p.endsWith("plugin.json") && !p.includes("node_modules")).length;

// --- Frontmatter validity (skills) ---
let validFm = 0, invalidFm = 0;
const bad = [];
for (const f of skillFiles) {
  const txt = readFileSync(f, "utf8");
  const m = txt.match(/^---\s*\n([\s\S]*?)\n---/);
  const hasName = m && /\bname\s*:/.test(m[1]);
  const hasDesc = m && /\bdescription\s*:/.test(m[1]);
  if (hasName && hasDesc) validFm++;
  else { invalidFm++; bad.push(path.relative(ROOT, f) + (m ? " (missing name/description)" : " (no frontmatter block)")); }
}

const claims = { skills: "90+", commands: "65+", agents: "38", plugins: "8" };
const row = (label, claimed, verified, note) =>
  `  ${label.padEnd(10)} claimed=${String(claimed).padEnd(5)} verified=${String(verified).padEnd(5)} ${note}`;

console.log("== ACOS inventory truth ==\n");
console.log(row("skills", claims.skills, skillFiles.length, skillFiles.length >= 90 ? "OK (exceeds claim)" : "BELOW CLAIM"));
console.log(row("commands", claims.commands, `${cmdTop}/${cmdAll}`, cmdTop >= 65 ? "OK top-level (exceeds claim)" : "BELOW CLAIM"));
console.log(row("agents", claims.agents, `${agentTopMd + agentTopJson}/${agentAll}`, (agentTopMd + agentTopJson) >= 38 ? "OK top-level (exceeds claim)" : "BELOW CLAIM"));
console.log(row("plugins", claims.plugins, pluginManifests, pluginManifests >= 8 ? "OK" : "DRIFT: fewer plugin.json manifests than claimed"));

console.log(`\n== SKILL.md frontmatter validity ==`);
console.log(`  valid: ${validFm}   invalid: ${invalidFm}`);
if (invalidFm) {
  console.log("  invalid files:");
  bad.slice(0, 40).forEach((b) => console.log("    - " + b));
  if (bad.length > 40) console.log(`    ... +${bad.length - 40} more`);
}

console.log(`\n================ RESULT ================`);
console.log(`  skills=${skillFiles.length} commands=${cmdTop}(top) agents=${agentTopMd + agentTopJson}(top) plugins=${pluginManifests}`);
console.log(`  frontmatter valid ${validFm}/${skillFiles.length}`);
process.exit(invalidFm > 0 ? 1 : 0);
