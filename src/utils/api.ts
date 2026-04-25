import type { DataSource } from '../types'

function extractAtPath(value: unknown, path: string): unknown {
  if (!path.trim()) return value
  const keys = path.split('.').map((k) => k.trim()).filter(Boolean)
  let current: unknown = value
  for (const key of keys) {
    if (current === null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

function coerceRecord(value: unknown): Record<string, string> {
  if (value === null || typeof value !== 'object') return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v === null || v === undefined) {
      out[k] = ''
    } else if (typeof v === 'object') {
      out[k] = JSON.stringify(v)
    } else {
      out[k] = String(v)
    }
  }
  return out
}

export async function fetchApiSource(url: string, path = ''): Promise<DataSource> {
  const trimmedUrl = url.trim()
  if (!trimmedUrl) throw new Error('URL is required')
  if (!/^https?:\/\//i.test(trimmedUrl)) {
    throw new Error('URL must start with http:// or https://')
  }

  let response: Response
  try {
    response = await fetch(trimmedUrl, {
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    throw new Error(`Network error: ${(err as Error).message}`)
  }

  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText})`)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Response is not valid JSON')
  }

  const extracted = extractAtPath(body, path)
  if (!Array.isArray(extracted)) {
    throw new Error(
      path
        ? `Path "${path}" did not resolve to an array`
        : 'Response must be a JSON array (or set a path to an array field)'
    )
  }
  if (extracted.length === 0) {
    throw new Error('API returned an empty array')
  }

  const records = extracted.map(coerceRecord)
  const headerSet = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) headerSet.add(key)
  }

  return {
    type: 'api',
    records,
    headers: [...headerSet],
    fileName: new URL(trimmedUrl).hostname + new URL(trimmedUrl).pathname,
    apiConfig: { url: trimmedUrl, path: path.trim() || undefined },
  }
}
