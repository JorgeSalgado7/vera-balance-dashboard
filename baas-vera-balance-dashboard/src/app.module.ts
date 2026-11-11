//* Nest
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

//* Infrastructure
import './infrastructure/dynamoose/dynamoose.config';

//* Modules
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
		UsersModule,
		AuthModule
  ],
})
export class AppModule {}
