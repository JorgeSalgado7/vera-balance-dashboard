import type { DashboardLayoutI } from "./interfaces/dashboard-layout.interface"

export const DashbaordLayout = ({children}: DashboardLayoutI) => {
	return (
		<div>
			{children}
		</div>
	)
}
