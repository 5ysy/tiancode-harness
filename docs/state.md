# 当前开发状态

TianCode 品牌定制已完成源码级的应用身份、窗口/托盘/欢迎页文案、用户数据隔离、CLI 路径、Windows 命令注册表隔离、提供的品牌资源映射和显式离线更新配置。macOS 打包流程在禁用更新时不再要求 `nightly-mac.yml`，Builder 的 macOS 本地化元数据也已合并保留。插件核心代码、Bundle Manifest、Desktop profile 结构和 `@deepseek-ai` 包名未改动。

当前分支为 `feature/tiancode-branding`。原生 Node 语法、离线更新配置、unsigned Builder 配置、macOS 离线产物夹具、品牌资源尺寸和升级指南 pairing 已验证。新增 `.github/workflows/tiancode-windows-build.yml`，通过手动 GitHub Actions 运行在 `windows-2025` x64 runner 上构建无签名 TianCode NSIS 安装器，生成安装器 ZIP 和源码 ZIP，上传 Actions artifacts，并创建包含构建文件、SHA-256 清单和 manifest 的 GitHub Release；支持传入受校验的企业 npm Registry origin。内网模型、离线插件安装、安装后 Windows 验收和完整 TypeScript/Vitest、文档门禁仍需在依赖可用及 Windows 企业环境中验证；详细结果见 `docs/tiancode/TEST_REPORT.md`。

客户端构建新增 `tiancode` profile，Desktop 打包流程使用 `build:tiancode`，侧栏通过用户提供的 `apps/web/public/tiancode-mark.png` 显示 TianCode 图标和名称。设置页、引导页、文档预览提示、PWA 元数据与浏览器图标会随 `DSH_CLIENT_TITLE` 和 TianCode profile 切换品牌，桌面自定义协议也会提供该静态资源。底层 DSH、DeepSeek、包名、CLI 和协议标识继续保持兼容。Windows Actions 工作流现在会从当前提交生成源码 ZIP，并创建包含 unsigned 安装器、安装器 ZIP、源码 ZIP、SHA-256 清单和构建 manifest 的 TianCode GitHub Release。

Windows Actions 运行 `38162449088` 在 Electron `44.0.0` 的 runtime install 收尾阶段复现 Windows 子进程退出崩溃。当前已将桌面端 Electron 更新到 `44.7.0`，并通过 pnpm `11.7.0` 的 frozen lockfile 校验。更新后的运行 `38165951276` 已成功生成并上传 TianCode Windows x64 unsigned NSIS `.exe`、同名 ZIP、SHA-256 清单和构建 manifest，下载后的文件哈希已复核；Windows 安装、启动、卸载和企业内网模型验收仍由 Windows 环境执行。
