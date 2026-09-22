# markdown-lint — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes revision `64d5130fd56f203c1bcfa48ab3a738353622acce`. Commands are source-inspected; no execution results are asserted.

## Workflow

Applies a built-in rule set with .mdlintrc.json overrides and text/JSON/GitHub output. --fix rewrites supported whitespace/link issues; --check-links makes HTTP requests.

Start without --fix. Network link checking sends requests to URLs found in your documents.

```bash
node index.js README.md --format json
```

## Commands and controls

| Control | Behavior in the inspected implementation |
| --- | --- |
| `FILE_OR_DIRECTORY` | Choose Markdown inputs |
| `--format json` | Emit diagnostics |
| `--fix` | Rewrite supported issues |
| `--check-links` | Make HTTP link checks |
| `--ignore PATTERN` | Skip matching paths |

## Interpretation and side effects

This is a custom linter, not a compatibility claim with every markdownlint rule. Link status can depend on authentication, rate limits and redirects; a successful response does not prove the link text is correct.

## Implementation reference

- [package.json](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/package.json)
- [index.js](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/index.js)
- [test/smoke.test.js](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/test/smoke.test.js)
