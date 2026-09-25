# Arquitectura de Vera Balance

## 1. Objetivo

Este documento define cómo deberán aplicarse los **Lineamientos de Arquitectura** al proyecto Vera Balance.

Debe utilizarse junto con:

* La definición de base de datos.
* La especificación OpenAPI.
* Las definiciones funcionales.
* Los Lineamientos de Arquitectura.

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

* Propiedades.
* Entidades.
* Estados.
* Roles.
* Relaciones.
* Endpoints públicos.
* Reglas de negocio.

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
├── autenticación
├── sesión
├── Public Operation Token
└── recuperación de contraseña
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

Todo usuario pertenece obligatoriamente a una clínica.

La referencia a Clinic en persistencia deberá seguir la estructura definida por la DB.

El email deberá ser único de acuerdo con las reglas funcionales y con las capacidades permitidas por el modelo de persistencia documentado.

`password` representa únicamente el hash persistido de la contraseña.

La contraseña en texto plano y su confirmación pertenecen exclusivamente al flujo de entrada correspondiente y no forman parte de la entidad persistida.

El contrato HTTP deberá seguir el OpenAPI y no exponer automáticamente `pk`, `sk`, contraseñas, hashes o confirmaciones de contraseña.

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

AuthModule
└── UsersModule
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

De la misma forma, `AuthModule` no deberá consumir directamente la infraestructura interna de persistencia de `UsersModule`.

Si Auth necesita consultar, validar o modificar información de un usuario, `UsersModule` deberá exponer la capacidad necesaria mediante una frontera explícita.

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

# 17. Autenticación, operaciones públicas y sesión

`AuthModule` es responsable de la autenticación, administración de sesión, Public Operation Tokens y flujos de recuperación de contraseña definidos por el contrato HTTP.

La lógica de Application y Domain no deberá depender directamente de la implementación concreta utilizada para generar, validar o consumir tokens.

Vera Balance utiliza mecanismos separados para:

```text
Public Operation Token
        ↓
autorizar una única operación sin sesión

JWT de sesión
        ↓
representar una sesión autenticada

Credencial de recuperación
        ↓
completar un flujo de recuperación de contraseña
```

Estos mecanismos tienen responsabilidades diferentes y no deberán reutilizarse indistintamente.

## 17.1 Public Operation Token

El Public Operation Token protege operaciones que deben poder ejecutarse antes de que exista una sesión autenticada.

Actualmente se utiliza exclusivamente para:

```text
POST /v1/users
POST /v1/auth/sign-in
POST /v1/auth/forgot-password
```

Los scopes permitidos actualmente son:

```text
users:create
auth:sign-in
auth:forgot-password
```

El endpoint:

```text
POST /v1/auth/public-token
```

es responsable de generar el Public Operation Token y es el único endpoint que no requiere previamente una sesión autenticada ni otro Public Operation Token.

Cada Public Operation Token deberá:

* Tener un scope específico.
* Tener una vigencia limitada.
* Ser de un solo uso.
* Autorizar exclusivamente la operación correspondiente a su scope.
* No representar una sesión autenticada.
* No permitir acceder a endpoints protegidos mediante sesión.
* Ser validado antes de ejecutar la operación correspondiente.
* Consumirse cuando la solicitud protegida por dicho token sea aceptada.
* Rechazarse si ya fue utilizado.
* Rechazarse si se encuentra expirado.
* Rechazarse si su scope no corresponde a la operación solicitada.

Un Public Operation Token no deberá convertirse en un JWT de sesión.

La representación HTTP del Public Operation Token deberá seguir `docs/openapi.yaml`.

La forma de persistir, consultar, consumir y expirar estos tokens deberá seguir la definición de base de datos.

No deberán crearse modelos, índices, tablas o estructuras de persistencia para estos tokens que no estén definidos previamente en la documentación de base de datos.

## 17.2 Inicio de sesión

