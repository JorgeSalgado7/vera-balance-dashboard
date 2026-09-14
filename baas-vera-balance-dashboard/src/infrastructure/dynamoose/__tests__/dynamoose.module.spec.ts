import { Test } from '@nestjs/testing';
import { DynamooseModule } from '../dynamoose.module';

describe('DynamooseModule', () => {
  it('should provide DYNAMOOSE instance', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DynamooseModule],
    }).compile();

    const dynamooseInstance = moduleRef.get('DYNAMOOSE');

    expect(dynamooseInstance).toBeDefined();
    expect(dynamooseInstance.aws).toBeDefined();
    expect(dynamooseInstance.model).toBeDefined();
  });
});
