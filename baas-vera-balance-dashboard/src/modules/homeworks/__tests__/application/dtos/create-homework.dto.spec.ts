import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { CreateHomeworkDto } from '../../../application/dtos/create-homework.dto'
import { input } from '../../fixtures/homework.fixture'
const valid = input
async function fields(data: unknown) { return (await validate(plainToInstance(CreateHomeworkDto, data), { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property) }
describe('CreateHomeworkDto', () => {
  it('accepts documented input', async () => { expect(await fields(valid)).toEqual([]) })
  it.each([null, 12, '', [], {}].map(description => ({ description })))('rejects invalid descriptions $description', async ({ description }) => { expect(await fields({ ...valid, description })).toContain('description') })
  it('rejects unknown fields', async () => { expect(await fields({ ...valid, unexpected: 'x' })).toContain('unexpected') })
  it.each(["description", "record"])("requires %s", async field => { const data = { ...valid }; Reflect.deleteProperty(data, field); expect(await fields(data)).toContain(field) })
  it('rejects a client-supplied therapeutic process ID', async () => {
    expect(await fields({ ...valid, therapeutic_process: 'other-process' })).toContain('therapeutic_process')
  })

})
