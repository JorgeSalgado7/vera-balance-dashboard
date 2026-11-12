import { LoggerModule } from './shared/logger/logger.module';
//* Nest
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

//* Infrastructure
import './infrastructure/dynamoose/dynamoose.config';

//* Modules
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

import { TherapyTypesModule } from './modules/therapy-types/therapy-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
		UsersModule,
		TherapyTypesModule,
		AuthModule
  ],
})
export class AppModule {}
