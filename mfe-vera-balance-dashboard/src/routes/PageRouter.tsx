import { BrowserRouter,Route, Routes } from 'react-router-dom'
import { Login } from '../features/auth/pages/Login'
import { LoginUseCase } from '../features/auth/application/use-cases/login.use-case'
import { LoginAdapter } from '../features/auth/infrastructure/adapters/login.adapter'
import { PasswordRecovery } from '../features/auth/pages/PasswordRecovery'
import { ResetPassword } from '../features/auth/pages/ResetPassword'
import { RequestPasswordRecoveryUseCase } from '../features/auth/application/use-cases/request-password-recovery.use-case'
import { ResetPasswordUseCase } from '../features/auth/application/use-cases/reset-password.use-case'
import { RequestPasswordRecoveryAdapter } from '../features/auth/infrastructure/adapters/request-password-recovery.adapter'
import { ResetPasswordAdapter } from '../features/auth/infrastructure/adapters/reset-password.adapter'
import { Dashboard } from '../features/dashboard/pages/Dashboard'

const loginUseCase = new LoginUseCase(new LoginAdapter())
const requestRecovery = new RequestPasswordRecoveryUseCase(new RequestPasswordRecoveryAdapter())
const resetPassword = new ResetPasswordUseCase(new ResetPasswordAdapter())

export const PageRouter = () => (
  <BrowserRouter>
    <Routes>

			{/** AUTH */}
      <Route path="/" element={<Login loginUseCase={loginUseCase} />} />
      <Route path="/forgot-password" element={<PasswordRecovery requestRecovery={requestRecovery} />} />
      <Route path="/reset-password" element={<ResetPassword requestRecovery={requestRecovery} resetPassword={resetPassword} />} />
    
			{/** AUTH */}
			<Route path="/dashboard" element={<Dashboard />} />

		</Routes>
  </BrowserRouter>
)
