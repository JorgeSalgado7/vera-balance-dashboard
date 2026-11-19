import { Alert, Button } from 'antd'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../../layouts/auth/AuthLayout'
import { locales } from '../../../locales'
import type { ResetPasswordI } from './interfaces/reset-password.interface'
import { useRequestPasswordRecovery } from '../hooks/use-request-password-recovery'
import { useResetPassword } from '../hooks/use-reset-password'
import { VBInputText } from '../../../ui/components/inputs/VBInputText'
import { VBInputEmail } from '../../../ui/components/inputs/VBInputEmail'
import { VBInputPassword } from '../../../ui/components/inputs/VBInputPassword'

export const ResetPassword = ({ requestRecovery, resetPassword }: ResetPasswordI) => {
  const location = useLocation()
  const navigate = useNavigate()
  const email = typeof location.state?.email === 'string' ? location.state.email : ''
  const message = typeof location.state?.message === 'string' ? location.state.message : ''
  const recovery = useRequestPasswordRecovery(requestRecovery, email, message)
  const reset = useResetPassword(resetPassword, recovery.email)
  const texts = locales.auth.passwordRecovery
  const pending = recovery.pending || reset.pending

  if (recovery.emailError) return <Navigate to="/forgot-password" replace />

  return (
    <AuthLayout>
      {reset.succeeded ? (
        <div className="vb-auth__recovery">
          <h3>{texts.successTitle}</h3>
          <Alert type="success" title={reset.message} showIcon role="status" />
        </div>
      ) : (
        <div className="vb-auth__recovery">
          <h3>{texts.resetTitle}</h3>
          <p>{texts.resetDescription}</p>
          <VBInputEmail
            value={recovery.email}
            setValue={recovery.changeEmail}
            disabled
            label={texts.emailLabel}
            placeholder={locales.auth.login.email.placeholder}
            hasError={recovery.emailError}
            errorMessage={recovery.emailErrorMessage}
          />
          {recovery.message && <Alert type="info" title={recovery.message} showIcon role="status" />}
          {(reset.error || recovery.error) && <Alert type="error" title={reset.error || recovery.error} showIcon role="alert" />}
          <VBInputText
            value={reset.code} setValue={reset.changeCode} disabled={pending} autoComplete="one-time-code"
            label={texts.code.label} placeholder={texts.code.placeholder}
            hasError={reset.touched.code && reset.codeError} errorMessage={reset.codeErrorMessage}
          />
          <VBInputPassword
            value={reset.password} setValue={reset.changePassword} disabled={pending} autoComplete="new-password"
            label={texts.password.label} placeholder={texts.password.placeholder}
            hasError={reset.touched.password && reset.passwordError} errorMessage={reset.passwordErrorMessage}
          />
          <VBInputPassword
            value={reset.confirmation} setValue={reset.changeConfirmation} disabled={pending} autoComplete="new-password"
            label={texts.confirmation.label} placeholder={texts.confirmation.placeholder}
            hasError={reset.touched.confirmation && reset.confirmationError} errorMessage={reset.confirmationErrorMessage}
          />
          <Button block type="primary" loading={reset.pending}
            disabled={pending || reset.codeError || reset.passwordError || reset.confirmationError}
            onClick={() => { void reset.resetPassword() }}>
            {texts.reset}
          </Button>
          <Button block type="link" loading={recovery.pending} disabled={pending}
            onClick={async () => { if (await recovery.requestCode() !== null) reset.clear() }}>
            {texts.resend}
          </Button>
          <p>{texts.resendHint}</p>
          <Button block type="link" disabled={pending} onClick={() => {
            reset.clear()
            navigate('/forgot-password')
          }}>{texts.changeEmail}</Button>
        </div>
      )}
      <Link className="vb-auth__link" to="/">{texts.backToLogin}</Link>
    </AuthLayout>
  )
}
