# TianCode Skill Hub 部署包

[English](README.md) | 中文

服务器需要 Docker Compose 或 Python 3。客户端需要 TianCode `0.2.1-rc.3`，并使用已有插件市场安装器。插件包内已包含 Skill Hub 的 Host、UI 与非核心运行时依赖。

1. 解压后将整个目录复制到服务器，例如 `/srv/skill-hub`。
2. 将地址替换成客户端可访问的服务器地址，运行 `python3 configure-market.py http://skills.internal:8088`。脚本更新插件下载链接，并显示插件来源和技能目录地址。
3. 在当前目录运行 `docker compose up -d`。服务端口为 `8088`。使用现有内网 Nginx 时，将站点目录指向 `public/`。
4. 在 TianCode 的「插件 → 发现 → 管理来源」添加 `http://skills.internal:8088/plugins/plugin-market.json`，安装并启用 **TianCode Skill Hub**。
5. 打开「设置 → Skill Hub」，填写 `http://skills.internal:8088/catalog.json` 并点击「保存并连接」。
6. 在技能卡片点击「安装技能」，选择分类并填写中英文名称；「更多元数据」可以设置父级和排序。安装成功后，在输入框对应分类菜单中使用技能。

无 Docker 的本地验证命令：`python3 -m http.server 8088 --directory public`。关闭该进程即可停止服务。Docker 需要预先提供 `nginx:stable-alpine` 镜像；断网服务器可由管理员预先导入镜像。

附带的 `frontend-design` 示例来自 Anthropic 社区技能，安装包内保留其许可证。发布更多技能时，在本仓库运行 `pnpm exec tsx scripts/skill-hub-catalog.ts --source /reviewed/my-skill --out deploy/skill-hub/public`，再同步生成的 `catalog.json` 与 `packages/` 到服务器。社区资源必须经管理员审核并保留许可证。服务器仅分发静态文件。

技能默认安装到当前 Host 的 `$DSH_HOME/skill-hub/skills`。安装保留脚本和资源，下载时不执行脚本。已有同名技能会提示冲突。插件支持八个 TianCode 分类；原文件的 `user-invocable: false` 会保留，该类技能遵循原有隐藏策略。卸载插件会保留已安装文件。

完整开发、配置与排障说明见仓库 `docs/tiancode/SKILL_HUB.zh.md`。Skill Hub 的包格式与有界读取改编自 [MichengAI/dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager)，插件包包含 NOTICE 与 Apache-2.0 许可证。
