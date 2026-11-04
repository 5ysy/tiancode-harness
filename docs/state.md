# Current development state

English | [中文](state.zh.md)

TianCode integrates official DeepSeek Harness `0.2.1-rc.3`. Workspace versions, dependency lockfile, vendored sources, persistence migrations, SDK consumers and upgrade guides are synchronized with the supplied release archive. Source identity, merge decisions and executed verification are recorded in the [upstream synchronization record](tiancode/UPSTREAM_SYNC_REPORT.md).

The Desktop uses TianCode identity and supplied artwork, `com.tiancode.desktop`, a separate `TianCode` user-data directory and default Harness home. It binds the IPv4 loopback address on an OS-assigned port. Offline builds persist the disabled update policy in their package metadata. The Windows release workflow uses the current runtime version and pnpm pin.

The composer groups the 26 application workflows into eight visible category menus above the input. It reads editable Skills from the repository-root `skills/` during development and `$DSH_HOME/skills` in installed Desktop. Explicit category metadata supports custom Skills and live reclassification; the built-in name mapping preserves categories for existing user-owned files. Directory setup, category identifiers and supported workflows are documented in [software skills](tiancode/SKILLS.md).

Build the customized client with `pnpm run build:tiancode`; start the built Desktop with `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`. The `docs/tiancode/TEST_REPORT.md` retains the prior Windows installer acceptance evidence. Current Windows installation and organization-specific model generation require acceptance in the target environment.

The preexisting uncommitted Office-entry work is retained. The original ZIP and linked extracted source remain available under `docs/tiancode/version-history/`; pre-sync files and merge metadata are saved under ignored `.artifacts/upstream-sync/20261028/`.

The Desktop development launch has been verified through the native TianCode welcome window. Retired workspace links left in pnpm’s virtual-hoist directory were removed after checking their targets against the sync backup; `pnpm install --frozen-lockfile --offline --optimistic-repeat-install=false` reconciled installation state. The virtual-hoist directory has no dangling links, and four development-project/application tests pass.

Category metadata, menu interactions and Office discovery pass 108 focused Vitest tests; the offline plugin market passes 45 focused tests. The real browser scenario passes with eight category menus, draft preservation, live custom Skill changes and both themes at 390px and 760px. The `public-report` recorded Session replay passes with the current application catalog. `pnpm run build:tiancode` passes all nine build and aggregate compiler checks; `pnpm run doc-sync` passes all 43 checks with the inherited SOCKS proxy variables removed from that command's environment. `uv run pytest` remains blocked during collection because the local Python packages are not installed; `uv run ruff .` cannot start because `ruff` is unavailable in the environment.

The static plugin-market procedure, format-1 tarball example, Windows Discover flow, offline dependency requirements, and observable Desktop checks are documented in [PLUGIN_MARKET.md](tiancode/PLUGIN_MARKET.md).
