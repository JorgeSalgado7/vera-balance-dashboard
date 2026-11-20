//* INTERFACES
import type { BreadcrumbI } from './interfaces/breadcrumb.interface'

//* LOCALES
import { locales } from '../../../locales'

export const Breadcrumb = ({ userName, pageTitle }: BreadcrumbI) => {
  const texts = locales.dashboard.breadcrumb

  return (
    <div className="vb-breadcrumb">

      {/** WELCOME */}
      <h1 className="vb-breadcrumb__welcome">
        <span className="vb-breadcrumb__greeting">{texts.welcome}</span>
        {userName && <> <span className="vb-breadcrumb__name">{userName}</span></>}
      </h1>

      {/** CURRENT PAGE */}
      <nav className="vb-breadcrumb__navigation" aria-label={texts.navigation}>
        <span className="vb-breadcrumb__route" aria-current="page">
          {pageTitle}
        </span>
      </nav>

    </div>
  )
}
