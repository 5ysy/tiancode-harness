---
kind: upgrade-guide
description: "企业内网桌面版的应用身份和数据目录变更为 TianCode。"
---

# 桌面端身份变更为 TianCode

[English](guide.md) | 中文

## 变更

企业内网桌面版使用 `TianCode` 和 `com.tiancode.desktop`。Windows 安装使用 `TianCode.exe`、独立的 Electron profile，以及 `%APPDATA%\\TianCode` 下独立的 `DSH_HOME`。上游 DeepSeek Harness 安装保留自己的身份和数据目录。两个产品之间不会自动复制已有数据。TianCode Host 请求系统分配的 loopback 端口，因此可以在上游应用运行时启动。通用设置显示 TianCode 产品版本 `v0.0.2`；包与构建版本保留发布标识。

## 迁移

1. 将 TianCode 安装到独立目录，不要选择已有 DeepSeek Harness 的安装目录。
2. 如果需要已有会话或插件，请通过应用和插件系统支持的导出、安装流程迁移。确认 TianCode 副本可用前，保留原有 `$DSH_HOME`。
3. 在 TianCode 的模型设置中配置内网模型 Provider。API Key 存储在应用凭据服务中，不要写入 `.env.windows` 或源代码。
4. 构建离线安装包时，在 `apps/desktop/.env.windows` 中设置 `DSH_DESKTOP_UPDATES=disabled`。安装后确认没有公网更新源，且 `TianCode.exe` 能与上游安装并存启动。
