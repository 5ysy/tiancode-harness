# TianCode 测试报告

## 2026-10-14 界面与共存验证

- `pnpm run build:tiancode` 与 Desktop build 已通过；客户端构建记录包含 TianCode profile、产品名称与显示版本 `v0.0.2`。
- 品牌、通用设置、桌面主进程与单实例的 146 项定向 Vitest 测试通过；profile resolution 与 macOS/Windows packaging configuration 的 259 项定向测试通过。
- Agent 预设目录与品牌、构建环境的后续 143 项定向 Vitest 测试通过；引导字典放入 locale 目录后，客户端 i18n 与 export JSDoc 检查通过。最终 TianCode 完整构建通过。
- `pnpm run typecheck` 与修复 3 处已有 lint 错误后的 `pnpm run lint` 通过；7 组已修改文档的 bilingual pairing、client catalog 和 plugin package catalog 检查通过。
- 在 macOS 真实 Electron 桌面界面逐项检查侧栏图标与 TianCode 名称、无侧栏版本、欢迎图标与指定中文标语、创造模式描述、更多菜单、通用设置 Session Log 说明和 `v0.0.2`、Agent 预设说明，均符合本次要求。开发版 Dock 使用 TianCode 资源。
- 官方应用 Host 正在监听 `19387` 时，TianCode Host 在系统分配的另一端口启动，主界面可用；两者运行进程和监听端口同时存在。
- Electron `44.7.0` 的原生内部模块访问在 `node-addon-require-builtin` `0.1.6` 上拒绝启动；更新到上游明确支持该 Electron 版本的 `0.1.9` 后，Electron 实际加载器检查与 Desktop 启动通过。依赖 frozen lockfile 安装通过。
- 全库 `pnpm run test:docs` 为 18 项通过、3 项失败，`pnpm run doc-sync` 为 37 项通过、6 项失败。失败包括现有 TianCode 单语文档、任务稿换行、repository references、5 个既有 export JSDoc 缺失及过期生成目录；client catalog 和 plugin package catalog 已重新生成并定向验证。完整文档门禁尚未通过。
- `uv run pytest` 有 5 个 Python 包缺失导致收集失败；`uv run ruff .` 因环境未安装 ruff 退出。上述命令未作为成功证据。
- Windows 安装、卸载与内网模型调用仍需 Windows 企业环境验收。
- `pnpm run hygiene` 为 16 项通过、2 项失败；现有 vendor rescope 夹具残留尚未修复。该次运行报告的 2 处客户端硬编码品牌问题已修复并通过 `verify-client-ui-i18n` 定向检查。

## 2026-10-14 Windows 发布验证

