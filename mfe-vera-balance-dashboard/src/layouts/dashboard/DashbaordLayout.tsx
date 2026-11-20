//* REACT
import { useState } from 'react'

import type { DashboardLayoutI } from "./interfaces/dashboard-layout.interface"

//* COMPONENTS
import { SideMenu } from "./SideMenu"
import { Header } from "./Header"

export const DashbaordLayout = ({children}: DashboardLayoutI) => {
  const [isOpen, setOpen] = useState(false)
	return (
		<div className="vb-dashboard-layout">

			{/** SIDE MENU */}
			<SideMenu isOpen={isOpen} />

			{/** MAIN */}
			<main className="vb-dashboard-layout__main">
				{/** HEADER */}
        <Header isOpen={isOpen} setOpen={setOpen} />

        {/** CONTENT */}
				{children}
			</main>
			
		</div>
	)
}
