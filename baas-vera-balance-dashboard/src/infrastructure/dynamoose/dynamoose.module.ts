import { Module } from '@nestjs/common';
import { dynamooseInstance } from './dynamoose.config';

@Module({
  providers: [
    {
      provide: 'DYNAMOOSE',
      useValue: dynamooseInstance,
    },
  ],
  exports: ['DYNAMOOSE'],
})
export class DynamooseModule {}
