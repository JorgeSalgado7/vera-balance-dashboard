//* Nest
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

//* Infrastructure
import './infrastructure/dynamoose/dynamoose.config';

//* Modules
import { ClinicsModule } from './modules/clinics/clinics.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClinicsModule,
    UsersModule,
  ],
})
export class AppModule {}
