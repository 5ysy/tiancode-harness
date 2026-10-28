---
name: public-ppt-police
description: 使用用户提供的两套公安工作汇报PPTX模板制作警务、案件与专项工作汇报，保留母版、配图及署名，交付可编辑PPTX并逐页预览。
metadata:
  tiancode:
    label:
      zh: 公安汇报
      en: Police briefing
    parent: public-ppt
    order: 10
---

# 公安汇报

先调用 `load_workspace_dependencies`，使用返回的 bundled Python 和环境。读取 [模板说明与页型地图](templates/README.md)、所选 `templates/police-report.pptx` 或 `templates/police-case.pptx`、对应 `.inventory.json`、`templates/example.json` 及 [操作说明](../public-ppt/references/workflow.md)。加载 `office-pptx`、`office-render`，需要 PDF 时加载 `office-export-pdf`。运行命令使用技能提供的绝对路径，不安装包、下载素材或运行更新器。

## 材料与页面

核对汇报对象、主题、报告期、时长、密级标识要求和用户允许使用的材料。仅使用任务已授权的案件与警务信息，不补造涉案人员、案件细节、警力部署、统计数字或政策依据。涉及身份信息按用户要求脱敏，不将工作区材料发送到外部服务。缺失事实标“待补充”，名称、时间、口径与来源逐项对应。

两套原件各28页、16:9，内含图片、分组与原生文字。先渲染拟用源页面，读取形状、段落、字体和尺寸；按封面、目录、工作概况、重点工作/案件、问题风险、部署、结束组织内容。参考12页选页方案 `[1,2,3,4,9,10,15,17,21,22,27,28]`，根据材料调整。源目录中的专项目录应随主题改写。最后一页保留作者与来源信息，按机构要求可作为附录。

## 填充与检查

从原始模板创建新稿，按清单中的 `slide`、`shape_id`、`paragraph` 和 `expected_text` 写入编辑JSON，必要时用 `run` 保留段落内混排格式。共享脚本 [deck.py](../public-ppt/scripts/deck.py) 通过 `inspect`、`fill`、`validate` 完成清点、严格替换和结构检查，命令见操作说明。`example.json` 提供完整12页选页和文字编辑演示，所有待补充内容仍需依据材料填写。

保留母版、背景、警徽原图、配色、页型和署名。图片里的文字、示意图数值与装饰图形无法通过文字槽编辑；来源模板无原生数据图表。涉及真实统计时应选用适合的文字页，使用已加载的 Office 工具新增原生图表及嵌入工作簿，核对数据与单位；移除含无依据演示数字的图片对象。不能把图片内的演示数值保留为事实。检查所有分组内文字、年份、汇报人、模板广告及英文样例；署名信息留在来源页。

保持新稿正文可编辑，图像素材与原件保持比例。选择和重排页面后更新目录与页码。逐页渲染最终PPTX，读取每张预览图，核对警徽比例、文字边缘、图表、分组、字体替换和剩余样例文字。按材料压缩重复内容、修正溢出，再检查来源。需要 PDF 时用 `office-export-pdf` 转换并核对签名。交付实际生成的可编辑PPTX、讲稿与要求的预览/PDF；说明材料缺口和影响使用的检查限制。

## 资源使用范围

两份用户提供的原件完整保留，来源与SHA-256见 `templates/assets.json`。模板作者和来源页保留；使用方应确认其使用权限。此技能没有附带 Gorden 的受限制视觉模板。完整说明见 [资源许可](../public-ppt/ASSETS.md)。
