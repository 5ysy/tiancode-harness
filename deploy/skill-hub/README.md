# TianCode Skill Hub deployment package

English | [中文](README.zh.md)

The server needs Docker Compose or Python 3. The client needs TianCode `0.2.1-rc.3` with its existing plugin market installer. The plugin tarball contains the Skill Hub Host, UI and non-core runtime dependencies.

1. Extract and copy the entire directory to the server, for example `/srv/skill-hub`.
2. Replace the address with a server URL accessible to clients and run `python3 configure-market.py http://skills.internal:8088`. The script updates the plugin download URL and prints the plugin source and skill catalog addresses.
3. Run `docker compose up -d` in this directory. The service listens on `8088`. With existing internal Nginx, point its document root to `public/`.
4. In TianCode, open Plugins → Discover → Manage sources, add `http://skills.internal:8088/plugins/plugin-market.json`, then install and enable **TianCode Skill Hub**.
5. Open Settings → Skill Hub, enter `http://skills.internal:8088/catalog.json` and choose Save and connect.
6. Choose Install skill on a card, select its category and enter Chinese and English names. More metadata offers parent and ordering fields. After installation, use the skill from its composer category menu.

For a local check without Docker, run `python3 -m http.server 8088 --directory public`. Stop that process to stop the service. Docker requires the `nginx:stable-alpine` image; administrators can import it before deploying to a disconnected server.

The included `frontend-design` example comes from Anthropic community skills and retains its license inside the package. To publish more skills, run `pnpm exec tsx scripts/skill-hub-catalog.ts --source /reviewed/my-skill --out deploy/skill-hub/public` in this repository, then synchronize the generated `catalog.json` and `packages/` to the server. Administrators must review community resources and preserve licenses. The server distributes static files.

Skills install on the current Host under `$DSH_HOME/skill-hub/skills` by default. Installation retains scripts and resources without executing scripts during download. Existing names cause a conflict. The plugin supports all eight TianCode categories and preserves `user-invocable: false`, keeping those skills subject to their original visibility policy. Removing the plugin retains installed files.

For development, configuration and troubleshooting, see `docs/tiancode/SKILL_HUB.md` in the repository. The package format and bounded reads adapt [MichengAI/dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager); plugin packages contain NOTICE and the Apache-2.0 license.
