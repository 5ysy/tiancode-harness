# TianCode upstream synchronization plan

English | [中文](UPSTREAM_SYNC_PLAN.zh.md)

The target is official `dsh-v0.2.2-rc.4`, published on November 18, 2026 in China Standard Time. The previously imported release is `dsh-v0.2.1-rc.3`. The synchronization preserves TianCode customizations and the optional Skill Hub plugin.

1. Archive tracked and untracked work, commit Skill Hub, and record the previously imported release's Git ancestry without changing its tree.
2. Merge the official release delta, preserving TianCode identity, artwork, data isolation, offline policy, application Skills and plugin installation.
3. Adapt Desktop runtime resource copying and Office workflows to rc.4, then regenerate catalogs and the lockfile.
4. Run focused behavior tests, shipped-profile recorded Sessions, browser installation/category checks, artifact and aggregate compiler checks, documentation checks and Python checks.
5. Commit and push the reviewed integration to the TianCode fork, dispatch its Windows workflow and verify the exact run's installer, source archive, manifest, checksums and installer evidence.

The pre-sync working files, patch, tree identifiers and protected-file hashes are retained under ignored `.artifacts/upstream-sync/20261118/`. Executed results belong in the [synchronization record](UPSTREAM_SYNC_REPORT.md) and [current state](../state.md).
