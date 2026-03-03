# markdown-lint

> Lint markdown files. Check links, headings, and style. Zero dependencies.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue)](package.json)

## Install

```bash
# Run without installing
npx markdown-lint README.md

# Install globally
npm install -g markdown-lint
```

## Quick Start

```
$ mdlint README.md
pass  README.md

$ mdlint docs/
docs/guide.md
     3:1    error    Heading level skipped: h1 to h3  MD001
    12:45   error    Trailing spaces  MD009 [fixable]
    24:1    warning  Inline HTML detected  MD033

2 errors, 1 warning across 1 file

$ mdlint --fix docs/guide.md
Fixed: docs/guide.md

$ mdlint --check-links --format github README.md
::error file=README.md,line=0,col=1::LINK: Broken link (404): https://example.com/gone
```

## Options

| Flag | Description |
|------|-------------|
| `--fix` | Auto-fix fixable issues (trailing spaces, blank lines, bare URLs) |
| `--check-links` | Verify all URLs return 2xx (async, with 8s timeout) |
| `--format text\|json\|github` | Output format. `github` emits `::error file=...,line=...::` |
| `--ignore <pattern>` | Skip matching files (e.g. `node_modules`, `docs/legacy`) |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

## Rules

| Rule | Description | Severity | Auto-fix |
|------|-------------|----------|----------|
| MD001 | Heading levels must increment by 1 | error | - |
| MD002 | First heading must be h1 | error | - |
| MD003 | Consistent heading style (ATX vs setext) | error | - |
| MD004 | Consistent list marker (`-` vs `*` vs `+`) | error | - |
| MD009 | No trailing spaces | error | yes |
| MD010 | No hard tabs | error | - |
| MD012 | No multiple consecutive blank lines | error | yes |
| MD013 | Line length <= 120 chars (configurable) | warning | - |
| MD022 | Blank lines around headings | error | - |
| MD025 | Only one h1 per document | error | - |
| MD031 | Blank lines around fenced code blocks | error | - |
| MD032 | Lists surrounded by blank lines | error | - |
| MD033 | No inline HTML | warning | - |
| MD034 | No bare URLs | error | yes |
| MD041 | First line should be a heading | error | - |
| LINK | HTTP 4xx/5xx URLs (with `--check-links`) | error/warning | - |

## Config

Create `.mdlintrc.json` in your project root to override rules:

```json
{
  "MD013": { "enabled": true, "line_length": 80 },
  "MD033": false,
  "MD041": false
}
```

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | No errors found (CI-safe) |
| `1` | One or more errors found |

## Examples

```bash
# Lint a single file
mdlint README.md

# Lint all markdown in a directory
mdlint docs/

# Auto-fix and then lint
mdlint --fix README.md && mdlint README.md

# CI/CD — GitHub Actions annotation format
mdlint --format github **/*.md

# Skip node_modules and vendor directories
mdlint . --ignore node_modules --ignore vendor

# JSON output for tooling integration
mdlint --format json docs/ | jq '.[] | select(.errors > 0)'

# Full check: lint + verify all links
mdlint --check-links README.md
```

---

Built with Node.js · Zero dependencies · MIT License