El inicio de sesión requiere un Public Operation Token con scope:

```text
auth:sign-in
```

Conceptualmente:

```text
Public Operation Token
        ↓
validación de token y scope
        ↓
consumo del token
        ↓
validación de email y contraseña
        ↓
validación de usuario active
        ↓
generación de JWT de sesión
        ↓
cookie HttpOnly
```

La validación de credenciales deberá utilizar una capacidad explícita para verificar el hash de la contraseña.

Los casos de uso no deberán depender directamente de una implementación concreta de hashing.

Si las credenciales son válidas, la infraestructura de autenticación genera un JWT para representar la sesión.

El JWT deberá entregarse mediante la cookie definida en el OpenAPI:

```text
vera_balance_session
```

El JWT no deberá exponerse en el cuerpo de las respuestas HTTP.

El frontend no deberá almacenar el JWT en `localStorage` o `sessionStorage` ni depender de la lectura directa de su contenido.

## 17.3 Sesión autenticada

El JWT representa la sesión autenticada del usuario.

La cookie `HttpOnly` es enviada automáticamente por el navegador en las solicitudes correspondientes.

Salvo las operaciones expresamente protegidas mediante Public Operation Token y el endpoint que genera dicho token, los endpoints del API deberán utilizar el mecanismo de sesión definido en `docs/openapi.yaml`.

Conceptualmente:

```text
Request
↓
vera_balance_session
↓
validación JWT
↓
identidad autenticada
↓
autorización
↓
caso de uso
```

La generación y validación de la sesión deberán utilizar capacidades explícitas y no depender directamente de servicios concretos del framework dentro de los casos de uso.

Conceptualmente:

```text
Auth Application
↓
Ports de autenticación y sesión
↓
Infrastructure
├── JWT
└── futuro proveedor de identidad
```

La infraestructura de autenticación deberá permanecer desacoplada mediante puertos o capacidades explícitas que permitan sustituir la implementación actual por otro proveedor de identidad, como Cognito, sin acoplar los casos de uso a dicho proveedor.

La ausencia de una sesión válida, un JWT inválido o un JWT expirado deberá impedir el acceso a endpoints que requieran sesión.

## 17.4 Verificación de sesión

La verificación de sesión obtiene el JWT desde la cookie `HttpOnly`.

El JWT no se recibe en el body.

El JWT tampoco se devuelve en el body.

La validación debe determinar si la sesión es válida de acuerdo con el contrato definido en `docs/openapi.yaml`.

## 17.5 Cierre de sesión

El cierre de sesión elimina la cookie `vera_balance_session`.

El cliente no deberá enviar el JWT en el body.

El comportamiento de invalidación o revocación adicional de sesiones no deberá inventarse mientras no esté definido expresamente por las fuentes de verdad.

## 17.6 Cambio de contraseña autenticado

El cambio de contraseña de un usuario autenticado deberá utilizar su sesión para determinar su identidad.

Conceptualmente:

```text
vera_balance_session
↓
JWT válido
↓
sub / identidad autenticada
↓
nueva contraseña + confirmación
↓
validación
↓
hash
↓
actualización del usuario
```

El cliente no deberá determinar el usuario objetivo mediante un email o identificador enviado en el body cuando el contrato indique que la identidad proviene de la sesión.

La nueva contraseña y su confirmación deberán coincidir antes de generar el hash y antes de persistir cualquier modificación.

La confirmación no deberá persistirse.

La contraseña en texto plano, su hash y su confirmación no deberán exponerse en respuestas del API.

## 17.7 Recuperación de contraseña

La solicitud inicial de recuperación de contraseña utiliza un Public Operation Token con scope:

```text
auth:forgot-password
```

Conceptualmente:

```text
Public Operation Token
↓
POST /v1/auth/forgot-password
↓
validación y consumo del Public Operation Token
↓
solicitud de recuperación
```

