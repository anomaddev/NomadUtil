import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))

function missing(pkg) {
  try {
    require.resolve(pkg)
    return false
  } catch {
    return !existsSync(join(root, 'node_modules', pkg))
  }
}

const required = ['typescript', '@types/node', 'commander']
const absent = required.filter(missing)
const tscPath = join(root, 'node_modules', 'typescript', 'bin', 'tsc')

if (absent.length > 0 || !existsSync(tscPath)) {
  console.error(
    'Missing build dependencies. Run `npm install` in the package root, then retry publish.\n' +
      (absent.length ? `Missing: ${absent.join(', ')}\n` : '') +
      'Tip: if your .npmrc sets omit=dev or production=true, use `npm install --include=dev`.',
  )
  process.exit(1)
}
