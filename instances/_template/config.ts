/**
 * Agentic Creator OS - Multi-Project Configuration
 * 
 * Enables portable deployment across multiple projects with
 * project-specific configurations for brand voices, workflows, and skills.
 * 
 * Structure:
 * agentic-creator-os/
 * ├── instances/                    # Project-specific configurations
 * │   ├── frankx/
 * │   ├── arcanea/
 * │   ├── custom-project/
 * │   └── _template/
 * ├── skills/                       # Project-agnostic skills
 * ├── workflows/                    # Core workflows (shared)
 * ├── templates/                    # Core templates (shared)
 * ├── mcp-servers/                  # MCP servers
 * └── config.yaml                   # Global configuration
 */

import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE_NAME = 'agentic-creator-os.config.yaml';
const INSTANCES_DIR = 'instances';
const GLOBAL_CONFIG_FILE = 'config.yaml';

export interface ProjectConfig {
  name: string;
  slug: string;
  version: string;
  brand: {
    name: string;
    voice: {
      tone: string;
      personality: string[];
      keywords: string[];
      avoidKeywords: string[];
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  directories: {
    workflows: string;
    templates: string;
    skills: string;
    mcpServers: string;
  };
  integrations: {
    opencode: boolean;
    claudeCode: boolean;
    gemini: boolean;
  };
  skills: {
    enabled: string[];
    custom: Array<{
      name: string;
      file: string;
      triggers: string[];
    }>;
  };
  workflows: {
    enabled: string[];
    custom: Array<{
      name: string;
      file: string;
    }>;
  };
  evaluation: {
    enabled: boolean;
    strictMode: boolean;
    benchmarkAgainst: 'industry-average' | 'top-performers' | 'previous-outputs';
  };
}

export interface GlobalConfig {
  version: string;
  defaultInstance: string;
  instances: Record<string, {
    path: string;
    description: string;
  }>;
  sharedResources: {
    workflowsDir: string;
    templatesDir: string;
    skillsDir: string;
    mcpServersDir: string;
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    trackBySource: boolean;
  };
}

// Get the project root directory
export function getProjectRoot(): string {
  return path.dirname(path.dirname(path.dirname(path.dirname(__dirname))));
}

// Get the Agentic Creator OS root directory
export function getACOSRoot(): string {
  return path.dirname(path.dirname(__dirname));
}

// Find and load project configuration
export async function loadProjectConfig(projectPath?: string): Promise<ProjectConfig | null> {
  const searchPath = projectPath || getProjectRoot();
  const configPath = path.join(searchPath, CONFIG_FILE_NAME);
  
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as ProjectConfig;
  } catch {
    return null;
  }
}

// Load global configuration
export async function loadGlobalConfig(): Promise<GlobalConfig | null> {
  const acosRoot = getACOSRoot();
  const configPath = path.join(acosRoot, GLOBAL_CONFIG_FILE);
  
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as GlobalConfig;
  } catch {
    return null;
  }
}

// Save project configuration
export async function saveProjectConfig(config: ProjectConfig, projectPath?: string): Promise<void> {
  const searchPath = projectPath || getProjectRoot();
  const configPath = path.join(searchPath, CONFIG_FILE_NAME);
  
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

// Get instance configuration (project-specific)
export async function getInstanceConfig(instanceName: string): Promise<ProjectConfig | null> {
  const acosRoot = getACOSRoot();
  const instancePath = path.join(acosRoot, INSTANCES_DIR, instanceName);
  
  const configPath = path.join(instancePath, 'config.json');
  
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content) as ProjectConfig;
  } catch {
    return null;
  }
}

// List all available instances
export async function listInstances(): Promise<Array<{ name: string; description: string; path: string }>> {
  const acosRoot = getACOSRoot();
  const instancesPath = path.join(acosRoot, INSTANCES_DIR);
  
  try {
    const entries = await fs.readdir(instancesPath);
    const instances: Array<{ name: string; description: string; path: string }> = [];
    
    for (const entry of entries) {
      const entryPath = path.join(instancesPath, entry);
      const stat = await fs.stat(entryPath);
      
      if (stat.isDirectory() && entry !== '_template') {
        const configPath = path.join(entryPath, 'config.json');
        try {
          const content = await fs.readFile(configPath, 'utf-8');
          const config = JSON.parse(content) as ProjectConfig;
          instances.push({
            name: config.name,
            description: config.slug,
            path: entryPath,
          });
        } catch {
          instances.push({
            name: entry,
            description: 'Unknown instance',
            path: entryPath,
          });
        }
      }
    }
    
    return instances;
  } catch {
    return [];
  }
}

// Get effective configuration (instance overrides global)
export async function getEffectiveConfig(projectPath?: string): Promise<ProjectConfig | null> {
  // Try to load project-specific config first
  const projectConfig = await loadProjectConfig(projectPath);
  if (projectConfig) {
    return projectConfig;
  }
  
  // Try to load from instances
  const projectName = path.basename(projectPath || getProjectRoot());
  const instanceConfig = await getInstanceConfig(projectName);
  if (instanceConfig) {
    return instanceConfig;
  }
  
  // Return null if no config found
  return null;
}

// Create a new project instance from template
export async function createInstanceFromTemplate(
  instanceName: string,
  projectPath: string,
  overrides: Partial<ProjectConfig> = {}
): Promise<ProjectConfig> {
  const acosRoot = getACOSRoot();
  const templatePath = path.join(acosRoot, INSTANCES_DIR, '_template');
  
  // Load template
  const templateConfigPath = path.join(templatePath, 'config.json');
  const templateContent = await fs.readFile(templateConfigPath, 'utf-8');
  const template = JSON.parse(templateContent) as ProjectConfig;
  
  // Create new config with overrides
  const newConfig: ProjectConfig = {
    ...template,
    name: overrides.name || instanceName,
    slug: overrides.slug || instanceName.toLowerCase().replace(/\s+/g, '-'),
    brand: {
      ...template.brand,
      ...overrides.brand,
    },
  };
  
  // Ensure project directory exists
  await fs.mkdir(projectPath, { recursive: true });
  
  // Save config
  await saveProjectConfig(newConfig, projectPath);
  
  return newConfig;
}

// Export for use in other modules
export const config = {
  getProjectRoot,
  getACOSRoot,
  loadProjectConfig,
  loadGlobalConfig,
  saveProjectConfig,
  getInstanceConfig,
  listInstances,
  getEffectiveConfig,
  createInstanceFromTemplate,
};
