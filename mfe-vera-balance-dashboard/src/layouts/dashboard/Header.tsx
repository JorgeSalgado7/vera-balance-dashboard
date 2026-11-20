//* INTERFACES
import type { HeaderI } from './interfaces/header.interface'

//* LOCALES
import { locales } from '../../locales'

export const Header = ({ isOpen, setOpen }: HeaderI) => {
  const texts = locales.dashboard.header

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

        {/** USER INITIALS */}
        <div className="vb-header__avatar" role="img" aria-label={texts.profile} title={texts.profile}>
        </div>

      </div>
    </header>
  )
}
