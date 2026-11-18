import { useState } from 'react'
import type { ResetPasswordUseCase } from '../application/use-cases/reset-password.use-case'
import { isEmail } from '../../../shared/validations/is-email'
import { locales } from '../../../locales'

export const useResetPassword = (useCase: ResetPasswordUseCase, email: string) => {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [touched, setTouched] = useState({ code: false, password: false, confirmation: false })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [succeeded, setSucceeded] = useState(false)
  const texts = locales.auth.passwordRecovery
  const codeErrorMessage = !code ? texts.code.required : !/^[0-9]{6}$/.test(code) ? texts.code.invalid : ''
  const passwordErrorMessage = !password.trim() ? locales.auth.login.password.required : ''
  const confirmationErrorMessage = !confirmation.trim() ? texts.confirmation.required : confirmation !== password ? texts.confirmation.mismatch : ''
  const codeError = Boolean(codeErrorMessage)
  const passwordError = Boolean(passwordErrorMessage)
  const confirmationError = Boolean(confirmationErrorMessage)

  const changeCode = (value: string) => {
    setCode(value)
    setTouched(previous => ({ ...previous, code: true }))
    setError('')
  }

  const changePassword = (value: string) => {
    setPassword(value)
    setTouched(previous => ({ ...previous, password: true }))
    setError('')
  }

  const changeConfirmation = (value: string) => {
    setConfirmation(value)
    setTouched(previous => ({ ...previous, confirmation: true }))
    setError('')
  }

  const clear = () => {
    setCode('')
    setPassword('')
    setConfirmation('')
    setTouched({ code: false, password: false, confirmation: false })
    setError('')
    setMessage('')
    setSucceeded(false)
  }

  const resetPassword = async () => {
    if (pending || codeError || passwordError || confirmationError || !isEmail(email)) return
    setPending(true)
    setError('')
    try {
      setMessage(await useCase.execute({ email, code, password, password_confirmation: confirmation }))
      setSucceeded(true)
      setCode('')
      setPassword('')
      setConfirmation('')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : locales.api.requestError)
    } finally {
      setPending(false)
    }
  }

  return {
    code, password, confirmation, touched, pending, error, message, succeeded,
    codeError, codeErrorMessage, passwordError, passwordErrorMessage, confirmationError, confirmationErrorMessage,
    changeCode, changePassword, changeConfirmation, clear, resetPassword,
  }
}
