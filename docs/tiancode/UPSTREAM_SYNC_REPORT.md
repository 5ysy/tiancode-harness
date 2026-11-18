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

Plain `uv run pytest` cannot collect local SDK imports without source paths. `uv run ruff .` cannot start because Ruff is absent; `uv run --with ruff ruff check .` reports 261 findings in repository Python files. This synchronization changes no Python implementation. Windows packaging and installer UI verification passed; publication results are recorded below. Target intranet connectivity and model-backed generation require deployment acceptance.

## Windows publication

[Actions 44251183359](https://github.com/5ysy/tiancode-harness/actions/runs/44251183359) completed both Windows building and Release publication successfully. [Release `tiancode-v0.2.2-rc.4.20261118.1`](https://github.com/5ysy/tiancode-harness/releases/tag/tiancode-v0.2.2-rc.4.20261118.1) contains the unsigned Windows x64 installer, installer ZIP, source ZIP, three individual checksum files, `SHA256SUMS.txt` and `build-manifest.json`. The Release tag and manifest identify the same build commit; subsequent documentation commits do not change the published binary.

All eight assets were downloaded and checked against GitHub asset sizes and digests. The three archive hashes match the manifest, individual checksum files and `SHA256SUMS.txt`. The installer ZIP contains the matching executable and checksum; the source ZIP identifies the build commit and its checked source files match that commit.

| Artifact | Bytes | SHA-256 |
|---|---:|---|
| Windows x64 unsigned installer | 511818016 | `e251f3ff3aa6eb54fd09bb556c0b517cd5a604010854b1113735975a164bc1ba` |
| Installer ZIP | 511553850 | `7c92b800c6076704aefe636d95afa952e5119fb1be2f64780a54c7d03f8876cd` |
| Source ZIP | 249390628 | `54a1629f41ae38b882bfc820a367edf92ced512f1ed408cd1194443ea31541f8` |

Windows packaging logs confirm offline CLI plugin installation/removal, Office Skill listing/loading, DOCX/XLSX/PPTX to PDF, image rendering, conversion and recalculation. The real installer passed welcome, progress, 100% completion, application-file presence, completion exit and uninstall cleanup checks in both light and dark themes; all six screenshots were inspected. Application shortcuts, taskbar behavior and enterprise intranet models require target-environment acceptance.

The installer verification script reads the generated string directory used by packaging. Archive validation uses the existing Node `tar` dependency and preserves Chinese template filenames. Related release/local packing tests passed 52 cases, subsequent package-preparation consumers passed 28 cases, and installer packaging passed seven cases.

## Local use and recovery

Build with `pnpm run build:tiancode` and launch with `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`. Skill Hub server deployment and client installation commands are in [Skill Hub](SKILL_HUB.md).

The pre-sync tracked and untracked working files are archived in `.artifacts/upstream-sync/20261118/tiancode-before.tar.gz`; `metadata.json` identifies the source trees and `protected-sha256.json` records resource hashes. The original Skill Hub commit and the previous release remain in Git history.
