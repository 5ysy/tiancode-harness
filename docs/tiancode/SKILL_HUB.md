# TianCode Skill Hub

English | [中文](SKILL_HUB.zh.md)

## Prepare the server directory

Use a machine with this checkout, installed pnpm dependencies, and Python 3. The server itself needs an HTTP server or Docker Compose. TianCode Skill Hub adapts [MichengAI/dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager)'s full-directory package format and bounded imports. The desktop plugin connects to your internal static catalog; internet access is needed only when administrators obtain community sources.

Review each community skill and its license before publishing it. A source directory must contain `SKILL.md` with YAML `name` and `description`. Keep its scripts, references, assets, and license files together. Generate a catalog from one or more directories:

```sh
pnpm exec tsx scripts/skill-hub-catalog.ts \
  --source /srv/reviewed-skills/my-skill \
  --source /srv/reviewed-skills/another-skill \
  --out deploy/skill-hub/public
```

The checked-in deployment contains a `frontend-design` sample from [Anthropic's community skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design), with its original `LICENSE.txt` inside the package. Running the builder replaces `catalog.json` with the supplied sources. Existing content-addressed package files remain available. Server display titles and author/repository fields can be edited in `catalog.json`; retain the generated package path, name, and checksum.

Build and package the plugin, substituting the server URL reachable from your TianCode machines:

```sh
pnpm run build:artifacts
SKILL_HUB_PUBLIC_URL=http://skills.internal:8088/plugins/ \
  pnpm exec tsx scripts/package-skill-hub.ts
mkdir -p deploy/skill-hub/public/plugins
cp .artifacts/skill-hub-release/*.tgz deploy/skill-hub/public/plugins/
cp .artifacts/skill-hub-release/plugin-market.json deploy/skill-hub/public/plugins/
```

The tarball embeds both new plugin packages and their non-core runtime dependencies. It requires the existing TianCode `0.2.2-rc.4` core services; it does not need an external npm registry for these bundled packages. The configured plugin installer still supplies pnpm and the application's ordinary installation checks.

## Start the static service

Copy `deploy/skill-hub/` to the server, then run:

```sh
cd /srv/skill-hub
docker compose up -d
```

The service listens on port `8088`. For a local check without Docker, use `python3 -m http.server 8088 --directory deploy/skill-hub/public`. An existing internal Nginx can serve the same `public/` directory. Keep `catalog.json` and `packages/` under the same URL directory. HTTPS and server access controls can be applied by your internal reverse proxy. The supplied static server permits read requests.

## Install the plugin in TianCode

Open **Plugins → Discover → Manage sources**, add `http://skills.internal:8088/plugins/plugin-market.json`, and install **TianCode Skill Hub**. The manual plugin installer can also use the direct `.tgz` URL. Enable the bundle after installation.

Open **Settings → Skill Hub** in the left Settings sidebar. Enter `http://skills.internal:8088/catalog.json`, then click **Save and connect**. Skill cards show names, descriptions, and installation state; search filters the cards.

## Install and classify a skill

Choose **Install skill**, select one of the eight TianCode categories, and enter Chinese and English display names. Optional metadata includes a parent skill's kebab-case name and an integer sort order. The parent must already exist. Confirm installation; the skill appears in its category and slash-command catalog without restarting TianCode.

The installer preserves community frontmatter and resources, and writes the exact supported `metadata.tiancode` fields. It retains invocation policies, including `user-invocable: false`; such skills remain unavailable to user menus. Installation does not execute community scripts. Existing same-name skills produce a conflict. Files live on the current TianCode Host, under `$DSH_HOME/skill-hub/skills` by default; Desktop uses the local machine. Advanced limits, the installation root, and the optional bearer-token environment variable are documented in the [Host reference](../../packages/skill/skill-hub/README.md).

## Connection and installation failures

Refresh after a timeout to confirm whether publication completed. An invalid catalog/package report requires checking the checksum, `SKILL.md` identity, resource paths, limits, and metadata. A missing file or access refusal requires checking static server paths and access rules. A conflict requires managing the existing local skill before retrying. Removing the plugin retains installed files; enabling it again registers them. Keep user settings that override `ui-skill.quickActionProviders` inclusive of `skill-hub` so marketplace entries appear in Desktop category menus.

Earlier bundle archives use a different package name. Follow the [bundle migration](../upgrade-guide/v0.2.2-rc.4/tiancode-skill-hub-bundle/guide.md) when replacing an installed older archive; installed skill files remain in place.
