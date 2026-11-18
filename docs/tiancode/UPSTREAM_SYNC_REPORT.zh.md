# TianCode 上游同步记录

[English](UPSTREAM_SYNC_REPORT.md) | 中文

## 来源与保留的定制

TianCode 已集成官方 tag `dsh-v0.2.2-rc.4`，该版本于北京时间 2026 年 11 月 18 日 01:53 发布。在合并官方增量前，通过不改变文件树的祖先桥接记录此前已导入的 `dsh-v0.2.1-rc.3`。工作中的 Skill Hub 实现在同步前单独提交，同步前归档保留于 `.artifacts/upstream-sync/20261118/`。

集成保留 TianCode 图形与名称、`com.tiancode.desktop`、独立用户数据和默认 Harness home、禁用自动更新策略、Windows 打包、八类工作流、应用模板及可选 Skill Hub。官方 rc.4 的 Session 历史、SDK 使用方、vendor 改动与升级指南均予以保留。

## 集成决策

- Desktop 将应用 Skill 复制到主运行时，再初始化 `$DSH_HOME/skills`，保留既有用户目录。上游 Office 与工作区依赖组合负责引擎初始化。
- Office 提供方保留上游异步目录读取、读取失败处理及四个 Office Skill。TianCode 公职办公工作流使用独立的文件系统监听提供方，加载 `office` 后使用 `office_render`/`office_convert`。
- TianCode 所有签名模式的打包均使用当前运行时版本与 `tiancode` 客户端 profile。产物路径、macOS 应用路径、安装器语言及壳菜单保持产品身份。
- Skill Hub 保持可选，包版本与兼容范围同步到 rc.4。可安装 bundle 使用 `@deepseek-ai/dsh-skill-hub-bundle`，旧归档可按[升级指南](../upgrade-guide/v0.2.2-rc.4/tiancode-skill-hub-bundle/guide.zh.md)迁移。HTTP tarball 插件详情避免请求仅适用于 npm 的元数据。
- Windows 发布在构建之外独立校验输入，仅接受成功 Windows 构建作业的产物，检查 manifest 身份与全部校验和，拒绝指向其他提交的 tag，并在验证已有资产字节后仅上传缺失资产。

## 验证

| 检查 | 结果 |
|---|---|
| `pnpm install --frozen-lockfile` | 合并后的锁文件安装通过。 |
| `pnpm run build:tiancode` | 十项产物与聚合编译检查通过。 |
| Desktop、Office 与 Skill Hub 定向行为测试 | 十一个文件、145 项测试通过。 |
| 打包、市场、分类与发布族集成 | 最初有二十一个文件通过；修正预期后的两个文件共 228 项测试通过。 |
| 真实浏览器工作流 | Skill Hub 连接、资源安装和所选分类发现通过 390px/1100px 双主题检查；工作流分类与实时编辑通过 390px/760px 检查。 |
| 录制 Session | public-report 与经 Skill Hub 安装的 skill-load 场景通过无密钥刷新及最终回放。 |
| `PYTHONPATH=python/sdk/src:python/sdk-runtime/src uv run pytest` | 387 项通过，20 项跳过。 |
| `pnpm run lint` | 通过，保留一条既有的无效禁用指令警告。 |
| 分发策略测试 | 四个文件、286 项测试通过；许可证例外限定于保留署名的两个 Skill Hub 包。 |
| `pnpm run doc-sync` | 全部 43 项检查通过。 |
| `pnpm run hygiene` | 23 项检查通过；vendor rescope 报告三个与官方目标字节一致的文件。 |
| 保护资源 | 55 个文件中 45 个字节一致；十个 Skill 指令文件仅适配 Office 工具流程。图形、模板与脚本保持原样。 |

直接执行 `uv run pytest` 时，缺少源码路径导致本地 SDK 导入无法收集。`uv run ruff .` 因环境没有 Ruff 无法启动；`uv run --with ruff ruff check .` 在仓库 Python 文件中报告 261 项问题。本次同步未修改 Python 实现。Windows 构建及安装器界面验证通过，发布结果见下节。目标内网连通性与模型生成需要部署验收。

## Windows 发布

[Actions 44251183359](https://github.com/5ysy/tiancode-harness/actions/runs/44251183359) 的 Windows 构建和 Release 发布作业均成功。[Release `tiancode-v0.2.2-rc.4.20261118.1`](https://github.com/5ysy/tiancode-harness/releases/tag/tiancode-v0.2.2-rc.4.20261118.1) 包含未签名 Windows x64 安装器、安装器 ZIP、源码 ZIP、三个独立校验文件、`SHA256SUMS.txt` 和 `build-manifest.json`。Release 标签与 manifest 指向同一构建提交；后续文档提交不改变已发布二进制。

已下载全部八项资产，并与 GitHub 资产大小及摘要逐一核对。三个归档的哈希与 manifest、独立校验文件和 `SHA256SUMS.txt` 一致。安装器 ZIP 内含匹配的可执行文件与校验文件；源码 ZIP 标识构建提交，抽查的源码文件与该提交一致。

| 产物 | 字节数 | SHA-256 |
|---|---:|---|
| Windows x64 未签名安装器 | 511818016 | `e251f3ff3aa6eb54fd09bb556c0b517cd5a604010854b1113735975a164bc1ba` |
| 安装器 ZIP | 511553850 | `7c92b800c6076704aefe636d95afa952e5119fb1be2f64780a54c7d03f8876cd` |
| 源码 ZIP | 249390628 | `54a1629f41ae38b882bfc820a367edf92ced512f1ed408cd1194443ea31541f8` |

Windows 打包日志确认离线 CLI 插件安装和移除、Office Skill 列表与加载、DOCX/XLSX/PPTX 转 PDF、图片渲染、格式转换及重算均通过。实际安装器在浅色和深色主题下通过欢迎页、进度页、100% 完成、应用文件存在、完成退出与卸载清理检查；六张截图已逐张查看。应用快捷方式、任务栏与企业内网模型仍需目标环境验收。

安装器验证脚本读取与打包过程一致的生成字符串目录。归档校验使用已有 Node `tar` 依赖，保留中文模板文件名。相关发布与本地打包测试共 52 项通过，后续包准备消费者 28 项通过，安装器打包 7 项通过。

## 本地使用与恢复

使用 `pnpm run build:tiancode` 构建，使用 `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop` 启动。Skill Hub 服务部署与客户端安装命令见[技能中心](SKILL_HUB.zh.md)。

同步前已跟踪与未跟踪的工作文件保存在 `.artifacts/upstream-sync/20261118/tiancode-before.tar.gz`；`metadata.json` 标识输入文件树，`protected-sha256.json` 记录资源哈希。原始 Skill Hub 提交和上一发行版保留在 Git 历史中。
