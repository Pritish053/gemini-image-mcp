# Optimization Audit — @pritishmaheta/gemini-image-mcp

Branch: `optimization/auto-audit` (local only, not pushed)
Baseline: `main` at `59303a1` (+ one pre-existing chore commit `6d86936`)

## Applied

| # | Commit | Area | Impact |
|---|---|---|---|
| 1 | `6d86936` chore: publish under @pritishmaheta scope and add eslint config | repo hygiene | Rescued 2 uncommitted files: scoped name, bin path, repo URL normalization, and tracked `eslint.config.js` (was untracked but referenced by the lint script). |
| 2 | `45a6250` chore(deps): drop unused sharp, pin @eslint/js, declare engines | deps | Removed `sharp` — never imported. `node_modules` shrinks **96 MB → 80 MB (-16 MB)**, deps count **182 → 176**. Removes a native-binary download from every `npm install -g`. Adds `engines.node >= 18` to match docs. |
| 3 | `9b69426` perf(server): lazy-load dotenv and harden tool-arg validation | startup + validation | `dotenv` is now only imported via dynamic `import()` when a `.env` exists on disk. Production MCP clients (Claude Desktop, etc.) inject env directly, so they skip both the module load and the file parse. Also replaces an `any`-cast of `SAFETY_LEVEL` and an unsafe `parseInt()` with narrowed helpers. Tool dispatch now validates arg shapes and returns LLM-friendly error strings naming the tool and field. |
| 4 | `242d567` refactor(types): remove any from client and shared types | code quality | Types the cached `model` handle as `GenerativeModel` from the SDK. Narrows `extractImagesFromResponse`. Promotes ad-hoc object shapes in `AnalysisResult` to named `DetectedObject` / `DetectedColor` / `BoundingBox` interfaces reused by the `comprehensive` result. Drops all 7 remaining `any` warnings. Bindingless `catch` removes the last no-unused-vars warning. |
| 5 | `b6f46d5` docs(install): install scoped package name in install.sh | docs | `install.sh` was still `npm install -g gemini-image-mcp` — that name no longer resolves on the registry. |
| 6 | `cbc39cb` docs(changelog): record unreleased optimization work | docs | `[Unreleased]` section added to `CHANGELOG.md`. |

## Metrics

| Metric | Before | After | Δ |
|---|---|---|---|
| `node_modules` size | 96 MB | 80 MB | **−16 MB (−16.7 %)** |
| Installed package count | 182 | 176 | −6 |
| `dist/` size | 84 K | 88 K | +4 K (more helper code for validation; worthwhile) |
| Published tarball | ~14.5 kB (doc claim) | **15.6 kB** (actual) | parity |
| Unpacked tarball | ~58.9 kB | 63.1 kB | +4 KB |
| ESLint warnings | 11 | **0** | −11 |
| ESLint errors | 0 | 0 | — |
| `tsc --noEmit` | clean | clean | — |
| Cold start (module load, warm cache) | n/a | ~89 ms | measured via `node -e "import('./dist/index.js')"` |
| Cold start (full process) | n/a | ~0.22 s wall (`/usr/bin/time -p`) | — |

Note: cold-start "before" wasn't measured pre-change; with `sharp` present and `dotenv` eagerly loaded, the startup work was strictly larger. The real win is that `dotenv` is now skipped entirely for MCP-client-launched runs (the common case).

## Deferred (risky / out of scope)

1. **`extractImagesFromResponse()` returns mock image bytes.** The client's comment flags it as a simplified placeholder — the server currently answers every `generateImage` / `modifyImage` / `applyStyleTransfer` call with a 1×1 transparent PNG. This is a real functionality gap but touching it is a behavioural/API change, not an optimization — left for a feature commit.
2. **No real runtime-schema validation (zod/ajv).** JSON-Schema in the MCP tool definitions plus my hand-rolled `requireString` guards are good-enough. Adding `zod` would add 60 kB and startup cost for marginal benefit; skipped deliberately.
3. **Major version bumps (`@google/generative-ai 0.21 → 0.x latest`, MCP SDK > 1.18).** Per hard rule, no major bumps. Minor/patch bumps are available but not urgent; defer to a dedicated dep-refresh PR.
4. **`npm audit` reports 10 vulns (5 mod, 5 high)** in the lockfile — all under transitive dev-tool trees. Worth a follow-up `npm audit fix` run, not done here because it can reshuffle the dev toolchain.
5. **`PUBLISHING.md` still references the unscoped name** in several commands and quotes a stale `14.5 kB` package size. Cosmetic; left for a docs pass.
6. **`dist/` is in `.gitignore` but shipped via the `files` whitelist.** Works correctly (the `prepack` script rebuilds before pack), but worth noting that anyone running `npm publish` without the lifecycle script would ship an empty package. Mitigation already in place; consider adding a CI publish workflow.
7. **Tool return for `analyzeImage('comprehensive')` dumps raw JSON.** Readability could be improved — not performance.
8. **Rate-limiter is in-memory & per-process.** Fine for stdio MCP (one process per client) but worth documenting.

## Secrets / Security

- Checked for committed secrets: **none found.** `.env` is correctly gitignored. `.env.example` contains only a placeholder.
- `GEMINI_API_KEY` is read from env at process start; never written to logs.
- No outbound network calls at import time.

## Publish readiness

**No blockers** to a safe `npm publish --access public` from `main` after merge. Verified:

- `npm pack --dry-run` produces a 15.6 kB tarball containing exactly `dist/`, `README.md`, `LICENSE`, `.env.example`, `package.json`.
- `bin` path resolves (`dist/index.js`), shebang present, file is marked executable in the compiled output via tsc default (`node dist/index.js` works).
- `prepublishOnly` and `prepack` both run `tsc`, so a fresh `dist/` is always shipped.
- Build, lint, typecheck are all green.
- **Caveat (pre-existing, see Deferred #1):** publishing today ships the mock-image implementation. That is the same behaviour as `main`, so not an optimization regression, but the maintainer should decide whether to gate a `1.1.0` release on fixing it.

## Recommendations

1. **Next functional commit:** wire `extractImagesFromResponse` to the real Gemini image payload (`response.candidates[0].content.parts[].inlineData`) and delete the mock.
2. **Follow-up PR:** `npm audit fix` + patch-level dep refresh.
3. **Docs pass:** reconcile `PUBLISHING.md` with the scoped name and current tarball metrics; add a one-liner pointing to `engines.node` enforcement.
4. **Consider** splitting `gemini-client.ts` parsers into `parsers.ts` — low value today but would matter once real parsing lands.
5. **Optional bundling:** `esbuild --bundle --minify` could collapse the three dist files into one ~15 KB file and shave a few `require` hops; probably not worth the build-tool addition at current scale.
