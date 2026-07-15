# nomadutil

CLI and library for local Git ship/release workflows. Stage everything, commit only when there are staged changes, push a branch, and (for release) create an annotated version tag — same behavior as classic shell helpers, runnable from any git repo.

Commands are grouped under modules so more tools can be added later. v1 ships the `git` module.

## Install

Global CLI:

```bash
npm install -g nomadutil
```

As a library dependency:

```bash
npm install nomadutil
```

One-off without installing:

```bash
npx nomadutil git ship "fix login crash"
```

### Local development

```bash
npm install
npm run build
npm link          # or: npm i -g .
```

## CLI

Always operates on the **current working directory’s** git repository (not the tool install path).

### Ship

Stage all changes, commit if anything is staged, push the branch:

```bash
nomadutil git ship "fix login crash"
```

### Release

Same as ship, then create an annotated tag and push it:

```bash
nomadutil git release 1.0.0
nomadutil git release 1.0.0 "optional message"
nomadutil git release v1.0.0   # same tag as 1.0.0 → v1.0.0
```

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--remote <name>` | `origin` | Git remote |
| `--branch <name>` | `main` | Branch to push |
| `--dry-run` | off | Print what would run; no git writes |
| `-h, --help` | | Show usage |

Examples:

```bash
nomadutil git ship "wip" --dry-run
nomadutil git release 1.2.0 --remote origin --branch main
```

Exit non-zero on missing args or git failures.

## Library

```ts
import { ship, release } from 'nomadutil'

await ship({ message: 'fix login crash' })

await release({ version: '1.0.0' })
await release({
  version: 'v1.0.0',
  message: 'optional message',
  remote: 'origin',
  branch: 'main',
  dryRun: false,
  cwd: process.cwd(), // optional; defaults to process.cwd()
})
```

## Defaults

- **Remote:** `origin`
- **Branch:** `main`
- **Tag prefix:** `v` (versions `1.0.0` and `v1.0.0` both become tag `v1.0.0`)
- **Release message:** `Release vX.Y.Z` when omitted
- **Working tree:** current working directory (`process.cwd()` / optional `cwd`)

## Modules

| Module | Commands |
|--------|----------|
| `git` | `ship`, `release` |

More modules can be added later as `nomadutil <module> <command>`.
