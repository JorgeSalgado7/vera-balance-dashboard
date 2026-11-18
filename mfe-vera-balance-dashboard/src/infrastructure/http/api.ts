import axios from 'axios'
import { locales } from '../../locales'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  if (!config.baseURL) throw new Error(locales.api.configurationError)
  return config
})

api.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error instanceof Error ? error : new Error(locales.api.requestError))
    }
    if (!error.response) return Promise.reject(new Error(locales.api.networkError))
    const data: unknown = error.response.data
    const detail = data && typeof data === 'object' && 'detail' in data ? data.detail : null
    return Promise.reject(new Error(typeof detail === 'string' && detail ? detail : locales.api.requestError))
  },
)
