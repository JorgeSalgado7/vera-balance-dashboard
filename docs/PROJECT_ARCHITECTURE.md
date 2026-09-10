# Arquitectura de Vera Balance

## 1. Objetivo

Este documento define cómo deberán aplicarse los **Lineamientos de Arquitectura** al proyecto Vera Balance.

Debe utilizarse junto con:

- La definición de base de datos.
- La especificación OpenAPI.
- Las definiciones funcionales.
- Los Lineamientos de Arquitectura.

La intención es proporcionar suficiente contexto para que la implementación pueda construirse sin inventar estructuras, relaciones o reglas de negocio.

---

# 2. Fuentes de verdad

Cuando exista una diferencia entre documentos, deberá utilizarse el siguiente orden de prioridad:

```text
1. Base de datos
2. OpenAPI
3. Definiciones funcionales
4. Arquitectura de Vera Balance
5. Lineamientos de Arquitectura
6. Implementación existente
```

La implementación deberá ajustarse a las fuentes de verdad y no al contrario.

No se deberán inventar:

- Propiedades.
- Entidades.
- Estados.
- Roles.
- Relaciones.
- Endpoints públicos.
- Reglas de negocio.

Las ambigüedades deberán resolverse antes de asumir comportamiento no documentado.

---

# 3. Stack y persistencia

Vera Balance utiliza DynamoDB con **Single Table Design**.

Conceptualmente:

```text
DynamoDB
└── VeraBalanceTable
    ├── CLINIC
    ├── USER
    ├── PATIENT
    ├── THERAPEUTIC_PROCESS
    ├── RECORD
    ├── HOME_WORK
    └── CATALOG#*
```

La existencia de una sola tabla física no modifica los límites arquitectónicos de los módulos.

Cada módulo deberá encapsular su propia lógica de persistencia.

La configuración técnica común del cliente DynamoDB puede vivir en:

```text
src/shared/dynamodb/
```

pero no deberá contener lógica funcional de las entidades.

No deberá crearse un repositorio general que conozca y administre todas las entidades de Vera Balance.

---

# 4. Módulos backend

Los módulos definidos actualmente son:

```text
src/modules/
├── auth/
├── catalogs/
├── clinics/
├── home-works/
├── patients/
├── records/
├── therapeutic-processes/
└── users/
```

No deberá crearse:

```text
src/modules/therapy-types
```

Los tipos de terapia pertenecen a `Clinic`.

---

# 5. Estructura backend

La estructura inicial esperada es:

```text
src/
├── modules/
│   ├── auth/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── auth.module.ts
│   ├── catalogs/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── catalogs.module.ts
│   ├── clinics/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── clinics.module.ts
│   ├── home-works/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── home-works.module.ts
│   ├── patients/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── patients.module.ts
│   ├── records/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── records.module.ts
│   ├── therapeutic-processes/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   └── therapeutic-processes.module.ts
│   └── users/
│       ├── application/
│       ├── domain/
│       ├── infrastructure/
│       ├── presentation/
│       └── users.module.ts
├── shared/
│   ├── config/
│   ├── dynamodb/
│   ├── http-problem/
│   └── logger/
└── main.ts
```

Las carpetas internas deberán crearse sólo cuando exista una necesidad real.

---

# 6. Ownership de entidades

La responsabilidad funcional se distribuye de la siguiente forma:

```text
ClinicsModule
└── Clinic
    └── TherapyType[]

UsersModule
└── User

PatientsModule
└── Patient

TherapeuticProcessesModule
└── TherapeuticProcess
    ├── therapist
    ├── patients[]
    └── records[]

RecordsModule
└── Record
    └── home_works[]

HomeWorksModule
└── HomeWork

CatalogsModule
└── Catalog

AuthModule
└── autenticación y sesión
```

Un módulo puede utilizar referencias hacia entidades de otro contexto, pero no deberá apropiarse de su lógica interna.

---

# 7. Clinic

La entidad persistida está definida conceptualmente por:

```text
Clinic {
    pk
    sk
    name
    logo
    address
    phone_number
    therapy_types
    status
    created_at
    updated_at
}
```

Los estados permitidos son:

```text
active
inactive
```

`therapy_types` pertenece directamente a Clinic.

---

