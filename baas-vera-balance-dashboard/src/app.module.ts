//* Nest
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

//* Infrastructure
import './infrastructure/dynamoose/dynamoose.config';

//* Modules


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  
  ],
})
export class AppModule {}
