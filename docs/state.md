# 当前开发状态

TianCode 品牌定制已完成源码级的应用身份、窗口/托盘/欢迎页文案、用户数据隔离、CLI 路径、Windows 命令注册表隔离、提供的品牌资源映射和显式离线更新配置。macOS 打包流程在禁用更新时不再要求 `nightly-mac.yml`，Builder 的 macOS 本地化元数据也已合并保留。插件核心代码、Bundle Manifest、Desktop profile 结构和 `@deepseek-ai` 包名未改动。

当前分支为 `feature/tiancode-branding`。原生 Node 语法、离线更新配置、unsigned Builder 配置、macOS 离线产物夹具、品牌资源尺寸和升级指南 pairing 已验证。新增 `.github/workflows/tiancode-windows-build.yml`，通过手动 GitHub Actions 运行在 `windows-2025` x64 runner 上构建无签名 TianCode NSIS 安装器，并上传 `.exe`、同名 ZIP、SHA-256 清单和打包日志；支持传入受校验的企业 npm Registry origin。Windows x64 安装包、内网模型、离线插件安装和完整 TypeScript/Vitest、文档门禁仍需在依赖可用及 Windows 企业环境中验证；详细结果见 `docs/tiancode/TEST_REPORT.md`。
