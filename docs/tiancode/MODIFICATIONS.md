# TianCode 修改记录

本页记录当前工作区中为 TianCode 品牌和企业内网部署做的实际修改。`@deepseek-ai/*` 包名、`dsh` CLI、Cordis 插件 Bundle、Manifest、Profile 目录和插件注册接口均保持原有标识。

## 代码与打包

| 路径 | 修改内容 |
| --- | --- |
| `apps/desktop/src/product-identity.ts` | 集中定义 TianCode 名称、中文名、App ID 和数据目录名。 |
| `apps/desktop/src/main.ts` | 设置 Electron 名称、Windows App User Model ID、独立 `userData`/`sessionData`，并在未显式指定时设置独立 `DSH_HOME`；更新关于面板和离线菜单。 |
| `apps/desktop/src/locale.ts` | 更新英文和中文的窗口、托盘、退出、欢迎页、更新文案。模型引导改为兼容 OpenAI 协议的模型描述。 |
| `apps/desktop/src/client/WelcomePage.tsx`、`renderer/assets/` | 欢迎页改用提供的 TianCode 横向 Logo。 |
| `apps/desktop/electron-builder.config.*` | 设置产品名、协议显示名、TianCode 安装包名称和 TianCode 麦克风说明。 |
| `apps/desktop/cli/dsh*` | CLI 启动 TianCode 可执行文件；缺少 `DSH_HOME` 时使用 TianCode 专属目录。 |
| `apps/desktop/scripts/command-path.ps1` | Windows `dsh` 命令的注册表所有权和互斥量使用 TianCode 专属名称，避免与官方安装互相覆盖。 |
| `apps/desktop/installer/` | 安装器文案和提取报告使用 TianCode 名称。 |
| `apps/desktop/scripts/` | 更新打包产物、macOS 开发包、运行时冒烟路径和构建版本扫描中的应用名称。 |
| `.github/workflows/tiancode-windows-build.yml` | 手动构建 Windows x64 unsigned NSIS 安装器，生成 ZIP、SHA-256 清单和脱敏打包日志并上传为 Actions artifacts。 |

## 离线策略

`DSH_DESKTOP_UPDATES=disabled` 是显式的企业内网构建选项。它跳过普通更新源和 Mandatory Update 策略配置，打包结果不携带公网更新源。Windows 示例环境已启用该选项；其他部署可以省略它并按原有发布环境配置内部更新服务。

模型 Provider、工具调用、会话、权限、沙箱和插件管理器未做结构性修改。内网模型地址与凭据仍由现有设置和凭据服务管理，源码没有加入地址、密钥或回退 Provider。

## 资源

应用、Windows、macOS、托盘和安装侧栏资源使用 `TianCode_Brand_Assets` 提供的文件。仓库中的 `.tiancode-brand-backup/` 保留素材覆盖前的文件，便于审阅和恢复。
