import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { UpdateTherapeuticProcessStatusDto } from '../../../application/dtos/update-therapeutic-process-status.dto'
import { input } from '../../fixtures/process.fixture'

describe('UpdateTherapeuticProcessStatusDto', () => {
  it('accepts documented input', async () => { expect(await validate(plainToInstance(UpdateTherapeuticProcessStatusDto, { status: 'Activo' }))).toEqual([]) })
  it('rejects null status', async () => { expect((await validate(plainToInstance(UpdateTherapeuticProcessStatusDto, { ...{ status: 'Activo' }, status: null }))).map(error => error.property)).toContain('status') })
  it.each(['status'])('requires %s', async field => { const data = { ...{ status: 'Activo' } }; Reflect.deleteProperty(data, field); expect((await validate(plainToInstance(UpdateTherapeuticProcessStatusDto, data))).map(error => error.property)).toContain(field) })
  it.each(['Activo', 'Dado de alta', 'Proceso interrupido', 'Cancelado'])('accepts catalog status %s', async status => { expect(await validate(plainToInstance(UpdateTherapeuticProcessStatusDto, { status }))).toEqual([]) })
  it('rejects unknown status', async () => { expect((await validate(plainToInstance(UpdateTherapeuticProcessStatusDto, { status: 'Otro' }))).length).toBeGreaterThan(0) })
})
