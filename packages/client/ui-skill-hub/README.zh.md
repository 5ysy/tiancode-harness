---
description: "Skill Hub 连接设置与分类元数据安装卡片。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-skill-hub

[English](README.md) | 中文

## 概述

Host 提供配置时，在设置左侧导航增加 **Skill Hub**。页面编辑目录地址、搜索技能卡片，并通过所有者认证的 [Host 插件](../../skill/skill-hub/README.zh.md)安装。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

<a id="use-this-package"></a>
## 使用本包

安装 [Skill Hub 组合包](../../experimental/skill-hub-bundle/README.zh.md)。保存 `catalog.json` 地址，选择卡片，选择 TianCode 分类，并编辑中英文显示名称。展开元数据区域可填写父级技能名称和整数排序值。失败时保留已读取的卡片与当前表单值；刷新操作读取最新安装状态。Host 上限与环境变量令牌使用 Host 插件配置。

<a id="understand-the-implementation"></a>
## 理解实现

注册端控制器观察配置表单，管理 HTTP 取消与过期响应隔离。插槽 hooks 绑定不可变状态。端点基于当前文档位置解析，支持反向代理前缀和桌面协议。中英文文案由 locale 管理。API 地址解析改编自 dsh-skills-manager；见 [NOTICE](NOTICE)。

<a id="model-experience"></a>
## 模型体验

本设置页面不注册模型可见入口。

#### KV Cache 影响

页面本身不改变模型请求；安装技能会改变现有技能插件读取的 Host 目录。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延期工作

- 设置页面需要匹配的 Host 包。连接远程 Host 时，安装写入远程 Host。本页面不覆盖已有的同名技能。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文</summary>

无。

</details>
