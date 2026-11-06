/**
 * Host side of dsh-workspace-explorer.
 *
 * Serves one read-only route the Web client polls for VS Code-style Git
 * decorations: `GET /dsh-workspace-explorer/git-status?session=<id>`.
 *
 * - The client names a Session, never a path: the directory is that Session's
 *   own working directory, resolved here, so the route cannot be aimed at an
 *   arbitrary folder.
 * - Every request passes the host's own request gate (`connection.requestRejection`,
 *   its Host/Origin fence plus browser login) before anything runs.
 * - Only `git rev-parse` and `git status` run, with GIT_OPTIONAL_LOCKS=0 so the
 *   index is never locked or rewritten. Nothing is staged, committed or pushed.
 */
import { execFile } from 'node:child_process'
import { access, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const ROUTE = '/dsh-workspace-explorer/git-status'
const TIMEOUT_MS = 8000
const MAX_BUFFER = 16 * 1024 * 1024
/** Above this many entries the answer is cut short; folder rollups stay correct only for what was sent. */
const MAX_ENTRIES = 20000

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function git(cwd, args) {
  return new Promise((resolve) => {
    execFile('git', ['-c', 'core.quotepath=false', ...args], {
      cwd,
      timeout: TIMEOUT_MS,
      maxBuffer: MAX_BUFFER,
      windowsHide: true,
      encoding: 'utf8',
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' },
    }, (error, stdout, stderr) => {
      resolve({ error, stdout: stdout ?? '', stderr: stderr ?? '' })
    })
  })
}

const norm = (p) => p.replace(/\\/g, '/').replace(/\/+$/, '')

/** VS Code-style single letter for one porcelain v1 XY pair. */
function classify(x, y) {
  if (x === '?' && y === '?') return 'U'
  if (x === '!' && y === '!') return 'I'
  if (x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D')) return 'C'
  if (y === 'D' || x === 'D') return 'D'
  if (x === 'A') return 'A'
  if (x === 'R' || x === 'C') return 'R'
  return 'M'
}

/**
 * Status of `cwd` relative to HEAD, keyed by paths relative to `cwd` ('/'-separated).
 * @returns {Promise<{ repo: false } | { repo: true, files: Record<string,string>, ignored: string[], truncated: boolean }>}
 */
async function statusOfRepo(cwd) {
  const top = await git(cwd, ['rev-parse', '--show-toplevel'])
  if (top.error) {
    if (top.error.code === 'ENOENT') return { repo: false, reason: 'git-missing' }
    return { repo: false }
  }
  const root = norm(top.stdout.trim())
  const base = norm(cwd)
  // Prefix that turns a repo-root-relative path into a cwd-relative one.
  let prefix = ''
  if (base.toLowerCase() !== root.toLowerCase()) {
    if (!base.toLowerCase().startsWith(root.toLowerCase() + '/')) return { repo: false }
    prefix = base.slice(root.length + 1) + '/'
  }
  const st = await git(cwd, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignored=matching', '--no-renames', '--', '.'])
  if (st.error) return { repo: true, error: (st.stderr || st.error.message || 'git status failed').trim(), files: {}, ignored: [], truncated: false }
  const parts = st.stdout.split('\0')
  const files = {}
  const ignored = []
  let count = 0
  let truncated = false
  for (let i = 0; i < parts.length; i++) {
    const item = parts[i]
    if (item.length < 4) continue
    const x = item[0]
    const y = item[1]
    let path = item.slice(3)
    if (x === 'R' || x === 'C') i++ // the source path follows; not shown
    if (prefix !== '') {
      if (!path.startsWith(prefix)) continue
      path = path.slice(prefix.length)
    }
    const code = classify(x, y)
    if (code === 'I') {
      ignored.push(path.replace(/\/+$/, ''))
      continue
    }
    if (++count > MAX_ENTRIES) { truncated = true; break }
    files[path] = code
  }
  return { repo: true, root, files, ignored, truncated }
}

/** Like VS Code's default scan depth: when the workspace itself is no repo, look one level down for repos. */
const SCAN_SKIP = new Set(['node_modules', '.git', '.svn', '.hg'])
const MAX_NESTED = 32

async function statusOf(cwd) {
  const direct = await statusOfRepo(cwd)
  if (direct.repo || direct.reason === 'git-missing') return direct
  let dirs
  try {
    dirs = (await readdir(cwd, { withFileTypes: true }))
      .filter((d) => d.isDirectory() && !SCAN_SKIP.has(d.name))
      .map((d) => d.name)
  } catch {
    return direct
  }
  const nested = []
  for (const name of dirs) {
    try { await access(join(cwd, name, '.git')); nested.push(name) } catch { /* not a repo root */ }
    if (nested.length >= MAX_NESTED) break
  }
  if (nested.length === 0) return direct
  const files = {}
  const ignored = []
  let truncated = false
  const results = await Promise.all(nested.map(async (name) => [name, await statusOfRepo(join(cwd, name))]))
  for (const [name, r] of results) {
    if (!r.repo || r.error) continue
    for (const [p, code] of Object.entries(r.files)) files[`${name}/${p}`] = code
    for (const p of r.ignored) ignored.push(`${name}/${p}`)
    truncated ||= r.truncated
  }
  return { repo: true, nested: nested.length, files, ignored, truncated }
}

export function apply(ctx) {
  ctx.inject(['webServer'], (host) => {
    const handler = async (request, response) => {
      try {
        const connection = host.get('connection')
        const gate = connection?.requestRejection
        if (typeof gate === 'function') {
          let status
          try { status = gate.call(connection, request) } catch { status = 403 }
          if (status !== undefined) return sendJson(response, status, { error: 'refused' })
        }
        if (request.method !== 'GET') return sendJson(response, 405, { error: 'method not allowed' })
        const url = new URL(request.url ?? '/', 'http://local')
        const sessionId = url.searchParams.get('session')
        if (!sessionId) return sendJson(response, 400, { error: 'missing session' })
        const sessions = host.get('sessions')
        const workingDirectory = host.get('workingDirectory')
        const session = sessions?.get(sessionId)
        if (session === undefined) return sendJson(response, 200, { repo: false, reason: 'no-session' })
        let cwd
        try { cwd = workingDirectory?.get(session) ?? session.header?.cwd } catch { cwd = session.header?.cwd }
        if (typeof cwd !== 'string' || cwd === '') return sendJson(response, 200, { repo: false, reason: 'no-cwd' })
        sendJson(response, 200, await statusOf(cwd))
      } catch (error) {
        if (!response.headersSent) sendJson(response, 500, { error: error?.message ?? String(error) })
        else response.end()
      }
    }
    host.effect(() => host.webServer.register({ kind: 'exact', path: ROUTE, handler }), 'workspace-explorer: git status route')
  })
}
