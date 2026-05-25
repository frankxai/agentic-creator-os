import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

function fail(message) {
  console.error(`ACOS harness check failed: ${message}`);
  process.exitCode = 1;
}

function requireText(path, pattern, label) {
  const text = read(path);
  if (!pattern.test(text)) {
    fail(`${path} missing ${label}`);
  }
}

const packageJson = readJson("package.json");
const harness = readJson(".agent-harness.json");

if (packageJson.version !== "11.0.0") {
  fail(`package.json version expected 11.0.0, got ${packageJson.version}`);
}

if (harness.health !== "npm run verify") {
  fail(`.agent-harness.json health expected "npm run verify", got "${harness.health}"`);
}

if (packageJson.scripts?.verify !== "npm run harness:check && npm audit && npm run build:all") {
  fail("package.json verify script must chain harness:check, npm audit, and build:all");
}

for (const path of ["AGENTS.md", "CLAUDE.md", "README.md", "adapters/README.md", "install.sh"]) {
  if (!existsSync(join(root, path))) {
    fail(`${path} is missing`);
  }
}

requireText("README.md", /Claude Code.*Cursor.*Windsurf.*Gemini.*Codex.*Antigravity.*OpenCode/is, "full platform support claim");
requireText("adapters/README.md", /Codex[\s\S]*AGENTS\.md/i, "Codex adapter row");
requireText("adapters/README.md", /Antigravity[\s\S]*\.antigravity\/instructions\.md/i, "Antigravity adapter row");
requireText("install.sh", /--platform=codex/i, "Codex install option");
requireText("install.sh", /--platform=antigravity/i, "Antigravity install option");
requireText("install.sh", /--platform=opencode/i, "OpenCode install option");
requireText("install.sh", /codex\)\s+generate_context_file "codex"/i, "Codex install routing");
requireText("install.sh", /antigravity\)\s+generate_context_file "antigravity"/i, "Antigravity install routing");
requireText("install.sh", /opencode\)\s+generate_context_file "opencode"[\s\S]*generate_opencode_config/i, "OpenCode templated config routing");
requireText("install.sh", /local supported="cursor,windsurf,gemini,codex,antigravity,opencode,generic"/i, "--platform=all portable coverage");
if (/\r/.test(read("install.sh"))) {
  fail("install.sh contains CRLF line endings; Bash execution requires LF");
}
if (!existsSync(join(root, ".gitattributes")) || !/install\.sh text eol=lf/.test(read(".gitattributes"))) {
  fail(".gitattributes must keep install.sh at LF line endings");
}
if (/FrankX\.AI - Vercel Website/i.test(read("opencode.json")) || /FrankX\.AI - Vercel Website/i.test(read("install.sh"))) {
  fail("OpenCode config must not contain stale FrankX absolute paths");
}
requireText("AGENTS.md", /v11/i, "v11 operating context");
requireText("CLAUDE.md", /v11/i, "v11 operating context");

const workspaceRoot = join(root, "mcp-servers");
for (const name of readdirSync(workspaceRoot)) {
  const packagePath = join(workspaceRoot, name, "package.json");
  if (!existsSync(packagePath)) continue;
  const workspacePackage = JSON.parse(readFileSync(packagePath, "utf8"));
  const build = workspacePackage.scripts?.build ?? "";
  if (!/esbuild src\/index\.ts --bundle/.test(build)) {
    fail(`mcp-servers/${name}/package.json build script is not the Windows-safe esbuild form`);
  }
}

if (!process.exitCode) {
  console.log("ACOS agent harness check passed.");
}
