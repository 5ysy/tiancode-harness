---
description: "Install TianCode Skill Hub with its Settings page and private catalog provider."
kind: "package-bundle"
---

# @deepseek-ai/dsh-skill-hub-bundle

English | [中文](README.zh.md)

## Summary

**TianCode Skill Hub** combines the [Host installer](../../skill/skill-hub/README.md) and [Settings cards](../../client/ui-skill-hub/README.md) as an optional installable plugin. It adapts the community directory package format from dsh-skills-manager to TianCode's classification metadata.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

## Use this package

Follow the [deployment and installation guide](../../../docs/tiancode/SKILL_HUB.md). Install the generated `.tgz` URL through TianCode's plugin installer and enable it. Open **Settings → Skill Hub**, save your internal catalog URL, and install a card with its display names and category.

## Understand the implementation

The bundle inserts `skill-hub` and `ui-skill-hub`. Its `ui-skill` override preserves TianCode's default desktop shortcuts and admits the `skill-hub` provider alongside `tiancode`. Profile/user configuration can override that allowlist; it must include `skill-hub` to display marketplace skills in desktop category menus. The offline tarball embeds the Host and Client packages and bundles their filesystem parser and third-party dependencies. Core Cordis, schema, home-path and skill services come from the running TianCode installation.

## Model Experience

Indirectly, through `dsh-skill-filesystem` and the existing skill consumers, which render installed names, descriptions, invocation policies and loaded instruction bodies.

#### KV Cache effect

Provider invalidation changes later skill catalogs; previously logged skill invocations retain their instruction text.

## Known Limitations and Deferred Work

- Disabling the plugin removes its page and provider; installed files remain available for re-enabling. It does not remove or update installed skills. Server access and authentication are deployment responsibilities.

### Dev Note

<details>
<summary>Working context for maintainers</summary>

None.

</details>
