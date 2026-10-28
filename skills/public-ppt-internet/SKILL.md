---
name: public-ppt-internet
description: 使用原创12页互联网企业模板完成产品、增长、运营与技术项目复盘，包含指标、留存、实验、路线图和资源决策的可编辑PPTX。
metadata:
  tiancode:
    label:
      zh: 互联网大厂
      en: Internet company briefing
    parent: public-ppt
    order: 30
---

# 互联网大厂

先调用 `load_workspace_dependencies`，使用返回的 bundled Python 和环境，读取 [模板说明](templates/README.md)、`templates/template.pptx`、`templates/example.json` 及 [操作说明](../public-ppt/references/workflow.md)。同时加载 `office-pptx`、`office-render`，需要 PDF 时加载 `office-export-pdf`；使用技能提供的 Office 引擎路径，不安装包或下载模板。

## 编排

确认产品范围、用户群、报告期、汇报对象、时长与决策目标。为每项指标记录定义、分母、去重逻辑、统计窗口、数据源和负责人。增长率区分同比、环比与百分点；漏斗注明各环节同一批用户或不同统计窗口；留存注明用户进入时间与观测周期。实验记录样本、分组、运行期、结果和限制，证据不足时保持“待验证”。

读取12页模板，逐页写出标题、主要事实、证据、图表数据及讲稿。页面顺序为封面、讨论事项、目标结果、核心指标、转化、分层留存、实验、路线图、技术依赖、风险护栏、资源决策、结束页。按用户页数选用、重排或扩展，重写目录、页码和讲述时间。围绕用户问题和可验证结果组织正文，决策请求写明成本、负责人、期限与验收标准。

## 生成与交付

以 `templates/example.json` 为底稿，在任务目录编写 `content.json`。替换全部 `{{...}}` 标记，填充原生表格及分类图表，并同步嵌入工作簿。演示漏斗100/60/35/12仅展示版式；正式交付使用材料数据，缺失时移除该图并写“待补充”，保持口径说明。禁止编造公司标识、客户故事、转化提升与实验显著性。

按 [共享脚本](../public-ppt/scripts/deck.py) 的 `inspect`、`fill`、`validate` 命令输出新的可编辑PPTX，JSON字段见操作说明。用 `office-render` 渲染全部页并读取每张图，检查文字溢出、图表轴与分母、表格对齐、字体替换和页面留白。压缩重复内容后调整版式，保留可编辑文字、表格、图表。用户要求 PDF 时用 `office-export-pdf` 导出并核对签名。交付实际生成的PPTX、讲稿及要求的预览/PDF，说明影响结论的待核实项。
