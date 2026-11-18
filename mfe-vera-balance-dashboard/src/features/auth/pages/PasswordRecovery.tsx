import { Alert, Button } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../../layouts/auth/AuthLayout'
import { locales } from '../../../locales'
import { VBInputEmail } from '../../../ui/components/inputs/VBInputEmail'
import type { RequestPasswordRecoveryUseCase } from '../application/use-cases/request-password-recovery.use-case'
import { useRequestPasswordRecovery } from '../hooks/use-request-password-recovery'

export const PasswordRecovery = ({ requestRecovery }: {
  requestRecovery: RequestPasswordRecoveryUseCase
}) => {
  const recovery = useRequestPasswordRecovery(requestRecovery)
  const navigate = useNavigate()
  const texts = locales.auth.passwordRecovery

  return (
    <AuthLayout>
      <div className="vb-auth__recovery">
        <h3>{texts.title}</h3>
        <p>{texts.description}</p>
        {recovery.error && <Alert type="error" title={recovery.error} showIcon role="alert" />}
        <VBInputEmail
          value={recovery.email}
          setValue={recovery.changeEmail}
          disabled={recovery.pending}
          label={locales.auth.login.email.label}
          placeholder={locales.auth.login.email.placeholder}
          hasError={recovery.emailTouched && recovery.emailError}
          errorMessage={recovery.emailErrorMessage}
        />
        <Button block type="primary" loading={recovery.pending} disabled={recovery.emailError || recovery.pending}
          onClick={async () => {
            const message = await recovery.requestCode()
            if (message !== null) navigate('/reset-password', { state: { email: recovery.email, message } })
          }}>
          {texts.requestCode}
        </Button>
      </div>
      <Link className="vb-auth__link" to="/">{texts.backToLogin}</Link>
    </AuthLayout>
  )
}
