import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { TherapyTypesModule } from '../therapy-types.module'
import { openApiHeader } from '../../../docs/openapi.header'
import { GetTherapyTypeByIdUseCase } from '../application/use-cases/get-therapy-type-by-id.use-case'

jest.mock('../infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: {} }))

describe('TherapyTypesModule composition', () => {
  it('composes all five operations and their independent DTOs', async () => {
    const module = await Test.createTestingModule({ imports: [TherapyTypesModule] }).compile()
    const app = module.createNestApplication()
    try {
      const document = SwaggerModule.createDocument(app, openApiHeader)
      const collection = document.paths['/therapy-types']!
      const individual = document.paths['/therapy-types/{therapyTypeId}']!
      expect(collection.post!.responses).toHaveProperty('201')
      expect(collection.get!.responses).toHaveProperty('200')
      expect(individual.get!.responses).toHaveProperty('200')
      expect(individual.patch!.responses).toHaveProperty('200')
      expect(individual.delete!.responses).toHaveProperty('204')
      for (const operation of [collection.post, collection.get, individual.get, individual.patch, individual.delete]) {
        expect(operation!.security ?? []).toEqual([])
      }
      expect(module.get(GetTherapyTypeByIdUseCase)).toBeInstanceOf(GetTherapyTypeByIdUseCase)
      expect(document.components!.schemas!.CreateTherapyTypeDto).toMatchObject({ required: ['name'] })
      expect(document.components!.schemas!.CreateTherapyTypeResponseDto).toMatchObject({ required: ['id', 'name', 'icon', 'created_at', 'updated_at'] })
    } finally { await app.close() }
  })
})
