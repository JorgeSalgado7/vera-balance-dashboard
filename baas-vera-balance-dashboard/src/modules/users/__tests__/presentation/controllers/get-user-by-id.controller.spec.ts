import type { ArgumentsHost } from '@nestjs/common';
import { HttpProblemFilter } from '../../../../../shared/http-problem/http-problem.filter';
import { UserNotFoundError, UserEmailAlreadyExistsError, InvalidUserStatusError } from '../../../domain/errors/user.error';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA, VERSION_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByIdController } from '../../../presentation/controllers/get-user-by-id.controller';
import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case';

describe('GetUserByIdController', () => {
  let module: TestingModule;
  let controller: GetUserByIdController;
  const useCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      controllers: [GetUserByIdController],
      providers: [{ provide: GetUserByIdUseCase, useValue: useCase }]
    }).compile();
    controller = module.get(GetUserByIdController);
  });

  afterEach(async () => { await module.close(); });

  it('should expose GET /v1/users/:id', () => {
    expect(Reflect.getMetadata(PATH_METADATA, GetUserByIdController)).toBe('users');
    expect(Reflect.getMetadata(PATH_METADATA, controller.execute)).toBe(':id');
    expect(Reflect.getMetadata(VERSION_METADATA, controller.execute)).toBe('1');
    expect(Reflect.getMetadata(METHOD_METADATA, controller.execute)).toBe(RequestMethod.GET);
  });

  it('should delegate the user ID and return the public response', async () => {
    const response = { id: 'user-id', name: 'Mónica' };
    useCase.execute.mockResolvedValue(response);
    expect(await controller.execute('user-id')).toBe(response);
    expect(useCase.execute).toHaveBeenCalledWith('user-id');
  });
});

describe('User HTTP errors', () => {
  it.each([
    [new UserNotFoundError(), '/v1/users/missing', 404],
    [new UserNotFoundError(), '/v1/users/missing/status', 404],
    [new InvalidUserStatusError(), '/v1/users/user-id/status', 400],
    [new UserEmailAlreadyExistsError(), '/v1/users/user-id', 409]
  ])('should translate %j into an HTTP problem', (error, instance, status) => {
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const host = { switchToHttp: () => ({ getResponse: () => response, getRequest: () => ({ originalUrl: instance }) }) };
    new HttpProblemFilter().catch(error, host as unknown as ArgumentsHost);
    expect(response.status).toHaveBeenCalledWith(status);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ status, instance }));
  });
});
