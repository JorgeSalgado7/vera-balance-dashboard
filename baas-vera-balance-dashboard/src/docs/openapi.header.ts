import { DocumentBuilder } from '@nestjs/swagger'

export const openApiHeader = new DocumentBuilder()
  .setOpenAPIVersion('3.1.0')
  .setTitle('baas-vera-balance-dashboard')
  .setVersion('1.0.0')
  .setDescription(
    `API REST para la gestión de Vera Balance.

Roles:
- admin: acceso global organizado por clínicas.
- clinic: acceso completo a su clínica.
- therapist: acceso a sus pacientes, procesos,
  registros y tareas relacionados.

Persistencia: DynamoDB Single Table Design.
Las consultas no deben utilizar Scan.
`,
  )
  .addServer('/')
  .addTag('Auth')
  .addTag('Users')
  .addTag('Clinics')
  .addTag('Patients')
  .addTag('Therapy Types')
  .addTag('Therapeutic Processes')
  .addTag('Records')
  .addTag('HomeWorks')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearerAuth')
  .addSecurityRequirements('bearerAuth')
  .build()
