export const removeLocalStorageItem = (key: string): boolean => {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
