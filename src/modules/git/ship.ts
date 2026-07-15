import {
  addAll,
  assertGitRepo,
  commitIfNeeded,
  pushBranch,
} from './helpers.js'

export type ShipOptions = {
  message: string
  cwd?: string
  remote?: string
  branch?: string
  dryRun?: boolean
}

export async function ship(options: ShipOptions): Promise<void> {
  const cwd = options.cwd ?? process.cwd()
  const remote = options.remote ?? 'origin'
  const branch = options.branch ?? 'main'
  const dryRun = options.dryRun ?? false
  const message = options.message

  if (!message?.trim()) {
    throw new Error('ship requires a commit message')
  }

  await assertGitRepo(cwd)
  await addAll(cwd, dryRun)
  await commitIfNeeded(message, cwd, dryRun)
  await pushBranch(remote, branch, cwd, dryRun)
}
