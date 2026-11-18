import { Card } from 'antd'
import type { PropsWithChildren } from 'react'
import { locales } from '../../locales'

export const AuthLayout = ({ children }: PropsWithChildren) => (
  <main className="vb-auth">
    <div className="vb-container">
      <div className="vb-auth__image">
        <img src="/Logo.svg" alt={locales.auth.login.logoAlt} />
      </div>
      <Card>{children}</Card>
    </div>
  </main>
)
