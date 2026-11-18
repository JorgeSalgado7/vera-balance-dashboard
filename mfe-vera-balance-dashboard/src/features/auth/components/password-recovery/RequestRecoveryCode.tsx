import { Alert, Button } from 'antd'
import { locales } from '../../../../locales'
import { VBInputEmail } from '../../../../ui/components/inputs/VBInputEmail'
import type { useRequestPasswordRecovery } from '../../hooks/use-request-password-recovery'

export const RequestRecoveryCode = ({ recovery, onContinue }: {
  recovery: ReturnType<typeof useRequestPasswordRecovery>
  onContinue: () => void
}) => {
  const texts = locales.auth.passwordRecovery

  return (
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
        onClick={async () => { if (await recovery.requestCode()) onContinue() }}>
        {texts.requestCode}
      </Button>
    </div>
  )
}
