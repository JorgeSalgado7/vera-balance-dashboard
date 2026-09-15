//* Nest
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

//* INfrastructure
import './infrastructure/dynamoose/dynamoose.config';

//* Modules
import { ClinicsModule } from './modules/clinics/clinics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClinicsModule,
  ],
})
export class AppModule {}
