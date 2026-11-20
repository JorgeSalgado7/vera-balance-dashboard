import { useState } from 'react'
import type { LoginUseCase } from '../application/use-cases/login.use-case'
import type { LoginDto } from '../application/dtos/login.dto'
import { setSession, clearSession } from '../application/store/session/session.slice'
import { resetLogin } from '../application/store/login/login.slice'
import { useAppDispatch } from '../../../store/hooks'
import { locales } from '../../../locales'

export const useLogin = (useCase: LoginUseCase) => {
  const dispatch = useAppDispatch()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const submitLogin = async (input: LoginDto): Promise<boolean> => {
    if (pending) return false
    setPending(true)
    setError('')
    dispatch(clearSession())
    try {
      const session = await useCase.execute(input)
      dispatch(setSession(session))
      dispatch(resetLogin())
      return true
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : locales.api.requestError)
      return false
    } finally {
      setPending(false)
    }
  }

  return { submitLogin, pending, error }
}
