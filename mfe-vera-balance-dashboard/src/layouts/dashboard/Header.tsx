//* REDUX
import { useAppSelector } from '../../store/hooks'

//* COMPONENTS
import { UserMenu } from './UserMenu'

//* SESSION
import { useLogout } from '../../features/auth/hooks/use-logout'

//* INTERFACES
import type { HeaderI } from './interfaces/header.interface'

//* LOCALES
import { locales } from '../../locales'

export const Header = ({ isOpen, setOpen }: HeaderI) => {
  const logout = useLogout()
  const texts = locales.dashboard.header
  const userName = useAppSelector(state => state.session.user?.name ?? '')

  return (
    <header className="vb-header">
      <div className="vb-container">

        {/** MENU TOGGLE */}
        <button
          type="button"
          className={`vb-header__toggle${isOpen ? ' vb-header__toggle--open' : ''}`}
          aria-label={isOpen ? texts.closeMenu : texts.openMenu}
          aria-expanded={isOpen}
          aria-controls="dashboard-side-menu"
          onClick={event => {
            event.stopPropagation()
            setOpen(!isOpen)
          }}
        >
          <span className="vb-header__toggle-line" aria-hidden="true" />
          <span className="vb-header__toggle-line" aria-hidden="true" />
          <span className="vb-header__toggle-line" aria-hidden="true" />
        </button>

        {/** USER MENU */}
        <UserMenu userName={userName} onLogout={() => {
          setOpen(false)
          logout()
        }} />

      </div>
    </header>
  )
}
