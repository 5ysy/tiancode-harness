# TianCode 上游同步计划

[English](UPSTREAM_SYNC_PLAN.md) | 中文

目标为北京时间 2026 年 11 月 18 日发布的官方 `dsh-v0.2.2-rc.4`。此前导入的版本为 `dsh-v0.2.1-rc.3`。本次同步保留 TianCode 定制与可选 Skill Hub 插件。

1. 归档已跟踪与未跟踪的工作文件，提交 Skill Hub，并在不改变文件树的情况下记录此前已导入版本的 Git 祖先关系。
2. 合并官方版本增量，保留 TianCode 身份、图形、数据隔离、离线策略、应用 Skill 和插件安装能力。
3. 适配 rc.4 的 Desktop 运行时资源复制与 Office 工作流，重新生成目录和锁文件。
4. 运行定向行为测试、随产品提供的 profile 录制 Session、浏览器安装与分类检查、产物与聚合编译检查、文档检查及 Python 检查。
5. 将审查后的集成提交并推送到 TianCode fork，触发 Windows 工作流，核验该次运行的安装器、源码包、manifest、校验和及安装器证据。

同步前的工作文件、补丁、文件树标识与保护文件哈希保存在忽略目录 `.artifacts/upstream-sync/20261118/`。实际结果记录于[同步记录](UPSTREAM_SYNC_REPORT.zh.md)和[当前状态](../state.zh.md)。
