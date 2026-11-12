const sensitive = /password|token|secret|authorization|cookie|email|recipient|phone|address|license|body|payload|credential|api.?key|recovery.?code/i

export function sanitizeLogMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const visited = new WeakSet<object>()
  const clean = (value: unknown, depth: number): unknown => {
    if (depth > 5) return '[profundidad máxima]'
    if (typeof value === 'string') return value.slice(0, 300)
    if (value === null || typeof value === 'number' || typeof value === 'boolean') return value
    if (typeof value !== 'object') return undefined
    if (visited.has(value)) return '[referencia circular]'
    visited.add(value)
    if (Array.isArray(value)) return value.slice(0, 20).map(item => clean(item, depth + 1))
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value).slice(0, 30)) {
      result[key] = sensitive.test(key) || ['name', 'code', 'from', 'to', 'request', 'response'].includes(key.toLowerCase())
        ? '[oculto]' : clean(item, depth + 1)
    }
    return result
  }
  return clean(metadata, 0) as Record<string, unknown>
}