- [GitHub Actions run 38432723290](https://github.com/5ysy/tiancode-harness/actions/runs/38432723290) 的 Windows x64 构建与 Release 作业均成功。打包日志确认 `runtime:primary-smoke`、`runtime:smoke` 和 `smoke-packaged-runtime.ts --unsigned` 通过。
- [Release tiancode-v0.2.0-rc.2.20261014.1](https://github.com/5ysy/tiancode-harness/releases/tag/tiancode-v0.2.0-rc.2.20261014.1) 包含 8 个完整资产：安装器、安装器 ZIP、源码 ZIP、三个 `.sha256` 文件、`SHA256SUMS.txt` 和 `build-manifest.json`。安装器大小为 291,396,775 字节，界面显示版本为 `v0.0.2`。
- 已下载 manifest 和校验文件，并核对 GitHub asset digest、manifest、`SHA256SUMS.txt` 与各 `.sha256` 文件。安装器 SHA-256 为 `260b376e8153025a787c04303b83233febd8082b6f5b1c9da88b5d46d30c2add`，安装器 ZIP 为 `9dd3aaa0906270dcc9bb644795b9d664a130f726e8110b72585de81ef42d7b10`，源码 ZIP 为 `fde54c60c3d9ea7d0d080aca3768c5dd725c5fe91451f785481001859d032e08`，全部一致。
- manifest 的产品为 TianCode、目标为 `win-x64`、`unsigned` 为 true、构建版本为 `0.2.0-rc.2.20261014.1`；manifest 和 Release Git 标签均指向提交 `d6ad84879e770315609d885351fe627036fe8f3d`。

报告基于当前工作区、macOS 实际界面和 Windows Actions；测试结果只记录已经执行的命令。Windows 安装器的已验证范围见 2026-10-15 记录，企业内网验收范围见“未完成或未验证”。

## 2026-10-15 Windows 安装器品牌验收

- [Windows Actions run 38741731764](https://github.com/5ysy/tiancode-harness/actions/runs/38741731764) 的构建、实际安装器页面验证与 Release 发布全部成功。安装器明确使用提供的 TianCode ICO，四套安装品牌图片使用提供的横向 Logo。
- 实际 `.exe` 在浅色、深色主题下分别完成安装；欢迎页、进度页和完成页的六张截图均已逐页查看，均显示天山智码 / TIANCode 与雪山代码图标。窗口标题与可见文字检查没有发现 DeepSeek 或 DSH；安装器图标与 Logo 渲染区域比对通过。
- 安装完成状态达到 100%，`TianCode.exe` 存在，完成按钮正常退出；验证脚本最后执行卸载并确认应用文件移除。此项覆盖安装器流程，应用启动、快捷方式和企业内网模型不在本次验证范围内。
- [Release tiancode-v0.2.0-rc.2.20261015.1](https://github.com/5ysy/tiancode-harness/releases/tag/tiancode-v0.2.0-rc.2.20261015.1) 包含安装器、安装器 ZIP、源码 ZIP、各自校验文件、SHA256SUMS 和 manifest，共 8 个资产。安装器为无签名 Windows x64 版本，大小为 291,953,403 字节。
- Release 标签与 manifest 均指向本轮构建提交；GitHub asset digest、manifest、SHA256SUMS 与三个单独校验文件一致。下载到本地的安装器 SHA-256 为 `2f8a09bcbfe7ff2cbf9855d73af640545609acb7704caa9185327d0fa334ad3b`，与发布清单一致。安装器、校验文件及截图保存在 `TianCode_pachages/20261015.1`。
- 本轮 `pnpm run doc-sync` 为 40 项通过、3 项失败；失败仍为现有单语文档 pairing、任务稿换行和 repository references，完整文档门禁未通过。

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
- 已将 Electron 更新到 `44.7.0`，并用 pnpm `11.7.0` 通过 `--frozen-lockfile --lockfile-only` 校验锁文件；该版本包含对应的 Node shutdown 修复，随后由新的 Windows Actions 运行验证最终 installer artifact。
- Windows Actions `38165951276` 已成功完成构建、ZIP/校验和生成与 artifact 上传。运行地址：[GitHub Actions run 38165951276](https://github.com/5ysy/tiancode-harness/actions/runs/38165951276)。
- 已下载 artifact 并检查 `TianCode-Setup-0.2.0-rc.2.20261012.1-win-x64-unsigned.exe`、同名 ZIP、`.sha256`、`SHA256SUMS.txt` 和 `build-manifest.json`；本地计算的 installer SHA-256 为 `c4533e9ace7f15e6e8131ecce5dd9c95a1aa5234fd3c6c777d36b593c2a0768d`，ZIP SHA-256 为 `588c9bfb7a55b9a408a9295344cdbe6b0a2c923e9fb9efdff4ed8a3e1ed8a30e`，均与清单一致。ZIP 内含 `.exe` 和 installer `.sha256` 文件。
- Windows Actions run `38275517275` 的构建作业已在 `windows-2025` 上成功生成 unsigned TianCode installer、安装器 ZIP、源码 ZIP、SHA-256 文件和 manifest；同一次运行的合并 Release 请求收到 GitHub API HTTP 500。修复为先创建 Release、再逐项上传资产后，run `38279554627` 复用该成功 artifact 并完成 Release 发布。
- GitHub Release [tiancode-v0.2.0-rc.2.20261012.2](https://github.com/5ysy/tiancode-harness/releases/tag/tiancode-v0.2.0-rc.2.20261012.2) 已创建为预发布版本，指向构建提交 `3b3f436b04dd4ae8d4014d498da8e60b96d19a22`，包含安装器、安装器 ZIP、源码 ZIP、三个 `.sha256` 文件、`SHA256SUMS.txt` 和 `build-manifest.json`。
- 已下载 Release 中的校验文件和 manifest，并核对 GitHub asset digest 与 `SHA256SUMS.txt`：installer 为 `41013dd80d55dbf0875309a723a81765475d6143f987bc11df21940753188dda`，installer ZIP 为 `659ea55c28bcef4777ea20e5db406288c4c9a671edea26d381ee817d463e8a53`，source ZIP 为 `5dd2b08183f0d478a94d53eebe882e09f5e9c2faa94bbb3e859b8bdc71566d04`；manifest 的 `product`、`target`、`unsigned`、文件名和 commit 与构建参数一致。

## 未完成或未验证

- `uv run pytest` 在收集阶段有 5 个 `ModuleNotFoundError`（`deepseek_harness` 和 `deepseek_harness_runtime`），未进入测试；`uv run ruff .` 因环境没有 `ruff` 可执行文件退出。
- 完整文档门禁与 hygiene 尚未全部通过，具体失败及后续定向修复见本报告的 2026-10-14 验证记录。
- 安装器双主题页面、安装成功、完成退出和卸载清理由 Windows Actions 验证；应用启动、快捷方式、任务栏、托盘和 Windows 单实例隔离仍需在 Windows 验收机上执行。
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
