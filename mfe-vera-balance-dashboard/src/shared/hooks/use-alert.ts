import { useCallback, useEffect } from 'react'
import { useAppDispatch } from '../../store/hooks'
import { showAlert, clearAlertSource } from '../../store/alerts/alerts.slice'
import type { AppAlertType } from '../../store/alerts/interfaces/alerts-state.interface'

export const useAlert = (source: string) => {
  const dispatch = useAppDispatch()
  const clear = useCallback(() => { dispatch(clearAlertSource(source)) }, [dispatch, source])
  const show = useCallback((message: string, type: AppAlertType) => {
    dispatch(showAlert(source, message, type))
  }, [dispatch, source])

  useEffect(() => clear, [clear])

  return { show, clear }
}
