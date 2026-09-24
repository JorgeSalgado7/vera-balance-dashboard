import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA, VERSION_METADATA, HTTP_CODE_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserController } from '../../../presentation/controllers/delete-user.controller';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case';

describe('DeleteUserController', () => {
  let module: TestingModule;
  let controller: DeleteUserController;
  const useCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      controllers: [DeleteUserController],
      providers: [{ provide: DeleteUserUseCase, useValue: useCase }]
    }).compile();
    controller = module.get(DeleteUserController);
  });

  afterEach(async () => { await module.close(); });

  it('should expose DELETE /v1/users/:id', () => {
    expect(Reflect.getMetadata(PATH_METADATA, DeleteUserController)).toBe('users');
    expect(Reflect.getMetadata(PATH_METADATA, controller.execute)).toBe(':id');
    expect(Reflect.getMetadata(VERSION_METADATA, controller.execute)).toBe('1');
    expect(Reflect.getMetadata(METHOD_METADATA, controller.execute)).toBe(RequestMethod.DELETE);
    expect(Reflect.getMetadata(HTTP_CODE_METADATA, controller.execute)).toBe(204);
  });

  it('should delete by ID and return no body', async () => {
    useCase.execute.mockResolvedValue(undefined);
    await expect(controller.execute('user-id')).resolves.toBeUndefined();
    expect(useCase.execute).toHaveBeenCalledWith('user-id');
  });
});
