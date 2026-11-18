import { useState } from 'react'
import type { RequestPasswordRecoveryUseCase } from '../application/use-cases/request-password-recovery.use-case'
import { isEmail } from '../../../shared/validations/is-email'
import { locales } from '../../../locales'

export const useRequestPasswordRecovery = (useCase: RequestPasswordRecoveryUseCase) => {
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const texts = locales.auth.login.email
  const emailErrorMessage = !email.trim() ? texts.required : !isEmail(email) ? texts.invalid : ''
  const emailError = Boolean(emailErrorMessage)

  const changeEmail = (value: string) => {
    setEmail(value)
    setEmailTouched(true)
    setError('')
    setMessage('')
  }

  const requestCode = async (): Promise<boolean> => {
    if (emailError || pending) return false
    setPending(true)
    setError('')
    setMessage('')
    try {
      setMessage(await useCase.execute(email))
      return true
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : locales.auth.passwordRecovery.requestError)
      return false
    } finally {
      setPending(false)
    }
  }

  return { email, changeEmail, emailTouched, emailError, emailErrorMessage, pending, error, message, requestCode }
}
