---
description: "安装包含设置页面和私有目录 provider 的 TianCode Skill Hub。"
kind: "package-bundle"
---

# @deepseek-ai/dsh-skill-hub-bundle

[English](README.md) | 中文

## 概述

**TianCode Skill Hub** 将 [Host 安装器](../../skill/skill-hub/README.zh.md)和[设置卡片](../../client/ui-skill-hub/README.zh.md)组合为可选的可安装插件。它将 dsh-skills-manager 的社区目录包格式适配到 TianCode 分类元数据。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

<a id="use-this-package"></a>
## 使用本包

按照[部署与安装指南](../../../docs/tiancode/SKILL_HUB.zh.md)操作。通过 TianCode 插件安装器安装生成的 `.tgz` 地址并启用。打开**设置 → Skill Hub**，保存内网目录地址，然后为卡片设置显示名称与分类并安装。

<a id="understand-the-implementation"></a>
## 理解实现

组合包插入 `skill-hub` 与 `ui-skill-hub`。它覆盖 `ui-skill` 配置，保留 TianCode 默认桌面快捷入口，并在 `tiancode` 之外允许 `skill-hub` provider。Profile 或用户配置可覆盖此允许列表；桌面分类菜单显示市场技能时，列表必须包含 `skill-hub`。离线 tarball 内嵌 Host、Client 包，并打包文件系统解析器及第三方依赖。核心 Cordis、schema、home-path 和 skill 服务来自运行中的 TianCode。

<a id="model-experience"></a>
## 模型体验

通过 `dsh-skill-filesystem` 与现有技能消费者间接提供安装后的名称、描述、调用策略和指令正文。

#### KV Cache 影响

Provider 失效通知会改变后续技能目录；已记录的技能调用保留原指令文本。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延期工作

- 禁用插件后移除页面与 provider；安装文件保留，可在重新启用后使用。插件不移除或更新已安装的技能。服务器访问与认证由部署方负责。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文</summary>

无。

</details>
