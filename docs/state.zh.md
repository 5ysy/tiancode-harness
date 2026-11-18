# 当前开发状态

[English](state.md) | 中文

TianCode 已集成官方 DeepSeek Harness `dsh-v0.2.2-rc.4`。工作区包、vendor 源码、SDK、持久化历史和依赖锁文件均随该版本同步。[上游同步记录](tiancode/UPSTREAM_SYNC_REPORT.zh.md)记录合并决策与实际验证。

Desktop 保留提供的 TianCode 图形、`com.tiancode.desktop`、独立用户数据和默认 Harness home、IPv4 回环监听及随包保存的禁用更新策略。使用 `pnpm run build:tiancode` 构建，使用 `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop` 启动已构建的应用。

输入框保留八类工作流与基于 metadata 的实时分类。已安装的 Desktop 从 `$DSH_HOME/skills` 读取应用 Skill，并保留既有用户文件。TianCode PPT、文档和 PDF 指令使用 rc.4 的 `office_render` 与 `office_convert` 工具。[软件专用技能](tiancode/SKILLS.zh.md)说明资源目录与 metadata。

[TianCode 技能中心](tiancode/SKILL_HUB.zh.md)保留为可离线安装的可选插件，提供设置侧栏入口、私有目录连接配置、可搜索卡片，以及安装时的分类和 metadata 编辑。完整目录格式基于 MichengAI/dsh-skills-manager 适配并保留署名。服务器通过静态 HTTP 分发目录与包；安装时保留下载的脚本且不执行。

rc.4 TianCode 构建通过全部十项产物与聚合编译检查。Desktop、打包、插件市场、Office 和 Skill Hub 定向测试通过。真实浏览器中的 Skill Hub 安装和工作流分类刷新通过；public-report 与经 Skill Hub 安装的 skill-load 录制 Session 通过无密钥刷新。Python 测试在显式源码路径下通过；仓库 Ruff 检查仍有本次同步未修改的 Python 问题。Windows 包校验通过不受区域设置影响的归档读取器保留所提供模板的中文文件名。未签名 Windows x64 安装器已发布为 `tiancode-v0.2.2-rc.4.20261118.1`；Windows 打包与双主题安装器均通过 Actions 验证。同步记录集中保存 Release 链接、校验和与实际验证结果。目标内网模型和部署验收需要组织环境。
