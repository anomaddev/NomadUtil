import { createRequire } from 'node:module'
import { Command } from 'commander'
import { GitError } from './modules/git/helpers.js'
import { registerGitCommands } from './modules/git/index.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const program = new Command()

program
  .name('nomadutil')
  .description('Local utilities for git ship/release workflows')
  .version(version, '-V, --version', 'Show version number')
  .helpOption('-h, --help', 'Show usage')
  .showHelpAfterError()
  .showSuggestionAfterError(false)

registerGitCommands(program)

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    program.outputHelp()
    process.exit(1)
  }

  try {
    await program.parseAsync(process.argv)
  } catch (err) {
    if (err instanceof GitError) {
      console.error(err.message)
      process.exit(err.exitCode)
    }
    if (err instanceof Error) {
      console.error(err.message)
      process.exit(1)
    }
    console.error(String(err))
    process.exit(1)
  }
}

void main()
