//* LAYOUT
import { DashbaordLayout } from '../../../layouts/dashboard/DashbaordLayout'

//* LOCALES
import { locales } from '../../../locales'

export const Dashboard = () => (
  <DashbaordLayout pageTitle={locales.dashboard.sideMenu.dashboard} />
)
