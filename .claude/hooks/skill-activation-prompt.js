#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const MAX_CACHE = 100;
const PATTERN_TTL = 60000;
const RULES_TTL = 30000;

const patternCache = new Map();
const rulesCache = new Map();

const EARLY_EXITS = [/^(help|version|list|status|quit|exit|clear)$/i, /^\s*$/];
const PRIORITY = { critical: 0, high: 1, medium: 2, low: 3 };

function getCachedPattern(regexStr) {
    const now = Date.now();
    const entry = patternCache.get(regexStr);

    if (entry && (now - entry.created) < PATTERN_TTL) {
        patternCache.delete(regexStr);
        patternCache.set(regexStr, entry);
        return entry.regex;
    }

    try {
        const regex = new RegExp(regexStr, 'i');
        if (patternCache.size >= MAX_CACHE) {
            patternCache.delete(patternCache.keys().next().value);
        }
        patternCache.set(regexStr, { regex, created: now });
        return regex;
    } catch {
        return null;
    }
}

function getCachedRules(rulesPath) {
    const now = Date.now();
    const entry = rulesCache.get(rulesPath);

    if (entry && (now - entry.created) < RULES_TTL) {
        return entry.rules;
    }

    try {
        if (!fs.existsSync(rulesPath)) return null;
        const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
        rulesCache.set(rulesPath, { rules, created: now });
        return rules;
    } catch {
        return null;
    }
}

function isEarlyExit(prompt) {
    const t = prompt.trim();
    if (t.length === 0) return true;
    if (t.length < 15) return EARLY_EXITS.some(r => r.test(t));
    return false;
}

function kwToRegex(kw) {
    return '\\b' + kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b';
}

function globToRegex(p) {
    return p.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '.');
}

function findMatches(rules, prompt, currentFile, isAgent) {
    const matches = [];
    const target = isAgent ? rules.agents : rules.skills;
    if (!target) return matches;

    for (const [name, config] of Object.entries(target)) {
        const trig = config.promptTriggers;
        if (!trig) continue;

        if (trig.keywords) {
            for (const kw of trig.keywords) {
                if (getCachedPattern(kwToRegex(kw))?.test(prompt)) {
                    matches.push({ name, matchType: 'keyword', config, priority: config.priority });
                    break;
                }
            }
            continue;
        }

        if (trig.intentPatterns) {
            for (const pat of trig.intentPatterns) {
                if (getCachedPattern(pat)?.test(prompt)) {
                    matches.push({ name, matchType: 'intent', config, priority: config.priority });
                    break;
                }
            }
        }

        if (!isAgent && config.fileTriggers?.pathPatterns && currentFile) {
            for (const pat of config.fileTriggers.pathPatterns) {
                if (getCachedPattern(globToRegex(pat))?.test(currentFile)) {
                    matches.push({ name, matchType: 'file', config, priority: config.priority });
                    break;
                }
            }
        }
    }

    return matches;
}

function buildOutput(skills, agents) {
    if (skills.length === 0 && agents.length === 0) return null;

    const sortBy = (a, b) => PRIORITY[a.priority] - PRIORITY[b.priority];

    const mustSkills = [...skills.filter(s => s.priority === 'critical'),
                        ...skills.filter(s => s.priority === 'high')].sort(sortBy);
    const mustAgents = [...agents.filter(a => a.priority === 'critical'),
                        ...agents.filter(a => a.priority === 'high')].sort(sortBy);
    const suggestSkills = [...skills.filter(s => s.priority === 'medium'),
                          ...skills.filter(s => s.priority === 'low')].sort(sortBy);
    const suggestAgents = [...agents.filter(a => a.priority === 'medium'),
                          ...agents.filter(a => a.priority === 'low')].sort(sortBy);

    const ctx = [];

    if (mustSkills.length > 0 || mustAgents.length > 0) {
        ctx.push('IMPORTANT GUIDELINES:\n');
        if (mustSkills.length > 0) {
            const name = mustSkills[0].name.replace(/-/g, ' ');
            const others = mustSkills.slice(1).map(s => s.name.replace(/-/g, ' '));
            ctx.push(`The "${name}" skill contains critical best practices.`);
            ctx.push('Review guidelines for: patterns, approach, quality');
            if (others.length > 0) ctx.push(`Also: ${others.join(', ')}`);
            ctx.push('');
        }
        if (mustAgents.length > 0) {
            const name = mustAgents[0].name.replace(/-/g, ' ');
            const desc = mustAgents[0].config.description;
            ctx.push('RECOMMENDED: Use "' + name + '" subagent');
            if (desc) ctx.push('Specialty: ' + desc);
            ctx.push('Say: "Use ' + name + ' subagent"');
            ctx.push('');
        }
    }

    if (suggestSkills.length > 0 || suggestAgents.length > 0) {
        ctx.push(mustSkills.length || mustAgents.length ? 'SUGGESTIONS:\n' : 'SUGGESTED:\n');
        if (suggestSkills.length) {
            ctx.push('- Skills: ' + suggestSkills.map(s => s.name.replace(/-/g, ' ')).join(', '));
        }
        if (suggestAgents.length) {
            ctx.push('- Agents: ' + suggestAgents.map(a => a.name.replace(/-/g, ' ')).join(', '));
        }
    }

    return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: ctx.join('\n') } };
}

