import { CreateClinicUseCase } from '../../../application/use-cases/create-clinic.use-case'
import { CreateClinicDomainService } from '../../../domain/services/create-clinic.domain-service'
import { ValidateCreateClinicDomainService } from '../../../domain/services/validate-create-clinic.domain-service'
import { InvalidClinicFieldError, InvalidClinicTherapyTypesError } from '../../../domain/errors/clinic.error'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'
import type { ResolveClinicTherapyTypesUseCase } from '../../../application/use-cases/resolve-clinic-therapy-types.use-case'
import type { EnsureDefaultTherapyTypesUseCase } from '../../../../therapy-types/application/use-cases/ensure-default-therapy-types.use-case'

const defaults = ['Individual', 'Pareja', 'Familiar', 'Infantil'].map((name, index) => ({
  id: `default-${index}`, name, icon: ['UserOutlined', 'HeartOutlined', 'TeamOutlined', 'SmileOutlined'][index],
  created_at: '2026-11-12T10:30:00.000Z', updated_at: '2026-11-12T10:30:00.000Z',
}))
const publicDefaults = defaults.map(({ id, name, icon }) => ({ id, name, icon }))

describe('CreateClinicUseCase', () => {
  const repository = { create: jest.fn(async entity => entity) }
  const therapies = { execute: jest.fn() }
  const defaultTherapies = { execute: jest.fn() }
  const useCase = new CreateClinicUseCase(new CreateClinicDomainService(new ValidateCreateClinicDomainService()),
    repository as unknown as IClinicRepository, therapies as unknown as ResolveClinicTherapyTypesUseCase,
    defaultTherapies as unknown as EnsureDefaultTherapyTypesUseCase)
  const input = { name: ' Clínica ', address: ' Centro ', phone_number: ' 555 ', status: 'Activo' as const }
  beforeEach(() => {
    jest.clearAllMocks()
    therapies.execute.mockResolvedValue([])
    defaultTherapies.execute.mockResolvedValue(defaults)
  })
  afterEach(() => jest.restoreAllMocks())

  it('creates a clinic without a therapy selection, stores IDs and returns defaults without persistence fields or extra timestamps', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1794483000000)
    const result = await useCase.execute(input)
    const saved = repository.create.mock.calls[0][0]
    expect(saved).toMatchObject({ sk: 'CLINIC', gsi1pk: 'CLINIC', gsi1sk: `CLINIC#${result.id}`, therapy_types: defaults.map(item => item.id) })
    expect(result).toMatchObject({ name: 'Clínica', address: 'Centro', phone_number: '555', therapy_types: publicDefaults,
      created_at: new Date(1794483000000).toISOString(), updated_at: new Date(1794483000000).toISOString() })
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(result).not.toHaveProperty('pk')
    expect(result).not.toHaveProperty('logo')
    expect(saved).not.toHaveProperty('logo')
    expect(result.therapy_types[0]).not.toHaveProperty('created_at')
    expect(defaultTherapies.execute).toHaveBeenCalledTimes(1)
  })

  it('assigns the four defaults even when the selection is explicitly empty', async () => {
    expect((await useCase.execute({ ...input, therapy_types: [] })).therapy_types).toEqual(publicDefaults)
  })

  it('adds supplied therapies and deduplicates IDs already included among the defaults', async () => {
    therapies.execute.mockResolvedValueOnce([publicDefaults[0], { id: 'additional-id', name: 'Otra terapia', icon: 'other.svg' }])
    const result = await useCase.execute({ ...input, therapy_types: ['default-0', 'additional-id'] })
    expect(therapies.execute).toHaveBeenCalledWith(['default-0', 'additional-id'])
    expect(result.therapy_types).toEqual([...publicDefaults, { id: 'additional-id', name: 'Otra terapia', icon: 'other.svg' }])
    expect(repository.create.mock.calls[0][0].therapy_types).toEqual(['default-0', 'default-1', 'default-2', 'default-3', 'additional-id'])
  })

  it.each(['name', 'address', 'phone_number', 'status'])('rejects missing %s before any writes', async field => {
    await expect(useCase.execute({ ...input, [field]: undefined })).rejects.toBeInstanceOf(InvalidClinicFieldError)
    expect(repository.create).not.toHaveBeenCalled()
    expect(defaultTherapies.execute).not.toHaveBeenCalled()
  })

  it.each([{ therapy_types: null }, { therapy_types: 'invalid' }, { therapy_types: ['id', 'id'] }, { therapy_types: [2] }])('rejects an invalid explicit selection %j before creating defaults', async ({ therapy_types }) => {
    await expect(useCase.execute({ ...input, therapy_types } as never)).rejects.toBeInstanceOf(InvalidClinicFieldError)
    expect(defaultTherapies.execute).not.toHaveBeenCalled()
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('rejects unknown supplied IDs before creating defaults or persisting the clinic', async () => {
    therapies.execute.mockRejectedValueOnce(new InvalidClinicTherapyTypesError())
    await expect(useCase.execute({ ...input, therapy_types: ['unknown'] })).rejects.toBeInstanceOf(InvalidClinicTherapyTypesError)
    expect(repository.create).not.toHaveBeenCalled()
    expect(defaultTherapies.execute).not.toHaveBeenCalled()
  })

  it('does not persist a clinic if preparing its defaults fails', async () => {
    defaultTherapies.execute.mockRejectedValueOnce(new Error('default creation failed'))
    await expect(useCase.execute(input)).rejects.toThrow('default creation failed')
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('propagates clinic persistence failures', async () => {
    repository.create.mockRejectedValueOnce(new Error('database unavailable'))
    await expect(useCase.execute(input)).rejects.toThrow('database unavailable')
  })
})
