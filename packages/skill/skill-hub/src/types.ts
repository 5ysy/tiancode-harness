/** Browser-safe Skill Hub wire declarations. */
/** Exact fields accepted by TianCode's skill catalog reader. */
export interface TianCodeMetadata {
  readonly category: 'chat' | 'ppt' | 'document' | 'report' | 'data' | 'law' | 'proofread' | 'other'
  readonly label: { readonly zh: string; readonly en: string }
  readonly parent?: string
  readonly order?: number
}

/** Immutable package reference in a private catalog. */
export interface SkillHubEntry {
  readonly id: string
  readonly name: string
  readonly title: string
  readonly description: string
  readonly author?: string
  readonly repository?: string
  readonly package: string
  readonly sha256: string
}

/** Versioned static catalog served on the internal network. */
export interface SkillHubIndex {
  readonly version: 1
  readonly skills: readonly SkillHubEntry[]
}

/** Browser selection; URLs and filesystem locations are never caller-supplied. */
export interface SkillHubInstallRequest {
  readonly skillId: string
  readonly metadata: TianCodeMetadata
}

/** Last accepted catalog with local installation state. */
export interface SkillHubCatalog extends SkillHubIndex {
  readonly installed: readonly string[]
}
