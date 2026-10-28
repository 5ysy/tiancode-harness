# 模板填充与检查

## 命令

以下 `PYTHON` 指 `load_workspace_dependencies` 返回的 Python 绝对路径，`PPT_SKILL` 指本技能实际目录，`CHILD` 指所选子技能实际目录。使用 shell 变量时按系统语法赋值并逐个引用路径。命令从工作区运行，输出放入用户任务目录，绝不覆盖模板或用户原件。

```sh
"$PYTHON" "$PPT_SKILL/scripts/deck.py" inspect "$CHILD/templates/template.pptx" --output ./output/inventory.json
"$PYTHON" "$PPT_SKILL/scripts/deck.py" fill "$CHILD/templates/template.pptx" ./output/content.json ./output/briefing-v1.pptx
"$PYTHON" "$PPT_SKILL/scripts/deck.py" validate ./output/briefing-v1.pptx --output ./output/validation.json
```

公安模板文件名使用 `police-report.pptx` 或 `police-case.pptx`。`inspect` 输出页数、尺寸、字体、形状ID、段落与文字块；分组内文字及表格单元格也能定位。可先用子技能的 `example.json` 生成示例，随后根据材料改写 JSON。示例中的“待补充”与演示数据必须逐项处理后交付。

## JSON格式

```json
{
  "selected_slides": [1, 2, 5, 12],
  "replacements": {
    "{{cover_title}}": "报告标题"
  },
  "edits": [
    {
      "slide": 1,
      "shape_id": 14,
      "paragraph": 0,
      "expected_text": "公安警察工作汇报",
      "text": "警务工作情况汇报"
    }
  ],
  "charts": [
    {
      "slide": 3,
      "shape_id": 5,
      "categories": ["第一季度", "第二季度"],
      "series": [{"name": "已核实指标", "values": [12, 18]}]
    }
  ]
}
```

各字段独立可选，上例说明语法，形状ID与图表ID必须从选定模板读取。页码从1开始；段落与 `run` 从0开始。`selected_slides` 使用源模板页码，允许选择与重排，暂不支持重复同一页；需要重复页面时通过 Office 编辑工具复制并重新检查关系与页码。`edits.slide` 使用源页码，`charts.slide` 使用选页后的输出页码。

`replacements` 按文字运行中的精确标记一次替换，未找到的键会报错；跨运行标记用显式 `edits`。`edits` 必须包含 `expected_text`，防止模板版本变化导致误改。指定 `run` 时修改单个运行；整段编辑保持第一个运行的样式并清空后续运行，混排强调文字需逐运行编辑。脚本不修改共享母版和版式中的固定文字，遇到固定页眉时用 Office 工具编辑对应母版并复查所有受影响页。

文字编辑直接修改 OOXML，保留其他压缩包部件、图片、动画、主题及运行样式。`charts` 通过 `python-pptx` 更新原生分类图表及嵌入工作簿，保存过程会重新写入包；执行后对照源模板检查动画与扩展对象。饼图、柱图、折线等分类图表可使用此入口；散点图、气泡图用相应原生编辑工具。表格文字通过文字槽编辑；需要新增行列时用已加载的 Office 工具或 bundled `python-pptx`，重新检查版式。

输入JSON只接受已声明字段，页码、地址、期望文字、图表维度和数值必须有效。输出必须是新文件，所有修改成功后才发布。脚本不执行JSON中的命令，不读取外部URL。

## 预览与修正

读取 `validate` 输出：错误包含残留 `{{...}}` 标记、ZIP损坏；风险列表包含越界对象和估算文字高度。模板可保留待填标记，正式成品须消除标记。估算继承字体、文字换行和分组合成存在误差，所有最终页面仍需渲染并读取。

加载 `office-render` 后，使用技能给出的 Node 和 CLI 绝对路径运行：

```sh
"$OFFICE_NODE" "$OFFICE_CLI" render --input ./output/briefing-v1.pptx --output-dir ./output/preview-v1
```

输出目录必须尚未存在。读取JSON清单中的图片、页数、字体诊断，检查全部最终页的标题、图表标签、文字边缘、图片裁剪与表格。先压缩重复内容、调整布局和段落间距，再考虑减小字号；正文通常保持18pt及以上，来源脚注可使用11–12pt。页数变化时重写目录和页码。来源位置及口径写入讲稿与来源清单；正式汇报数据图表旁保留单位和必要注释。

需要 PDF 时加载 `office-export-pdf` 并运行 `convert --input ./output/briefing-v1.pptx --output ./output/briefing-v1.pdf`，核对非空文件与 `%PDF-` 签名。遵守渲染技能对空白图、失败重试和缺失引擎的处理要求。记录实际检查结果，不能凭估算声称无溢出。

## 原创模板重建

两个原创模板及示例可由 `"$PYTHON" "$PPT_SKILL/scripts/create_templates.py"` 重建。该维护命令会覆盖这两个技能内的内置模板与示例，日常用户任务直接填充副本。生成器使用已有 `python-pptx`，全部文字、表格、图表均为可编辑对象，无下载与更新行为。设计来源与公安资产使用范围见 [资源许可](../ASSETS.md)。