# 8. TherapyType

`TherapyType` no constituye una entidad independiente en el modelo actual.

Su estructura es:

```text
TherapyType {
    name: string
    icon: string
}
```

No deberá recibir un `id` propio salvo que la definición de DB cambie expresamente.

Cada clínica tendrá tipos de terapia definidos por default y podrá agregar nuevos tipos.

Los tipos iniciales son:

```text
Terapia individual
Terapia de pareja
Terapia infantil
Terapia familiar
```

`TherapeuticProcess` guarda:

```text
therapy_type: string
```

No:

```text
therapy_type_id
```

---

# 9. User

La entidad está definida conceptualmente por:

```text
User {
    pk
    sk
    name
    email
    password
    professional_license
    clinic
    role
    status
    created_at
    updated_at
}
```

Los roles válidos son exclusivamente:

```text
clinic
therapist
```

No existe:

```text
admin
```

Los estados válidos son:

```text
active
inactive
```

La referencia a Clinic en persistencia deberá seguir la estructura definida por la DB.

El contrato HTTP deberá seguir el OpenAPI y no exponer automáticamente `pk` o `sk`.

---

# 10. Patient

`Patient` representa exclusivamente a la persona registrada.

Conceptualmente:

```text
Patient {
    pk
    sk
    name
    age
    guardian
    phone_number
    sex
    education
    occupation
    marital_status
    partner_data
    religion
    address
    created_at
    updated_at
}
```

El paciente **no tiene status**.

No deberán agregarse a Patient propiedades como:

```text
status
therapy_type
therapist
last_session
consultation_reason
goals
```

Estas propiedades pertenecen a otros contextos.

Si una vista necesita mostrar terapia, terapeuta, última sesión o estado, la información deberá obtenerse de `TherapeuticProcess` y `Record`.

---

# 11. TherapeuticProcess

`TherapeuticProcess` representa el tratamiento.

Conceptualmente:

```text
TherapeuticProcess {
    pk
    sk
    therapy_type
    therapist
    patients
    is_first_time
    consultation_reason
    goals
    records
    status
    created_at
    updated_at
}
```

Un paciente puede participar en diferentes procesos terapéuticos a lo largo del tiempo.

Los estados permitidos son:

```text
active
inactive
discharged
unfinished
```

No deberán crearse estados adicionales.

El status pertenece a `TherapeuticProcess` y nunca a `Patient`.

---

# 12. Record

Cada `Record` pertenece a un `TherapeuticProcess`.

Conceptualmente:

```text
Record {
    pk
    sk
    session_date
    is_attendance
    resume
    tools
    home_works
    created_at
    updated_at
}
```

`resume` puede ser `null`.

`tools` puede ser `null`.

Los nombres canónicos son:

```text
is_attendance
resume
home_works
```

No deberán sustituirse internamente por conceptos diferentes únicamente por conveniencia.

El contrato HTTP deberá seguir exactamente el OpenAPI vigente.

---

# 13. HomeWork

`HomeWork` es una entidad independiente.

```text
HomeWork {
    pk
    sk
    description
    is_completed
    created_at
    updated_at
}
```

Los registros almacenan referencias a tareas existentes.

La entidad deberá permanecer dentro de `HomeWorksModule`.

---

# 14. Catalog

Los catálogos son entidades independientes.

```text
Catalog {
    pk
    sk
    name
    options
    created_at
    updated_at
}
```

La `sk` sigue:

```text
CATALOG#type
```

Ejemplos definidos actualmente:

```text
CATALOG#MARITAL_STATUS
CATALOG#SCHOOL
CATALOG#GENDER
```

No deberán duplicarse valores configurables como listas hardcodeadas si forman parte de un catálogo administrable.

---

# 15. Relaciones entre módulos

Las principales dependencias funcionales son:

```text
TherapeuticProcessesModule
├── ClinicsModule
├── UsersModule
└── PatientsModule

RecordsModule
├── TherapeuticProcessesModule
└── HomeWorksModule
```

Estas relaciones no autorizan el acceso directo a infraestructura de otros módulos.

Por ejemplo:

```text
TherapeuticProcessesModule
```

no deberá consumir directamente:

```text
PatientsDynamoRepository
```

