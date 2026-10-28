---
name: public-ppt-business
description: 使用原创12页国企商务模板制作经营工作、重点项目、预算资源和提请决策汇报，生成可编辑PPTX并逐页预览。
metadata:
  tiancode:
    label:
      zh: 国企商务
      en: Business briefing
    parent: public-ppt
    order: 20
---

# 国企商务

先调用 `load_workspace_dependencies`，使用返回的 bundled Python 和环境，读取 [模板说明](templates/README.md)、`templates/template.pptx`、`templates/example.json` 及 [操作说明](../public-ppt/references/workflow.md)。同时加载 `office-pptx`、`office-render`，需要 PDF 时加载 `office-export-pdf`；使用技能提供的 Office 引擎路径，不安装包或下载模板。

## 编排

从用户材料确认报告期、单位、受众、汇报时长及提请决策事项。记录经营指标的统计口径、目标、实际、同比/环比和来源位置；金额注明币种、单位与含税口径。预算、预测与已发生金额分开标记。缺失数字写“待补充”。不把计划写成已批准事项。

读取12页模板，逐页写出标题、主要事实、证据、图表数据及讲稿。页面顺序为封面、议程、关键结论、核心指标、趋势、项目进展、重点措施、风险、资源预算、工作节点、提请决策、结束页。按用户页数选用、重排或扩展，调整目录、编号及讲述时间。正文以事实、原因、责任和期限组织，每页承担一个明确问题。

## 生成与交付

以 `templates/example.json` 为底稿写入任务目录的 `content.json`，替换全部 `{{...}}` 标记。原生图表使用已核实分类与数值，同时更新嵌入工作簿；表格填写事项、进展、责任和截止日期。所有示例数字都有“演示数据”标记，正式交付前替换并核验来源。用户缺少数据时保留待补充文字，移除无依据图表并注明材料缺口。

使用 [共享脚本](../public-ppt/scripts/deck.py) 的 `inspect`、`fill`、`validate` 命令生成新文件；命令及JSON字段见操作说明。将文稿与可编辑PPTX保存在工作区任务目录。使用 `office-render` 渲染全部页并读取每张图，修正文字溢出、表格拥挤、图表单位和字体问题；几何风险估算不能替代预览。用户要求 PDF 时用 `office-export-pdf` 导出并核对签名。交付实际生成的PPTX、讲稿及要求的预览/PDF，列出影响使用的待补充事项。
