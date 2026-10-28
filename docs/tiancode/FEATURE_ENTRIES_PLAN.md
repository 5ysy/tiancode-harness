# TianCode workflow entry implementation plan

English | [中文](FEATURE_ENTRIES_PLAN.zh.md)

Scope: shortcuts above the composer, available Skill discovery, public-service office workflows, reporting templates and development verification.

The shortcut row sits above the composer card. Report writing selects the workflow and opens its template menu upward; selecting a template updates the draft and closes the menu. Selected workflows show no instructional text. Browser checks cover placement, template replacement, menu dismissal, both themes and narrow windows.

1. Declare a workflow slot above the Conversation composer card and supply it from Skill UI; reuse existing icons, menus, theme tokens and bilingual dictionaries.
2. Read invocable Skills from the current Session catalog. Configuration controls the primary order, with remaining entries in More. Selection writes a visible `/skill` into the draft; switching preserves requirements and attachments, Chat removes the prefix, and sending uses the existing backend Skill loading and Session log.
3. Provide an optional Office resource group for briefing PPTs, reports, official documents, minutes, summaries, plans, speeches, proofreading and registers. Desktop enables the group; Web development can enable it through an overlay.
4. Adapt Shanhaijian's event overview, topic assessment, phase review and material crosscheck templates, with template versions, outline confirmation, section drafts, summaries, revisions and source checks. Materials come from the workspace; reports deliver Markdown/DOCX and presentations use the existing Office environment for editable PPTX.
5. Cover draft switching, catalog availability, invalid configuration, real Loader resource loading, recorded Skill injection, component interactions and browser layout. Check themes, narrow windows, menu dismissal, submission protection and Session changes.
6. Start TianCode development and inspect shortcuts and template selection; update consumer instructions and state with executed validation and environment limits.

## Development preview

Run `pnpm run build:tiancode`, then `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop` from the repository root. The running development window exposes the office shortcuts; clicking Report writing opens four template choices above its button. Add workspace materials and requirements before sending.

## Verification record

- Shortcut layout verification: 156 focused tests passed across Skill UI, composer controls and focus styles, including welcome and ongoing-conversation placement and reactive template replacement.
- Built browser interaction: one test passed, covering the shortcut row above the card, upward template menus, draft preservation, template switching, both themes, narrow viewport geometry and menu dismissal.
- Headless `public-report` recorded-session replay: one selected scenario passed, including durable skill injection and an independently checked output file. The fixture uses synthetic material and authored model responses.
- `build:tiancode`, Host/Client TypeScript checks and lint passed. The affected README and plan pairs passed targeted pairing checks; client, configuration and tool catalogs passed freshness checks in `doc-sync`.
- Full `doc-sync`: 40 gates passed, three failed on existing documentation pairing, wrapping and repository references. `uv run pytest` could not collect without the Python SDK/runtime packages; `uv run ruff .` could not start because Ruff is unavailable.
- Actual model generation quality and organization-specific submission formats require acceptance with the deployment's configured model and approved materials.
