import { useState } from 'react'
import type { RequestPasswordRecoveryUseCase } from '../application/use-cases/request-password-recovery.use-case'
import { isEmail } from '../../../shared/validations/is-email'
import { locales } from '../../../locales'

export const useRequestPasswordRecovery = (useCase: RequestPasswordRecoveryUseCase, initialEmail = '', initialMessage = '') => {
  const [email, setEmail] = useState(initialEmail)
  const [emailTouched, setEmailTouched] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(initialMessage)
  const texts = locales.auth.login.email
  const emailErrorMessage = !email.trim() ? texts.required : !isEmail(email) ? texts.invalid : ''
  const emailError = Boolean(emailErrorMessage)

  const changeEmail = (value: string) => {
    setEmail(value)
    setEmailTouched(true)
    setError('')
    setMessage('')
  }

  const requestCode = async (): Promise<string | null> => {
    if (emailError || pending) return null
    setPending(true)
    setError('')
    setMessage('')
    try {
      const result = await useCase.execute(email)
      setMessage(result)
      return result
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : locales.api.requestError)
      return null
    } finally {
      setPending(false)
    }
  }

  return { email, changeEmail, emailTouched, emailError, emailErrorMessage, pending, error, message, requestCode }
}
