import { Module } from '@nestjs/common';
import { dynamooseInstance } from './dynamoose.config';
import { DynamooseTransactionManager } from './dynamoose-transaction.manager';

@Module({
  providers: [
    DynamooseTransactionManager,
    {
      provide: 'DYNAMOOSE',
      useValue: dynamooseInstance,
    },
  ],
  exports: ['DYNAMOOSE', DynamooseTransactionManager],
})
export class DynamooseModule {}
