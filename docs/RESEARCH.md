# markdown-lint — research record

## Revision and scope

- Repository: [NickCirv/markdown-lint](https://github.com/NickCirv/markdown-lint)
- Commit: `64d5130fd56f203c1bcfa48ab3a738353622acce`
- Tree: `ce7c45985b812936ef75c215cb907f1bb379663c`
- Captured: 6 of 6 eligible text files (all eligible text files).
- Recursive tree truncated: `False`.
- Runtime verification: **unverified**; no repository code, installation or test command was executed.

The captured file inventory is broader than the semantic review. Authoring inspected package metadata, entrypoint/argument handling and implementation paths relevant to the claims below, plus test declarations. This is documentation research, not a line-by-line security audit. Generated/binary artifacts, lockfiles and file types outside the acquisition filter were not inspected.

## Claim and evidence

| Claim | Pinned evidence | Status |
| --- | --- | --- |
| Runtime requirement and executable mapping | [package.json](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/package.json) | verified in manifest; installation unverified |
| Check local Markdown for selected structural, whitespace and link issues. | [implementation](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/index.js) | partially verified by static implementation review |
| Operational limits and side effects | [implementation](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/index.js) and source map in [reference](REFERENCE.md) | partially verified; runtime unverified |
| Test command definition | [package.json](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/package.json) | verified as a declaration only |

## Findings carried into the rewrite

This is a custom linter, not a compatibility claim with every markdownlint rule. Link status can depend on authentication, rate limits and redirects; a successful response does not prove the link text is correct.

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

## Documentation inventory and disposition

| Existing document | Disposition |
| --- | --- |
| [README.md](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/README.md) | Rewritten overview; historical copy remains at this pinned URL. |

New supporting documents: `docs/REFERENCE.md` and `docs/RESEARCH.md`. No original source or protected legal/security file was changed.

## Protected-file evidence

- `LICENSE` SHA-256 `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d`.

## Remaining verification

Clean installation, useful-command execution, malformed input, side-effect boundaries, platform compatibility and end-to-end tests remain unverified. Package-registry availability and live API destinations were not checked. No performance, customer-adoption, compliance or production-readiness claim is made.

## Captured evidence index

- [LICENSE](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/LICENSE) · blob `05b804beeec7d1a6c933d087387ba4adf6463d93`.
- [README.md](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/README.md) · blob `9bc86793acb9765a4b2762525c115914884161a6`.
- [package.json](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/package.json) · blob `1e4e5449c375308d818cd0da6dd4a1ff4d427e61`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/.github/workflows/ci.yml) · blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [index.js](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/index.js) · blob `a2c9487ab6ce47b80c5528a257ca9bee787068f8`.
- [test/smoke.test.js](https://github.com/NickCirv/markdown-lint/blob/64d5130fd56f203c1bcfa48ab3a738353622acce/test/smoke.test.js) · blob `ebbccaaf2583b4850575f835313e4b0afd21bff7`.

## Tree files outside the captured text set

These paths were mapped but their contents were not acquired in this research pass:

- `.gitignore`
