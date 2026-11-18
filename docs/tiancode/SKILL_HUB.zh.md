# TianCode Skill Hub

[English](SKILL_HUB.md) | 中文

## 准备服务器目录

构建机器需要本仓库、已安装的 pnpm 依赖与 Python 3。服务器需要 HTTP 服务或 Docker Compose。TianCode Skill Hub 改编自 [MichengAI/dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager) 的完整目录包格式与有界导入。桌面插件连接内网静态目录；管理员获取社区来源时需要访问互联网。

发布前审核社区技能及其许可证。来源目录必须包含具有 YAML `name`、`description` 的 `SKILL.md`，并保留脚本、参考资料、资源与许可证文件。从一个或多个目录生成索引：

```sh
pnpm exec tsx scripts/skill-hub-catalog.ts \
  --source /srv/reviewed-skills/my-skill \
  --source /srv/reviewed-skills/another-skill \
  --out deploy/skill-hub/public
```

仓库部署目录附带来自 [Anthropic 社区技能](https://github.com/anthropics/skills/tree/main/skills/frontend-design)的 `frontend-design` 示例，包内保留原始 `LICENSE.txt`。运行生成器会用指定来源替换 `catalog.json`；已有的内容寻址安装包保留可用。可在 `catalog.json` 编辑显示标题与作者、仓库字段；保留生成的包路径、名称和校验和。

构建并打包插件，将地址替换为 TianCode 客户端可访问的服务器地址：

```sh
pnpm run build:artifacts
SKILL_HUB_PUBLIC_URL=http://skills.internal:8088/plugins/ \
  pnpm exec tsx scripts/package-skill-hub.ts
mkdir -p deploy/skill-hub/public/plugins
cp .artifacts/skill-hub-release/*.tgz deploy/skill-hub/public/plugins/
cp .artifacts/skill-hub-release/plugin-market.json deploy/skill-hub/public/plugins/
```

Tarball 内嵌两个新插件包及其非核心运行时依赖。它需要 TianCode `0.2.1-rc.3` 现有核心服务，内嵌包无需外部 npm 仓库。插件安装器仍提供 pnpm，并执行应用已有的安装检查。

## 启动静态服务

将 `deploy/skill-hub/` 复制到服务器，然后执行：

```sh
cd /srv/skill-hub
docker compose up -d
```

服务监听 `8088` 端口。本地无 Docker 时，可运行 `python3 -m http.server 8088 --directory deploy/skill-hub/public`。已有内网 Nginx 也可提供同一个 `public/` 目录。将 `catalog.json` 与 `packages/` 放在同一个 URL 目录下。可通过内网反向代理配置 HTTPS 与访问控制。随附静态服务器允许读取请求。

## 在 TianCode 安装插件

打开**插件 → 发现 → 管理来源**，添加 `http://skills.internal:8088/plugins/plugin-market.json`，安装 **TianCode Skill Hub**。手动插件安装器也支持直接填写 `.tgz` 地址。安装完成后启用组合包。

打开设置左侧边栏的 **Skill Hub**，填写 `http://skills.internal:8088/catalog.json`，点击**保存并连接**。技能卡片显示名称、描述与安装状态，搜索框可筛选卡片。

## 安装与分类技能

选择**安装技能**，选择 TianCode 八个分类之一，并填写中英文显示名称。可选元数据包括父级技能的 kebab-case 名称与整数排序值。父级必须已存在。确认安装后，技能会出现在对应分类与斜杠命令目录中，无需重启 TianCode。

安装器保留社区 frontmatter 与资源，并写入准确支持的 `metadata.tiancode` 字段。调用策略保持原值，包括 `user-invocable: false`；此类技能不会出现在用户菜单中。安装过程不执行社区脚本。已有同名技能会报告冲突。文件位于当前 TianCode Host，默认目录为 `$DSH_HOME/skill-hub/skills`；桌面版使用本机。高级上限、安装目录和可选 Bearer 令牌环境变量见 [Host 参考](../../packages/skill/skill-hub/README.zh.md)。

## 连接与安装失败

超时后刷新目录，确认发布是否完成。目录或安装包无效时，检查校验和、`SKILL.md` 身份、资源路径、上限和元数据。文件缺失或访问拒绝时，检查静态服务器路径与访问规则。冲突时，先管理已有本地技能再重试。移除插件会保留安装文件，重新启用后重新注册。用户设置覆盖 `ui-skill.quickActionProviders` 时，应包含 `skill-hub`，以便在桌面分类菜单显示市场技能。
