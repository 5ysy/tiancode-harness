# 当前开发状态

TianCode 开发启动使用 `build:tiancode`。侧栏显示提供的图标与 TianCode 名称，隐藏内部版本；对话欢迎页使用同一图标与“把你的工作交给我，请放心！”。通用设置显示 `v0.0.2` 和“帮助改进TianCode产品”，创造模式与 Agent 预设说明使用 TianCode。Desktop Host 请求系统分配的 loopback 端口；本机已确认官方 Host 的 `19387` 与 TianCode Host 的独立端口同时监听，TianCode 主界面正常运行。Electron `44.7.0` 配套的原生内部模块访问依赖使用 `node-addon-require-builtin` `0.1.9`。新 Windows 安装包发布结果见测试报告。

TianCode 品牌定制已完成源码级的应用身份、窗口/托盘/欢迎页文案、用户数据隔离、CLI 路径、Windows 命令注册表隔离、提供的品牌资源映射和显式离线更新配置。macOS 打包流程在禁用更新时不再要求 `nightly-mac.yml`，Builder 的 macOS 本地化元数据也已合并保留。插件核心代码、Bundle Manifest、Desktop profile 结构和 `@deepseek-ai` 包名未改动。

当前分支为 `feature/tiancode-branding`。原生 Node 语法、离线更新配置、unsigned Builder 配置、macOS 离线产物夹具、品牌资源尺寸和升级指南 pairing 已验证。新增 `.github/workflows/tiancode-windows-build.yml`，通过手动 GitHub Actions 运行在 `windows-2025` x64 runner 上构建无签名 TianCode NSIS 安装器，生成安装器 ZIP 和源码 ZIP，上传 Actions artifacts，并创建包含构建文件、SHA-256 清单和 manifest 的 GitHub Release；支持传入受校验的企业 npm Registry origin。TianCode 完整构建、TypeScript、lint 和相关定向 Vitest 已通过；完整文档门禁仍有现有文档问题。内网模型、离线插件安装和安装后 Windows 验收仍需在 Windows 企业环境中验证；详细结果见 `docs/tiancode/TEST_REPORT.md`。

客户端构建新增 `tiancode` profile，Desktop 打包流程使用 `build:tiancode`，侧栏通过用户提供的 `apps/web/public/tiancode-mark.png` 显示 TianCode 图标和名称。设置页、引导页、文档预览提示、PWA 元数据与浏览器图标会随 `DSH_CLIENT_TITLE` 和 TianCode profile 切换品牌，桌面自定义协议也会提供该静态资源。底层 DSH、DeepSeek、包名、CLI 和协议标识继续保持兼容。Windows Actions 工作流现在会从当前提交生成源码 ZIP，并创建包含 unsigned 安装器、安装器 ZIP、源码 ZIP、SHA-256 清单和构建 manifest 的 TianCode GitHub Release。

Windows Actions [运行 38432723290](https://github.com/5ysy/tiancode-harness/actions/runs/38432723290) 已成功构建并发布 [TianCode 0.2.0-rc.2.20261014.1](https://github.com/5ysy/tiancode-harness/releases/tag/tiancode-v0.2.0-rc.2.20261014.1)。Release 的 8 个资产完整，安装器、安装器 ZIP 和源码 ZIP 的 GitHub digest 与 manifest、SHA-256 文件一致；Release 标签和 manifest 指向源码提交 `d6ad84879e770315609d885351fe627036fe8f3d`。Windows runtime smoke 和打包后运行时检查通过；Windows 安装、启动、卸载和企业内网模型验收仍由 Windows 环境执行。

Windows 安装器欢迎、进度与完成页使用提供的 TianCode 横向组合 Logo，浅色／深色与 1x／2x 资源由 `render:installer-brand` 生成。安装器与卸载器明确使用 `TianCode.ico`。Windows 发布流程包含实际安装包的双主题页面操作与截图验证；新安装包的构建与验收结果待本轮 Windows Actions 完成。
