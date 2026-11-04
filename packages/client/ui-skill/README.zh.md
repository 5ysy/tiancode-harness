---
description: "dsh Web 客户端的 skill 引用与专属 skill 工具行：/ 触发的 skill source 与 skill 调用卡片。"
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-skill

[English](README.md) | 中文

## 概述

`dsh-client-ui-skill` 让用户通过 `/` 建议选择或直接键入 `/name` 来调用 skill（技能）。同一条字面命令可以从 Web 编辑器、TUI 和 ACP（Agent Client Protocol）一致地加载 skill；如果名称与宿主命令相同，它仍会解析为该命令。skill 调用在对话中显示为可展开的 `Instructions` 卡片；即使已安装的 skill 目录发生变化，卡片落定后的内容仍保持稳定。

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

在编辑器中输入 `/` 并从建议中选择 skill，或直接键入 `/name`；发出的消息携带字面文本，宿主对菜单 pick 与手动键入的 token 以同样方式加载 skill。与宿主命令同名的名称仍解析为命令——裁决在客户端把该行认领走，它根本不会成为提示词。

### source 提供什么

普通会话的候选来自 `skills/list` Remote；宿主提供每一个用户可调用的 skill，`modelInvocable: false` 的条目（即 `disable-model-invocation` skill，此路径是其唯一入口）会以当前语言把仅限用户标记作为描述前缀带上。结果经 `/` 菜单共享的名字排序器（ui-primitives 的 `rankByName`）排名：查询作为不区分大小写的有序子序列匹配 skill 名，前缀命中排最前，同分保持宿主顺序（[排名决策](../../../.agents/notes/archived/feature/2026-08-04-web-slash-command-fuzzy-discovery.md)）。`skills/list` 调用失败时会被记录并静默丢弃该菜单组——菜单只显示 pending／ready 状态。

### 输入框工作流入口

在 `ui-skill` Loader 条目中将 `quickActions` 设置为非空的有效技能名称列表，即可启用输入卡片上方的分类栏。空列表（独立插件的默认值）隐藏分类栏。配置表单将该设置投影到浏览器。八个分类始终按此顺序显示：对话、PPT汇报、公文写作、编报生成、数据分析、执法办案、格式校对、其他。每个按钮均向上展开菜单，空分类显示禁用的“暂无可用技能”条目。`quickActionProviders` 按提供方筛选目录；空列表包含全部提供方，Desktop 选择 `tiancode`。目录加载失败时提供重试。

打开分类保留当前草稿。选择技能添加可见的 `/name` 调用；切换技能替换已识别的开头技能，同时保留用户编写的文本和附件。“对话”菜单包含移除开头技能的“普通对话”选项，以及自定义对话技能。无关的斜杠命令、锁定输入或命令阶段会禁用分类选择。Escape 和外部点击关闭菜单。按下状态表示当前选中的分类。浏览菜单不会增加模型 token。

技能 frontmatter 的 `metadata.tiancode` 必须提供 `label.zh` 和 `label.en`，可选 `category`、技能名称 `parent` 及整数 `order`。分类值为 `chat`、`ppt`、`document`、`report`、`data`、`law`、`proofread` 和 `other`。显式分类优先；未分类技能沿可用的父技能链查找分类，再使用内置技能名称映射。该映射可为现有安装文件分类，同时保留用户拥有的文件内容。未知父技能和父技能循环均保留所有技能，未分类的自定义技能归入“其他”。政策研究归入“执法办案”；分类本身不增加专用办案能力。菜单优先按配置顺序显示 `quickActions` 中的技能，其余技能先按 `order`、再按技能名称排序，显示本地化标签或技能名称。提供方发出的目录通知会在技能新增、修改、删除或重新分类时更新已展开的菜单。

### skill 工具行

`preparing` 阶段只显示技能图标与标题，不显示请求加载的技能名称，也不能展开。`start` 和 `result` 阶段使用下述记录参数与输出；准备阶段不查询已安装目录。

收起的行显示 skill 图标、`Skill` 标题与请求加载的 skill 名称，并与普通工具行使用相同的 secondary 字号轴、行高、行高度和图标缩放。所有生命周期状态都保留普通 skill 图标；运行中的调用以同一道高光从左到右扫过标题、分隔符与 skill 名称，失败时以错误首行替换名称，中断则保留明确状态文本。已结算的行展开为一个尺寸受限的 `Instructions` 卡片，其中原样呈现持久化的工具输出；可用时还会提供标准轨迹的 `Inspect` 入口，展开卡片保留自身排版。该行的名称、生命周期与正文只派生自 ui-tool 提供的冻结调用／结果切片，绝不读取当前目录，因此即使已安装的 skill 或其描述发生变化，回放仍保持稳定。 文字和图标默认使用 tertiary 色，悬停使用 secondary 色；错误和中断文字保留各自的语义色。

鼠标移入 `/name` 时，背景覆盖整个引用。点击已知 skill 会在右侧栏打开提供方给出的 `SKILL.md` 路径，同时保留文本的可编辑性。缓存未就绪时，点击复用该 Session 的目录请求，在完成后按点击时的 Session 地址打开预览。切换预设、插件管理操作、重置连接和插件释放会取消待处理的预览；后续点击重新获取当前目录。没有文件路径的 skill 仍可调用，但没有文件预览。

-----

