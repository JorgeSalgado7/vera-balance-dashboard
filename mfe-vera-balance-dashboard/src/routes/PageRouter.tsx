import { BrowserRouter,Route, Routes } from 'react-router-dom'
import { Login } from '../features/auth/pages/Login'
import { PasswordRecovery } from '../features/auth/pages/PasswordRecovery'
import { RequestPasswordRecoveryUseCase } from '../features/auth/application/use-cases/request-password-recovery.use-case'
import { ResetPasswordUseCase } from '../features/auth/application/use-cases/reset-password.use-case'
import { RequestPasswordRecoveryAdapter } from '../features/auth/infrastructure/adapters/request-password-recovery.adapter'
import { ResetPasswordAdapter } from '../features/auth/infrastructure/adapters/reset-password.adapter'

const requestRecovery = new RequestPasswordRecoveryUseCase(new RequestPasswordRecoveryAdapter())
const resetPassword = new ResetPasswordUseCase(new ResetPasswordAdapter())

export const PageRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<PasswordRecovery requestRecovery={requestRecovery} resetPassword={resetPassword} />} />
    </Routes>
  </BrowserRouter>
)
