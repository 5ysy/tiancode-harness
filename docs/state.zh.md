# 当前开发状态

[English](state.md) | 中文

TianCode 已集成官方 DeepSeek Harness `0.2.1-rc.3`。工作区版本、依赖锁文件、Vendored 源码、持久化迁移、SDK 消费者和升级指南均随提供的发布源码同步。源码标识、合并决策和实际验证见[上游同步记录](tiancode/UPSTREAM_SYNC_REPORT.zh.md)。

Desktop 使用 TianCode 身份与提供的素材、`com.tiancode.desktop`、独立的 `TianCode` 用户数据目录及默认 Harness home，监听 IPv4 loopback 的系统分配端口。离线构建将禁用更新策略写入安装包元数据，Windows 发布工作流使用当前运行时版本与 pnpm 固定版本。

输入区从开发项目根目录 `skills/` 或安装版 `$DSH_HOME/skills` 读取可编辑工作流，应用提供方包含九类独立编报模板、三类 PPT 风格及补充办公技能。文件变化会刷新菜单和后续调用，目录配置与使用方式见[软件专用技能](tiancode/SKILLS.zh.md)。

使用 `pnpm run build:tiancode` 构建定制客户端，通过 `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop` 启动已构建桌面端。`docs/tiancode/TEST_REPORT.md`保留此前 Windows 安装器验收证据；当前版本的 Windows 安装与实际业务模型生成需在目标环境验收。

工作区原有未提交的办公入口改动已保留。原 ZIP 与解压源码链接位于 `docs/tiancode/version-history/`，同步前文件及合并元数据保存在忽略的 `.artifacts/upstream-sync/20261028/`。

已实际启动 Desktop 开发版并确认原生 TianCode 欢迎窗口可见。pnpm 虚拟提升目录中残留的旧工作区链接，已对照同步备份核实目标后清理，并通过 `pnpm install --frozen-lockfile --offline --optimistic-repeat-install=false` 校正安装状态。虚拟提升目录已无失效链接，四项开发项目与应用测试通过。

技能工作流改动已由 42 项定向 Vitest、`pnpm run typecheck`、`pnpm run lint`、`pnpm run build:tiancode`、`pnpm run build:check`、`pnpm run test:docs`（21 项门禁）和 `git diff --check` 验证。`uv run pytest` 仍在收集阶段因本地 Python 包未安装而受阻；`uv run ruff .` 因环境没有 `ruff` 可执行文件而无法启动。
