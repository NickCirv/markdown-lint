#!/usr/bin/env node
// markdown-lint — Zero-dependency markdown linter
// Node 18+ ES modules

import { readFileSync, writeFileSync, statSync, readdirSync, existsSync } from 'fs'
import { resolve, join, extname, relative } from 'path'
import { request } from 'https'
import { request as httpRequest } from 'http'

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  MD001: true,
  MD002: true,
  MD003: true,
  MD004: true,
  MD009: true,
  MD010: true,
  MD012: true,
  MD013: { enabled: true, line_length: 120 },
  MD022: true,
  MD025: true,
  MD031: true,
  MD032: true,
  MD033: true,
  MD034: true,
  MD041: true,
}

function loadConfig(cwd) {
  const cfgPath = join(cwd, '.mdlintrc.json')
  if (!existsSync(cfgPath)) return DEFAULT_CONFIG
  try {
    const raw = readFileSync(cfgPath, 'utf8')
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

function isEnabled(config, rule) {
  const val = config[rule]
  if (val === undefined) return true
  if (typeof val === 'boolean') return val
  if (typeof val === 'object') return val.enabled !== false
  return true
}

// ─── ANSI Colors ──────────────────────────────────────────────────────────────

const isTTY = process.stdout.isTTY
const c = {
  red:    (s) => isTTY ? `\x1b[31m${s}\x1b[0m` : s,
  yellow: (s) => isTTY ? `\x1b[33m${s}\x1b[0m` : s,
  green:  (s) => isTTY ? `\x1b[32m${s}\x1b[0m` : s,
  cyan:   (s) => isTTY ? `\x1b[36m${s}\x1b[0m` : s,
  bold:   (s) => isTTY ? `\x1b[1m${s}\x1b[0m`  : s,
  dim:    (s) => isTTY ? `\x1b[2m${s}\x1b[0m`  : s,
}

// ─── Rules ────────────────────────────────────────────────────────────────────

function lint(content, config) {
  const lines = content.split('\n')
  const diags = []

  function err(rule, line, col, message, fixable = false) {
    diags.push({ rule, line, col, severity: 'error', message, fixable })
  }
  function warn(rule, line, col, message, fixable = false) {
    diags.push({ rule, line, col, severity: 'warning', message, fixable })
  }

  function headingLevel(line) {
    const m = line.match(/^(#{1,6})(\s|$)/)
    return m ? m[1].length : 0
  }

  function isFencedMarker(line) {
    return /^(`{3,}|~{3,})/.test(line.trim())
  }

  function isBullet(line) {
    return /^(\s*)([-*+])\s/.test(line)
  }

  function isOrderedItem(line) {
    return /^\s*\d+\.\s/.test(line)
  }

  function isListItem(line) {
    return isBullet(line) || isOrderedItem(line)
  }

  function isBlank(line) {
    return line.trim() === ''
  }

  // State
  let inFenced = false
  let fenceChar = ''
  let headingStyle = null
  let listMarker = null
  let h1Count = 0
  let prevHeadingLevel = 0
  let headingCount = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    const nextLine = lines[i + 1]
    const prevLine = i > 0 ? lines[i - 1] : null

    // Track fenced code blocks
    if (isFencedMarker(line)) {
      if (!inFenced) {
        inFenced = true
        fenceChar = line.trim()[0]
        // MD031 — blank line before fenced block
        if (isEnabled(config, 'MD031') && prevLine !== null && prevLine !== undefined && !isBlank(prevLine) && !isFencedMarker(prevLine)) {
          err('MD031', lineNum, 1, 'Fenced code blocks should be surrounded by blank lines (missing blank before)')
        }
      } else if (line.trim()[0] === fenceChar) {
        inFenced = false
        // MD031 — blank line after fenced block
        if (isEnabled(config, 'MD031') && nextLine !== undefined && !isBlank(nextLine) && !isFencedMarker(nextLine)) {
          err('MD031', lineNum, 1, 'Fenced code blocks should be surrounded by blank lines (missing blank after)')
        }
      }
      continue
    }

    if (inFenced) continue

    // MD009 — trailing spaces
    if (isEnabled(config, 'MD009') && /[ \t]+$/.test(line)) {
      err('MD009', lineNum, line.trimEnd().length + 1, 'Trailing spaces', true)
    }

    // MD010 — hard tabs
    if (isEnabled(config, 'MD010') && line.includes('\t')) {
      err('MD010', lineNum, line.indexOf('\t') + 1, 'Hard tabs found (use spaces instead)')
    }

    // MD013 — line length
    const lineLenCfg = config['MD013']
    const maxLen = (typeof lineLenCfg === 'object' ? lineLenCfg.line_length : 120) || 120
    if (isEnabled(config, 'MD013') && line.length > maxLen) {
      warn('MD013', lineNum, maxLen + 1, `Line length ${line.length} exceeds limit of ${maxLen}`)
    }

    // MD033 — inline HTML
    if (isEnabled(config, 'MD033') && /<[a-zA-Z][^>]*>/.test(line)) {
      warn('MD033', lineNum, 1, 'Inline HTML detected')
    }

    // MD034 — bare URLs
    if (isEnabled(config, 'MD034')) {
      const bareUrlRegex = /(?<![<(\[])(https?:\/\/[^\s>)\]]+)/g
      let match
      while ((match = bareUrlRegex.exec(line)) !== null) {
        const before = line.slice(0, match.index)
        const inAngle = before.split('<').length > before.split('>').length
        const inMarkdownLink = /\[[^\]]*\]\($/.test(before) || /\[[^\]]*\]\([^)]*$/.test(before)
        if (!inAngle && !inMarkdownLink) {
          err('MD034', lineNum, match.index + 1, `Bare URL found: ${match[1]} (wrap in angle brackets or markdown link)`, true)
        }
      }
    }

    // Heading checks
    const level = headingLevel(line)
    if (level > 0) {
      headingCount++

      // MD001 — heading increment
      if (isEnabled(config, 'MD001') && prevHeadingLevel > 0 && level > prevHeadingLevel + 1) {
        err('MD001', lineNum, 1, `Heading level skipped: h${prevHeadingLevel} to h${level} (should increment by 1)`)
      }
      prevHeadingLevel = level

      // MD002 — first heading must be h1
      if (isEnabled(config, 'MD002') && headingCount === 1 && level !== 1) {
        err('MD002', lineNum, 1, `First heading must be h1, found h${level}`)
      }

      // MD003 — consistent heading style (ATX only in this parser)
      const thisStyle = 'atx'
      if (headingStyle === null) {
        headingStyle = thisStyle
      }

      // MD025 — single h1
      if (level === 1) {
        h1Count++
        if (isEnabled(config, 'MD025') && h1Count > 1) {
          err('MD025', lineNum, 1, 'Multiple h1 headings found (only one allowed per document)')
        }
      }

      // MD022 — blank lines around headings
      if (isEnabled(config, 'MD022')) {
        if (prevLine !== null && prevLine !== undefined && !isBlank(prevLine) && lineNum > 1) {
          err('MD022', lineNum, 1, 'Heading should have a blank line before it')
        }
        if (nextLine !== undefined && !isBlank(nextLine)) {
          err('MD022', lineNum, 1, 'Heading should have a blank line after it')
        }
      }

      continue
    }

    // MD004 — consistent list marker
    if (isEnabled(config, 'MD004') && isBullet(line)) {
      const markerMatch = line.match(/^(\s*)([-*+])\s/)
      if (markerMatch) {
        const marker = markerMatch[2]
        if (listMarker === null) {
          listMarker = marker
        } else if (marker !== listMarker) {
          err('MD004', lineNum, 1, `Inconsistent list marker: found "${marker}", expected "${listMarker}"`)
        }
      }
    }

    // MD032 — lists surrounded by blank lines
    if (isEnabled(config, 'MD032')) {
      if (isListItem(line) && prevLine !== null && prevLine !== undefined && !isBlank(prevLine) && !isListItem(prevLine) && lineNum > 1) {
        err('MD032', lineNum, 1, 'List should have a blank line before it')
      }
      if (!isListItem(line) && !isBlank(line) && prevLine !== null && prevLine !== undefined && isListItem(prevLine)) {
        err('MD032', lineNum, 1, 'List should have a blank line after it')
      }
    }
  }

  // MD012 — multiple consecutive blank lines
  if (isEnabled(config, 'MD012')) {
    let blanks = 0
    for (let i = 0; i < lines.length; i++) {
      if (isBlank(lines[i])) {
        blanks++
        if (blanks > 1) {
          err('MD012', i + 1, 1, 'Multiple consecutive blank lines', true)
        }
      } else {
        blanks = 0
      }
    }
  }

  // MD041 — first line should be a heading
  if (isEnabled(config, 'MD041')) {
    const firstNonEmpty = lines.find(l => l.trim() !== '')
    if (firstNonEmpty && headingLevel(firstNonEmpty) === 0) {
      err('MD041', 1, 1, 'First line should be a top-level heading (h1)')
    }
  }

  return diags
}

// ─── Auto-fix ─────────────────────────────────────────────────────────────────

function applyFix(content) {
  let lines = content.split('\n')

  // MD009 — remove trailing spaces
  lines = lines.map(line => line.replace(/[ \t]+$/, ''))

  // MD012 — collapse multiple blank lines
  const collapsed = []
  let blanks = 0
  for (const line of lines) {
    if (line.trim() === '') {
      blanks++
      if (blanks <= 1) collapsed.push(line)
    } else {
      blanks = 0
      collapsed.push(line)
    }
  }
  lines = collapsed

  // MD034 — wrap bare URLs in angle brackets
  lines = lines.map(line => {
    return line.replace(/(?<![<(\[])(https?:\/\/[^\s>)\]]+)/g, (match, url, offset) => {
      const before = line.slice(0, offset)
      const inAngle = before.split('<').length > before.split('>').length
      const inMarkdownLink = /\[[^\]]*\]\($/.test(before) || /\[[^\]]*\]\([^)]*$/.test(before)
      if (!inAngle && !inMarkdownLink) return `<${url}>`
      return match
    })
  })

  return lines.join('\n')
}

// ─── Link Checking ────────────────────────────────────────────────────────────

function extractUrls(content) {
  const urls = []
  const mdLink = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g
  const angleLink = /<(https?:\/\/[^>]+)>/g
  let m
  while ((m = mdLink.exec(content)) !== null) urls.push(m[2])
  while ((m = angleLink.exec(content)) !== null) urls.push(m[1])
  return [...new Set(urls)]
}

function checkUrl(url, timeout = 8000) {
  return new Promise((resolveP) => {
    let parsed
    try { parsed = new URL(url) } catch { return resolveP({ url, status: 0, ok: false, error: 'Invalid URL' }) }

    const lib = parsed.protocol === 'https:' ? request : httpRequest
    const timer = setTimeout(() => {
      req.destroy()
      resolveP({ url, status: 0, ok: false, error: 'Timeout' })
    }, timeout)

    const req = lib(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: 'HEAD', headers: { 'User-Agent': 'markdown-lint/1.0.0' } },
      (res) => {
        clearTimeout(timer)
        const status = res.statusCode || 0
        if (status >= 301 && status <= 308 && res.headers.location) {
          checkUrl(res.headers.location, timeout).then(resolveP)
          return
        }
        resolveP({ url, status, ok: status >= 200 && status < 300 })
      }
    )
    req.on('error', (e) => {
      clearTimeout(timer)
      resolveP({ url, status: 0, ok: false, error: e.message })
    })
    req.end()
  })
}

// ─── File Discovery ───────────────────────────────────────────────────────────

function collectFiles(target, ignorePatterns) {
  const files = []

  function shouldIgnore(filePath) {
    if (!ignorePatterns || ignorePatterns.length === 0) return false
    const rel = relative(process.cwd(), filePath)
    return ignorePatterns.some(pat => rel.includes(pat) || filePath.includes(pat))
  }

  function walk(dir) {
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      const full = join(dir, e.name)
      if (shouldIgnore(full)) continue
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git') continue
        walk(full)
      } else if (e.isFile() && extname(e.name).toLowerCase() === '.md') {
        files.push(full)
      }
    }
  }

  let stat
  try { stat = statSync(target) } catch {
    walk(process.cwd())
    return files
  }

  if (stat.isDirectory()) {
    walk(target)
  } else {
    if (!shouldIgnore(target)) files.push(resolve(target))
  }

  return files
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatText(filePath, diags) {
  if (diags.length === 0) {
    console.log(c.green('pass') + '  ' + c.dim(filePath))
    return
  }
  console.log(c.bold(filePath))
  for (const d of diags) {
    const loc = c.dim(`  ${String(d.line).padStart(4)}:${String(d.col).padEnd(4)}`)
    const sev = d.severity === 'error' ? c.red('error  ') : c.yellow('warning')
    const fix = d.fixable ? c.cyan(' [fixable]') : ''
    console.log(`${loc}  ${sev}  ${d.message}  ${c.dim(d.rule)}${fix}`)
  }
}

function formatJson(results) {
  console.log(JSON.stringify(results, null, 2))
}

function formatGithub(filePath, diags) {
  for (const d of diags) {
    const level = d.severity === 'error' ? 'error' : 'warning'
    console.log(`::${level} file=${filePath},line=${d.line},col=${d.col}::${d.rule}: ${d.message}`)
  }
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2)
  const opts = { fix: false, checkLinks: false, format: 'text', ignore: [], files: [], help: false, version: false }

  let i = 0
  while (i < args.length) {
    const a = args[i]
    if (a === '--fix') { opts.fix = true }
    else if (a === '--check-links') { opts.checkLinks = true }
    else if (a === '--format') { opts.format = args[++i] || 'text' }
    else if (a === '--ignore') { opts.ignore.push(args[++i]) }
    else if (a === '--help' || a === '-h') { opts.help = true }
    else if (a === '--version' || a === '-v') { opts.version = true }
    else if (!a.startsWith('--')) { opts.files.push(a) }
    i++
  }
  return opts
}

function printHelp() {
  console.log(`
${c.bold('markdown-lint')} v1.0.0 — Zero-dependency markdown linter

${c.bold('USAGE')}
  mdlint [options] <file|dir>

${c.bold('OPTIONS')}
  --fix               Auto-fix fixable issues
  --check-links       Verify all URLs return 2xx
  --format <fmt>      Output format: text (default), json, github
  --ignore <pattern>  Skip matching files
  -v, --version       Show version
  -h, --help          Show this help

${c.bold('RULES')}
  MD001  Heading levels must increment by 1
  MD002  First heading must be h1
  MD003  Consistent heading style
  MD004  Consistent list marker
  MD009  No trailing spaces           [fixable]
  MD010  No hard tabs
  MD012  No multiple consecutive blank lines  [fixable]
  MD013  Line length <= 120 chars
  MD022  Blank lines around headings
  MD025  Only one h1 per document
  MD031  Blank lines around fenced code blocks
  MD032  Lists surrounded by blank lines
  MD033  No inline HTML               [warning]
  MD034  No bare URLs                 [fixable]
  MD041  First line should be heading

${c.bold('CONFIG')}
  .mdlintrc.json in project root overrides defaults:
  { "MD013": { "enabled": true, "line_length": 80 }, "MD033": false }
`.trim())
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(process.argv)

  if (opts.version) { console.log('1.0.0'); process.exit(0) }
  if (opts.help || opts.files.length === 0) { printHelp(); process.exit(opts.help ? 0 : 1) }

  const config = loadConfig(process.cwd())
  const allFiles = []
  for (const f of opts.files) {
    allFiles.push(...collectFiles(resolve(f), opts.ignore))
  }

  if (allFiles.length === 0) {
    console.error(c.yellow('No markdown files found.'))
    process.exit(0)
  }

  const jsonResults = []
  let totalErrors = 0
  let totalWarnings = 0
  let filesFixed = 0

  for (const filePath of allFiles) {
    let content
    try { content = readFileSync(filePath, 'utf8') } catch (e) {
      console.error(c.red(`Cannot read: ${filePath}: ${e.message}`)); continue
    }

    if (opts.fix) {
      const fixed = applyFix(content)
      if (fixed !== content) {
        writeFileSync(filePath, fixed, 'utf8')
        content = fixed
        filesFixed++
      }
    }

    const diags = lint(content, config)

    if (opts.checkLinks) {
      const urls = extractUrls(content)
      if (urls.length > 0) {
        const results = await Promise.all(urls.map(u => checkUrl(u)))
        for (const r of results) {
          if (!r.ok) {
            const severity = r.error === 'Timeout' ? 'warning' : 'error'
            diags.push({ rule: 'LINK', line: 0, col: 1, severity, message: `${severity === 'warning' ? 'Link timeout' : 'Broken link'} (${r.error || r.status}): ${r.url}`, fixable: false })
          }
        }
      }
    }

    const errors = diags.filter(d => d.severity === 'error').length
    const warnings = diags.filter(d => d.severity === 'warning').length
    totalErrors += errors
    totalWarnings += warnings

    if (opts.format === 'json') {
      jsonResults.push({ file: filePath, diagnostics: diags, errors, warnings })
    } else if (opts.format === 'github') {
      formatGithub(filePath, diags)
    } else {
      formatText(filePath, diags)
    }
  }

  if (opts.format === 'json') {
    formatJson(jsonResults)
  } else if (opts.format === 'text') {
    if (allFiles.length > 1) {
      console.log()
      const parts = []
      if (totalErrors > 0) parts.push(c.red(`${totalErrors} error${totalErrors !== 1 ? 's' : ''}`))
      if (totalWarnings > 0) parts.push(c.yellow(`${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`))
      if (parts.length === 0) parts.push(c.green('No issues found'))
      console.log(`${parts.join(', ')} across ${allFiles.length} file${allFiles.length !== 1 ? 's' : ''}`)
    }
    if (filesFixed > 0) console.log(c.cyan(`Fixed ${filesFixed} file${filesFixed !== 1 ? 's' : ''}`))
  }

  process.exit(totalErrors > 0 ? 1 : 0)
}

main().catch(e => { console.error(c.red('Fatal:'), e.message); process.exit(1) })
