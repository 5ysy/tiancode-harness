/** Locale-owned Skill Hub copy. */
export const zh = {
  title: 'Skill Hub', subtitle: '连接内网技能市场，为社区技能设置 TianCode 分类并安装。',
  catalogUrl: '技能目录地址', catalogUrlPlaceholder: 'http://skills.internal/catalog.json', save: '保存并连接',
  saved: '连接配置已保存。', refresh: '刷新', search: '搜索技能', loading: '正在连接技能市场…', empty: '目录中暂无技能。', noResults: '没有找到匹配的技能。',
  configure: '填写服务器的 catalog.json 地址，保存后即可浏览技能。', unavailable: 'Skill Hub 的 Host 配置暂不可用。',
  installed: '已安装', install: '安装技能', cancel: '取消', installing: '正在安装…', installSuccess: '安装完成，可在对应分类和技能命令中使用。',
  category: 'TianCode 分类', labelZh: '中文显示名称', labelEn: '英文显示名称', parent: '父级技能名称（可选）', order: '排序值（可选）',
  advanced: '更多元数据', metadataHint: '名称和分类用于功能菜单；父级必须已安装，排序值越小越靠前。',
  locationHint: '技能安装到当前 TianCode Host；桌面模式下保存在本机。已有同名技能会保留。',
  'category.chat': '对话', 'category.ppt': '演示文稿', 'category.document': '文档', 'category.report': '报告', 'category.data': '数据', 'category.law': '法律', 'category.proofread': '校对', 'category.other': '其他',
  'error.not-configured': '请先配置技能目录地址。', 'error.invalid-url': '请输入无账号、密码、查询参数和片段的 HTTP 或 HTTPS 目录地址。',
  'error.invalid-data': '技能目录、安装包或元数据无效，请检查服务器文件与表单。', 'error.unreachable': '无法连接技能服务器，请检查地址、网络和服务状态。',
  'error.upstream-failed': '技能服务器拒绝了请求，请检查文件路径和访问权限。', 'error.missing-token': 'Host 未设置配置的令牌环境变量，请联系管理员。',
  'error.conflict': '已有同名技能，请保留现有技能或在本机管理后重试。', 'error.busy': '另一项安装正在进行，请稍后刷新。',
  'error.invalid-parent': '父级技能不存在，请检查父级名称。', 'error.cancelled': '操作超时或已取消，请刷新目录确认安装状态。',
  'error.save-failed': '连接配置保存失败，输入内容已保留，请重试。', 'error.operation-failed': '操作失败，请检查连接并刷新目录确认安装状态。',
} as const
/** Dictionary keys registered under settings.skillHub. */
export type SkillHubLocaleKey = keyof typeof zh
/** English dictionary with the same keys as Chinese. */
export const en = {
  title: 'Skill Hub', subtitle: 'Connect to your internal skill market and install community skills with TianCode categories.',
  catalogUrl: 'Skill catalog URL', catalogUrlPlaceholder: 'http://skills.internal/catalog.json', save: 'Save and connect',
  saved: 'Connection settings saved.', refresh: 'Refresh', search: 'Search skills', loading: 'Connecting to the skill market…', empty: 'No skills in this catalog.', noResults: 'No matching skills.',
  configure: 'Enter your server’s catalog.json URL to browse skills.', unavailable: 'The Skill Hub Host configuration is unavailable.',
  installed: 'Installed', install: 'Install skill', cancel: 'Cancel', installing: 'Installing…', installSuccess: 'Installed. Available in its category and skill commands.',
  category: 'TianCode category', labelZh: 'Chinese display name', labelEn: 'English display name', parent: 'Parent skill name (optional)', order: 'Sort order (optional)',
  advanced: 'More metadata', metadataHint: 'Names and categories appear in the feature menu. The parent must be installed. Lower sort values appear first.',
  locationHint: 'Skills are installed on the current TianCode Host, locally in desktop mode. Existing skills are preserved.',
  'category.chat': 'Chat', 'category.ppt': 'Presentations', 'category.document': 'Documents', 'category.report': 'Reports', 'category.data': 'Data', 'category.law': 'Legal', 'category.proofread': 'Proofreading', 'category.other': 'Other',
  'error.not-configured': 'Configure a skill catalog URL first.', 'error.invalid-url': 'Enter an HTTP or HTTPS catalog URL without credentials, query parameters, or a fragment.',
  'error.invalid-data': 'Invalid catalog, package, or metadata. Check the server files and form.', 'error.unreachable': 'Cannot reach the skill server. Check its URL, network, and service.',
  'error.upstream-failed': 'The skill server refused the request. Check file paths and access permissions.', 'error.missing-token': 'The configured token environment variable is missing on the Host. Contact your administrator.',
  'error.conflict': 'A skill with this name already exists. Keep it or manage the local copy before retrying.', 'error.busy': 'Another installation is running. Refresh shortly.',
  'error.invalid-parent': 'The parent skill is missing.', 'error.cancelled': 'The operation timed out or was cancelled. Refresh to confirm installation status.',
  'error.save-failed': 'Could not save the connection. Your input is retained; try again.', 'error.operation-failed': 'Operation failed. Check the connection and refresh to confirm installation status.',
} satisfies Record<SkillHubLocaleKey, string>
