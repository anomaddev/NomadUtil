import {
  addAll,
  assertGitRepo,
  commitIfNeeded,
  createAnnotatedTag,
  normalizeVersion,
  pushBranch,
  pushTag,
  versionToTag,
} from './helpers.js'

export type ReleaseOptions = {
  version: string
  message?: string
  cwd?: string
  remote?: string
  branch?: string
  dryRun?: boolean
}

export async function release(options: ReleaseOptions): Promise<void> {
  const cwd = options.cwd ?? process.cwd()
  const remote = options.remote ?? 'origin'
  const branch = options.branch ?? 'main'
  const dryRun = options.dryRun ?? false

  if (!options.version?.trim()) {
    throw new Error('release requires a version')
  }

  const version = normalizeVersion(options.version.trim())
  const tag = versionToTag(version)
  const message = options.message?.trim() || `Release ${tag}`

  await assertGitRepo(cwd)
  await addAll(cwd, dryRun)
  await commitIfNeeded(message, cwd, dryRun)
  await createAnnotatedTag(tag, message, cwd, dryRun)
  await pushBranch(remote, branch, cwd, dryRun)
  await pushTag(remote, tag, cwd, dryRun)
}
