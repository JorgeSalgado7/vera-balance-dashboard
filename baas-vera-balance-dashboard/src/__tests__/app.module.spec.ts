jest.mock('../modules/records/infrastructure/persistance/models/record.model', () => ({ RecordModel: {} }))
jest.mock('../modules/therapeutic-processes/infrastructure/persistance/models/therapeutic-process.model', () => ({ TherapeuticProcessModel: {} }))
jest.mock('../modules/therapeutic-processes/infrastructure/persistance/models/patient-therapeutic-process.model', () => ({ PatientTherapeuticProcessModel: {} }))
jest.mock('../modules/patients/infrastructure/persistance/models/patient.model', () => ({ PatientModel: {} }))
jest.mock('../modules/clinics/infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: {} }))
import { Test } from '@nestjs/testing'
import { PasswordHasher } from '@nestjs/authentication'
import { CreateUserUseCase } from '../modules/users/application/use-cases/create-user.use-case'
import { PasswordHashService } from '../modules/auth/infrastructure/services/password-hash.service'
import { AppModule } from '../app.module'

jest.mock('../modules/therapy-types/infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: {} }))

jest.mock('../modules/users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))

describe('AppModule composition', () => {
  it('composes public endpoints, login and password hashing', async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile()
    expect(module.get(CreateUserUseCase)).toBeInstanceOf(CreateUserUseCase)
    expect(module.get('IHashPasswordService')).toBe(module.get(PasswordHashService))
    expect(module.get(PasswordHasher)).toBeInstanceOf(PasswordHasher)
    await module.close()
  })
})
