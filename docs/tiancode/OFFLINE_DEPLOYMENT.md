# 企业内网离线部署

安装包包含 Electron、TianCode Desktop Host、`dsh` 运行时、内置 pnpm、核心插件依赖和界面资源。首次启动不要求访问 GitHub、npm Registry、DeepSeek 公网服务或 CDN。应用的模型请求地址由管理员或用户在模型设置中配置。

## 数据隔离

TianCode 使用独立的 Electron `userData` 和 `sessionData`，默认位置为 Windows `%APPDATA%\TianCode`。在没有外部 `DSH_HOME` 的启动中，桌面端使用 `%APPDATA%\TianCode\dsh`，并在其中保留 `profiles/desktop`、会话、设置、凭据、工作区和插件数据。CLI 启动器使用相同的默认目录；显式 `DSH_HOME` 仍由管理员或测试环境控制。

官方 Harness 与 TianCode 使用不同 App ID、单实例锁、Electron profile、更新缓存和 dsh home，可以并存。卸载 TianCode 只清理自己的安装目录和已登记的产品目录，不应删除官方 Harness 数据；这项行为需要在 Windows 安装机上实测确认。

## 内网模型

在模型设置中新增 OpenAI 兼容 Provider，填写企业 API 的 Base URL、模型 ID 和由管理员分配的 API Key。例如 Base URL 可以是 `http://192.168.10.20:8000/v1`，该地址只作为配置格式示例，源码不包含它。保存后的凭据由现有凭据服务管理；失败时不会回退到公网模型。

流式输出、工具调用、多模型配置和 Provider 兼容性由现有 LLM 包处理。具体模型是否支持工具调用，需使用企业模型服务的实际响应完成验收。

## 插件离线安装

Cordis Plugin Manager、内置 pnpm、Bundle Manifest 校验、插件审批、启用/禁用、卸载和异常恢复保持原有流程。内网环境应使用本地插件包、预填充的 pnpm 缓存或企业 npm Registry；管理员可以通过本地路径安装第三方插件。安装失败时保留原有兼容性校验和安全沙箱，不自动回退到公网 npm、npmmirror 或 GitHub。

Desktop profile 仍位于 `$DSH_HOME/profiles/desktop`。CLI 与桌面端共享 TianCode 的 `DSH_HOME`，插件包名和 `@deepseek-ai` 依赖标识继续使用上游值，保证现有插件 Bundle 可解析。

## 更新与网络检查

Windows 企业包在 `.env.windows` 设置 `DSH_DESKTOP_UPDATES=disabled`。打包器不会写入普通更新 feed，也不会写入 Mandatory Update 策略；运行时不会自动下载官方更新包，应用菜单隐藏更新入口。企业后续升级通过重新分发内部安装包完成。

可选的插件下载和模型 API 请求仍会访问管理员配置的内网地址。网络监控验收应允许内网模型、内网 npm Registry 和本地服务请求，并确认没有其他公网目的地。
