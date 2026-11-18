import { useState } from 'react'
import { Alert } from 'antd'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../../layouts/auth/AuthLayout'
import { locales } from '../../../locales'
import type { RequestPasswordRecoveryUseCase } from '../application/use-cases/request-password-recovery.use-case'
import type { ResetPasswordUseCase } from '../application/use-cases/reset-password.use-case'
import { useRequestPasswordRecovery } from '../hooks/use-request-password-recovery'
import { useResetPassword } from '../hooks/use-reset-password'
import { RequestRecoveryCode } from '../components/password-recovery/RequestRecoveryCode'
import { ResetPasswordForm } from '../components/password-recovery/ResetPasswordForm'

export const PasswordRecovery = ({ requestRecovery, resetPassword }: {
  requestRecovery: RequestPasswordRecoveryUseCase
  resetPassword: ResetPasswordUseCase
}) => {
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const recovery = useRequestPasswordRecovery(requestRecovery)
  const reset = useResetPassword(resetPassword, recovery.email)
  const texts = locales.auth.passwordRecovery

  return (
    <AuthLayout>
      {reset.succeeded ? (
        <div className="vb-auth__recovery">
          <h3>{texts.successTitle}</h3>
          <Alert type="success" title={reset.message} showIcon role="status" />
        </div>
      ) : step === 'request' ? (
        <RequestRecoveryCode recovery={recovery} onContinue={() => setStep('reset')} />
      ) : (
        <ResetPasswordForm recovery={recovery} reset={reset} onChangeEmail={() => {
          reset.clear()
          setStep('request')
        }} />
      )}
      <Link className="vb-auth__link" to="/">{texts.backToLogin}</Link>
    </AuthLayout>
  )
}
