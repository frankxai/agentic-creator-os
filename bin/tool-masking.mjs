#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function globToRegExp(glob) {
  const parts = glob.split('/**/').map(p => {
    return p.split('**').map(s => {
      return s.split('*').map(x => x.replace(/[.+^${}()|[\]\\]/g, '\\$&')).join('[^/]*')
    }).join('.*')
  })
  return new RegExp('^' + parts.join('(?:/.*)?/?') + '$')
}

export class ToolMaskingEngine {
  constructor(policyData) {
    this.maskPolicy = policyData
  }

  filterTools(allTools, agentProfile) {
    const profile = this.maskPolicy.profiles[agentProfile]
    if (!profile) {
      // Return basic filesystem read-only set if profile is unrecognized
      return allTools.filter(t => 
        this.maskPolicy.categories.filesystem.includes(t.name) && t.name !== 'write_file'
      )
    }

    return allTools.filter((tool) => {
      // 1. Check explicit denies
      if (profile.denyIndividualTools?.includes(tool.name)) {
        return false
      }

      // 2. Check explicit allows
      if (profile.allowIndividualTools?.includes(tool.name)) {
        return true
      }

      // 3. Check category allocations
      let allowedByCategory = false
      if (profile.allowCategories) {
        for (const catName of profile.allowCategories) {
          const categoryTools = this.maskPolicy.categories[catName]
          if (categoryTools?.includes(tool.name)) {
            allowedByCategory = true
            break
          }
        }
      }

      return allowedByCategory
    })
  }

  enforceWriteScope(agentProfile, targetFilePath) {
    const profile = this.maskPolicy.profiles[agentProfile]
    if (!profile) return false
    if (profile.readOnly) return false
    if (!profile.fileSystemScope) return false

    // Check glob patterns
    return profile.fileSystemScope.some((pattern) => {
      const regex = globToRegExp(pattern)
      return regex.test(targetFilePath)
    })
  }
}

// Quick CLI check capability
if (process.argv[1] && (process.argv[1].endsWith('tool-masking.mjs') || process.argv[1].endsWith('tool-masking'))) {
  const configPath = join(__dirname, 'tool-masks.json')
  if (existsSync(configPath)) {
    const policy = JSON.parse(readFileSync(configPath, 'utf-8'))
    const engine = new ToolMaskingEngine(policy)
    console.log('Tool Masking Engine Initialized.')
    console.log('Testing write scope of blog-writer on content/posts/test.md:', engine.enforceWriteScope('blog-writer', 'content/posts/test.md'))
    console.log('Testing write scope of blog-writer on src/index.ts:', engine.enforceWriteScope('blog-writer', 'src/index.ts'))
  }
}
