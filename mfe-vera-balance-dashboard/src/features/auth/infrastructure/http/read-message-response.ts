import { locales } from '../../../../locales'

export const readMessageResponse = (data: unknown): string => {
  if (!data || typeof data !== 'object' || !('message' in data) || typeof data.message !== 'string') {
    throw new Error(locales.api.requestError)
  }
  return data.message
}
