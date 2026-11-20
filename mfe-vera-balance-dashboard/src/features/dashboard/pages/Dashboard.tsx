//* REDUX
import { useAppSelector } from '../../../store/hooks'

//* LAYOUT
import { DashbaordLayout } from "../../../layouts/dashboard/DashbaordLayout"

//* COMPONENTS
import { Breadcrumb } from '../../../ui/components/breadcrumb/Breadcrumb'

//* LOCALES
import { locales } from '../../../locales'

export const Dashboard = () => {
  const userName = useAppSelector(state => state.session.user?.name)
  return (
    <DashbaordLayout>

      {/** BREADCRUMB */}
      <Breadcrumb userName={userName} pageTitle={locales.dashboard.sideMenu.dashboard} />
    
		</DashbaordLayout>
  )
}
