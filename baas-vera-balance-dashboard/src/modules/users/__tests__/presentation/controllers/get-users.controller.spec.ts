import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA, VERSION_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { GetUsersController } from '../../../presentation/controllers/get-users.controller';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';

describe('GetUsersController', () => {
  let module: TestingModule;
  let controller: GetUsersController;
  const useCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      controllers: [GetUsersController],
      providers: [{ provide: GetUsersUseCase, useValue: useCase }]
    }).compile();
    controller = module.get(GetUsersController);
  });

  afterEach(async () => { await module.close(); });

  it('should expose GET /v1/users', () => {
    expect(Reflect.getMetadata(PATH_METADATA, GetUsersController)).toBe('users');
    expect(Reflect.getMetadata(VERSION_METADATA, controller.execute)).toBe('1');
    expect(Reflect.getMetadata(METHOD_METADATA, controller.execute)).toBe(RequestMethod.GET);
  });

  it.each([[], [{ id: 'user-id', name: 'Mónica' }]])('should delegate the query and return %j', async (...users) => {
    useCase.execute.mockResolvedValue(users);
    expect(await controller.execute()).toBe(users);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
    expect(useCase.execute).toHaveBeenCalledWith();
  });
});
