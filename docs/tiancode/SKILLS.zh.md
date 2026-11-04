# TianCode 软件专用技能

[English](SKILLS.md) | 中文

## 新增与更新技能

开发环境读取项目根目录 `skills/`。创建 `skills/my-workflow/SKILL.md`，保存后在输入框上方打开对应分类。新增、修改和删除文件均会刷新目录，无需重启 TianCode。下次调用读取当前说明，历史会话中已记录的说明保持原样。

```yaml
---
name: my-workflow
description: Draft a sourced weekly briefing from workspace materials.
metadata:
  tiancode:
    category: report
    label:
      zh: 我的工作流
      en: My workflow
    order: 150
---

# My workflow

Read the relevant workspace materials, draft the briefing and verify its sources.
```

`name` 与 `description` 必填，文件夹名称应与连字符分隔的技能名称一致。可选的 `metadata.tiancode` 对象仅接受 `label`（同时填写 `zh` 和 `en`）、`category`、`parent`（技能名称）及 `order`（整数）。将 `category` 设为下表中的标识；无效标识会显示目录加载错误。模板和脚本的相对路径以所属 Skill 文件夹为基准。

| 分类 | 标识 | 内置工作流 |
| --- | --- | --- |
| 对话 | `chat` | 普通对话及自定义对话技能 |
| PPT汇报 | `ppt` | PPT 工作流以及公安、商务和互联网公司模板 |
| 公文写作 | `document` | 公文、纪要、总结、预案、讲话、协同撰稿和内部简报 |
| 编报生成 | `report` | 编报工作流及九类编报模板 |
| 数据分析 | `data` | 台账整理 |
| 执法办案 | `law` | 政策检索及适用依据核验 |
| 格式校对 | `proofread` | 材料校核与公文排版 |
| 其他 | `other` | PDF 处理及未分类的自定义技能 |

显式分类会覆盖继承分类。子技能可通过 `parent: public-report` 或 `parent: public-ppt` 继承父级分类；`order` 决定菜单排序。既有内置技能名称在安装目录中缺少新字段时仍保留对应分类。自定义 Skill 未填写分类且没有已分类父级时显示在“其他”，没有标签时显示技能名称。修改 `category` 后，目录刷新会将技能移入对应菜单。

Desktop 默认预设关闭通用项目和用户 `.agents/skills`、`.dsh/skills` 的发现。应用提供方名称为 `tiancode`，分类菜单仅包含此提供方；七个渐进式 Office 技能继续作为创作支撑工具使用。

安装版将缺少的内置技能目录放入 `$DSH_HOME/skills`，默认位于 TianCode 应用数据目录（macOS 为 `~/Library/Application Support/TianCode/dsh/skills`）。已有目录由用户维护，后续启动保留原样；需要更新内置 Skill 时可手动复制新版。环境变量 `DSH_DESKTOP_SKILLS_DIR` 可指定绝对目录，开发环境默认使用项目 `skills/`。请将该目录随应用数据备份。

## 工作流与模板

“编报生成”展开九个可独立调用的类别。每个 `skills/public-report-*/template.md` 都包含完整的类别模板，编辑该文件即可影响后续编报。[类别索引](../../skills/public-report/templates.md)链接到全部九类。

“PPT汇报”展开公安汇报、国企商务和互联网大厂，每个子 Skill 拥有自己的演示文稿与说明。[PPT 工作流](../../skills/public-ppt/SKILL.md)描述检查、JSON 编辑、预览与可编辑文件交付。用户提供的公安源稿保留署名，商务和互联网布局采用原创设计。Gorden 视觉模板未进入分发的软件，其参考素材许可限制商业及营利组织内部使用。

八个分类持续显示在输入框上方，在窄窗口中自动换行。打开分类后选择 Skill，会更新可见的斜杠调用并保留需求和附件。在“对话”中选择普通对话可移除调用前缀。PDF 处理使用已锁定的离线 `pypdf` 依赖，任务执行时无需安装包；扫描页识别需要可用的 OCR 工具。

## 启动与验证

依次执行 `pnpm install --frozen-lockfile`、`pnpm run build:tiancode` 和 `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`。启动器准备离线创作资源并读取当前项目的 `skills/`。

文件发现与浏览器测试覆盖新增 Skill、修改标签和正文、删除条目、草稿保留、九类编报及响应式菜单。会话回放验证当前目录与选定说明进入模型请求；PPT 冒烟输出在本机完成结构检查和渲染。模型实际撰写报告的质量仍取决于所选模型及提供的证据。
