/** Copy for the API Session-log upload preference. */
const isTianCode = process.env.DSH_CLIENT_BUILD_PROFILE === 'tiancode'

/** English preference copy. */
export const en = {
  title: 'Upload Session Log when using the official model API',
  description: isTianCode ? 'Help improve TianCode products.' : 'Help improve DeepSeek models and products.',
  saved: 'Preference saved',
  failed: 'Could not save preference',
}

/** Chinese preference copy. */
export const zh: Record<keyof typeof en, string> = {
  title: '在使用官方模型 API 时上传 Session Log',
  description: isTianCode ? '帮助改进TianCode产品' : '帮助改进 DeepSeek 模型与产品',
  saved: '设置已保存',
  failed: '无法保存设置',
}
