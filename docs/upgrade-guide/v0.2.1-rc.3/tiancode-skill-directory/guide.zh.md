---
kind: upgrade-guide
description: "公职办公技能需要应用专用目录，快捷入口由 Skill 元数据提供。"
---

# 配置 TianCode 技能目录

[English](guide.md) | 中文

## 变更

`dsh-skill-office` 在 `publicService: true` 时要求绝对路径 `publicSkillDir`，从该目录加载公职办公工作流并监听文件变化。Desktop 使用软件专用目录，关闭预设中的通用 Agent 技能目录发现；编报类别调用各自独立的 Skill。对话框展示八个固定类别菜单；非空 `quickActions` 启用这些菜单，并在每个类别内优先排列指定技能。

## 迁移

1. 将每个工作流放入 `<publicSkillDir>/<name>/SKILL.md`，frontmatter 包含 `name` 和 `description`，相关模板与脚本随目录一起移动。Desktop 开发环境使用项目根目录 `skills/`，安装版将缺失目录放入 `$DSH_HOME/skills` 并保留已有目录。
2. 自定义 Loader 组合在 `publicService: true` 旁设置绝对目录 `publicSkillDir`，固定测试组合可设置 `publicServiceWatch: false`。Desktop 自动提供这些路径。
3. 可选添加 `metadata.tiancode`，包含 `label: { zh: ..., en: ... }`、整数 `order`、技能名称 `parent`，以及取值为 `chat`、`ppt`、`document`、`report`、`data`、`law`、`proofread` 或 `other` 的 `category`。显式父级类别与内置技能名称提供回退分类；未分类的自定义 Skill 出现在“其他”。已有 UI 编报指令可换为 `/public-report-<category>`，参见[类别索引](../../../../skills/public-report/templates.md)。
4. 打开对应类别，保存新 Skill 并确认出现，再修改类别或说明并重新调用。安装目录内已有 Skill 由用户维护；目录及更新方式详见[软件专用技能](../../../tiancode/SKILLS.zh.md)。
