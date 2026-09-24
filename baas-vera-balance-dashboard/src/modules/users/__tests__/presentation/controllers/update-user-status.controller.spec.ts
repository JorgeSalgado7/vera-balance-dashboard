import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA, VERSION_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserStatusController } from '../../../presentation/controllers/update-user-status.controller';
import { UpdateUserStatusUseCase } from '../../../application/use-cases/update-user-status.use-case';
import { UpdateUserStatusDto } from '../../../application/dtos/update-user-status.dto';

describe('UpdateUserStatusController', () => {
  let module: TestingModule;
  let controller: UpdateUserStatusController;
  const useCase = { execute: jest.fn() };
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const validate = (body: unknown) => pipe.transform(body, { type: 'body', metatype: UpdateUserStatusDto });

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      controllers: [UpdateUserStatusController],
      providers: [{ provide: UpdateUserStatusUseCase, useValue: useCase }]
    }).compile();
    controller = module.get(UpdateUserStatusController);
  });

  afterEach(async () => { await module.close(); });

  it('should expose PATCH /v1/users/:id/status', () => {
    expect(Reflect.getMetadata(PATH_METADATA, UpdateUserStatusController)).toBe('users');
    expect(Reflect.getMetadata(PATH_METADATA, controller.execute)).toBe(':id/status');
    expect(Reflect.getMetadata(VERSION_METADATA, controller.execute)).toBe('1');
    expect(Reflect.getMetadata(METHOD_METADATA, controller.execute)).toBe(RequestMethod.PATCH);
    expect(Reflect.getMetadata(HTTP_CODE_METADATA, controller.execute)).toBe(200);
  });

  it('should validate the body and delegate to the use case', async () => {
    const dto = await validate({ status: 'inactive' });
    const response = { id: 'user-id', status: 'inactive' };
    useCase.execute.mockResolvedValue(response);
    expect(await controller.execute('user-id', dto)).toBe(response);
    expect(useCase.execute).toHaveBeenCalledWith('user-id', dto);
  });

  it.each(['active', 'inactive'])('should accept %s', async status => {
    await expect(validate({ status })).resolves.toMatchObject({ status });
  });

  it.each([{}, { status: null }, { status: 'disabled' }, { status: '' }, { status: ' ' },
    { status: 1 }, { status: {} }, { status: 'active', name: 'Changed' },
    { status: 'active', password: 'secret' }, { status: 'active', clinic_id: null },
    { status: 'active', updated_at: 'injected' }])('should reject invalid or extra fields %j', async body => {
    await expect(validate(body)).rejects.toMatchObject({ status: 400 });
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
