import { Button } from 'antd'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import { setEmail, setPassword, setEmailError, setPasswordError, setEmailErrorMessage, setPasswordErrorMessage } from '../../application/store/login/login.slice'
import { isEmail } from '../../../../shared/validations/is-email'
import { locales } from '../../../../locales'
import { VBInputEmail } from '../../../../ui/components/inputs/VBInputEmail'
import { VBInputPassword } from '../../../../ui/components/inputs/VBInputPassword'

export const LoginForm = () => {
  const dispatch = useAppDispatch()
  const { email, password, emailError, passwordError, emailErrorMessage, passwordErrorMessage } = useAppSelector(state => state.login)
  const login = locales.auth.login

  const validateEmail = (value: string) => {
    const errorMessage = !value.trim() ? login.email.required : !isEmail(value) ? login.email.invalid : ''
    dispatch(setEmailError(Boolean(errorMessage)))
    dispatch(setEmailErrorMessage(errorMessage))
  }

  const validatePassword = (value: string) => {
    const hasError = !value.trim()
    dispatch(setPasswordError(hasError))
    dispatch(setPasswordErrorMessage(hasError ? login.password.required : ''))
  }

  return (
    <div className="vb-auth__login">
      <VBInputEmail
        value={email}
        setValue={value => {
          dispatch(setEmail(value))
          validateEmail(value)
        }}
        label={login.email.label}
        placeholder={login.email.placeholder}
        hasError={emailError}
        errorMessage={emailErrorMessage}
      />
      <VBInputPassword
        value={password}
        setValue={value => {
          dispatch(setPassword(value))
          validatePassword(value)
        }}
        label={login.password.label}
        placeholder={login.password.placeholder}
        hasError={passwordError}
        errorMessage={passwordErrorMessage}
      />
      <Button block className="vb-auth__login--login" type="primary" disabled={emailError || passwordError}>
        {login.login}
      </Button>
      <Link className="vb-auth__link" to="/forgot-password">{login.forgotPassword}</Link>
    </div>
  )
}