Si necesita información de Patient, `PatientsModule` deberá exponer una capacidad explícita.

Ejemplos conceptuales:

```text
GetPatientUseCase
PatientQueryService
PatientReaderPort
```

La abstracción concreta deberá elegirse según la responsabilidad real.

---

# 16. Persistencia y referencias

La DB utiliza referencias como:

```text
{
    pk: 'uuid',
    sk: 'USER'
}
```

El contrato HTTP puede utilizar:

```json
{
  "therapist_id": "uuid"
}
```

Estas representaciones no son equivalentes arquitectónicamente.

Debe conservarse la separación:

```text
HTTP DTO
   ↓
Application
   ↓
Domain
   ↓
Mapper
   ↓
DynamoDB Model
```

`pk` y `sk` son detalles de persistencia.

No deberán exponerse en los DTOs HTTP salvo que el OpenAPI lo defina expresamente.

---

# 17. Autorización

Los permisos reales pertenecen al backend.

## 17.1 `clinic`

El usuario con rol `clinic`:

- Puede editar su clínica.
- Puede editar su perfil.
- Puede cambiar su contraseña.
- Puede crear, editar y eliminar usuarios de su clínica.
- Puede crear, editar y eliminar pacientes.
- Puede crear, editar y eliminar procesos terapéuticos.
- Puede crear, editar y eliminar registros.
- Puede crear, editar y eliminar tareas.
- Puede consultar terapeutas de su clínica.
- Puede consultar pacientes y recursos de terapeutas de su clínica.
- Además actúa como terapeuta.

El alcance deberá limitarse a su propia clínica.

## 17.2 `therapist`

El usuario con rol `therapist`:

- Puede editar su perfil.
- Puede cambiar su contraseña.
- Puede crear y editar sus pacientes.
- Puede crear y editar sus procesos terapéuticos.
- Puede crear y editar sus registros.
- Puede crear y editar tareas de sus pacientes.

Tiene acceso únicamente a sus propios recursos.

No puede eliminar directamente un paciente.

Backend deberá aplicar estas restricciones independientemente de lo que muestre el frontend.

---

# 18. Reglas de tipos de terapia

## 18.1 Individual

- Exactamente un paciente.
- Si `marital_status` es `En una relación` o `Casado`, el frontend muestra `partner_data`.
- Si la edad es menor a 18 años, por default el tipo cambia a Terapia infantil.

## 18.2 Pareja

- Exactamente dos pacientes pertenecen al mismo proceso.
- Pueden crearse pacientes o seleccionarse pacientes existentes.
- El estado civil no activa `partner_data` por participar en terapia de pareja.

## 18.3 Infantil

- Exactamente un paciente.
- Se solicitan datos de tutor.
- Los datos de tutor se muestran por default al seleccionar Terapia infantil.

## 18.4 Familiar

- Dos o más pacientes.
- Ser menor de 18 años no obliga por sí mismo a capturar tutor dentro de este tipo de terapia.

Estas reglas son funcionales.

La DB permite estructuras nullable cuando corresponde, pero la aplicación deberá aplicar las reglas definidas para cada flujo.

---

# 19. Eliminación de pacientes

El rol `clinic` puede eliminar pacientes.

El rol `therapist` no puede eliminar directamente pacientes.

Cuando se ejecuta:

```text
DELETE /v1/patients/{id}
```

el controller no deberá implementar manualmente la eliminación de relaciones.

Deberá ejecutar un caso de uso.

Las reglas exactas de cascada y el comportamiento ante procesos compartidos de pareja o familia deberán seguir la definición backend vigente.

No deberán inventarse reglas de cascada no documentadas.

---

# 20. OpenAPI

La especificación OpenAPI representa el contrato HTTP.

Los controllers, request DTOs y response DTOs deberán respetarla.

Los nombres definidos por el OpenAPI no deberán cambiarse arbitrariamente para hacerlos coincidir con los nombres físicos de DynamoDB.

De igual manera, la DB no deberá modificarse únicamente para hacerla coincidir con un DTO HTTP.

Los mappers y capas intermedias existen para mantener esta separación.

---

# 21. Endpoints

Los grupos funcionales definidos son:

```text
/v1/clinics
/v1/users
/v1/auth
/v1/catalogs
/v1/patients
/v1/therapeutic-processes
/v1/records
/v1/home-works
```

