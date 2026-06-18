<div align="center">

# markdown-lint

**Catch broken links, heading structure errors, and style issues in your Markdown — zero dependencies.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?labelColor=0B0A09)](LICENSE)
[![Dependencies: 0](https://img.shields.io/badge/dependencies-0-brightgreen?labelColor=0B0A09)](package.json)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18-blue?labelColor=0B0A09)](https://nodejs.org)

</div>

## Install

```bash
npx github:NickCirv/markdown-lint README.md
```

## Usage

```bash
# Lint a file
npx github:NickCirv/markdown-lint README.md

# Lint a directory, auto-fix what can be fixed
npx github:NickCirv/markdown-lint --fix docs/

# GitHub Actions annotation output + verify all links
npx github:NickCirv/markdown-lint --format github --check-links **/*.md
```

| Flag | Description |
|------|-------------|
| `--fix` | Auto-fix trailing spaces, consecutive blank lines, bare URLs |
| `--check-links` | Verify all URLs return 2xx (8s timeout, follows redirects) |
| `--format text\|json\|github` | Output format — `github` emits `::error file=…,line=…::` annotations |
| `--ignore <pattern>` | Skip files matching pattern (e.g. `node_modules`, `vendor`) |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

## What it does

Checks 15 rules covering heading structure (MD001–MD003, MD022, MD025), list consistency (MD004, MD032), whitespace hygiene (MD009, MD010, MD012), line length (MD013), and link validity (LINK). Rules can be overridden per-project via `.mdlintrc.json`. Exits `0` when clean, `1` on errors — CI-safe by default.

```json
{ "MD013": { "enabled": true, "line_length": 80 }, "MD033": false }
```

---
<sub>Zero dependencies · Node >=18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
