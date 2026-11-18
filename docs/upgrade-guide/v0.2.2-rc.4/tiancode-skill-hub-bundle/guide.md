---
kind: upgrade-guide
description: "TianCode Skill Hub uses the unprefixed bundle package name while retaining installed skills."
---

# TianCode Skill Hub bundle package name

English | [中文](guide.zh.md)

## Change

The installable bundle is `@deepseek-ai/dsh-skill-hub-bundle`. Earlier TianCode Skill Hub archives used `@deepseek-ai/dsh-experimental-skill-hub-bundle`. Deployments that installed those archives must replace the bundle package. Installed skill directories and `metadata.tiancode` values remain under the same installation root.

## Migration

1. In TianCode Plugins, disable and uninstall `@deepseek-ai/dsh-experimental-skill-hub-bundle`. Keep `$DSH_HOME/skill-hub/skills` and any configured custom installation root.
2. Publish the rc.4 tarball and refreshed `plugin-market.json` using the [deployment guide](../../../tiancode/SKILL_HUB.md). Install and enable `@deepseek-ai/dsh-skill-hub-bundle` from the configured internal source.
3. Open Settings → Skill Hub, save the catalog URL and confirm existing skills are listed as installed and remain available in their categories.
