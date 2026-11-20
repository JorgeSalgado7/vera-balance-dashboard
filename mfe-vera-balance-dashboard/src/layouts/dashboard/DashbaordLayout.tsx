//* REACT
import { useState } from 'react'

import type { DashboardLayoutI } from "./interfaces/dashboard-layout.interface"

//* COMPONENTS
import { SideMenu } from "./SideMenu"
import { Header } from "./Header"
import { Breadcrumb } from '../../ui/components/breadcrumb/Breadcrumb'
import { GlobalAlerts } from '../../ui/components/alerts/GlobalAlerts'

//* REDUX
import { useAppSelector } from '../../store/hooks'

export const DashbaordLayout = ({children, pageTitle}: DashboardLayoutI) => {
  const [isOpen, setOpen] = useState(false)
  const userName = useAppSelector(state => state.session.user?.name)
	return (
		<div className="vb-dashboard-layout">

			{/** SIDE MENU */}
			<SideMenu isOpen={isOpen} />

			{/** MAIN */}
			<main className="vb-dashboard-layout__main">
				{/** HEADER */}
        <Header isOpen={isOpen} setOpen={setOpen} />

        {/** CONTENT */}
				<div className="vb-container">
					{/** BREADCRUMB */}
          <Breadcrumb userName={userName} pageTitle={pageTitle} />

          {/** ALERTS */}
          <GlobalAlerts />

          {/** PAGE CONTENT */}
          {children}
				</div>

			</main>
			
		</div>
	)
}
