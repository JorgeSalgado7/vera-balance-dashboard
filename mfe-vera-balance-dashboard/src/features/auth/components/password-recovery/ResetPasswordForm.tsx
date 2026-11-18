import { Alert, Button } from 'antd'
import { locales } from '../../../../locales'
import { VBInputText } from '../../../../ui/components/inputs/VBInputText'
import { VBInputPassword } from '../../../../ui/components/inputs/VBInputPassword'
import type { useRequestPasswordRecovery } from '../../hooks/use-request-password-recovery'
import type { useResetPassword } from '../../hooks/use-reset-password'

export const ResetPasswordForm = ({ recovery, reset, onChangeEmail }: {
  recovery: ReturnType<typeof useRequestPasswordRecovery>
  reset: ReturnType<typeof useResetPassword>
  onChangeEmail: () => void
}) => {
  const texts = locales.auth.passwordRecovery
  const pending = recovery.pending || reset.pending

  return (
    <div className="vb-auth__recovery">
      <h3>{texts.resetTitle}</h3>
      <p>{texts.resetDescription}</p>
      <p>{texts.emailLabel}: {recovery.email}</p>
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
        onClick={async () => { if (await recovery.requestCode()) reset.clear() }}>
        {texts.resend}
      </Button>
      <p>{texts.resendHint}</p>
      <Button block type="link" disabled={pending} onClick={onChangeEmail}>{texts.changeEmail}</Button>
    </div>
  )
}
