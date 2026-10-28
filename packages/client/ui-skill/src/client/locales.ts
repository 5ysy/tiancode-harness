/** `skill` namespace dictionaries for the dedicated tool row. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'skill'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'features.label': '办公助手',
  'features.locale': 'zh',
  'features.chat': '对话',
  'features.more': '更多',
  'features.error': '功能列表加载失败',
  'features.retry': '重试',
  'features.command': '当前正在编辑命令，发送或清空后可选择功能',
  'features.unavailable': '当前会话未启用此功能',
  'row.title': '加载技能',
  'row.running': '正在加载 skill',
  'row.preparing': '准备加载技能',
  'row.failed': 'skill 加载失败',
  'row.stopped': 'skill 加载已中止',
  'row.instructions': '说明',
  'row.inspect': '查看',
  'menu.userOnly': '仅用户',
} satisfies Record<string, string>

/** The skill namespace key union. */
export type SkillKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'features.label': 'Office assistant',
  'features.locale': 'en',
  'features.chat': 'Chat',
  'features.more': 'More',
  'features.error': 'Could not load features',
  'features.retry': 'Retry',
  'features.command': 'Finish or clear the current command to select a feature',
  'features.unavailable': 'This feature is unavailable in the current session',
  'row.title': 'Skill',
  'row.running': 'Loading skill',
  'row.preparing': 'Preparing to load a skill',
  'row.failed': 'Skill load failed',
  'row.stopped': 'Skill load stopped',
  'row.instructions': 'Instructions',
  'row.inspect': 'Inspect',
  'menu.userOnly': 'user-only',
} satisfies Record<SkillKey, string>
