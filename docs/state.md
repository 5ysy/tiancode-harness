# Current development state

English | [中文](state.zh.md)

TianCode integrates official DeepSeek Harness `dsh-v0.2.2-rc.4`. Workspace packages, vendored sources, SDKs, persistence history and the dependency lockfile follow that release. The [upstream synchronization record](tiancode/UPSTREAM_SYNC_REPORT.md) owns merge decisions and executed verification.

Desktop retains supplied TianCode artwork, `com.tiancode.desktop`, separate user data and default Harness home, IPv4 loopback binding and the packaged disabled-update policy. Build with `pnpm run build:tiancode`; launch the built application with `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.

The composer retains eight workflow categories and live metadata-based classification. Installed Desktop reads application Skills from `$DSH_HOME/skills`, preserving existing user files. TianCode PPT, document and PDF instructions use the rc.4 `office_render` and `office_convert` tools. [Software skills](tiancode/SKILLS.md) documents resource directories and metadata.

[TianCode Skill Hub](tiancode/SKILL_HUB.md) remains an optional offline-installable plugin with a Settings sidebar entry, configurable private catalog connection, searchable cards and category/metadata editing during installation. Its complete-directory format adapts MichengAI/dsh-skills-manager with attribution. The server uses a static HTTP catalog and packages; downloaded scripts are retained without execution during installation.

The rc.4 TianCode build passes all ten artifact and aggregate compiler checks. Focused Desktop, packaging, plugin-market, Office and Skill Hub tests pass. Real-browser Skill Hub installation and workflow category refresh pass; the public-report and Skill Hub-installed skill-load recorded Sessions pass a keyless refresh. Python tests pass with explicit source paths; repository Ruff findings remain outside this synchronization's Python changes. Windows package validation preserves the supplied Chinese template filenames through the locale-independent archive reader. The synchronization record tracks final replay, documentation and Windows build evidence. Target intranet model and deployment acceptance require the organization's environment.
