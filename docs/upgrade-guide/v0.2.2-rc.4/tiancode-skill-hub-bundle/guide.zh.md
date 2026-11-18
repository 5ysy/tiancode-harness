---
kind: upgrade-guide
description: "TianCode Skill Hub 使用无实验前缀的 bundle 包名，并保留已安装的技能。"
---

# TianCode Skill Hub bundle 包名

[English](guide.md) | 中文

## 变更

可安装 bundle 使用 `@deepseek-ai/dsh-skill-hub-bundle`。较早的 TianCode Skill Hub 归档使用 `@deepseek-ai/dsh-experimental-skill-hub-bundle`。已安装这些归档的部署需要替换 bundle 包。已安装技能目录及 `metadata.tiancode` 值保留在原安装根目录中。

## 迁移

1. 在 TianCode 插件页面禁用并卸载 `@deepseek-ai/dsh-experimental-skill-hub-bundle`。保留 `$DSH_HOME/skill-hub/skills` 及任何自定义安装根目录。
2. 按[部署指南](../../../tiancode/SKILL_HUB.zh.md)发布 rc.4 tarball 和更新后的 `plugin-market.json`。从已配置的内网源安装并启用 `@deepseek-ai/dsh-skill-hub-bundle`。
3. 打开设置 → Skill Hub，保存目录地址，确认既有技能显示已安装并仍可从对应分类使用。
