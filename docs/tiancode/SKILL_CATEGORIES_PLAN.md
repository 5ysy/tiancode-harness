# TianCode Skill category implementation plan

English | [中文](SKILL_CATEGORIES_PLAN.zh.md)

The composer exposes eight categories in this order: Chat, PPT reporting, Official documents, Report writing, Data analysis, Law enforcement, Format proofreading and Other. Categories remain visible above the input, wrap on narrow windows and open menus of available Skills.

1. Extend validated `metadata.tiancode` and the Session Skill catalog with an optional category identifier: `chat`, `ppt`, `document`, `report`, `data`, `law`, `proofread` or `other`. Preserve localized labels, parent relationships and ordering; reject invalid identifiers.
2. Classify every application-owned Skill by its function. Explicit metadata controls custom classification; parent metadata supplies inherited classification. Existing bundled names retain their category after upgrading, without overwriting user-owned Skill files; unclassified custom Skills appear in Other.
3. Replace the four pinned shortcuts and More with all eight category menus. Selecting a Skill preserves authored requirements and attachments while changing the visible slash invocation. The ordinary-chat choice removes the invocation. Retain composer locks, command protection, provider filtering, catalog refresh and visible fetch recovery.
4. Verify metadata rejection, complete built-in classification, old installed Skill metadata, category overrides, menu selection and live custom Skill changes. Run browser checks for both themes, 390-pixel and desktop layouts, menu dismissal, draft preservation and all eight visible categories.
5. Update the bilingual Skill-authoring guide and current development state. Run the relevant unit tests, recorded Skill invocation, compiler/build checks, lint and documentation checks; obtain independent specification and quality reviews.
6. Push the verified branch containing the offline plugin market and category changes. Dispatch the existing TianCode Windows Actions workflow for a fresh build version, inspect the run and installer verification, download its installer and verify its SHA-256 and build commit before reporting the artifact.
