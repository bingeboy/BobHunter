# CLAUDE.md

Guidance for Claude Code working in this repo.

## Pull requests & commits

- When a change is ready, **open the pull request** yourself (e.g. `gh pr create`)
  with a clear, concise **summary** of what changed and why.
- **Never sign or attribute work to Claude / AI.** No `Co-Authored-By: Claude`
  trailer on commits, no "Generated with Claude Code" footer or AI signature on
  PR descriptions. Commits and PRs are the user's.

## Deploy

- The live site is a Cloudflare Worker (`bobhunter`) serving the `public/`
  directory as static assets; every push to `main` auto-deploys.
- `main` is protected — land changes through a PR, never push to it directly.
