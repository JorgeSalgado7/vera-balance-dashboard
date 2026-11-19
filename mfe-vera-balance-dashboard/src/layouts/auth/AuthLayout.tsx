import { Card } from 'antd'
import type { AuthLayoutI } from './interfaces/auth-layout.interface'
import { locales } from '../../locales'

export const AuthLayout = ({ children }: AuthLayoutI) => (

  <main className="vb-auth">

    <div className="vb-container">

			{/** LOGO */}
      <div className="vb-auth__image">
        <img src="/Logo.svg" alt={locales.auth.login.logoAlt} />
      </div>

			{/** FORM */}
      <Card>{children}</Card>

    </div>

  </main>

)
