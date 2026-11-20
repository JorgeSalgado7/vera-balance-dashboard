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
import { ClinicDetail } from '../features/clinics/pages/ClinicDetail'
import { GetClinicUseCase } from '../features/clinics/application/use-cases/get-clinic.use-case'
import { GetClinicTherapistsUseCase } from '../features/clinics/application/use-cases/get-clinic-therapists.use-case'
import { UpdateClinicUseCase } from '../features/clinics/application/use-cases/update-clinic.use-case'
import { GetClinicAdapter } from '../features/clinics/infrastructure/adapters/get-clinic.adapter'
import { GetClinicTherapistsAdapter } from '../features/clinics/infrastructure/adapters/get-clinic-therapists.adapter'
import { UpdateClinicTherapistUseCase } from '../features/clinics/application/use-cases/update-clinic-therapist.use-case'
import { UpdateClinicTherapistStatusUseCase } from '../features/clinics/application/use-cases/update-clinic-therapist-status.use-case'
import { UpdateClinicTherapistStatusAdapter } from '../features/clinics/infrastructure/adapters/update-clinic-therapist-status.adapter'
import { UpdateClinicTherapistAdapter } from '../features/clinics/infrastructure/adapters/update-clinic-therapist.adapter'
import { UpdateClinicAdapter } from '../features/clinics/infrastructure/adapters/update-clinic.adapter'
import { Dashboard } from '../features/dashboard/pages/Dashboard'

const loginUseCase = new LoginUseCase(new LoginAdapter())
const requestRecovery = new RequestPasswordRecoveryUseCase(new RequestPasswordRecoveryAdapter())
const resetPassword = new ResetPasswordUseCase(new ResetPasswordAdapter())

const clinicDetail = {
  getClinic: new GetClinicUseCase(new GetClinicAdapter()),
  getTherapists: new GetClinicTherapistsUseCase(new GetClinicTherapistsAdapter()),
  updateClinic: new UpdateClinicUseCase(new UpdateClinicAdapter()),
  updateTherapist: new UpdateClinicTherapistUseCase(new UpdateClinicTherapistAdapter()),
  updateTherapistStatus: new UpdateClinicTherapistStatusUseCase(new UpdateClinicTherapistStatusAdapter()),
}

export const PageRouter = () => (
  <BrowserRouter>
    <Routes>

			{/** AUTH */}
      <Route path="/" element={<Login loginUseCase={loginUseCase} />} />
      <Route path="/forgot-password" element={<PasswordRecovery requestRecovery={requestRecovery} />} />
      <Route path="/reset-password" element={<ResetPassword requestRecovery={requestRecovery} resetPassword={resetPassword} />} />
    
			{/** AUTH */}
			<Route path="/dashboard" element={<Dashboard />} />

      {/** CLINICS */}
      <Route path="/clinic-detail" element={<ClinicDetail {...clinicDetail} />} />
      <Route path="/clinic-detail/:clinicId" element={<ClinicDetail {...clinicDetail} />} />

		</Routes>
  </BrowserRouter>
)
