import { spawn } from 'node:child_process'

export type GitRunOptions = {
  cwd?: string
  dryRun?: boolean
  /** When true, always execute even if dryRun is set (for read-only probes). */
  force?: boolean
}

export class GitError extends Error {
  readonly exitCode: number

  constructor(message: string, exitCode = 1) {
    super(message)
    this.name = 'GitError'
    this.exitCode = exitCode
  }
}

function formatGitCommand(args: string[]): string {
  return `git ${args.join(' ')}`
}

export async function runGit(
  args: string[],
  options: GitRunOptions = {},
): Promise<{ stdout: string; stderr: string; code: number }> {
  const cwd = options.cwd ?? process.cwd()
  const dryRun = options.dryRun ?? false
  const force = options.force ?? false

  if (dryRun && !force) {
    console.log(`[dry-run] ${formatGitCommand(args)}`)
    return { stdout: '', stderr: '', code: 0 }
  }

  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    child.on('error', (err) => {
      reject(new GitError(`failed to run git: ${err.message}`))
    })

    child.on('close', (code) => {
      const exitCode = code ?? 1
      if (exitCode !== 0) {
        const detail = (stderr || stdout).trim()
        reject(
          new GitError(
            detail
              ? `git ${args.join(' ')} failed: ${detail}`
              : `git ${args.join(' ')} failed with exit code ${exitCode}`,
            exitCode,
          ),
        )
        return
      }
      resolve({ stdout, stderr, code: exitCode })
    })
  })
}

/** Like runGit, but returns the exit code instead of throwing on failure. */
export async function runGitAllowFail(
  args: string[],
  options: GitRunOptions = {},
): Promise<{ stdout: string; stderr: string; code: number }> {
  const cwd = options.cwd ?? process.cwd()

  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    child.on('error', (err) => {
      reject(new GitError(`failed to run git: ${err.message}`))
    })

    child.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? 1 })
    })
  })
}

export async function assertGitRepo(cwd: string = process.cwd()): Promise<void> {
  const result = await runGitAllowFail(['rev-parse', '--is-inside-work-tree'], {
    cwd,
  })
  if (result.code !== 0 || result.stdout.trim() !== 'true') {
    throw new GitError(`not a git repository: ${cwd}`)
  }
}

export async function addAll(
  cwd: string = process.cwd(),
  dryRun = false,
): Promise<void> {
  await runGit(['add', '-A'], { cwd, dryRun })
}

export async function commitIfNeeded(
  message: string,
  cwd: string = process.cwd(),
  dryRun = false,
): Promise<boolean> {
  let shouldCommit: boolean

  if (dryRun) {
    // add -A is skipped in dry-run, so check the working tree for anything
    // that would become staged (tracked diffs + untracked files).
    const status = await runGitAllowFail(['status', '--porcelain'], { cwd })
    shouldCommit = status.stdout.trim().length > 0
    if (!shouldCommit) {
      console.log('[dry-run] no changes; skipping commit')
      return false
    }
  } else {
    const diff = await runGitAllowFail(['diff', '--cached', '--quiet'], { cwd })
    shouldCommit = diff.code !== 0
    if (!shouldCommit) {
      return false
    }
  }

  await runGit(['commit', '-m', message], { cwd, dryRun })
  return true
}

export async function pushBranch(
  remote: string,
  branch: string,
  cwd: string = process.cwd(),
  dryRun = false,
): Promise<void> {
  await runGit(['push', '-u', remote, branch], { cwd, dryRun })
}

export async function createAnnotatedTag(
  tag: string,
  message: string,
  cwd: string = process.cwd(),
  dryRun = false,
): Promise<void> {
  await runGit(['tag', '-a', tag, '-m', message], { cwd, dryRun })
}

export async function pushTag(
  remote: string,
  tag: string,
  cwd: string = process.cwd(),
  dryRun = false,
): Promise<void> {
  await runGit(['push', remote, tag], { cwd, dryRun })
}

export function normalizeVersion(version: string): string {
  return version.startsWith('v') ? version.slice(1) : version
}

export function versionToTag(version: string): string {
  return `v${normalizeVersion(version)}`
}
