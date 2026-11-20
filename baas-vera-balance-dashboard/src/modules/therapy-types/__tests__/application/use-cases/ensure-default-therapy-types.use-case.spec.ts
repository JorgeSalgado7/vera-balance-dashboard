import { EnsureDefaultTherapyTypesUseCase } from '../../../application/use-cases/ensure-default-therapy-types.use-case'
import { GetTherapyTypesUseCase } from '../../../application/use-cases/get-therapy-types.use-case'
import { CreateTherapyTypeUseCase } from '../../../application/use-cases/create-therapy-type.use-case'
import { CreateTherapyTypeDomainService } from '../../../domain/services/create-therapy-type.domain-service'
import { UpdateTherapyTypeUseCase } from '../../../application/use-cases/update-therapy-type.use-case'
import { UpdateTherapyTypeDomainService } from '../../../domain/services/update-therapy-type.domain-service'
import { TherapyTypeEntity } from '../../../domain/entities/therapy-type.entity'

const names = ['Individual', 'Pareja', 'Familiar', 'Infantil']
const icons: Record<string, string> = { Individual: 'UserOutlined', Pareja: 'HeartOutlined', Familiar: 'TeamOutlined', Infantil: 'SmileOutlined' }
const now = '2026-11-12T10:30:00.000Z'
const existing = (name: string) => Object.assign(new TherapyTypeEntity(), {
  pk: `existing-${name}`, name, icon: icons[name] ?? 'custom.svg',
  gsi1sk: `THERAPY_TYPE#existing-${name}`, created_at: now, updated_at: now,
})

describe('EnsureDefaultTherapyTypesUseCase', () => {
  let records: TherapyTypeEntity[]
  const repository = { create: jest.fn(), findAll: jest.fn(), findById: jest.fn(), findByIds: jest.fn(), update: jest.fn(), delete: jest.fn(), isAssignedToClinic: jest.fn() }
  const useCase = new EnsureDefaultTherapyTypesUseCase(new GetTherapyTypesUseCase(repository),
    new CreateTherapyTypeUseCase(new CreateTherapyTypeDomainService(), repository),
    new UpdateTherapyTypeUseCase(new UpdateTherapyTypeDomainService(), repository))

  beforeEach(() => {
    jest.resetAllMocks()
    records = []
    repository.findAll.mockImplementation(async () => records)
    repository.create.mockImplementation(async (entity: TherapyTypeEntity) => { records.push(entity); return entity })
    repository.findById.mockImplementation(async (id: string) => records.find(item => item.pk === id))
    repository.update.mockImplementation(async (entity: TherapyTypeEntity, changes: Partial<TherapyTypeEntity>, updatedAt: string) => Object.assign(entity, changes, { updated_at: updatedAt }))
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse(now))
  })
  afterEach(() => jest.restoreAllMocks())

  it('creates all four defaults using the existing create flow with UUIDs, stable Ant Design icon names and ISO timestamps', async () => {
    const result = await useCase.execute()
    expect(result.map(item => item.name)).toEqual(names)
    expect(repository.create).toHaveBeenCalledTimes(4)
    expect(new Set(result.map(item => item.id)).size).toBe(4)
    for (const therapy of result) {
      expect(therapy.id).toMatch(/^[0-9a-f-]{36}$/)
      expect(therapy).toMatchObject({ icon: icons[therapy.name], created_at: now, updated_at: now })
      expect(therapy).not.toHaveProperty('pk')
    }
    for (const record of records) {
      expect(record).toMatchObject({ sk: 'THERAPY_TYPE', gsi1pk: 'THERAPY_TYPE', gsi1sk: `THERAPY_TYPE#${record.pk}` })
    }
  })

  it('reuses existing defaults without changing their IDs, icons or timestamps', async () => {
    records = names.map(existing)
    const result = await useCase.execute()
    expect(result.map(item => item.id)).toEqual(records.map(item => item.pk))
    expect(result.map(item => item.icon)).toEqual(records.map(item => item.icon))
    expect(repository.create).not.toHaveBeenCalled()
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('updates null or custom icons on existing defaults without changing IDs or creating new types', async () => {
    records = names.map(existing)
    records[0].icon = null
    records[1].icon = 'old-icon.svg'
    records[0].updated_at = '2026-01-01T00:00:00.000Z'
    const ids = records.map(item => item.pk)
    const result = await useCase.execute()
    expect(result.map(item => item.id)).toEqual(ids)
    expect(result.map(item => item.icon)).toEqual(names.map(name => icons[name]))
    expect(result[0].created_at).toBe(now)
    expect(result[0].updated_at).toBe(now)
    expect(repository.update).toHaveBeenCalledTimes(2)
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('propagates icon update failures', async () => {
    records = [Object.assign(existing('Individual'), { icon: null })]
    repository.update.mockRejectedValueOnce(new Error('icon update failed'))
    await expect(useCase.execute()).rejects.toThrow('icon update failed')
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('creates only missing defaults and preserves unrelated therapies', async () => {
    records = [existing('Infantil'), existing('Otra terapia'), existing('Pareja')]
    const result = await useCase.execute()
    expect(result.map(item => item.name)).toEqual(names)
    expect(repository.create.mock.calls.map(([entity]) => entity.name)).toEqual(['Individual', 'Familiar'])
    expect(records.some(item => item.name === 'Otra terapia')).toBe(true)
  })

  it('reuses defaults on subsequent requests when they are visible in the global listing', async () => {
    const first = await useCase.execute()
    const second = await useCase.execute()
    expect(second).toEqual(first)
    expect(repository.create).toHaveBeenCalledTimes(4)
  })

  it('matches the exact documented names instead of reusing a differently named type', async () => {
    records = [existing('individual')]
    expect((await useCase.execute())[0].name).toBe('Individual')
    expect(repository.create).toHaveBeenCalledTimes(4)
  })

  it('propagates listing failures without attempting writes', async () => {
    repository.findAll.mockRejectedValueOnce(new Error('query failed'))
    await expect(useCase.execute()).rejects.toThrow('query failed')
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('propagates a creation failure and reuses already created global types on retry', async () => {
    repository.create.mockImplementationOnce(async (entity: TherapyTypeEntity) => { records.push(entity); return entity })
      .mockRejectedValueOnce(new Error('write failed'))
    await expect(useCase.execute()).rejects.toThrow('write failed')
    expect(records.map(item => item.name)).toEqual(['Individual'])
    const firstId = records[0].pk
    const result = await useCase.execute()
    expect(result.map(item => item.name)).toEqual(names)
    expect(result[0].id).toBe(firstId)
    expect(records).toHaveLength(4)
  })
})
