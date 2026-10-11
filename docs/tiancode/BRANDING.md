# TianCode 品牌规范

TianCode（中文名“天山智码”）是企业内网 AI 编程助手。界面显示使用 TianCode 或天山智码，底层包名、Cordis 插件标识和 `dsh` CLI 保持 DeepSeek Harness 兼容性。

欢迎页使用品牌标语“以智能之力，攀技术高峰”和英文副标题“Enterprise AI Coding Assistant”。

## 视觉规范

- 主色：天山深蓝 `#0F2742`、冰川蓝 `#4FC3F7`、浅冰蓝 `#AEEBFF`、雪山白 `#F4FAFF`、深灰蓝 `#1E2E3E`。
- 图形由素材包提供，包含天山雪峰和代码符号。源码不重新绘制 Logo。
- 应用图标使用无文字的圆角图形，欢迎页使用横向组合 Logo。
- `icon.png`、`icon-windows.png`、`icon-macos.png` 使用 1024 像素主图；`tray-windows.ico` 和 `tray.ico` 使用多尺寸托盘资源；`TianCode.ico` 用于 Windows 应用身份；安装侧栏使用 `installer/assets/uninstaller-sidebar.png`。

## 资源位置

- 应用图标：`apps/desktop/resources/icon*.{png,svg}`。
- Windows 托盘和应用 ICO：`apps/desktop/resources/tray*.ico`、`apps/desktop/resources/TianCode.ico`。
- 欢迎页：`apps/desktop/renderer/assets/tiancode-logo-horizontal.png`。
- 安装器侧栏：`apps/desktop/installer/assets/uninstaller-sidebar.png`。

`electron-builder` 从这些路径读取 Windows、macOS、关于面板和托盘资源。Windows 资源来自仓库外的 `TianCode_Brand_Assets/repo-overrides`；只允许为打包进行格式和尺寸转换。

## 应用身份

| 项目 | TianCode 值 |
| --- | --- |
| 产品名 | `TianCode` |
| 中文名 | `天山智码` |
| App ID | `com.tiancode.desktop` |
| Windows 可执行文件 | `TianCode.exe` |
| 安装包模式 | `TianCode-Setup-<version>-win-x64.exe` |
| URL Protocol | `dsh://`（协议方案保持兼容） |
| 独立数据目录 | `%APPDATA%\TianCode` 下的 `dsh` 与 Electron profile |

应用菜单、关于面板、托盘、退出确认、安装器错误提示和欢迎页都从桌面壳的本地化文案读取品牌名称。版权与开源许可证继续保留。
