# Windows x64 构建

当前开发工作区为 macOS，无法执行 Windows x64 的 Electron、NSIS、Visual C++ 和 Windows SDK 验证。Windows 开发机需要使用仓库要求的 Node.js 22.19 或更高兼容版本、pnpm、Python、Visual C++ Build Tools、Windows 10/11 SDK、PowerShell 和 Git。目标机不需要在线安装 Node.js 或 pnpm，运行时由安装包携带。

## 准备

在仓库根目录安装依赖，并在 `apps/desktop/.env.windows` 中填写企业内部构建值。可以从 `.env.windows.example` 复制模板：

```powershell
Copy-Item apps/desktop/.env.windows.example apps/desktop/.env.windows
```

企业离线构建至少保留：

```dotenv
DSH_DESKTOP_APP_ID=com.tiancode.desktop
DSH_DESKTOP_UPDATES=disabled
```

准备阶段仍需要访问内部 npm Registry 或已准备的 pnpm 离线缓存。公网 Registry、GitHub 和 DeepSeek 公网服务不属于运行时依赖；若构建机完全隔离，需要先将工作区依赖和 Electron 缓存导入内网。

## 构建命令

推荐在 Windows x64 工作区执行：

```powershell
pnpm install --offline
pnpm run package:desktop:win:x64:unsigned -- --build-version 0.2.0-rc.2.20261012.1
```

命令会构建 `dsh` 运行时、Host、内置 pnpm、插件运行时和 NSIS 安装器。当前版本校验要求构建版本使用 `0.2.0-rc.2.<date>.<sequence>` 格式，因此示例产物名称为 `TianCode-Setup-0.2.0-rc.2.20261012.1-win-x64-unsigned.exe`。构建器会在文件名中保留目标平台、架构和未签名后缀；正式企业签名构建需要公司的证书、签名工具和 PIN，不能使用官方证书。

构建前可运行：

```powershell
pnpm run package:desktop:win:x64 -- --check
pnpm --filter @deepseek-ai/dsh-desktop run test:installer
```

第一条命令检查配置和工具链，第二条命令验证安装器界面、目录隔离和卸载流程。当前 macOS 工作区未执行这些 Windows 命令。

## GitHub Actions 构建

仓库提供 `.github/workflows/tiancode-windows-build.yml` 手动工作流。它在 `windows-2025` x64 runner 上安装 Node.js 24、pnpm 11.7.0 和工作区依赖，写入 TianCode 的无更新打包配置，运行工具链检查，然后生成未签名 NSIS 安装器。Windows runner 会使用仓库已有的 Visual Studio C++ Build Tools 和 Windows SDK；工作流不读取 API Key、签名 PIN 或其他发布凭据。

在 GitHub 仓库的 **Actions** 页面选择 **Build TianCode Windows installer**，点击 **Run workflow**，填写 `build_version`（默认值为 `0.2.0-rc.2.20261012.2`）和对应的 `release_tag`（必须是 `tiancode-v<build_version>`，默认值为 `tiancode-v0.2.0-rc.2.20261012.2`）。日期和序号用于区分同一产品版本的内部构建。如果企业依赖内网 npm Registry，可以在 `npm_registry` 输入框填写不带路径、凭据、查询参数或片段的 HTTPS origin；留空时使用默认 npm Registry。工作流会校验版本、Release 标签和 Registry 输入，并拒绝不符合规则的值。

工作流成功后会在同一个仓库创建对应的预发布 GitHub Release，并在 **Assets** 中提供 Windows 安装器、安装器 ZIP、源码 ZIP、各文件的 SHA-256 文件、`SHA256SUMS.txt` 和 `build-manifest.json`。Release 使用 `contents: write` 权限发布，标签指向本次运行的提交。Actions artifact `TianCode-windows-x64-<run-id>` 仍提供单独的 `.exe`、`.zip`、`.blockmap`（构建器生成时存在）、源码 ZIP、`SHA256SUMS.txt` 和 `build-manifest.json`；`TianCode-windows-x64-<run-id>-logs` 保存脱敏的打包运行日志，失败时也会上传。下载后可在 PowerShell 中校验：

```powershell
Get-FileHash .\TianCode-Setup-0.2.0-rc.2.20261012.2-win-x64-unsigned.exe -Algorithm SHA256
Get-FileHash .\TianCode-Setup-0.2.0-rc.2.20261012.2-win-x64-unsigned.zip -Algorithm SHA256
Get-Content .\SHA256SUMS.txt
```

该工作流生成的安装器沿用构建器的实际命名规则 `TianCode-Setup-<version>-win-x64-unsigned.exe`，ZIP 使用同一名称并追加 `.zip`，源码包命名为 `TianCode-source-<version>.zip`。Release 标签必须唯一；如果标签已经存在，工作流会停止并要求选择新的版本。Actions artifact 的默认保留期为 14 天，GitHub Release 用于长期保存。安装器未签名，SmartScreen 或企业策略提示时应使用公司签名流程处理。

## 产物检查

在 Windows 上安装到独立目录，确认开始菜单、桌面快捷方式、任务栏、托盘、关于面板和卸载器显示 TianCode。安装包的 SHA-256 可用以下命令生成：

```powershell
Get-FileHash .desktop-build\targets\win-x64\unsigned-artifacts\TianCode-Setup-0.2.0-rc.2.20261012.2-win-x64-unsigned.exe -Algorithm SHA256
```

SmartScreen 或企业策略提示未签名时，应使用公司的签名流程处理，不能关闭安全保护。
