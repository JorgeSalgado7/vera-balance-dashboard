import { RequestMethod, VersioningType } from '@nestjs/common';
import type { ArgumentsHost, INestApplication } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA, VERSION_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GetClinicByUserIdController } from '../../../presentation/controllers/get-clinic-by-user-id.controller';
import { GetClinicByUserIdUseCase } from '../../../application/use-cases/get-clinic-by-user-id.use-case';
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error';
import { HttpProblemFilter } from '../../../../../shared/http-problem/http-problem.filter';

describe('GetClinicByUserIdController', () => {
  let module: TestingModule;
  let controller: GetClinicByUserIdController;
  let app: INestApplication;
  const useCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      controllers: [GetClinicByUserIdController],
      providers: [{ provide: GetClinicByUserIdUseCase, useValue: useCase }]
    }).compile();
    controller = module.get(GetClinicByUserIdController);
    app = module.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI });
    await app.init();
  });

  afterEach(async () => { await app.close(); });

  it('should expose GET /v1/clinics/user/:userId', () => {
    expect(Reflect.getMetadata(PATH_METADATA, GetClinicByUserIdController)).toBe('clinics');
    expect(Reflect.getMetadata(PATH_METADATA, controller.execute)).toBe('user/:userId');
    expect(Reflect.getMetadata(VERSION_METADATA, controller.execute)).toBe('1');
    expect(Reflect.getMetadata(METHOD_METADATA, controller.execute)).toBe(RequestMethod.GET);
  });

  it('should delegate the user ID and return the clinic', async () => {
    const response = { id: 'clinic-id', name: 'Vera Balance', logo: null };
    useCase.execute.mockResolvedValue(response);
    expect(await controller.execute('user-id')).toBe(response);
    expect(useCase.execute).toHaveBeenCalledWith('user-id');
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should document the complete OpenAPI response', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Test').build());
    const operation = document.paths['/v1/clinics/user/{userId}'].get!;
    expect(operation.responses['200']).toMatchObject({
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ClinicByUserResponseDto' } } }
    });
    expect(document.components!.schemas!.ClinicByUserResponseDto).toMatchObject({
      required: ['id', 'name', 'logo', 'address', 'phone_number', 'therapy_types', 'status', 'created_at', 'updated_at'],
      properties: {
        status: { enum: ['active', 'inactive'] },
        created_at: { format: 'date-time' }, updated_at: { format: 'date-time' }
      }
    });
  });

  it('should propagate missing associations and translate them to HTTP 404', async () => {
    const error = new ClinicNotFoundError();
    useCase.execute.mockRejectedValue(error);
    await expect(controller.execute('user-id')).rejects.toThrow(error);
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const host = { switchToHttp: () => ({ getResponse: () => response,
      getRequest: () => ({ originalUrl: '/v1/clinics/user/user-id' }) }) };
    new HttpProblemFilter().catch(error, host as unknown as ArgumentsHost);
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ status: 404, detail: error.message }));
  });
});
