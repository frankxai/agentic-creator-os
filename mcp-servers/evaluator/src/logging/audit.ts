/**
 * Audit Logging Module
 * 
 * Provides comprehensive logging of all evaluations with source tracking
 * to distinguish between ClaudeCode, OpenCode, and other AI assistants.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_DIR = path.join(__dirname, '..', '..', '..', '..', '.claude', 'agentic-creator-os', 'audit');

// Ensure audit directory exists
async function ensureAuditDir() {
  try {
    await fs.mkdir(AUDIT_DIR, { recursive: true });
  } catch (error) {
    // Directory might exist
  }
}

export interface AuditEntry {
  id: string;
  type: 'content-evaluation' | 'hook-evaluation' | 'performance-tracking' | 'session-start' | 'session-end';
  source: 'claude-code' | 'opencode' | 'gemini' | 'custom';
  sessionId?: string;
  projectId?: string;
  workflowId?: string;
  contentType?: string;
  platform?: string;
  result?: any;
  timestamp: string;
  metadata?: {
    contentLength?: number;
    platformVersion?: string;
    mcpVersion?: string;
    [key: string]: any;
  };
}

export interface SessionLog {
  sessionId: string;
  project: string;
  source: string;
  startTime: string;
  endTime?: string;
  evaluations: number;
  lastActivity: string;
}

export async function logEvaluation(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<string> {
  await ensureAuditDir();
  
  const id = `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const fullEntry: AuditEntry = {
    ...entry,
    id,
    timestamp: new Date().toISOString(),
  };
  
  // Write to audit file
  const date = new Date().toISOString().split('T')[0];
  const filePath = path.join(AUDIT_DIR, `${date}.jsonl`);
  await fs.appendFile(filePath, JSON.stringify(fullEntry) + '\n');
  
  // Write to source-specific file for easy filtering
  const sourceFilePath = path.join(AUDIT_DIR, `${entry.source}.jsonl`);
  await fs.appendFile(sourceFilePath, JSON.stringify(fullEntry) + '\n');
  
  return id;
}

export async function logSession(args: {
  sessionId: string;
  project: string;
  source: 'claude-code' | 'opencode' | 'gemini' | 'custom';
  action: 'start' | 'end';
}): Promise<void> {
  await ensureAuditDir();
  
  const entry: AuditEntry = {
    id: `session-${Date.now()}`,
    type: args.action === 'start' ? 'session-start' : 'session-end',
    source: args.source,
    sessionId: args.sessionId,
    projectId: args.project,
    timestamp: new Date().toISOString(),
  };
  
  const date = new Date().toISOString().split('T')[0];
  const filePath = path.join(AUDIT_DIR, `${date}.jsonl`);
  await fs.appendFile(filePath, JSON.stringify(entry) + '\n');
}

export async function getAuditTrail(args: {
  sessionId?: string;
  projectId?: string;
  source?: 'claude-code' | 'opencode' | 'gemini' | 'all';
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<AuditEntry[]> {
  await ensureAuditDir();
  
  const { sessionId, projectId, source, startDate, endDate, limit = 100 } = args;
  
  const entries: AuditEntry[] = [];
  
  // Determine which files to read
  const filesToRead: string[] = [];
  
  if (source && source !== 'all') {
    filesToRead.push(path.join(AUDIT_DIR, `${source}.jsonl`));
  } else {
    // Read all date files in range
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Read from .claude/agentic-creator-os/audit directory
    try {
      const allFiles = await fs.readdir(AUDIT_DIR);
      for (const file of allFiles) {
        if (file.match(/^\d{4}-\d{2}-\d{2}\.jsonl$/)) {
          const fileDate = new Date(file.replace('.jsonl', ''));
          if (fileDate >= start && fileDate <= end) {
            filesToRead.push(path.join(AUDIT_DIR, file));
          }
        }
      }
    } catch {
      // Directory might be empty
    }
  }
  
  // Read and filter entries
  for (const filePath of filesToRead) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.trim().split('\n');
      
      for (const line of lines) {
        const entry = JSON.parse(line) as AuditEntry;
        
        // Apply filters
        if (sessionId && entry.sessionId !== sessionId) continue;
        if (projectId && entry.projectId !== projectId) continue;
        if (source && source !== 'all' && entry.source !== source) continue;
        
        entries.push(entry);
      }
    } catch {
      // Skip unreadable files
    }
  }
  
  // Sort by timestamp descending and limit
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return entries.slice(0, limit);
}

export async function getSessionSummary(source?: 'claude-code' | 'opencode' | 'gemini' | 'all'): Promise<{
  totalSessions: number;
  totalEvaluations: number;
  bySource: Record<string, number>;
  recentSessions: SessionLog[];
}> {
  await ensureAuditDir();
  
  const auditTrail = await getAuditTrail({ source, limit: 1000 });
  
  // Count by source
  const bySource: Record<string, number> = {};
  let totalEvaluations = 0;
  
  // Group session starts
  const sessions: Record<string, SessionLog> = {};
  
  for (const entry of auditTrail) {
    if (entry.type === 'content-evaluation' || entry.type === 'hook-evaluation') {
      totalEvaluations++;
      bySource[entry.source] = (bySource[entry.source] || 0) + 1;
    }
    
    if (entry.type === 'session-start' && entry.sessionId) {
      sessions[entry.sessionId] = {
        sessionId: entry.sessionId,
        project: entry.projectId || 'unknown',
        source: entry.source,
        startTime: entry.timestamp,
        evaluations: 0,
        lastActivity: entry.timestamp,
      };
    }
    
    if (entry.type === 'session-end' && entry.sessionId && sessions[entry.sessionId]) {
      sessions[entry.sessionId].endTime = entry.timestamp;
    }
    
    if (entry.type.startsWith('content-evaluation') && entry.sessionId && sessions[entry.sessionId]) {
      sessions[entry.sessionId].evaluations++;
      sessions[entry.sessionId].lastActivity = entry.timestamp;
    }
  }
  
  const recentSessions = Object.values(sessions)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10);
  
  return {
    totalSessions: Object.keys(sessions).length,
    totalEvaluations,
    bySource,
    recentSessions,
  };
}

// Auto-logging utility for integrations
export function createEvaluationLogger(source: 'claude-code' | 'opencode' | 'gemini' | 'custom') {
  return {
    log: (entry: Omit<AuditEntry, 'id' | 'timestamp' | 'source'>) => 
      logEvaluation({ ...entry, source }),
    logSession: (sessionId: string, project: string, action: 'start' | 'end') =>
      logSession({ sessionId, project, source, action }),
  };
}
