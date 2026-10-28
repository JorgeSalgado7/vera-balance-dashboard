jest.mock('@nestjs/core', () => ({ NestFactory: { create: jest.fn() } }))
jest.mock('@nestjs/swagger', () => ({ SwaggerModule: { createDocument: jest.fn(), setup: jest.fn() } }))
jest.mock('../app.module', () => ({ AppModule: class AppModule {} }))
jest.mock('../docs/openapi.header', () => ({ openApiHeader: { info: { title: 'test-documentation' } } }))

describe('Application bootstrap', () => {
  const previousPort = process.env.PORT

  afterEach(() => {
    if (previousPort === undefined) delete process.env.PORT
    else process.env.PORT = previousPort
    jest.resetModules()
  })

  it.each([undefined, '4001'])('configures HTTP, validation and docs before listening on %s', async (port) => {
    if (port === undefined) delete process.env.PORT
    else process.env.PORT = port
    const { NestFactory } = require('@nestjs/core')
    const { SwaggerModule } = require('@nestjs/swagger')
    const { AppModule } = require('../app.module')
    const { openApiHeader } = require('../docs/openapi.header')
    const app = { enableCors: jest.fn(), useGlobalPipes: jest.fn(), useGlobalFilters: jest.fn(), listen: jest.fn().mockResolvedValue(undefined) }
    NestFactory.create.mockResolvedValue(app)
    SwaggerModule.createDocument.mockReturnValue({ documentation: true })
    require('../main')
    await Promise.resolve()
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule)
    expect(app.enableCors).toHaveBeenCalledWith({
      origin: '*',
      methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Authorization',
      exposedHeaders: ['Content-Disposition', 'Content-Length'],
    })
    expect(app.useGlobalFilters).toHaveBeenCalledTimes(1)
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, openApiHeader)
    expect(SwaggerModule.setup).toHaveBeenCalledWith('docs', app, { documentation: true })
    expect(app.listen).toHaveBeenCalledWith(port ?? 3000)
    const pipe = app.useGlobalPipes.mock.calls[0][0]
    expect(pipe).toMatchObject({ isTransformEnabled: true, validatorOptions: expect.objectContaining({ whitelist: true, forbidNonWhitelisted: true }) })
    const problem = pipe.exceptionFactory([
      { property: 'parent', constraints: { required: 'parent required' }, children: [{ property: 'email', constraints: { email: 'email invalid' } }] },
      { property: 'empty', children: [] },
      { property: 'noChildren' },
    ])
    expect(problem.getStatus()).toBe(400)
    expect(problem.getResponse()).toMatchObject({ errors: [{ message: 'parent required' }, { message: 'email invalid' }] })
    expect(pipe.exceptionFactory([]).getResponse()).not.toHaveProperty('errors')
  })
})
