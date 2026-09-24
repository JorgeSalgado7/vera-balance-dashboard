import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { METHOD_METADATA, PATH_METADATA, VERSION_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { CreateUserController } from '../../../presentation/controllers/create-user.controller';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../../../application/dtos/create-user.dto';
import { UserErrorTranslator } from '../../../presentation/errors/user-error.translator';
import { MissingUserClinicError, UserEmailAlreadyExistsError } from '../../../domain/errors/user.error';
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util';

const validDto = {
  name: 'Mónica', email: 'monica@example.com', password: 'secret password',
  professional_license: '123', clinic_id: '7cb3a81a-e137-4ef4-aafd-6e387c8c7390', role: 'therapist'
};

describe('CreateUserController', () => {
  let module: TestingModule;
  let controller: CreateUserController;
  const useCase = { execute: jest.fn() };
  const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
  const validate = (body: unknown) => pipe.transform(body, { type: 'body', metatype: CreateUserDto });

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      controllers: [CreateUserController],
      providers: [{ provide: CreateUserUseCase, useValue: useCase }]
    }).compile();
    controller = module.get(CreateUserController);
  });

  afterEach(async () => { await module.close(); });

  it('should expose POST /v1/users with status 201', () => {
    expect(Reflect.getMetadata(PATH_METADATA, CreateUserController)).toBe('users');
    expect(Reflect.getMetadata(VERSION_METADATA, controller.execute)).toBe('1');
    expect(Reflect.getMetadata(METHOD_METADATA, controller.execute)).toBe(1);
    expect(Reflect.getMetadata(HTTP_CODE_METADATA, controller.execute)).toBe(201);
  });

  it.each(['clinic', 'therapist'])('should validate and delegate a valid %s request', async role => {
    const dto = await validate({ ...validDto, role });
    const response = { id: 'user-id', clinic: { id: validDto.clinic_id } };
    useCase.execute.mockResolvedValue(response);
    expect(await controller.execute(dto)).toBe(response);
    expect(useCase.execute).toHaveBeenCalledWith(dto);
  });

  it.each(['name', 'email', 'password', 'professional_license', 'clinic_id', 'role'])('should reject omitted %s', async field => {
    const body: Record<string, unknown> = { ...validDto };
    delete body[field];
    await expect(validate(body)).rejects.toMatchObject({ status: 400 });
  });

  it.each(['name', 'email', 'password', 'professional_license', 'clinic_id', 'role'])('should reject invalid values for %s', async field => {
    for (const value of ['', '  ', null, 123, {}]) {
      await expect(validate({ ...validDto, [field]: value })).rejects.toMatchObject({ status: 400 });
    }
  });

  it.each([{ email: 'invalid' }, { role: 'admin' }, { clinic_id: 'invalid' }, { status: 'inactive' },
    { passwordHash: 'injected' }, { pk: 'injected' }, { created_at: 'injected' }])('should reject invalid or unsolicited fields %j', async changes => {
    await expect(validate({ ...validDto, ...changes })).rejects.toMatchObject({ status: 400 });
  });

  it.each([
    [new MissingUserClinicError(), 400],
    [new UserEmailAlreadyExistsError(), 409]
  ])('should translate domain errors into HTTP problems', (error, status) => {
    try {
      UserErrorTranslator.translate(error, '/v1/users');
      throw new Error('Expected translation');
    } catch (problem) {
      expect(problem).toBeInstanceOf(HttpProblem);
      expect((problem as HttpProblem).getStatus()).toBe(status);
      expect((problem as HttpProblem).getResponse()).toMatchObject({ instance: '/v1/users' });
    }
  });
});
