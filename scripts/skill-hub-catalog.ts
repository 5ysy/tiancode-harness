/** Build a private Skill Hub catalog from local, reviewed community skill directories. */
import { resolve } from 'node:path'
import { buildCatalog } from '../packages/skill/skill-hub/src/builder.ts'

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const sources: string[] = []
  let output: string | undefined
  for (let index = 0; index < args.length; index += 2) {
    const value = args[index + 1]
    if (value === undefined) throw new Error('Usage: --source <skill-directory> [--source <directory>] --out <static-root>')
    if (args[index] === '--source') sources.push(resolve(value))
    else if (args[index] === '--out') output = resolve(value)
    else throw new Error('Unknown option; use --source and --out')
  }
  if (sources.length === 0 || output === undefined) throw new Error('At least one --source and an --out directory are required')
  const catalog = await buildCatalog(sources, output)
  console.log(`Published ${catalog.skills.length} skills to ${output}`)
}

void main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Catalog generation failed'); process.exitCode = 1 })
