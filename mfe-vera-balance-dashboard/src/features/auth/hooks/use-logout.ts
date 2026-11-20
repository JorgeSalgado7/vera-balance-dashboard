import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../store/hooks'
import { clearSession } from '../application/store/session/session.slice'
import { resetLogin } from '../application/store/login/login.slice'

export const useLogout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return () => {
    dispatch(clearSession())
    dispatch(resetLogin())
    navigate('/', { replace: true })
  }
}
