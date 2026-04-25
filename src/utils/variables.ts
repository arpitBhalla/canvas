const VARIABLE_REGEX = /\{\{(\w+)\}\}/g

export interface ContentSegment {
  type: 'text' | 'variable'
  value: string
}

export function parseContentToSegments(content: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  let lastIndex = 0

  for (const match of content.matchAll(VARIABLE_REGEX)) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'variable', value: match[1]! })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) })
  }

  return segments
}

export function extractVariables(content: string): string[] {
  return [...content.matchAll(VARIABLE_REGEX)].map((m) => m[1]!)
}

export function replaceVariables(content: string, data: Record<string, string>): string {
  return content.replace(VARIABLE_REGEX, (_, name: string) => data[name] ?? `{{${name}}}`)
}
