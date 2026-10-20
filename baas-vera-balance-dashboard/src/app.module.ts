//* Nest
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

//* Infrastructure
import './infrastructure/dynamoose/dynamoose.config';

//* Modules
import { ClinicsModule } from './modules/clinics/clinics.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClinicsModule,
    AuthModule,
  ],
})
export class AppModule {}
