export type AppAlertType = 'success' | 'error' | 'warning' | 'info'

export interface AppAlertI {
  id: string
  source: string
  message: string
  type: AppAlertType
}

export interface AlertsStateI {
  items: AppAlertI[]
}
