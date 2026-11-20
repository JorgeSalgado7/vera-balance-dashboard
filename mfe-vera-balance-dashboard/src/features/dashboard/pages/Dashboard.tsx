//* LAYOUT
import { DashbaordLayout } from "../../../layouts/dashboard/DashbaordLayout"

//* COMPONENTS
import { Breadcrumb } from '../../../ui/components/breadcrumb/Breadcrumb'

//* LOCALES
import { locales } from '../../../locales'

export const Dashboard = () => {
  return (
    <DashbaordLayout>

      {/** BREADCRUMB */}
      <Breadcrumb userName="Mónica Vera" pageTitle={locales.dashboard.sideMenu.dashboard} />
    
		</DashbaordLayout>
  )
}
