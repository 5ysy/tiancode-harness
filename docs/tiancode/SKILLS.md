# TianCode software skills

English | [中文](SKILLS.zh.md)

## Add and update skills

Development reads the repository-root `skills/` directory. Create `skills/my-workflow/SKILL.md`; save the file and open its category above the conversation input. Added, edited and removed files refresh the catalog without restarting TianCode. The next invocation reads the current instructions; previously logged instructions stay unchanged.

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

`name` and `description` are required. Folder names should match the kebab-case skill name. The optional `metadata.tiancode` object accepts only `label` (both `zh` and `en`), `category`, `parent` (a skill name), and `order` (an integer). Set `category` to one of the identifiers below; invalid identifiers produce a visible catalog error. Relative template and script paths resolve from the owning Skill folder.

| Category | Identifier | Bundled workflows |
| --- | --- | --- |
| Chat | `chat` | Ordinary conversation; custom conversational Skills |
| PPT reporting | `ppt` | PPT workflow and police, business and Internet company templates |
| Official documents | `document` | Documents, minutes, summaries, plans, speeches, collaborative writing and internal communications |
| Report writing | `report` | Report workflow and nine report templates |
| Data analysis | `data` | Registers |
| Law enforcement | `law` | Policy research and verification of applicable sources |
| Format proofreading | `proofread` | Proofreading and document formatting |
| Other | `other` | PDF processing and unclassified custom Skills |

An explicit category overrides inherited classification. A child can use `parent: public-report` or `parent: public-ppt` to inherit its parent's category; `order` sorts menu choices. Existing bundled names retain their category when installed Skill files lack the new field. A custom Skill without category metadata or a classified parent appears in Other, using its name when no label is supplied. Changing `category` moves the Skill into the corresponding menu after the catalog refresh.

Desktop's default preset does not discover generic project/user `.agents/skills` or `.dsh/skills`. The application provider is `tiancode`; the category menus include this provider only. The seven progressive Office skills remain available as supporting authoring tools.

Installed builds seed missing bundled directories into `$DSH_HOME/skills`, under the TianCode application-data directory (on macOS, `~/Library/Application Support/TianCode/dsh/skills`). Existing directories belong to the user and remain untouched on subsequent launches; copy an updated bundled Skill manually when desired. `DSH_DESKTOP_SKILLS_DIR` selects an explicit absolute directory; development defaults to the repository's `skills/`. Back up this directory with other application data.

## Workflows and templates

Report writing opens nine independently invocable categories. Each `skills/public-report-*/template.md` contains the complete category template; edit that file to change subsequent reports. The [category index](../../skills/public-report/templates.md) links to all nine.

Briefing PPT opens Police briefing, Business briefing and Internet company briefing. Each child Skill owns its decks and instructions. The shared [PPT workflow](../../skills/public-ppt/SKILL.md) documents inspection, JSON edits, preview and editable output. User-supplied police sources retain their attribution; business and Internet layouts are original. Gorden visual templates are excluded from shipped software; its reference license does not permit commercial/internal for-profit use of those visual assets.

All eight categories stay visible above the input and wrap in narrow windows. Open a category to choose a Skill; selection changes the visible slash invocation while preserving requirements and attachments. Choose ordinary conversation under Chat to remove the invocation. PDF processing uses the locked, offline `pypdf` dependency; it does not install packages during a task. Scanned pages require an available OCR tool.

## Launch and verification

Run `pnpm install --frozen-lockfile`, `pnpm run build:tiancode`, then `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`. The launcher prepares offline authoring resources and reads this checkout's `skills/` directory.

File discovery and browser tests cover adding a Skill, editing its label/body, removing it, draft preservation, nine report categories and responsive menus. Recorded-session replay verifies that the current catalog and selected instructions reach the model request. PPT smoke outputs are structurally checked and rendered locally; model-authored report quality still depends on the selected model and supplied evidence.
