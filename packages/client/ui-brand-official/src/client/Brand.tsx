import { BrandWordmark, FishLogo } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SidebarBrandMarkOwnerProps } from '@deepseek-ai/dsh-client-ui-sidebar/client'

/**
 * Render the supplied TianCode application artwork in a sidebar slot.
 * @param props - Host-supplied mark presentation.
 * @returns the TianCode application artwork.
 */
export function TianCodeBrandMark({ size }: SidebarBrandMarkOwnerProps) {
  return <img src="/tiancode-mark.png" width={size} height={size} alt="" aria-hidden="true" />
}

/**
 * Render the TianCode name beside its supplied application artwork.
 * @returns the TianCode name.
 */
export function TianCodeBrandName() {
  return <span aria-hidden="true">TianCode</span>
}

/**
 * Render the official mark with the presentation requested by its host surface.
 * @param props - Host-supplied mark presentation.
 * @returns the official whale mark.
 */
export function OfficialBrandMark({ size }: SidebarBrandMarkOwnerProps) {
  return <FishLogo size={size} />
}

/**
 * Render the official name artwork without its independently slotted mark.
 * @returns the official name wordmark.
 */
export function OfficialBrandName() {
  return <BrandWordmark includeMark={false} />
}
