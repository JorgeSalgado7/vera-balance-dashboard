import { openApiHeader } from '../openapi.header'

describe('OpenAPI header', () => {
  it('declares the application identity and supported OpenAPI version', () => {
    expect(openApiHeader.openapi).toBe('3.1.0')
    expect(openApiHeader.info).toMatchObject({ title: 'baas-vera-balance-dashboard', version: '1.0.0' })
    expect(openApiHeader.info.description).toContain('API REST para la gestión de Vera Balance.')
  })

  it('declares the relative server, module tags and global bearer authentication', () => {
    expect(openApiHeader.servers).toEqual([expect.objectContaining({ url: '/' })])
    expect(openApiHeader.tags?.map((tag) => tag.name)).toEqual(['Auth', 'Users', 'Clinics', 'Patients', 'Therapy Types', 'Therapeutic Processes', 'Records', 'HomeWorks'])
    expect(openApiHeader.components?.securitySchemes).toMatchObject({ bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } })
    expect(openApiHeader.security).toEqual([{ bearerAuth: [] }])
  })
})
