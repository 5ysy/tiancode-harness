# TianCode upstream synchronization record

English | [中文](UPSTREAM_SYNC_REPORT.zh.md)

## Source and retained customizations

TianCode integrates official tag `dsh-v0.2.2-rc.4`, published at 01:53 China Standard Time on November 18, 2026. The previous imported release, `dsh-v0.2.1-rc.3`, is recorded as an ancestry bridge with no tree changes before merging the official delta. The working Skill Hub implementation is committed before synchronization, and the pre-sync archive remains under `.artifacts/upstream-sync/20261118/`.

The integration retains TianCode artwork and names, `com.tiancode.desktop`, separate user data and default Harness home, disabled automatic updates, Windows packaging, eight workflow categories, application templates and the optional Skill Hub. Official rc.4 Session history, SDK consumers, vendor changes and upgrade guides remain present.

## Integration decisions

- Desktop copies application Skills into the primary runtime, then initializes `$DSH_HOME/skills` without replacing existing user directories. The upstream Office/workspace-dependency composition owns engine initialization.
- The Office provider retains its upstream asynchronous catalog/read failure handling and four Office Skills. TianCode public workflows have a separate watched filesystem provider and use `office_render`/`office_convert` after loading `office`.
- TianCode packaging uses the current runtime version and `tiancode` client profile for every signing mode. Artifact paths, macOS application paths, installer languages and shell menus preserve product identity.
- Skill Hub stays optional and receives the rc.4 package version and compatibility range. Its installable bundle uses `@deepseek-ai/dsh-skill-hub-bundle`, with an [upgrade guide](../upgrade-guide/v0.2.2-rc.4/tiancode-skill-hub-bundle/guide.md) for earlier archives. HTTP tarball plugin details avoid npm-only metadata requests.
- Windows publication validates dispatch inputs independently of building, accepts only artifacts from a successful Windows build job, verifies manifest identity and all checksums, rejects a tag with another commit, and uploads only missing assets after validating existing bytes.

## Verification

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Passed with the merged lockfile. |
| `pnpm run build:tiancode` | Ten artifact and aggregate compiler checks passed. |
| Focused Desktop, Office and Skill Hub behavior tests | Eleven files and 145 tests passed. |
| Broader packaging, market, category and release-family integration | Twenty-one files passed initially; the two corrected expectation files then passed all 228 tests. |
| Real-browser workflows | Skill Hub connection, resource installation and selected category discovery passed at 390px/1100px in both themes; workflow categories and live edits passed at 390px/760px. |
| Recorded Sessions | Keyless refresh and final replay passed for public-report and the Skill Hub-installed skill-load scenario. |
| `PYTHONPATH=python/sdk/src:python/sdk-runtime/src uv run pytest` | 387 passed; 20 skipped. |
| `pnpm run lint` | Passed with one inherited unused-disable warning. |
| Distribution policy tests | Four files and 286 tests passed; license exceptions are restricted to the two attributed Skill Hub packages. |
| `pnpm run doc-sync` | All 43 checks passed. |
| `pnpm run hygiene` | 23 checks passed; vendor rescope reports three files byte-identical to the official target. |
| Protected resources | 45 of 55 files remain byte-identical; ten Skill instruction files only adapt the Office tool workflow. Artwork, templates and scripts are unchanged. |

Plain `uv run pytest` cannot collect local SDK imports without source paths. `uv run ruff .` cannot start because Ruff is absent; `uv run --with ruff ruff check .` reports 261 findings in repository Python files. This synchronization changes no Python implementation. Source and installer review is complete; actual Windows PowerShell execution is owned by the dispatched Actions run. Target intranet connectivity and model-backed generation require deployment acceptance.

## Local use and recovery

Build with `pnpm run build:tiancode` and launch with `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`. Skill Hub server deployment and client installation commands are in [Skill Hub](SKILL_HUB.md).

The pre-sync tracked and untracked working files are archived in `.artifacts/upstream-sync/20261118/tiancode-before.tar.gz`; `metadata.json` identifies the source trees and `protected-sha256.json` records resource hashes. The original Skill Hub commit and the previous release remain in Git history.
