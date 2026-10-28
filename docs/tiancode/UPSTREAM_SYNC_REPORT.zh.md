# TianCode 上游同步记录

[English](UPSTREAM_SYNC_REPORT.md) | 中文

## 同步来源与保留内容

运行时与工作区包使用官方 `0.2.1-rc.3`，配套 pnpm `11.28.5`、Electron `44.7.0` 和 LibreOffice Kit `0.1.5`。共同上游基线为 `dsh-v0.2.0-rc.2`。

提供的 ZIP 为 `version-history/deepseek-harness-dsh-v0.2.1-rc.3.zip`，SHA-256 为 `75bb71d8e81eca21ec0ceae77f7ddeb6d5930c252a3b97aca566752cfc408b2f`。解压源码通过相对符号链接保持原路径可访问，实际位于忽略的 `.artifacts/upstream/`。

合并保留 TianCode 素材、中英文名称、`com.tiancode.desktop`、独立的 `TianCode` 用户数据目录、默认 `DSH_HOME`、安装器定制和 Windows 发布流程。工作区已有的办公快捷入口、九类公职办公流程与四种编报模板均保留。

官方改动以原上游基线进行比较，48 个冲突文件已逐项处理。Office 提供路由及六个编写或操作技能，并可同时启用公职办公流程。会话格式迁移、SDK 消费者、持久化确认记录及各版本升级指南均随提供的源码同步。

## 集成处理

- Desktop 在 `127.0.0.1` 上使用系统分配端口，并保留上游 WebSocket 凭据检查。
- `DSH_DESKTOP_UPDATES=disabled` 在本地无签名 macOS 准备流程中保留，并以 `dshDesktopUpdates: disabled` 写入安装包元数据，普通安装启动无需额外设置启动环境变量。
- 产物发现、留存发布及期望输出使用 `TianCode-Setup-`，并沿用上游无签名、未公证后缀规则。Windows 工作流的默认构建版本以 `0.2.1-rc.3` 为前缀。
- Skill UI 保留 Host 与 Client 编译入口、配置驱动的快捷入口顺序，并接入上游会话文本注册机制。配置与插槽目录从其所属源码重新生成。

## 验证

| 检查 | 结果 |
|---|---|
| `pnpm install --frozen-lockfile --offline` | 更新后的锁文件验证通过。 |
| `pnpm run build:tiancode` | 九项产物构建及聚合类型检查全部通过。 |
| `pnpm run test --maxWorkers=4` | 首跑 44,025 项通过、287 项失败、243 项跳过、一项预期失败。调整验证环境并移走旧构建残留后，六个失败测试文件均通过定向重跑：350 项通过、两项跳过。 |
| Desktop、打包、Skill UI 与输入区定向测试 | 1,817 项通过，57 项按平台跳过。 |
| `pnpm run test:snapshot snapshots/session/headless.snapshot.ts -t public-report` | 新运行时上下文及技能目录完成无密钥刷新后，选中的一次回放通过；最终输出文件继续独立校验。 |
| `pnpm run test:web:built apps/web/tests/feature-entries.e2e.ts` | 通过，覆盖真实服务的快捷入口、模板、草稿保留、主题和窄窗口。 |
| `PYTHONPATH=python/sdk/src:python/sdk-runtime/src uv run pytest` | 231 项通过，九项运行时或平台相关用例跳过。 |
| `pnpm run lint` | 通过，保留一条上游无用禁用指令警告。 |
| 依赖策略、客户端文案归属、tsconfig 别名及 Cordis 配置 | 通过，验证了 278 个 Cordis 配置文件。 |
| 更新的双语文档 | 选中的状态、方案、报告及包 README 共六组配对通过。 |
| 受保护资源 | 22 个公职办公资源及 TianCode 素材文件与同步前字节一致。 |
| `git diff --check` | 通过，真实索引与分支保持原状。 |

最初的根目录 `uv run pytest` 无法导入源码包，上述显式 `PYTHONPATH` 调用通过。`uv run ruff .` 无法找到 Ruff；`uv run --with ruff ruff check .` 已实际执行，在未改动的上游 Python、脚本及技能文件中报告 158 个问题。完整文档检查的 43 项中有 39 项通过，TianCode 已有单语文档、段落换行和提交引用问题仍保留；额外的 CLI 帮助失败来自继承的 SOCKS 代理，使用系统 `/usr/bin/env` 仅移除 `ALL_PROXY`/`all_proxy` 后，七个帮助页检查通过。本次更新的文档配对已独立通过。

首次全量单测使用系统 Python 3.9 和本机 `~/.local/bin/env` 包装程序，上游 PTC 后端要求 CPython 3.10 及以上。将 Python 3.11 和系统 `env` 放在本次命令的 PATH 前部后，受影响测试重跑通过 343 项、跳过两项。剩余的构建导入失败来自已迁移包的旧编译产物。13 个仅包含生成残留及空源码／测试目录的包目录已移入备份，随后七项构建导入检查通过。没有修改机器全局 PATH 或可执行文件。Vendor 重定域检查对提供的源码报告 26 个残留路径，其中 25 个文件与该源码字节一致，另一个文件仅增加了保留的办公快捷入口配置。

## 本地使用与恢复

使用 `pnpm run build:tiancode` 构建；运行 `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop` 启动已构建桌面端，`pnpm run dev:desktop` 会在启动前重新构建。构建产物保留在本地。

同步前已跟踪与未跟踪的工作区文件保存在 `.artifacts/upstream-sync/20261028/tiancode-before.tar.gz`，`metadata.json` 记录输入树。当前分支与真实索引保持原状。

## 桌面启动验证

同步后启动发现十二个虚拟提升链接仍指向已迁移的旧工作区目录。清理前已将保存的链接目标与 `obsolete-builds.json` 逐项匹配。使用 `--optimistic-repeat-install=false` 的冻结离线安装通过，完整扫描确认虚拟提升目录中失效链接为零。随后使用原命令 `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop` 完成办公运行时准备与检查，启动 Host，并打开原生 TianCode 欢迎窗口。开发项目与开发应用测试共四项全部通过。原链接清单与诊断日志保存在 `.artifacts/upstream-sync/20261028/startup-fix/`。
