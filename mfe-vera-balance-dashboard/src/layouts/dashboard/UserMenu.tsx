//* REACT
import { useState } from 'react'

//* ANT DESIGN
import { Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'

//* REACT ROUTER
import { Link } from 'react-router-dom'

//* INTERFACES
import type { UserMenuI } from './interfaces/user-menu.interface'

//* INITIALS
import { getInitials } from '../../shared/strings/get-initials'

//* LOCALES
import { locales } from '../../locales'

export const UserMenu = ({ userName, onLogout }: UserMenuI) => {
  const [isOpen, setOpen] = useState(false)
  const menu = locales.dashboard.sideMenu
  const profile = locales.dashboard.header.profile

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      open={isOpen}
      onOpenChange={setOpen}
      popupRender={menuContent => (
        <div className="vb-user-menu__panel">

          {/** USER PROFILE */}
          <div className="vb-user-menu__profile">
            <div className="vb-user-menu__profile-avatar" aria-hidden="true">{getInitials(userName)}</div>
            <p className="vb-user-menu__name">{userName}</p>
          </div>

          {/** SEPARATOR */}
          <div className="vb-user-menu__separator" role="separator" />

          {/** PROFILE LINKS */}
          {menuContent}

        </div>
      )}
      classNames={{ root: 'vb-user-menu__popup', menu: 'vb-user-menu__menu', item: 'vb-user-menu__item', itemIcon: 'vb-user-menu__icon' }}
      menu={{
        items: [
          { key: 'profile', icon: <UserOutlined />, label: <Link to="">{menu.profile}</Link> },
          { key: 'logout', icon: <LogoutOutlined />, label: menu.logout },
        ],
        onClick: ({ key }) => {
          setOpen(false)
          if (key === 'logout') onLogout()
        },
      }}
    >
      {/** USER AVATAR */}
      <button
        type="button"
        className="vb-user-menu"
        aria-label={userName ? `${profile}: ${userName}` : profile}
        title={userName || profile}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {getInitials(userName)}
      </button>
    </Dropdown>
  )
}
