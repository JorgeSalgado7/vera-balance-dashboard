//* INTERFACES
import type { SideMenuI } from './interfaces/side-menu.interface'

//* REACT ROUTER
import { Link } from "react-router-dom"

//* ANT DESIGN
import { Button } from 'antd'

//* ICONS
import { AppstoreOutlined, SolutionOutlined, TeamOutlined, UserOutlined, QuestionCircleOutlined, LogoutOutlined } from '@ant-design/icons'

//* LOCALES
import { locales } from '../../locales'

export const SideMenu = ({ isOpen }: SideMenuI) => {
  const menu = locales.dashboard.sideMenu

  return (
    <aside id="dashboard-side-menu" className={`vb-side-menu ${isOpen ? ' vb-side-menu--open' : ''}`}>
      <nav className="vb-side-menu__navigation" aria-label={menu.navigation}>

        {/** DASHBOARD */}
        <section className="vb-side-menu__group" aria-label={menu.dashboard}>
          <div className="vb-side-menu__separator">{menu.dashboard}</div>
          <Link className="vb-side-menu__link" to="/dashboard">
            <AppstoreOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.dashboard}</span>
          </Link>
        </section>


        {/** THERAPEUTIC PROCESS */}
        <section className="vb-side-menu__group" aria-label={menu.therapeuticProcess}>
          <div className="vb-side-menu__separator">{menu.therapeuticProcess}</div>
          <Link className="vb-side-menu__link" to="/">
            <SolutionOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.therapeuticProcess}</span>
          </Link>
          {/** PATIENTS */}
          <Link className="vb-side-menu__link" to="">
            <TeamOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.patients}</span>
          </Link>
        </section>


        {/** SETTINGS */}
        <section className="vb-side-menu__group" aria-label={menu.settings}>
          <div className="vb-side-menu__separator">{menu.settings}</div>

          {/** MY PROFILE */}
          <Link className="vb-side-menu__link" to="">
            <UserOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.profile}</span>
          </Link>
          {/** HELP */}
          <Link className="vb-side-menu__link" to="">
            <QuestionCircleOutlined className="vb-side-menu__link--icon" />
            <span className="vb-side-menu__link--text">{menu.help}</span>
          </Link>
        </section>
      </nav>

      {/** LOGOUT */}
      <div className="vb-side-menu__footer">
        <Button block type="primary" icon={<LogoutOutlined />}>
          {menu.logout}
        </Button>
      </div>
    </aside>
  )
}