Cada grupo deberá implementarse dentro de su módulo correspondiente.

No deberán crearse endpoints públicos adicionales salvo que el contrato sea actualizado expresamente.

---

# 22. Frontend de Vera Balance

Cuando se implemente frontend, los features previstos son:

```text
src/features/
├── auth/
├── catalogs/
├── clinics/
├── home-works/
├── patients/
├── records/
├── therapeutic-processes/
└── users/
```

No deberá crearse un feature `therapy-types`.

Los tipos de terapia pertenecen a `clinics`.

---

# 23. Dashboard

`Dashboard` no representa actualmente un dominio backend independiente.

Mientras sea una pantalla agregadora deberá permanecer como UI global.

```text
src/ui/pages/Dashboard.tsx
```

Puede consumir información proveniente de:

```text
Patients
Therapeutic Processes
Records
Users
```

No deberá crearse:

```text
src/features/dashboard
```

ni:

```text
src/modules/dashboard
```

mientras no exista un contexto funcional o contrato de API específico para Dashboard.

---

# 24. Redux

Los stores deberán separarse por flujo cuando sus responsabilidades sean independientes.

Ejemplo para Patients:

```text
features/patients/application/store/
├── patient-list/
├── create-patient/
├── edit-patient/
└── patient-detail/
```

Cada flujo puede contener:

```text
interface/
initial-state/
slice/
selector/
```

Crear y editar paciente deberán mantenerse separados cuando tengan estado o lógica propios.

No deberá concentrarse todo Patients en un único slice.

---

# 25. Estructura frontend

```text
src/
├── common/
│   ├── constants/
│   ├── interfaces/
│   ├── types/
│   └── utils/
├── features/
│   ├── auth/
│   ├── catalogs/
│   ├── clinics/
│   ├── home-works/
│   ├── patients/
│   ├── records/
│   ├── therapeutic-processes/
│   └── users/
├── routes/
│   └── PageRouter.tsx
├── store/
│   ├── hooks.ts
│   └── store.ts
├── ui/
│   ├── components/
│   ├── layouts/
│   │   └── dashboard/
│   │       ├── interfaces/
│   │       │   └── dashboard.interface.ts
│   │       ├── DashboardLayout.tsx
│   │       ├── HeaderLayout.tsx
│   │       └── SidebarMenu.tsx
│   ├── pages/
│   │   └── Dashboard.tsx
│   └── scss/
└── main.tsx
```

No existe `src/shared` en frontend.

---

# 26. Decisiones que no deben asumirse

Mientras las fuentes de verdad no las definan expresamente, no deberán inventarse decisiones sobre:

- Comportamiento exacto de cascada al eliminar un paciente compartido por procesos de pareja o familia.
- Nuevos roles.
- Nuevos estados.
- Nuevos tipos de entidades.
- Identificadores propios para TherapyType.
- Status de Patient.
- Endpoints de Dashboard.
- Campos adicionales de auditoría distintos de los definidos.
- Relaciones adicionales entre entidades.
- Nuevos catálogos.
- Nuevas reglas de autorización.

Si una implementación requiere alguna de estas decisiones, deberá resolverse primero en la documentación correspondiente.

---

# 27. Criterio para implementación autónoma

Para construir Vera Balance deberán utilizarse conjuntamente:

```text
Base de datos
      +
OpenAPI
      +
Definiciones funcionales
      +
Arquitectura de Vera Balance
      +
Lineamientos de Arquitectura
```

Cada documento tiene una responsabilidad distinta:

```text
Base de datos
-> define la estructura persistida y relaciones canónicas.

OpenAPI
-> define el contrato HTTP.

Definiciones funcionales
-> define comportamiento, roles y reglas del negocio.

Arquitectura de Vera Balance
-> define cómo se organiza específicamente este sistema.

Lineamientos de Arquitectura
-> define las reglas generales de diseño y separación de responsabilidades.
```

Codex o cualquier desarrollador deberá implementar el sistema utilizando estas fuentes sin completar silenciosamente información que no esté definida.

Cuando exista una ambigüedad que afecte el comportamiento funcional o el modelo de datos, deberá señalarse antes de implementar una decisión irreversible.
