# TianCode upstream synchronization plan

English | [中文](UPSTREAM_SYNC_PLAN.zh.md)

The target is the local official `dsh-v0.2.1-rc.3` source archive. The common upstream baseline is `dsh-v0.2.0-rc.2`. Both committed TianCode customizations and the existing uncommitted Office shortcuts participate in the three-way merge.

1. Save the working files and Git tree identifiers, then calculate the merge with temporary indexes while retaining the current branch and real index.
2. Synchronize official additions, modifications, removals, tests, dependencies, migrations and upgrade guides; retain TianCode identity, artwork, offline policy, data directories, release workflow and Office resources.
3. Resolve Desktop startup, packaging, client registration and Office skill conflicts against the updated service APIs, then regenerate derived catalogs.
4. Install the declared dependencies; run TianCode build, unit tests, recorded-session replay, browser checks, lint, documentation checks and Python checks.
5. Record executed verification and limitations in the [sync report](UPSTREAM_SYNC_REPORT.md) and update the [current state](../state.md).

The original ZIP remains in `version-history/`. The extracted source remains accessible at its original path through a relative symlink into ignored `.artifacts/upstream/`, keeping the nested repository out of recursive documentation discovery.

The pre-sync backup and merge metadata are retained under `.artifacts/upstream-sync/20261028/`. Ignored credentials and build outputs are excluded from the backup.
