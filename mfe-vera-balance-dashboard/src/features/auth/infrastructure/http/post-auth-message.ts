import { locales } from '../../../../locales'

export const postAuthMessage = async (path: string, body: Record<string, string>): Promise<string> => {
  const texts = locales.auth.passwordRecovery
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error(texts.configurationError)

  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error(texts.networkError)
  }

  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = data && typeof data === 'object' && 'detail' in data ? data.detail : null
    throw new Error(typeof detail === 'string' && detail ? detail : texts.requestError)
  }
  if (!data || typeof data !== 'object' || !('message' in data) || typeof data.message !== 'string') {
    throw new Error(texts.requestError)
  }
  return data.message
}
