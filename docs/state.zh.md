# 当前开发状态

[English](state.md) | 中文

TianCode 已集成官方 DeepSeek Harness `0.2.1-rc.3`。工作区版本、依赖锁文件、Vendored 源码、持久化迁移、SDK 消费者和升级指南均随提供的发布源码同步。源码标识、合并决策和实际验证见[上游同步记录](tiancode/UPSTREAM_SYNC_REPORT.zh.md)。

Desktop 使用 TianCode 身份与提供的素材、`com.tiancode.desktop`、独立的 `TianCode` 用户数据目录及默认 Harness home，监听 IPv4 loopback 的系统分配端口。离线构建将禁用更新策略写入安装包元数据，Windows 发布工作流使用当前运行时版本与 pnpm 固定版本。

输入框上方通过八个可见分类菜单组织 26 个应用工作流。开发时读取仓库根目录 `skills/`，安装版 Desktop 读取 `$DSH_HOME/skills`。显式分类元数据支持自定义 Skill 与实时重新分类；内置名称映射保留既有用户技能文件的分类。目录配置、分类标识和支持的工作流见[软件专用技能](tiancode/SKILLS.zh.md)。

使用 `pnpm run build:tiancode` 构建定制客户端，通过 `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop` 启动已构建桌面端。Windows 构建 `0.2.1-rc.3.20261104.1` 已发布；无签名安装器通过 Windows 浅色与深色主题安装、完成及清理流程。`docs/tiancode/TEST_REPORT.md`记录产物校验；具体业务模型生成和内网插件安装仍需在目标环境验收。

工作区原有未提交的办公入口改动已保留。原 ZIP 与解压源码链接位于 `docs/tiancode/version-history/`，同步前文件及合并元数据保存在忽略的 `.artifacts/upstream-sync/20261028/`。

已实际启动 Desktop 开发版并确认原生 TianCode 欢迎窗口可见。pnpm 虚拟提升目录中残留的旧工作区链接，已对照同步备份核实目标后清理，并通过 `pnpm install --frozen-lockfile --offline --optimistic-repeat-install=false` 校正安装状态。虚拟提升目录已无失效链接，四项开发项目与应用测试通过。

分类元数据、菜单交互与 Office 发现通过 108 项定向 Vitest，离线插件市场通过 45 项定向测试。真实浏览器场景验证了八个分类菜单、草稿保留、自定义 Skill 实时变化，以及 390px 和 760px 下的两种主题。`public-report` 会话记录回放已通过，目录包含当前应用技能。`pnpm run build:tiancode` 的九项构建与聚合编译检查全部通过；从该命令环境中移除继承的 SOCKS 代理变量后，`pnpm run doc-sync` 的 43 项检查全部通过。`uv run pytest` 仍在收集阶段因本地 Python 包未安装而受阻；`uv run ruff .` 因环境没有 `ruff` 可执行文件而无法启动。

静态插件市场流程、格式 1 tarball 示例、Windows Discover 流程、离线依赖要求和可观察的 Desktop 检查见[PLUGIN_MARKET.md](tiancode/PLUGIN_MARKET.zh.md)。

TianCode Skill Hub 提供可离线安装的可选插件组合包，包含设置侧边栏入口、内网目录地址配置、可搜索卡片与 TianCode 元数据安装表单。完整目录包格式与有界读取改编自 MichengAI/dsh-skills-manager，并保留署名。静态目录生成器、Nginx/Compose 部署文件与安装流程见 [Skill Hub](tiancode/SKILL_HUB.zh.md)。打包后的组合包已通过全新配置目录离线安装，以及真实浏览器的连接、资源安装和分类即时发现验证，覆盖 390px、1100px 与深浅主题。55 项定向测试、经 Skill Hub 安装的 `skill-load` 录制 Session 回放、产物构建与聚合编译检查均通过。目标内网与 Windows Desktop 验收仍需在部署环境执行。