function updateActiveTrajectory(prompt) {
    // Update active trajectory with prompt count and task detection
    const trajDir = path.join(process.env.CLAUDE_PROJECT_DIR || path.join(__dirname, '..', '..'),
                              '.claude', 'trajectories');
    const metaPath = path.join(trajDir, '_active.json');
    try {
        if (!fs.existsSync(metaPath)) return null;
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        meta.promptCount = (meta.promptCount || 0) + 1;
        // Set task from first meaningful prompt
        if (!meta.task && prompt.length > 10) {
            meta.task = prompt.slice(0, 200);
        }
        fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
        return meta;
    } catch { return null; }
}

function getTrajectoryHint(prompt) {
    // Check reasoning bank for similar past work
    const trajDir = path.join(process.env.CLAUDE_PROJECT_DIR || path.join(__dirname, '..', '..'),
                              '.claude', 'trajectories');
    try {
        if (!fs.existsSync(trajDir)) return null;
        const files = fs.readdirSync(trajDir)
            .filter(f => f.endsWith('.json') && !f.startsWith('_') && f !== 'patterns.json');
        if (files.length === 0) return null;

        const promptWords = new Set(prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3));
        if (promptWords.size < 2) return null;

        let bestMatch = null;
        let bestScore = 0;

        for (const f of files.slice(-30)) {
            try {
                const traj = JSON.parse(fs.readFileSync(path.join(trajDir, f), 'utf-8'));
                if (!traj.task) continue;
                const taskWords = new Set(traj.task.toLowerCase().split(/\s+/).filter(w => w.length > 3));
                const overlap = [...promptWords].filter(w => taskWords.has(w)).length;
                const score = overlap / Math.max(promptWords.size, taskWords.size);
                if (score > bestScore && score > 0.25) {
                    bestScore = score;
                    bestMatch = traj;
                }
            } catch { continue; }
        }

        if (bestMatch) {
            return `Trajectory hint: Similar past work "${bestMatch.task?.slice(0, 80)}" scored ${(bestMatch.successScore * 100).toFixed(0)}% success (${bestMatch.operationCount || '?'} ops, type: ${bestMatch.type})`;
        }
    } catch { /* silent */ }
    return null;
}

function main() {
    try {
        const data = JSON.parse(fs.readFileSync(0, 'utf-8'));
        if (isEarlyExit(data.prompt.toLowerCase())) process.exit(0);

        // Update active trajectory
        updateActiveTrajectory(data.prompt);

        const rulesPath = path.join(process.env.CLAUDE_PROJECT_DIR || path.join(__dirname, '..', '..'),
                                   '.claude', 'skills', 'skill-rules.json');
        const rules = getCachedRules(rulesPath);
        if (!rules) process.exit(0);

        const skills = findMatches(rules, data.prompt.toLowerCase(), data.cwd || '', false);
        const agents = findMatches(rules, data.prompt.toLowerCase(), null, true);

        const out = buildOutput(skills, agents);

        // Add trajectory hint if available
        const hint = getTrajectoryHint(data.prompt);

        if (out || hint) {
            const result = out || { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: '' } };
            if (hint) {
                const existing = result.hookSpecificOutput.additionalContext || '';
                result.hookSpecificOutput.additionalContext = (existing ? existing + '\n\n' : '') + hint;
            }
            console.log(JSON.stringify(result));
        }
        process.exit(0);
    } catch {
        process.exit(0);
    }
}

main();