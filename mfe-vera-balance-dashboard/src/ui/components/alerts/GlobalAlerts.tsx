//* REDUX
import { useAppSelector } from '../../../store/hooks'

//* COMPONENTS
import { AlertItem } from './AlertItem'

export const GlobalAlerts = () => {
  const alerts = useAppSelector(state => state.alerts.items)

  if (!alerts.length) return null

  return (
    <div className="vb-alerts">
      {/** GLOBAL MESSAGES */}
      {alerts.map(alert => <AlertItem key={alert.id} alert={alert} />)}
    </div>
  )
}
