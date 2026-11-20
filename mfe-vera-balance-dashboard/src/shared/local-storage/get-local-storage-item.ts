export const getLocalStorageItem = (key: string): unknown => {
  try {
    const value = window.localStorage.getItem(key)
    return value === null ? null : JSON.parse(value)
  } catch {
    return null
  }
}