<a id="understand-the-implementation"></a>
## 理解实现

<details>
<summary>实现细节——点击展开</summary>

source 不实现任何裁决钩子，也没有引用 codec：pick 落下字面文本，发出的提示词中也是同一段字面文本，因此确定性在宿主侧（[slash 流水线笔记](../../../.agents/notes/archived/architecture/2026-07-25-web-input-machine-and-slash-pipeline.md)）。

### 候选流程

目录按普通会话缓存，拉取走 single-flight；scope 创建时的 `warm` 钩子预热该会话的缓存项，转发的 owner 事件 `agent-preset/selected` 丢弃该会话这一项（目录属于 preset，而空会话可能在预热之后才切换），转发的 `plugin-manager/changed` 事件清空全部缓存（插件管理操作可能增删每个会话都会读取的 skill provider），`api-session/skills-changed` 在文件变更后刷新全部缓存目录，`connection/reset` 清空全部缓存。由目录寻址的可继续 subagent 在客户端解析为没有 skill 候选，因为现有 skill RPC 要求会话已挂载；查看其持久化历史不得激活它。列表 RPC 使用插件注册时捕获的根上下文连接；草稿 chip 视觉由 `lexicon` 扫描派生。

每次目录拉取都要求客户端已持有该会话，并等待首次历史打开成功后才发送 `skills/list`。临时的 `skillCatalog` 引用持续持有会话，直到拉取结束。未被持有的会话或打开失败会直接拒绝，不发送 RPC；预设失效、插件管理操作、连接重置和插件释放也会取消正在等待的历史打开。

### 注册

`/client` 导出接口只有插件主体（`apply`／`inject`）；source 对象是注册 effect 的内部实现。工具行把 `skill` wire 名称注册进 ui-tool 的 keyed `tool.call.toolview` slot。

对于已发送文本，插件注册使用调用方已确认 `skillNames`、返回原文中下一个候选的 UserText 匹配器，并拥有 `conversation.user.text.node` 中的 `skill` 条目。renderer 从自身绑定 Session 的 Injection 接收 `openSkill`，委托本 source 的预览操作，而非 Chat owner props。不可交互的预览仍为标签。[UserText](../ui-conversation/README.zh.md#sent-user-text) 拥有求值与节点分发。

</details>

-----

<a id="further-exploration"></a>
## 进一步探索

以下页面覆盖输入机制、工具行宿主与宿主侧 skill 工具。

- [ui-input-trigger](../ui-input-trigger/README.zh.md)——该 source 注册进的行内建议机制。
- [ui-tool](../ui-tool/README.zh.md)——承载 `tool.call.toolview` slot 的工具调用展示层。
- [tool-skill](../../skill/tool-skill/README.zh.md)——拥有 pre-step 手势边界的宿主侧 `skill` 工具。
- [Web 输入机器与 slash 流水线](../../../.agents/notes/archived/architecture/2026-07-25-web-input-machine-and-slash-pipeline.md)——引用与命令如何共享输入机器。

-----

<a id="model-experience"></a>
## 模型体验

### 用户显式 skill 调用

#### 模型看到的内容

用户消息原样到达模型，字面文本 `/name` 也包含在内。随后宿主的 pre-step 边界（`dsh-tool-skill`）把规范的 `<skill_content>` 块——与 `skill` 工具返回的 `renderSkillContent` 输出相同——作为注入的指令上下文追加在该步骤各项注入的末尾，最贴近模型的回答。加载是确定性的：模型无需被要求调用 `skill` 工具就能收到完整正文，目录也会告诉它不要重新加载已内联注入的 skill。

#### Token 影响

一次调用会把渲染后的 skill 正文作为注入上下文加进该轮次——成本与模型经由工具加载该 skill 相同，只是无条件支付，而非由模型自行裁量。浏览菜单和拉取候选不会增加任何模型 token。

#### KV Cache 影响

仅追加：注入的消息落在可复用历史前缀之后。该包绝不改写较早的请求 token。

## 已知限制与延期工作

<a id="known-limitations-and-deferred-work"></a>


这些限制定义引用与工具行何时回退到通用行为；它们是当前包约束。

- **仅含工具结果的 history 页使用通用行**：键控分派要求配对的工具调用位于运行时窗口内；分页将工具调用留在窗口外时，工具结果没有工具身份。这项客户端呈现功能不会为了恢复该身份而扩展 history 协议约定。
- **文本是唯一依据**：引用是普通的草稿文本；手动键入的相同 token 就是同一个引用，宿主手势边界评判的是发出的文本，而不是菜单交互。chip 视觉由 lexicon 扫描派生；提示词协议上没有 occurrence 身份、位置跟踪或结构化引用载荷。
- **预热落定之前打开的菜单**：在那次击键下不显示 skill 候选；下一次击键会重新轮询已落定的缓存。
- **目录刷新依赖提供方通知**——未发出 `skills/change` 的提供方会保留缓存目录，直到预设切换、插件管理操作或连接重置。
- **草稿中的 skill 高亮等待下一次目录拉取**：切换预设、插件管理操作或重置连接会清空该会话的 lexicon；菜单关闭时，草稿里已有的 `/name` 会失去 skill 高亮，直到 `/` 菜单重新拉取目录；菜单打开时会立即重新拉取。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者的工作上下文——点击展开</summary>

无。

</details>
