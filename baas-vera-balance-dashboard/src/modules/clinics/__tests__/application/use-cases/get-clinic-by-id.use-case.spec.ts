import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), {
  pk: 'clinic-id', gsi1sk: 'CLINIC#clinic-id', name: 'Clínica', logo: null, address: 'Centro',
  phone_number: '555', therapy_types: ['therapy-id'], status: 'Activo',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
})
import { GetClinicByIdUseCase } from '../../../application/use-cases/get-clinic-by-id.use-case'
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'
import type { ResolveClinicTherapyTypesUseCase } from '../../../application/use-cases/resolve-clinic-therapy-types.use-case'
describe('GetClinicByIdUseCase', () => {
  const repository = { findById: jest.fn() }
  const therapies = { execute: jest.fn() }
  const useCase = new GetClinicByIdUseCase(repository as unknown as IClinicRepository, therapies as unknown as ResolveClinicTherapyTypesUseCase)
  beforeEach(() => { jest.clearAllMocks(); repository.findById.mockResolvedValue(clinic()); therapies.execute.mockResolvedValue([{ id: 'therapy-id', name: 'Individual', icon: null }]) })
  it('returns public clinic fields and complete therapy details', async () => {
    const response = await useCase.execute('clinic-id')
    const result = response
    expect(result).toMatchObject({ id: 'clinic-id', therapy_types: [{ id: 'therapy-id', name: 'Individual', icon: null }] })
    expect(result).not.toHaveProperty('pk')
    expect(therapies.execute).toHaveBeenCalledWith(['therapy-id'])
  })
  it('rejects an unknown clinic', async () => {
    repository.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(ClinicNotFoundError)
  })
  it('propagates database failures', async () => {
    repository.findById.mockRejectedValueOnce(new Error('database unavailable'))
    await expect(useCase.execute('clinic-id')).rejects.toThrow('database unavailable')
  })
})
