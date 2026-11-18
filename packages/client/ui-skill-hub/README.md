---
description: "Skill Hub connection settings and metadata-aware installation cards."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-skill-hub

English | [中文](README.zh.md)

## Summary

Adds **Skill Hub** to the left Settings navigation when its Host configuration is served. The page edits the catalog URL, searches skill cards, and installs through the owner-authenticated [Host plugin](../../skill/skill-hub/README.md).

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

## Use this package

Install the [Skill Hub bundle](../../experimental/skill-hub-bundle/README.md). Save a `catalog.json` URL, select a card, choose a TianCode category, and edit its Chinese and English display names. Expand the metadata section for a parent skill name and integer sort order. Failures keep the accepted cards and current form values; Refresh reads the current installation state. Advanced Host limits and environment token configuration belong to the Host plugin configuration.

## Understand the implementation

The registration-owned controller observes the configuration form and owns HTTP cancellation and stale-response fencing. Slot hooks bind its immutable publications. Endpoints resolve under the current document mount, including reverse-proxy prefixes and the desktop protocol. Chinese and English copy is locale-owned. The API URL resolver adapts dsh-skills-manager; see [NOTICE](NOTICE).

## Model Experience

None, as this Settings page registers no model-facing surface.

#### KV Cache effect

The page itself changes no model request; installing a skill changes the Host catalog consumed by existing skill plugins.

## Known Limitations and Deferred Work

- The Settings page requires the matching Host package. Installing on a remote Host writes to that Host. Existing same-name skills cannot be overwritten from this page.

### Dev Note

<details>
<summary>Working context for maintainers</summary>

None.

</details>
