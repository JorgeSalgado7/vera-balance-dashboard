//* INTERFACES
import type { SideMenuI } from './interfaces/side-menu.interface'

//* REACT ROUTER
import { Link, NavLink } from "react-router-dom"

//* ICONS
import { BankOutlined, AppstoreOutlined, SolutionOutlined, TeamOutlined, UserOutlined, QuestionCircleOutlined, LogoutOutlined } from '@ant-design/icons'

//* REDUX
import { useAppSelector } from '../../store/hooks'

//* SESSION
import { useLogout } from '../../features/auth/hooks/use-logout'

//* LOCALES
import { locales } from '../../locales'

export const SideMenu = ({ isOpen }: SideMenuI) => {
  const menu = locales.dashboard.sideMenu
  const logout = useLogout()
  const user = useAppSelector(state => state.session.user)

  return (
    <aside id="dashboard-side-menu" className={`vb-side-menu ${isOpen ? ' vb-side-menu--open' : ''}`}>
      {/** BRAND */}
      <Link className="vb-side-menu__brand" to="/dashboard" aria-label={menu.dashboard}>
        <img src="/Logo.svg" alt={locales.auth.login.logoAlt} />
      </Link>

      {/** NAVIGATION */}
      <nav className="vb-side-menu__navigation" aria-label={menu.navigation}>

        {/** DASHBOARD */}
        <section className="vb-side-menu__group" aria-label={menu.dashboard}>
          <div className="vb-side-menu__separator">{menu.dashboard}</div>
          <NavLink className={({ isActive }) => `vb-side-menu__link${isActive ? ' vb-side-menu__link--active' : ''}`} to="/dashboard" end aria-label={menu.dashboard}>
            <AppstoreOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.dashboard}</span>
          </NavLink>
        </section>


        {/** FOLLOW-UP */}
        <section className="vb-side-menu__group" aria-label={menu.followUp}>
          <div className="vb-side-menu__separator">{menu.followUp}</div>
          {/** THERAPEUTIC PROCESS */}
          <Link className="vb-side-menu__link" to="" aria-label={menu.therapeuticProcess}>
            <SolutionOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.therapeuticProcess}</span>
          </Link>
          {/** PATIENTS */}
          <Link className="vb-side-menu__link" to="" aria-label={menu.patients}>
            <TeamOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.patients}</span>
          </Link>
        </section>


        {/** SETTINGS */}
        <section className="vb-side-menu__group" aria-label={menu.settings}>
          <div className="vb-side-menu__separator">{menu.settings}</div>

          {/** MY CLINIC */}
          {(user?.role === 'clinic' || user?.role === 'therapist') && (
            <NavLink className={({ isActive }) => `vb-side-menu__link${isActive ? ' vb-side-menu__link--active' : ''}`} to={user.clinic ? `/clinic-detail/${encodeURIComponent(user.clinic)}` : '/clinic-detail'} aria-label={menu.clinic}>
              <BankOutlined className="vb-side-menu__link--icon" />
              <span className="vb-side-menu__link--text">{menu.clinic}</span>
            </NavLink>
          )}

          {/** MY PROFILE */}
          <Link className="vb-side-menu__link" to="" aria-label={menu.profile}>
            <UserOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.profile}</span>
          </Link>
          {/** HELP */}
          <Link className="vb-side-menu__link" to="" aria-label={menu.help}>
            <QuestionCircleOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.help}</span>
          </Link>
        </section>
      </nav>

      {/** LOGOUT */}
      <div className="vb-side-menu__footer">
        <button type="button" className="vb-side-menu__link" onClick={logout} aria-label={menu.logout}>
          <LogoutOutlined className="vb-side-menu__link--icon" />
          <span className="vb-side-menu__link--text">{menu.logout}</span>
        </button>
      </div>
    </aside>
  )
}