El Public Operation Token utilizado para `forgot-password` únicamente autoriza la solicitud inicial.

No deberá reutilizarse como credencial para establecer una nueva contraseña.

La respuesta de la solicitud de recuperación no deberá revelar si el email proporcionado corresponde a un usuario existente.

El mecanismo posterior encargado de completar la recuperación deberá utilizar una credencial específica de recuperación cuando dicho flujo se encuentre definido por `docs/openapi.yaml`.

El Public Operation Token, el JWT de sesión y cualquier futura credencial de recuperación deberán permanecer separados conceptualmente y técnicamente.

No deberán inventarse endpoints, estructuras de persistencia o mecanismos adicionales para completar la recuperación mientras no estén definidos en las fuentes de verdad.

## 17.8 Seguridad de credenciales

Las credenciales, contraseñas, hashes y tokens de sesión no deberán exponerse en respuestas del API salvo que el OpenAPI lo defina expresamente.

El Public Operation Token constituye una excepción únicamente porque debe entregarse al cliente que lo solicita para ejecutar la operación autorizada por su scope.

La contraseña en texto plano y su confirmación son datos transitorios de entrada.

La confirmación nunca deberá persistirse.

Los hashes de contraseña nunca deberán exponerse mediante el contrato HTTP.

El contrato HTTP completo de autenticación, operaciones públicas y sesión deberá seguir `docs/openapi.yaml`.

---

# 18. Autorización

Los permisos reales pertenecen al backend.

La autenticación y la autorización son responsabilidades diferentes.

Una sesión válida permite identificar al usuario, pero no implica automáticamente que tenga permiso para acceder a cualquier recurso.

El backend deberá aplicar las reglas de rol, clínica y propiedad de recursos independientemente de lo que muestre el frontend.

## 18.1 `clinic`

El usuario con rol `clinic`:

* Puede editar su clínica.
* Puede editar su perfil.
* Puede cambiar su contraseña.
* Puede crear, editar y eliminar usuarios de su clínica.
* Puede crear, editar y eliminar pacientes.
* Puede crear, editar y eliminar procesos terapéuticos.
* Puede crear, editar y eliminar registros.
* Puede crear, editar y eliminar tareas.
* Puede consultar terapeutas de su clínica.
* Puede consultar pacientes y recursos de terapeutas de su clínica.
* Además actúa como terapeuta.

El alcance deberá limitarse a su propia clínica.

## 18.2 `therapist`

El usuario con rol `therapist`:

* Puede editar su perfil.
* Puede cambiar su contraseña.
* Puede crear y editar sus pacientes.
* Puede crear y editar sus procesos terapéuticos.
* Puede crear y editar sus registros.
* Puede crear y editar tareas de sus pacientes.

Tiene acceso únicamente a sus propios recursos.

No puede eliminar directamente un paciente.

Backend deberá aplicar estas restricciones independientemente de lo que muestre el frontend.

---

# 19. Reglas de tipos de terapia

## 19.1 Individual

* Exactamente un paciente.
* Si `marital_status` es `En una relación` o `Casado`, el frontend muestra `partner_data`.
* Si la edad es menor a 18 años, por default el tipo cambia a Terapia infantil.

## 19.2 Pareja

* Exactamente dos pacientes pertenecen al mismo proceso.
* Pueden crearse pacientes o seleccionarse pacientes existentes.
* El estado civil no activa `partner_data` por participar en terapia de pareja.

## 19.3 Infantil

* Exactamente un paciente.
* Se solicitan datos de tutor.
* Los datos de tutor se muestran por default al seleccionar Terapia infantil.

## 19.4 Familiar

* Dos o más pacientes.
* Ser menor de 18 años no obliga por sí mismo a capturar tutor dentro de este tipo de terapia.

Estas reglas son funcionales.

La DB permite estructuras nullable cuando corresponde, pero la aplicación deberá aplicar las reglas definidas para cada flujo.

