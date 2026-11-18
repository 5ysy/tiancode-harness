---
description: "Private skill catalogs and metadata-aware installation for TianCode."
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-hub

English | [中文](README.zh.md)

## Summary

The Host half of **TianCode Skill Hub** downloads complete community skill directories from an internal static catalog, merges TianCode display metadata, and registers the `skill-hub` filesystem provider. Install the [optional bundle](../../experimental/skill-hub-bundle/README.md) for its Settings page. Deployment instructions are in [Skill Hub](../../../docs/tiancode/SKILL_HUB.md).

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

## Use this package

| Config | Default | Meaning |
|---|---|---|
| `catalogUrl` | empty | HTTP(S) `catalog.json` URL; volatile and editable in Settings. Credentials, query parameters, fragments and redirects are rejected. |
| `installRoot` | `$DSH_HOME/skill-hub/skills` | Host directory; changing it remounts the provider. |
| `maxBytes` | `16777216` | Wire limit per catalog/package and aggregate decoded package bytes. |
| `maxFiles` | `1000` | Maximum files in one skill. |
| `fetchTimeoutMs` | `30000` | Whole catalog/install request timeout, in milliseconds. |
| `tokenEnv` | empty | Optional environment variable holding the server's bearer token; the token stays on the Host. |

Owner-authenticated `GET /api/skill-hub/catalog` returns the validated catalog with installed ids. `POST /api/skill-hub/install` accepts `{ skillId, metadata }`; metadata contains `label: { zh, en }`, one of the eight TianCode categories, optional `parent`, and optional integer `order`. The parent must already exist. Original frontmatter and invocation policies remain intact; `metadata.tiancode` is replaced by the validated selection.

The catalog is version 1 with a `skills` array. Every entry has `id`, `name`, `title`, `description`, a relative `package` under `packages/`, and its `sha256`; `author` and `repository` are optional display fields. Packages use dsh-skills-manager's `{ name, entries: [{ path, data }] }` JSON format with base64 data; `executable` is an optional boolean. The [builder](../../../scripts/skill-hub-catalog.ts) generates immutable package filenames and the index from reviewed directories.

## Understand the implementation

The Host bounds streaming downloads, verifies checksums before JSON parsing, rejects traversal, Windows reserved names, conflicting paths and symlink roots, and stages every file before publishing a nonempty directory. Existing skills are conflicts. Installation never executes downloaded scripts. Provider invalidation refreshes existing skill consumers after publication; removal aborts requests and closes watchers. Interrupted staging is excluded from discovery; a process crash can leave `.stage-*` directories for an administrator to remove while TianCode is stopped.

The package format and bounded download implementation adapt [MichengAI/dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager). See [NOTICE](NOTICE) and [Apache license](LICENSE.Apache-2.0).

## Model Experience

Indirectly, through `dsh-skill-filesystem` and the existing skill consumers, which render installed names, descriptions, invocation policies and loaded instruction bodies.

#### KV Cache effect

Provider invalidation changes later skill catalogs; previously logged skill invocations retain their instruction text.

## Known Limitations and Deferred Work

- Installation targets the current Host, shared by its users. Browser clients do not receive local filesystem copies. Existing skills require deliberate local management before reinstallation. Server publishing requires reviewed skill directories and their original licenses; the plugin does not run Git or npm during skill installation.

### Dev Note

<details>
<summary>Working context for maintainers</summary>

None.

</details>
