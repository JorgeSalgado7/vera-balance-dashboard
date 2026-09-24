import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA, VERSION_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserController } from '../../../presentation/controllers/update-user.controller';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case';
import { UpdateUserDto } from '../../../application/dtos/update-user.dto';

describe('UpdateUserController', () => {
  let module: TestingModule;
  let controller: UpdateUserController;
  const useCase = { execute: jest.fn() };
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const validate = (body: unknown) => pipe.transform(body, { type: 'body', metatype: UpdateUserDto });

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      controllers: [UpdateUserController],
      providers: [{ provide: UpdateUserUseCase, useValue: useCase }]
    }).compile();
    controller = module.get(UpdateUserController);
  });

  afterEach(async () => { await module.close(); });

  it('should expose PUT /v1/users/:id', () => {
    expect(Reflect.getMetadata(PATH_METADATA, UpdateUserController)).toBe('users');
    expect(Reflect.getMetadata(PATH_METADATA, controller.execute)).toBe(':id');
    expect(Reflect.getMetadata(VERSION_METADATA, controller.execute)).toBe('1');
    expect(Reflect.getMetadata(METHOD_METADATA, controller.execute)).toBe(RequestMethod.PUT);
    expect(Reflect.getMetadata(HTTP_CODE_METADATA, controller.execute)).toBe(200);
  });

  it('should validate the body and delegate to the use case', async () => {
    const dto = await validate({ status: 'inactive' });
    const response = { id: 'user-id', status: 'inactive' };
    useCase.execute.mockResolvedValue(response);
    expect(await controller.execute('user-id', dto)).toBe(response);
    expect(useCase.execute).toHaveBeenCalledWith('user-id', dto);
  });

  it('should allow partial updates and an empty update', async () => {
    await expect(validate({})).resolves.toEqual({});
    await expect(validate({ name: 'Ana' })).resolves.toMatchObject({ name: 'Ana' });
    await expect(validate({ name: 'Ana', email: 'ana@example.com', professional_license: '123',
      clinic_id: '7cb3a81a-e137-4ef4-aafd-6e387c8c7390', role: 'clinic', status: 'active'
    })).resolves.toMatchObject({ role: 'clinic', status: 'active' });
  });

  it.each(['name', 'email', 'professional_license', 'clinic_id', 'role', 'status'])(
    'should reject empty or null %s', async field => {
      for (const value of ['', '  ', null, 123, {}]) {
        await expect(validate({ [field]: value })).rejects.toMatchObject({ status: 400 });
      }
    }
  );

  it.each([{ password: 'new secret' }, { passwordHash: 'hash' }, { pk: 'id' }, { sk: 'USER' },
    { created_at: 'injected' }, { updated_at: 'injected' }, { email: 'invalid' },
    { clinic_id: 'invalid' }, { role: 'admin' }, { status: 'disabled' }
  ])('should reject invalid and protected fields %j', async body => {
    await expect(validate(body)).rejects.toMatchObject({ status: 400 });
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
