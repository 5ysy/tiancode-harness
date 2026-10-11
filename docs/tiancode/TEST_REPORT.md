# TianCode 测试报告

报告基于当前工作区和可用的 macOS 环境。测试结果只记录已经执行的命令；Windows、内网模型和安装卸载结果在对应环境完成前保持“未验证”。

## 已检查

- 已检查 `apps/desktop` 的 Electron Builder、NSIS、托盘、欢迎页、CLI、更新策略和 `DSH_HOME` 引用。
- 已确认品牌素材来自 `TianCode_Brand_Assets`，并检查 PNG、SVG、ICO 和安装侧栏的文件类型与尺寸。
- 已创建 `feature/tiancode-branding` 分支，保留用户原有素材备份和未跟踪文件。
- 已运行 `node --check` 检查修改的 `.mjs` 配置脚本，结果通过。
- 已运行 `node --experimental-strip-types --check` 检查修改的 TypeScript 文件，结果通过。
- 已运行 `git diff --check`，当前修改没有空白错误。
- 已运行原生 Node 定向检查，确认 `DSH_DESKTOP_UPDATES=disabled` 会跳过更新源和 Mandatory Update 策略，unsigned Windows Builder 配置使用 TianCode 身份并将 `publish` 设为 `null`。
- 已运行原生 Node macOS 打包夹具，确认禁用更新时 ZIP、DMG 和 blockmap 可以生成，`nightly-mac.yml` 不会作为产物发布。
- 已用 `sips` 检查品牌 PNG 尺寸：主图标为 1024×1024，横向 Logo 为 2062×650，欢迎图为 1600×520，安装侧栏为 164×314。
- 已通过原生 Node pairing 检查：`verify-translation-pairing: 1 named pair(s) consistent`。
- 已用 Ruby YAML 解析和 Python 结构断言检查 `.github/workflows/tiancode-windows-build.yml` 的 runner、Node.js/pnpm 版本、离线更新环境、构建版本输入、artifact 路径和 SHA-256 生成步骤。
- 已在个人 fork 上运行 Windows Actions `38162449088`，确认 `windows-2025` runner、pnpm 依赖安装、Visual Studio/C++/SDK 工具链检查、官方构建、dsh/Host/vendor/Landlock runtime pack 和 Electron 下载步骤通过；运行在 `prepare:dsh -> runtime:install` 处因 Electron `44.0.0` 的 Windows 进程退出崩溃停止。
- 已将 Electron 更新到 `44.7.0`，并用 pnpm `11.7.0` 通过 `--frozen-lockfile --lockfile-only` 校验锁文件；该版本包含对应的 Node shutdown 修复，等待新的 Windows Actions 运行验证最终 installer artifact。

## 未完成或未验证

- `pnpm install --offline` 因本地缓存缺少 `mermaid-11.16.0.tgz` 退出，工作区依赖链接仍不完整。
- `pnpm --filter @deepseek-ai/dsh-desktop run build`、`pnpm run test:docs`、`pnpm run doc-sync` 和 `pnpm run lint` 都在自动补依赖阶段请求 npm Registry 时出现 `ECONNRESET`；命令未进入实际脚本或 TypeScript 编译阶段。
- `pnpm run verify-translation-pairing docs/upgrade-guide/v0.2.0-rc.2/tiancode-identity/guide.md` 同样因依赖安装阶段的 Registry 请求未完成，已用原生 Node pairing 检查替代当前工作区可执行证据。
- `uv run pytest` 在收集阶段有 5 个 `ModuleNotFoundError`（`deepseek_harness` 和 `deepseek_harness_runtime`），未进入测试；`uv run ruff .` 因环境没有 `ruff` 可执行文件退出。
- 由于 `vitest`、`tsx` 和对应的 esbuild 可执行链接没有完成，桌面端 focused Vitest 未执行。
- Windows x64 unsigned NSIS 构建、安装、启动、卸载、快捷方式、任务栏、托盘、单实例隔离和 SHA-256 尚未验证。
- GitHub Actions Windows runner 的最终 NSIS 构建、ZIP 上传和 artifact 下载仍待 Electron `44.7.0` 更新后的新运行验证；上一轮运行已验证依赖安装和工具链检查路径。
- 无公网启动、内网模型流式输出和工具调用尚未验证。

## 插件兼容性验收

源码没有修改 `@deepseek-ai/dsh`、Plugin Manager、Bundle Manifest、Profile 解析、插件注册、安装审批或沙箱代码。`DSH_HOME/profiles/desktop` 目录约定和 CLI 启动器仍然保留，离线安装路径记录在 [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md)。以下项目仍待在 Windows 或企业内网环境完成：

- 内置插件加载和运行：未验证。
- 第三方插件安装、启用、禁用和卸载：未验证。
- 本地离线插件包和离线依赖缓存安装：未验证。
- 插件异常恢复与兼容性校验失败处理：未验证。
- CLI 对 Desktop profile 的插件管理：未验证。
- 原生 Node 模块在 Windows x64 与 Electron Node 运行时中的兼容性：未验证。

验收通过条件是这些场景均使用 TianCode 专属 `DSH_HOME` 完成，并且官方 Harness 的 profile、插件和会话数据保持可用。