---

# 20. Eliminación de pacientes

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

# 21. OpenAPI

La especificación OpenAPI representa el contrato HTTP.

Los controllers, request DTOs y response DTOs deberán respetarla.

Los nombres definidos por el OpenAPI no deberán cambiarse arbitrariamente para hacerlos coincidir con los nombres físicos de DynamoDB.

De igual manera, la DB no deberá modificarse únicamente para hacerla coincidir con un DTO HTTP.

Los mappers y capas intermedias existen para mantener esta separación.

Los mecanismos de seguridad definidos por cada operación también forman parte del contrato HTTP.

Actualmente el OpenAPI distingue:

```text
Sin credencial previa
└── POST /v1/auth/public-token

Public Operation Token
├── POST /v1/users
├── POST /v1/auth/sign-in
└── POST /v1/auth/forgot-password

Session Cookie
└── resto de endpoints protegidos
```

La implementación no deberá convertir un endpoint protegido mediante sesión en un endpoint público por conveniencia.

Tampoco deberá sustituirse `publicOperationToken` por `sessionCookie`, o viceversa, sin modificar previamente las fuentes de verdad correspondientes.

---

# 22. Endpoints

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

Dentro de `/v1/auth` existen operaciones con diferentes mecanismos de seguridad.

El mecanismo aplicable a cada endpoint deberá obtenerse de `docs/openapi.yaml`.

No deberán crearse endpoints públicos adicionales salvo que el contrato sea actualizado expresamente.

---

# 23. Frontend de Vera Balance

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

El frontend deberá respetar la separación entre Public Operation Token y sesión autenticada.

El Public Operation Token deberá utilizarse únicamente para ejecutar la operación correspondiente a su scope.

El frontend no deberá tratar el Public Operation Token como una sesión de usuario.

El JWT de sesión no deberá almacenarse en Redux, `localStorage` o `sessionStorage`, ni deberá requerirse su lectura directa desde JavaScript cuando se encuentre almacenado en una cookie `HttpOnly`.

---

# 24. Dashboard

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

# 25. Redux

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

# 26. Estructura frontend

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

# 27. Decisiones que no deben asumirse

Mientras las fuentes de verdad no las definan expresamente, no deberán inventarse decisiones sobre:

* Comportamiento exacto de cascada al eliminar un paciente compartido por procesos de pareja o familia.
* Nuevos roles.
* Nuevos estados.
* Nuevos tipos de entidades.
* Identificadores propios para TherapyType.
* Status de Patient.
* Endpoints de Dashboard.
* Campos adicionales de auditoría distintos de los definidos.
* Relaciones adicionales entre entidades.
* Nuevos catálogos.
* Nuevas reglas de autorización.
* Nuevos scopes para Public Operation Token.
* Nuevas operaciones protegidas mediante Public Operation Token.
* Nuevos tipos de tokens o credenciales.
* Mecanismos de revocación de sesión no documentados.
* Mecanismos para completar la recuperación de contraseña que todavía no estén definidos en OpenAPI.
* Estructuras de persistencia para tokens que no estén definidas en la documentación de base de datos.

Si una implementación requiere alguna de estas decisiones, deberá resolverse primero en la documentación correspondiente.

---

# 28. Criterio para implementación autónoma

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
-> define el contrato HTTP y los mecanismos de seguridad de cada operación.

Definiciones funcionales
-> define comportamiento, roles y reglas del negocio.

Arquitectura de Vera Balance
-> define cómo se organiza específicamente este sistema.

Lineamientos de Arquitectura
-> define las reglas generales de diseño y separación de responsabilidades.
```

Codex o cualquier desarrollador deberá implementar el sistema utilizando estas fuentes sin completar silenciosamente información que no esté definida.

Cuando exista una ambigüedad que afecte el comportamiento funcional o el modelo de datos, deberá señalarse antes de implementar una decisión irreversible.
