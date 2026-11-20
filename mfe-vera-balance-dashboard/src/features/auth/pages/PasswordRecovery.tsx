import { Button } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../../layouts/auth/AuthLayout'
import { locales } from '../../../locales'
import { VBInputEmail } from '../../../ui/components/inputs/VBInputEmail'
import type { PasswordRecoveryI } from './interfaces/password-recovery.interface'
import { usePublishAlert } from '../../../shared/hooks/use-publish-alert'
import { useRequestPasswordRecovery } from '../hooks/use-request-password-recovery'

export const PasswordRecovery = ({ requestRecovery }: PasswordRecoveryI) => {
  
	const recovery = useRequestPasswordRecovery(requestRecovery)
  const navigate = useNavigate()
  const texts = locales.auth.passwordRecovery
  usePublishAlert('auth-recovery', recovery.error, 'error')

  return (

    <AuthLayout>

      <div className="vb-auth__recovery">

        <h3>{texts.title}</h3>
        <p>{texts.description}</p>


        
				{/** EMAIL */}
				<VBInputEmail
          value={recovery.email}
          setValue={recovery.changeEmail}
          disabled={recovery.pending}
          label={locales.auth.login.email.label}
          placeholder={locales.auth.login.email.placeholder}
          hasError={recovery.emailTouched && recovery.emailError}
          errorMessage={recovery.emailErrorMessage}
        />

				{/** GET RECOVERY CODE */}
        <Button 
					block 
					type="primary" 
					loading={recovery.pending} 
					disabled={recovery.emailError || recovery.pending}
          onClick={async () => {
            const message = await recovery.requestCode()
            if (message !== null) navigate('/reset-password', { 
							state: { email: recovery.email, message } 
						})
          }}
				>
          {texts.requestCode}
        </Button>

      </div>

			{/** BACK TO LOGIN */}
      <Link className="vb-auth__link" to="/">{texts.backToLogin}</Link>

    </AuthLayout>

  )

}
