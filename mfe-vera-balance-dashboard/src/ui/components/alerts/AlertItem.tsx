//* REACT
import { useEffect } from 'react'

//* ANT DESIGN
import { Alert } from 'antd'

//* REDUX
import { useAppDispatch } from '../../../store/hooks'
import { dismissAlert } from '../../../store/alerts/alerts.slice'

//* INTERFACES
import type { AlertItemI } from './interfaces/alert-item.interface'

export const AlertItem = ({ alert }: AlertItemI) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(dismissAlert(alert.id)), 5000)
    return () => window.clearTimeout(timer)
  }, [dispatch, alert.id])

  return (
    <Alert
      type={alert.type}
      title={alert.message}
      showIcon
      role={alert.type === 'error' || alert.type === 'warning' ? 'alert' : 'status'}
      closable={{ onClose: () => dispatch(dismissAlert(alert.id)) }}
    />
  )
}
