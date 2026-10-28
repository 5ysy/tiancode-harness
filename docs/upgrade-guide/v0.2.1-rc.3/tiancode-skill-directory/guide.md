---
kind: upgrade-guide
description: "Public-service skills require an application-owned directory and derive shortcuts from Skill metadata."
---

# Configure the TianCode skill directory

English | [中文](guide.zh.md)

## Change

`dsh-skill-office` with `publicService: true` requires an absolute `publicSkillDir`. Public-service workflows load from that directory and watch file changes. Desktop uses its software-specific directory and disables preset discovery of generic agent skill roots. Report categories invoke their independent Skills.

## Migration

1. Put each workflow in `<publicSkillDir>/<name>/SKILL.md`, with `name` and `description` frontmatter. Move associated templates and scripts with it. Desktop development uses the repository-root `skills/`; installed Desktop seeds `$DSH_HOME/skills` and preserves existing directories.
2. For custom Loader compositions, set `publicSkillDir` to that absolute directory beside `publicService: true`. Set `publicServiceWatch: false` only for fixed test compositions. Desktop supplies these paths automatically.
3. Optionally add `metadata.tiancode` with `label: { zh: ..., en: ... }`, integer `order`, and a skill-name `parent`. Existing UI-only report directives can be replaced with `/public-report-<category>`; see the [category index](../../../../skills/public-report/templates.md).
4. Open More, save a new Skill and verify it appears; edit the instructions and invoke it again. Detailed directory and update behavior is documented in [software skills](../../../tiancode/SKILLS.md).
