---
description: "面向侧栏的 DeepSeek Harness 与 TianCode 品牌填充，由客户端构建 profile 选择；供选择或替换品牌呈现的用户与维护者阅读。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-official

[English](README.md) | 中文

## 概述

本包让以 `official` profile 构建的客户端在侧栏显示 DeepSeek Harness 标志与名称，让以 `tiancode` profile 构建的客户端显示 TianCode 标志与名称。其他构建 profile 保留外壳的鱼形标志与本地构建标签，TianCode 还会在会话首屏显示提供的图标。使用其他品牌的部署应提供替代品牌包。本包不保留运行时状态，也不影响模型请求。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [进一步探索](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

将本插件挂载到浏览器插件名单；DeepSeek 发布选择 `official` profile，TianCode Desktop 发布选择 `tiancode` profile，让对应的填充注册。

### 选择 profile

`DSH_CLIENT_BUILD_PROFILE` 决定渲染哪个品牌。`official` 构建在侧栏显示 DeepSeek Harness 标志与名称，`tiancode` 构建显示提供的 TianCode 图标与名称。其他取值都让外壳回退——鱼形标志与本地构建标签——保持原样。TianCode 构建还会填充会话首屏标志；其他 profile 保留来自 `dsh-client-ui-conversation` 的动画首屏鱼。所有情况下插件都会照常加载并通过校验；只有注册受 profile 门控。

### 替换品牌

自有身份的部署组合另一个占据侧栏与首屏 slot 的包。占据 slot 是唯一的组合路径；这里不存在任何品牌配置面。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

侧栏填充作为一组声明感知的注册安装：嵌套的 `ctx.slots.inject()` 调用等待侧栏声明，因此无论本行在声明者之前还是之后激活，这组注册都能工作；声明消失时两个填充一并撤回，HMR 期间也不会留下残缺的品牌混合。TianCode 首屏标志通过独立的声明感知 effect 安装，首屏声明消失时撤回。浏览器半部是 [`src/client/index.ts`](src/client/index.ts)；node 半部是一个空 Loader 座位。浏览器标题是构建环境的事（`DSH_CLIENT_TITLE`），不在 slot 系统之内。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

当品牌面不够用时阅读以下页面。它们从本包占据的 slot 进入渲染这些 slot 的外壳。

- [ui-sidebar](../ui-sidebar/README.zh.md)——声明 `sidebar.brand.mark` 与 `sidebar.brand.name` 并渲染其回退。
- [ui-conversation](../ui-conversation/README.zh.md)——在首屏声明 `conversation.hero.brand.mark`。
- [Web 客户端架构](../../../.agents/notes/implemented/architecture/2026-07-19-gui-web-client-architecture.zh.md)——浏览器插件行如何加载并注册 slot。

-----

<a id="model-experience"></a>
## 模型体验

无，因为本包只贡献浏览器呈现；这里没有任何内容进入模型请求。

#### KV Cache 影响

无；本包既不组装也不发送提供方请求。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>


这些限制界定了品牌呈现的供给方式。它们是当前包约束，不是品牌设计对比或任务积压。

- **只有一组填充**——替代呈现属于占据相同 slot 的另一个 Cordis 包。
- **浏览器标题独立**——`DSH_CLIENT_TITLE` 在构建时选择标题文本，而非通过 UI slot。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>

**运行时不变式：** 不发布伴生入口。本包不保留可变状态，slot occupant 通过声明感知 effect 安装和释放。
