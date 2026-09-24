import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const SKILLS = ['handoff-clean', 'review-a-diff', 'run-the-checks', 'start-safely', 'stated-voice']
const SCHEMA = 'creator-os.practice-receipt.v1'
const SECRET = /(?:^|[^A-Za-z0-9])sk-[A-Za-z0-9]{8,}|ghp_[A-Za-z0-9]{20,}|github_pat_|xai-[A-Za-z0-9]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:api[_-]?key|token|secret)\s*[:=]\s*\S+/i

export function checkReceipt(receipt) {
  const errors = []
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    return { yes: false, verdict: 'no', signed: false, errors: ['Receipt must be an object.'] }
  }
  const allowed = new Set(['schema', 'skill', 'finishedAt', 'outcome', 'command', 'summary'])
  for (const key of Object.keys(receipt)) {
    if (!allowed.has(key)) errors.push(`Unexpected field: ${key}`)
  }
  if (receipt.schema !== SCHEMA) errors.push(`schema must be ${SCHEMA}`)
  if (!SKILLS.includes(receipt.skill)) errors.push('skill must be one of the five creator-os-core practices')
  if (typeof receipt.finishedAt !== 'string' || !receipt.finishedAt.includes('T') || Number.isNaN(Date.parse(receipt.finishedAt))) {
    errors.push('finishedAt must be a date-time string')
  }
  if (receipt.outcome !== 'pass' && receipt.outcome !== 'fail') errors.push('outcome must be pass or fail')
  if (typeof receipt.command !== 'string' || receipt.command.length < 1 || receipt.command.length > 200) {
    errors.push('command must be 1 to 200 characters')
  }
  if (typeof receipt.summary !== 'string' || receipt.summary.length < 1 || receipt.summary.length > 280) {
    errors.push('summary must be 1 to 280 characters')
  }
  const text = `${receipt.command ?? ''}\n${receipt.summary ?? ''}`
  if (SECRET.test(text)) errors.push('Receipt text looks like a secret. Remove it and check again.')
  return {
    yes: errors.length === 0,
    verdict: errors.length === 0 ? 'yes' : 'no',
    signed: false,
    errors,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2]
  if (!file) {
    console.log(JSON.stringify({ yes: false, verdict: 'no', signed: false, errors: ['Pass a receipt JSON file.'] }))
    process.exit(1)
  }
  const result = checkReceipt(JSON.parse(readFileSync(file, 'utf8')))
  console.log(JSON.stringify(result))
  process.exit(result.yes ? 0 : 1)
}
