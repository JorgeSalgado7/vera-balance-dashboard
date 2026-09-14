import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import './infrastructure/dynamoose/dynamoose.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
