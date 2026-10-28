# TianCode software skills

English | [中文](SKILLS.zh.md)

## Add and update skills

Development reads the repository-root `skills/` directory. Create `skills/my-workflow/SKILL.md`; save the file and open More in an ordinary conversation. Added, edited and removed files refresh the catalog without restarting TianCode. The next invocation reads the current instructions; previously logged instructions stay unchanged.

```yaml
---
name: my-workflow
description: Draft a sourced weekly briefing from workspace materials.
metadata:
  tiancode:
    label:
      zh: 我的工作流
      en: My workflow
    order: 150
---

# My workflow

Read the relevant workspace materials, draft the briefing and verify its sources.
```

`name` and `description` are required. Folder names should match the kebab-case skill name. The optional `metadata.tiancode` object accepts only `label` (both `zh` and `en`), `parent` (a skill name), and `order` (an integer). Omit the entire object to show the skill name in More. Use `parent: public-report` or `parent: public-ppt` to add a category to those menus. Relative template and script paths resolve from the owning Skill folder.

Desktop's default preset does not discover generic project/user `.agents/skills` or `.dsh/skills`. The application provider is `tiancode`; More includes this provider only. The seven progressive Office skills remain available as supporting authoring tools.

Installed builds seed missing bundled directories into `$DSH_HOME/skills`, under the TianCode application-data directory (on macOS, `~/Library/Application Support/TianCode/dsh/skills`). Existing directories belong to the user and remain untouched on subsequent launches; copy an updated bundled Skill manually when desired. `DSH_DESKTOP_SKILLS_DIR` selects an explicit absolute directory; development defaults to the repository's `skills/`. Back up this directory with other application data.

## Workflows and templates

Report writing opens nine independently invocable categories. Each `skills/public-report-*/template.md` contains the complete category template; edit that file to change subsequent reports. The [category index](../../skills/public-report/templates.md) links to all nine.

Briefing PPT opens Police briefing, Business briefing and Internet company briefing. Each child Skill owns its decks and instructions. The shared [PPT workflow](../../skills/public-ppt/SKILL.md) documents inspection, JSON edits, preview and editable output. User-supplied police sources retain their attribution; business and Internet layouts are original. Gorden visual templates are excluded from shipped software; its reference license does not permit commercial/internal for-profit use of those visual assets.

More also offers work summaries, plans, speeches, proofreading, registers, document formatting, policy research, collaborative writing, internal communications and PDF processing. PDF processing uses the locked, offline `pypdf` dependency; it does not install packages during a task. Scanned pages require an available OCR tool.

## Launch and verification

Run `pnpm install --frozen-lockfile`, `pnpm run build:tiancode`, then `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`. The launcher prepares offline authoring resources and reads this checkout's `skills/` directory.

File discovery and browser tests cover adding a Skill, editing its label/body, removing it, draft preservation, nine report categories and responsive menus. Recorded-session replay verifies that the current catalog and selected instructions reach the model request. PPT smoke outputs are structurally checked and rendered locally; model-authored report quality still depends on the selected model and supplied evidence.
