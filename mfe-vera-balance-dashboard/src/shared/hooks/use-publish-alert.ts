import { useEffect } from 'react'
import { useAlert } from './use-alert'
import type { AppAlertType } from '../../store/alerts/interfaces/alerts-state.interface'

export const usePublishAlert = (source: string, message: string, type: AppAlertType) => {
  const { show, clear } = useAlert(source)

  useEffect(() => {
    if (message) show(message, type)
    else clear()
    return clear
  }, [show, clear, message, type])
}
