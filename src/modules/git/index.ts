import type { Command } from 'commander'
import { release } from './release.js'
import { ship } from './ship.js'

export { ship, release }
export type { ShipOptions } from './ship.js'
export type { ReleaseOptions } from './release.js'

type SharedOpts = {
  remote?: string
  branch?: string
  dryRun?: boolean
}

function sharedFlags(cmd: Command): Command {
  return cmd
    .option('--remote <name>', 'git remote', 'origin')
    .option('--branch <name>', 'branch to push', 'main')
    .option('--dry-run', 'print what would happen, no git writes', false)
}

export function registerGitCommands(program: Command): void {
  const git = program
    .command('git')
    .description('Local git ship/release workflows')

  sharedFlags(
    git
      .command('ship')
      .description('Stage, commit (if needed), and push')
      .argument('<message>', 'commit message')
      .action(async (message: string, opts: SharedOpts) => {
        await ship({
          message,
          remote: opts.remote,
          branch: opts.branch,
          dryRun: opts.dryRun,
        })
      }),
  )

  sharedFlags(
    git
      .command('release')
      .description('Stage, commit (if needed), tag, and push branch + tag')
      .argument('<version>', 'version (e.g. 1.0.0 or v1.0.0)')
      .argument('[message]', 'tag/commit message (default: Release vX.Y.Z)')
      .action(async (version: string, message: string | undefined, opts: SharedOpts) => {
        await release({
          version,
          message,
          remote: opts.remote,
          branch: opts.branch,
          dryRun: opts.dryRun,
        })
      }),
  )
}
