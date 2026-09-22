![markdown-lint — Nicholas Ashkar repository collection](assets/nicholas-ashkar/banner.png)

# markdown-lint

Check local Markdown for selected structural, whitespace and link issues.


<a id="usage"></a>

## What it does

Applies a built-in rule set with .mdlintrc.json overrides and text/JSON/GitHub output. --fix rewrites supported whitespace/link issues; --check-links makes HTTP requests. See the pinned [implementation](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/index.js).


<a id="install"></a>

## Quickstart

Node requirement from the inspected manifest: **`>=20`**. Start without --fix. Network link checking sends requests to URLs found in your documents.

The following example is **source-inspected, not executed**. It uses a pinned checkout; npm package publication is not assumed. Replace project paths or provide the stated input fixtures before running it.

```bash
git clone https://github.com/NickCirv/markdown-lint.git
cd markdown-lint
git checkout 64d5130fd56f203c1bcfa48ab3a738353622acce
npm install --ignore-scripts
node index.js README.md --format json
```

Dependencies are installed with lifecycle scripts disabled in this recipe. Read the package scripts before enabling any lifecycle step required by your environment.

## Usage and reference

`markdown-lint` | `mdlint` are the executable names declared by the package. [Command reference](docs/REFERENCE.md) covers source-backed options and entry points.

| Control | Behavior in the inspected implementation |
| --- | --- |
| `FILE_OR_DIRECTORY` | Choose Markdown inputs |
| `--format json` | Emit diagnostics |
| `--fix` | Rewrite supported issues |
| `--check-links` | Make HTTP link checks |
| `--ignore PATTERN` | Skip matching paths |

## Limits and operational notes

This is a custom linter, not a compatibility claim with every markdownlint rule. Link status can depend on authentication, rate limits and redirects; a successful response does not prove the link text is correct.

## Development

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

| Script | Declared command |
| --- | --- |
| `test` | `node --test` |

Work from the pinned source, keep changes focused, and reproduce the affected behavior with a small fixture before proposing a change. Existing contribution and security policies remain authoritative where present.

## Research and status

[Research record](docs/RESEARCH.md) identifies the inspected revision, source evidence, documentation disposition and verification gaps. Static inspection supports the descriptions here; runtime behavior, dependency installation and current hosted services remain unverified.

## License and author

[License](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/LICENSE)

[Nicholas Ashkar](https://nicholashkar.com) · Applied AI, systems and consulting.
