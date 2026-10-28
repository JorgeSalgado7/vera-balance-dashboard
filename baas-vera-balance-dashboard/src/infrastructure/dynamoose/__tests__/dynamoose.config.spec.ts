jest.mock('dynamoose', () => ({
  aws: {
    ddb: {
      local: jest.fn(),
      set: jest.fn(),
      DynamoDB: jest.fn(function (options) {
        return { options }
      }),
    },
  },
}))

describe('Dynamoose environment configuration', () => {
  const original = { NODE_ENV: process.env.NODE_ENV, AWS_REGION: process.env.AWS_REGION, DYNAMO_ENDPOINT: process.env.DYNAMO_ENDPOINT }

  afterEach(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    jest.resetModules()
  })

  it.each([
    ['development', undefined, 'us-east-1', 'http://localhost:8000'],
    ['production', 'eu-west-1', 'eu-west-1', undefined],
  ] as const)('configures %s without provisioning tables', (environment, region, expectedRegion, expectedEndpoint) => {
    process.env.NODE_ENV = environment
    process.env.DYNAMO_ENDPOINT = 'http://localhost:8000'
    if (region === undefined) delete process.env.AWS_REGION
    else process.env.AWS_REGION = region
    jest.isolateModules(() => {
      const dynamoose = require('dynamoose')
      const { dynamooseInstance } = require('../dynamoose.config')
      expect(dynamooseInstance.aws).toBe(dynamoose.aws)
      expect(dynamoose.aws.ddb.DynamoDB).toHaveBeenCalledWith({ region: expectedRegion, endpoint: expectedEndpoint })
      expect(dynamoose.aws.ddb.set).toHaveBeenCalledWith(expect.objectContaining({ options: { region: expectedRegion, endpoint: expectedEndpoint } }))
      if (environment === 'production') expect(dynamoose.aws.ddb.local).not.toHaveBeenCalled()
      else expect(dynamoose.aws.ddb.local).toHaveBeenCalledWith('http://localhost:8000')
    })
  })
})
