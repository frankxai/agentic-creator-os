#!/usr/bin/env node

/**
 * ACOS-Antigravity Dynamic Registry Subsystem (Core ACOS)
 * Compiles Claude-style agent specifications (.md) into Antigravity subagent configurations (JSON)
 * works relative to the active workspace (CWD).
 */

import fs from 'fs';
import path from 'path';

// Resolve target paths relative to the current working directory (where the user runs the agent)
const CWD = process.cwd();
const AGENT_DIRS = [
  path.join(CWD, '.claude/agents'),
  path.join(CWD, 'departments'),
  path.join(CWD, 'agents')
];
const ANTIGRAVITY_DIR = path.join(CWD, '.antigravity');
const REGISTRY_JSON = path.join(ANTIGRAVITY_DIR, 'agents-registry.json');

// Global FrankX Directives to prepend to ALL subagent prompts
const VOICE_GUARD = `
# ==============================================================================
# FRANKX VOICE & BRAND GUARD (CRITICAL - DO NOT DEVIATE)
# ==============================================================================
- Voice: "Elite Creator. AI Architect. Humble Excellence." - direct, technical, results-first.
- Persona Title: Always "AI Architect" (NEVER "AI Systems Architect" or "Senior AI Architect").
- Banned AI-Slop Words (NEVER use): delve, dive into, it's worth noting, certainly, absolutely, unleash, unlock the power of, revolutionary, game-changing, the journey, elevate.
- Restraint: Let the work speak. Avoid exclamation marks or emoji in user-facing headers unless explicitly asked.
- Brand Integrity: No Arcanean mythology terms outside of '/ultraworld/*'.
# ==============================================================================
`;

// Helper to parse YAML frontmatter and markdown body
function parseAgentFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  
  let frontmatter = {};
  let body = fileContent;

  if (match) {
    const yamlSection = match[1];
    body = match[2];
    
    yamlSection.split(/\r?\n/).forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim();
        let val = line.substring(colonIdx + 1).trim();
        
        // Strip quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        
        // Simple bracket array parsing
        if (val.startsWith('[') && val.endsWith(']')) {
          val = val.substring(1, val.length - 1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        }
        
        frontmatter[key] = val;
      }
    });
  }

  const filename = path.basename(filePath, '.md');
  const fallbackName = filename.replace(/_/g, '-').toLowerCase();
  
  const name = frontmatter.name || fallbackName;
  const rawDescription = frontmatter.description || `Specialized ACOS agent: ${name}`;
  const description = rawDescription.replace(/^\|\s*/, '').replace(/\s+/g, ' ').trim();
  
  const toolsList = Array.isArray(frontmatter.tools) 
    ? frontmatter.tools 
    : (typeof frontmatter.tools === 'string' ? frontmatter.tools.split(',').map(t => t.trim()) : []);
  
  const lowerTools = toolsList.map(t => t.toLowerCase());
  const enable_write_tools = lowerTools.some(t => ['write', 'edit', 'bash', 'filesystem', 'write_file'].includes(t)) || true;
  const enable_mcp_tools = lowerTools.some(t => ['mcp', 'creator-mcp'].includes(t)) || true;
  const enable_subagent_tools = ['aco-router', 'multimodal-orchestrator', 'business-ops-orchestrator', 'workshop-orchestrator', 'research-orchestrator'].includes(name) || true;

  const system_prompt = VOICE_GUARD + '\n' + body.trim();

  return {
    name,
    description,
    system_prompt,
    enable_write_tools,
    enable_mcp_tools,
    enable_subagent_tools,
    metadata: {
      original_file: path.relative(CWD, filePath),
      model_preference: frontmatter.model || 'inherited'
    }
  };
}

// Find all agent definition files in whitelisted paths
function scanAgents() {
  const agents = {};
  
  for (const dir of AGENT_DIRS) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      if (file.isDirectory()) {
        const subDir = path.join(dir, file.name);
        const subFiles = fs.readdirSync(subDir);
        for (const subFile of subFiles) {
          if (subFile.endsWith('.md')) {
            const filePath = path.join(subDir, subFile);
            try {
              const parsed = parseAgentFile(filePath);
              agents[parsed.name] = parsed;
            } catch (err) {
              // skip
            }
          }
        }
      } else if (file.name.endsWith('.md') && file.name !== 'README.md' && file.name !== 'CLAUDE.md') {
        const filePath = path.join(dir, file.name);
        try {
          const parsed = parseAgentFile(filePath);
          agents[parsed.name] = parsed;
        } catch (err) {
          // skip
        }
      }
    }
  }
  
  return agents;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--list';

  // Scan and parse CWD ACOS context
  const allAgents = scanAgents();

  // If ACOS is present in CWD, update/cache registry JSON
  if (Object.keys(allAgents).length > 0) {
    if (!fs.existsSync(ANTIGRAVITY_DIR)) {
      fs.mkdirSync(ANTIGRAVITY_DIR, { recursive: true });
    }
    fs.writeFileSync(REGISTRY_JSON, JSON.stringify(allAgents, null, 2), 'utf-8');
  }

  if (command === '--list' || command === '-l') {
    if (Object.keys(allAgents).length === 0) {
      console.log(`\n\x1b[33m[Warning] No ACOS agent specifications found in ${CWD}.\x1b[0m`);
      console.log(`Run this command inside an ACOS-activated workspace (containing .claude/agents/ or departments/).\n`);
      return;
    }

    console.log(`\n🚀 ACOS Dynamic Registry - ${Object.keys(allAgents).length} Agents Active\n`);
    Object.keys(allAgents).sort().forEach(name => {
      const agent = allAgents[name];
      const desc = agent.description.length > 80 ? agent.description.substring(0, 77) + '...' : agent.description;
      console.log(`  * \x1b[36m${name.padEnd(30)}\x1b[0m - ${desc}`);
    });
    console.log(`\nCache refreshed at: ${REGISTRY_JSON}\n`);
    return;
  }

  if (command === '--all' || command === '-a') {
    console.log(JSON.stringify(allAgents, null, 2));
    return;
  }

  // Lookup agent by name
  const targetName = command.replace(/^@/, '');
  const agent = allAgents[targetName];

  if (!agent) {
    console.error(`\x1b[31m[Error] Agent "${targetName}" not found in ACOS specs at ${CWD}.\x1b[0m`);
    process.exit(1);
  }

  console.log(JSON.stringify({
    name: agent.name,
    description: agent.description,
    system_prompt: agent.system_prompt,
    enable_write_tools: agent.enable_write_tools,
    enable_mcp_tools: agent.enable_mcp_tools,
    enable_subagent_tools: agent.enable_subagent_tools
  }, null, 2));
}

main();
