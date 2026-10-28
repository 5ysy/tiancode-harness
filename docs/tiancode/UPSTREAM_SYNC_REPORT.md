# TianCode upstream synchronization record

English | [中文](UPSTREAM_SYNC_REPORT.zh.md)

## Source and retained customizations

The runtime and workspace packages use official `0.2.1-rc.3`, with pnpm `11.28.5`, Electron `44.7.0` and LibreOffice Kit `0.1.5`. The common upstream baseline is `dsh-v0.2.0-rc.2`.

The supplied ZIP is `version-history/deepseek-harness-dsh-v0.2.1-rc.3.zip`; its SHA-256 is `75bb71d8e81eca21ec0ceae77f7ddeb6d5930c252a3b97aca566752cfc408b2f`. The extracted source remains accessible at the supplied path through a relative symlink into ignored `.artifacts/upstream/`.

The merge retains TianCode artwork, Chinese and English names, `com.tiancode.desktop`, the separate `TianCode` user-data directory, its default `DSH_HOME`, installer customization and Windows release workflow. The preexisting Office shortcuts, nine public-service workflows and four reporting templates remain available.

Official changes were compared with the original upstream baseline; 48 conflicting files were resolved. Office now includes the router and six authoring or operation skills alongside the optional public-service workflows. Session-format migrations, SDK consumers, persistence acknowledgements and release-specific upgrade guides are synchronized with the supplied source.

## Integration decisions

- Desktop binds `127.0.0.1` on an OS-assigned port and retains the upstream WebSocket credential checks.
- `DSH_DESKTOP_UPDATES=disabled` survives local unsigned macOS preparation and is embedded as `dshDesktopUpdates: disabled` in packaged metadata; normal installed launches honor it without requiring a launcher environment variable.
- Artifact discovery, retained releases and their expected outputs use `TianCode-Setup-` with the upstream unsigned and unnotarized suffix rules. The Windows workflow defaults to a build version extending `0.2.1-rc.3`.
- Skill UI keeps its Host and Client compiler leaves, configuration-backed shortcut order and the upstream conversation text registrations. Config and slot catalogs are regenerated from their owners.

## Verification

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile --offline` | Passed with the updated lockfile. |
| `pnpm run build:tiancode` | All nine artifact and aggregate compiler steps passed. |
| `pnpm run test --maxWorkers=4` | Initial run: 44,025 passed, 287 failed, 243 skipped and one expected failure. All six failed suites passed targeted reruns after environment selection and obsolete-build cleanup: 350 passed, two skipped. |
| Focused Desktop, packaging, Skill UI and composer tests | 1,817 passed; 57 platform-dependent tests skipped. |
| `pnpm run test:snapshot snapshots/session/headless.snapshot.ts -t public-report` | One selected replay passed after a keyless refresh of the new runtime context and skill catalog; final output files remain checked independently. |
| `pnpm run test:web:built apps/web/tests/feature-entries.e2e.ts` | Passed: real-server shortcuts, templates, draft retention, themes and narrow viewports. |
| `PYTHONPATH=python/sdk/src:python/sdk-runtime/src uv run pytest` | 231 passed; nine runtime/platform cases skipped. |
| `pnpm run lint` | Passed; one inherited unused-disable warning remains. |
| Dependency policy, client locale ownership, tsconfig aliases and Cordis config | Passed; 278 Cordis config files validated. |
| Updated bilingual pairs | The six selected state, plan, report and package README pairs passed. |
| Protected assets | All 22 public-service workflow and TianCode artwork files match their pre-sync bytes. |
| `git diff --check` | Passed; the real index and branch remain unchanged. |

The initial root `uv run pytest` could not import the source packages; the explicit `PYTHONPATH` invocation above passes. `uv run ruff .` could not find Ruff; `uv run --with ruff ruff check .` ran and reported 158 findings in unchanged supplied Python/scripts/skill files. The full documentation run passed 39 of 43 gates: prior TianCode monolingual documents, wrapped paragraphs and commit references remain; the additional CLI-help failure came from the inherited SOCKS proxy. Running that check with the system `/usr/bin/env` and removing only `ALL_PROXY`/`all_proxy` passed all seven help pages. The updated documentation pairs pass independently.

The initial all-unit run used system Python 3.9 and the local `~/.local/bin/env` wrapper. The supplied PTC backend requires CPython 3.10 or newer. Repeating the affected suites with Python 3.11 and the system `env` first on PATH passed 343 tests with two skips. The remaining failed import check came from an obsolete package’s ignored build output. Thirteen directories containing only generated residue and empty source/test directories were moved into the backup; the seven built-import checks then passed. No machine-wide PATH or executable was modified. The vendor-rescope checker reports 26 residue paths on the supplied source; 25 files are byte-identical to that source and the remaining file differs only by the retained Office shortcut configuration.

## Local use and recovery

Build with `pnpm run build:tiancode`. Launch the built Desktop with `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`; `pnpm run dev:desktop` rebuilds it before launch. Build outputs remain local.

The pre-sync tracked and untracked working files are archived in `.artifacts/upstream-sync/20261028/tiancode-before.tar.gz`; `metadata.json` identifies the input trees. The branch and real index are retained.

## Desktop launch verification

A post-sync launch exposed twelve virtual-hoist links pointing to the retired workspace directories. Their saved targets were matched against `obsolete-builds.json` before unlinking. A frozen offline install with `--optimistic-repeat-install=false` completed successfully, and a complete scan found zero dangling virtual-hoist links. The unchanged `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop` command then prepared and checked the Office runtime, started its Host and opened the native TianCode welcome window. The development-project and development-app suites passed all four tests. The original link inventory and diagnostic logs are retained in `.artifacts/upstream-sync/20261028/startup-fix/`.
