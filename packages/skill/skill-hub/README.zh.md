---
description: "TianCode 的私有技能目录与分类元数据安装。"
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-hub

[English](README.md) | 中文

## 概述

**TianCode Skill Hub** 的 Host 部分从内网静态目录下载完整的社区技能目录，合并 TianCode 显示元数据，并注册 `skill-hub` 文件系统 provider。安装[可选组合包](../../experimental/skill-hub-bundle/README.zh.md)即可使用设置页面。部署步骤见 [Skill Hub](../../../docs/tiancode/SKILL_HUB.zh.md)。

## 目录

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [模型体验](#model-experience)
- [已知限制与延期工作](#known-limitations-and-deferred-work)
- [开发备注](#dev-note)

<a id="use-this-package"></a>
## 使用本包

| 配置 | 默认值 | 含义 |
|---|---|---|
| `catalogUrl` | 空 | HTTP(S) `catalog.json` 地址；volatile 字段，可在设置中编辑。拒绝凭据、查询参数、片段和重定向。 |
| `installRoot` | `$DSH_HOME/skill-hub/skills` | Host 目录；修改后重新挂载 provider。 |
| `maxBytes` | `16777216` | 单个目录或安装包响应的字节上限，以及解码后文件的合计字节上限。 |
| `maxFiles` | `1000` | 单个技能的文件数量上限。 |
| `fetchTimeoutMs` | `30000` | 整个目录读取或安装请求的超时，单位毫秒。 |
| `tokenEnv` | 空 | 可选的服务器 Bearer 令牌环境变量名；令牌保留在 Host。 |

所有者认证的 `GET /api/skill-hub/catalog` 返回校验后的目录及已安装 id。`POST /api/skill-hub/install` 接收 `{ skillId, metadata }`；元数据包含 `label: { zh, en }`、TianCode 八类之一、可选的 `parent` 和整数 `order`。父级必须已存在。保留原始 frontmatter 与调用策略，用校验后的选择替换 `metadata.tiancode`。

目录的版本为 1，包含 `skills` 数组。每个条目具有 `id`、`name`、`title`、`description`、位于 `packages/` 下的相对 `package` 和 `sha256`；`author`、`repository` 是可选显示字段。安装包采用 dsh-skills-manager 的 `{ name, entries: [{ path, data }] }` JSON 格式，数据为 base64；`executable` 是可选布尔值。[生成器](../../../scripts/skill-hub-catalog.ts)从审核过的目录生成不可变包名和索引。

<a id="understand-the-implementation"></a>
## 理解实现

Host 限制流式下载大小，在解析 JSON 前验证校验和，拒绝路径穿越、Windows 保留名称、路径冲突和符号链接根目录，并在发布非空目录前暂存全部文件。已有技能视为冲突。安装过程不执行下载的脚本。发布后的 provider 失效通知刷新现有技能消费者；移除插件时中止请求并关闭监听。暂存目录不参与发现；进程崩溃可能留下 `.stage-*` 目录，管理员可在停止 TianCode 后移除。

安装包格式与有界下载实现改编自 [MichengAI/dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager)。见 [NOTICE](NOTICE) 和 [Apache 许可证](LICENSE.Apache-2.0)。

<a id="model-experience"></a>
## 模型体验

通过 `dsh-skill-filesystem` 与现有技能消费者间接提供安装后的名称、描述、调用策略和指令正文。

#### KV Cache 影响

Provider 失效通知会改变后续技能目录；已记录的技能调用保留原指令文本。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延期工作

- 安装目标是当前 Host，由其用户共享。浏览器客户端不会获得本地文件系统副本。重新安装已有技能前，需要主动管理本地副本。服务器发布需要审核技能目录并保留原始许可证；技能安装过程不运行 Git 或 npm。

<a id="dev-note"></a>
### 开发备注

<details>
<summary>维护者工作上下文</summary>

无。

</details>
