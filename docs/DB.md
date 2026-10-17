# DEFINICIÓN DE LA DB

Base de datos: DynamoDB con Single Table Design.

Todas las entidades del sistema se almacenarán en una única tabla de DynamoDB.

Las claves `pk` y `sk` permitirán identificar cada entidad y diferenciar los tipos de registros almacenados.

## 1. Clinics

```text
pk: string -> uuid
sk: string -> 'CLINIC'
name: string
logo: string | null
address: string
phone_number: string
therapy_types: TherapyType[]
status: string -> 'active' | 'inactive'
created_at: datetime
updated_at: datetime
```

Cada clínica tendrá tipos de terapia por default, pero podrá agregar nuevos tipos.

```text
TherapyType: {
    name: string
    icon: string
}
```

Tipos iniciales:

```text
[
    {name: 'Terapia individual', icon: ''},
    {name: 'Terapia de pareja', icon: ''},
    {name: 'Terapia infantil', icon: ''},
    {name: 'Terapia familiar', icon: ''}
]
```

## 2. Users

```text
pk: string -> uuid
sk: string -> 'USER'
name: string
email: string
password: string
professional_license: string
clinic: Clinic -> {pk: uuid, sk: 'CLINIC'}
role: string -> 'clinic' | 'therapist'
status: string -> 'active' | 'inactive'
created_at: datetime
updated_at: datetime
```

### Reglas de seguridad de usuarios

- `email` debe ser único entre todos los usuarios.
- `password` almacena únicamente el hash de la contraseña.
- Las contraseñas nunca deben almacenarse en texto plano.
- `password` nunca debe exponerse en respuestas del API.
- Únicamente los usuarios con estado `active` podrán iniciar sesión.
- Los usuarios autenticados se identificarán mediante un JWT enviado en una cookie HttpOnly.
- Los JWT de sesión no se almacenarán en DynamoDB.
- No se realizarán consultas a DynamoDB para buscar o comparar el valor de un JWT.
- La expiración del JWT será de 5 minutos.
- La renovación de la sesión se realizará mientras exista actividad válida del usuario y antes de que expire el JWT.
- El frontend deberá finalizar la sesión después de un máximo de 5 minutos de inactividad.
- El cierre de sesión eliminará la cookie de autenticación del navegador.

La autenticación será stateless respecto a los JWT. La eliminación de la cookie no revoca automáticamente copias del JWT emitidas previamente; estas permanecerán criptográficamente válidas hasta su expiración, salvo que se incorpore un mecanismo adicional de revocación.

## 3. Therapeutic Processes

```text
pk: string -> uuid
sk: string -> 'THERAPEUTIC_PROCESS'
therapy_type: string -> clinic.therapyType
therapist: User -> {pk: uuid, sk: 'USER'}
patients: Patient[] -> [{pk: uuid, sk: 'PATIENT'}...]
is_first_time: boolean
consultation_reason: string
goals: string
records: Record[] -> [{pk: uuid, sk: 'RECORD'}...]
status: string -> 'active' | 'inactive' | 'discharged' | 'unfinished'
created_at: datetime
updated_at: datetime
```

El estado pertenece al proceso terapéutico y no al paciente.

### Reglas de negocio

- Cada proceso terapéutico pertenece a una clínica a través de sus relaciones con los pacientes y el terapeuta.
- El tipo de terapia debe existir entre los tipos configurados para la clínica.
- Un proceso terapéutico puede relacionarse con uno o varios pacientes.
- Todos los pacientes asociados deben pertenecer a la misma clínica.
- Un paciente puede participar en diferentes procesos terapéuticos.
- El terapeuta responsable debe pertenecer a la clínica correspondiente.
- Los registros de sesión se almacenarán como referencias a entidades `RECORD`.
- Los usuarios con rol `clinic` podrán consultar los procesos de su clínica.
- Los usuarios con rol `therapist` únicamente podrán consultar los procesos que tengan asignados.

## 4. Patients

```text
pk: string -> uuid
sk: string -> 'PATIENT'
clinic: {
    pk: string -> uuid
    sk: string -> 'CLINIC'
}
name: string
age: number
guardian: {
    name: string
    phone_number: string
    relationship: string
} | null
phone_number: string | null
sex: string
education: string
occupation: string
marital_status: string | null
partner_data: {
    name: string
    age: number
    relationship_time: string
    occupation: string
} | null
religion: string
address: string
created_at: datetime
updated_at: datetime
```

El paciente no tiene un status propio.

### Reglas de negocio

- Cada paciente pertenece a una clínica.
- La clínica del paciente se establece durante su creación y no puede modificarse.
- Los pacientes mayores de edad deben contar con un número telefónico propio.
- Los pacientes menores de edad pueden contar con información de un tutor o responsable.
- Los menores de edad no tendrán información de estado civil ni datos de pareja.
- `partner_data` únicamente aplica cuando corresponda a pacientes mayores de edad.
- Los valores de `sex`, `education` y `marital_status` deben corresponder a los catálogos configurados.
- La relación entre pacientes y terapeutas se establece mediante los procesos terapéuticos.
- Un paciente puede tener múltiples procesos terapéuticos.
- Los usuarios con rol `clinic` podrán consultar los pacientes de su clínica.
- Los usuarios con rol `therapist` únicamente podrán consultar pacientes relacionados con sus procesos terapéuticos asignados.
- Un paciente únicamente podrá eliminarse físicamente cuando no haya participado en ningún proceso terapéutico.

## 5. Records

```text
pk: string -> uuid
sk: string -> 'RECORD'
session_date: datetime
is_attendance: boolean
resume: string | null
tools: string | null
home_works: HomeWork[] -> [{pk: uuid, sk: 'HOME_WORK'}...]
created_at: datetime
updated_at: datetime
```

Cada Record pertenece a un proceso terapéutico.

Las tareas se seleccionan desde las tareas existentes y se almacenan como referencias.

### Reglas de negocio

- Cada registro debe estar asociado a un proceso terapéutico existente.
- Solo podrán crearse registros cuando el proceso terapéutico esté activo.
- La fecha de sesión deberá corresponder al día actual al momento de crear el registro.
- No podrán existir dos registros para el mismo proceso terapéutico y fecha de sesión.
- Cuando `is_attendance` sea `false`, los campos `resume` y `tools` serán `null`.
- Cuando `is_attendance` sea `false`, el registro no podrá tener tareas asociadas.
- Las tareas deberán existir antes de asociarse al registro.
- Los usuarios con rol `clinic` podrán consultar los registros de los procesos de su clínica.
- Los usuarios con rol `therapist` únicamente podrán consultar los registros de sus procesos terapéuticos asignados.

## 6. HomeWorks

```text
pk: string -> uuid
sk: string -> 'HOME_WORK'
description: string
is_completed: boolean
created_at: datetime
updated_at: datetime
```

HomeWork es una entidad independiente para permitir reutilizar y seleccionar tareas al crear o editar un Record.

### Reglas de negocio

- Cada tarea tendrá un identificador único.
- Las tareas podrán crearse antes de registrar una sesión.
- Las tareas se asociarán a los registros mediante referencias.
- `is_completed` indicará si la tarea fue completada.
- El estado de cumplimiento se actualizará manualmente.
- Podrán existir tareas con la misma descripción.
- Una tarea podrá existir temporalmente sin estar asociada a un registro.
- Al eliminar una tarea, deberán eliminarse las referencias correspondientes de los registros relacionados.
- El acceso a las tareas asociadas a registros estará sujeto a los permisos del proceso terapéutico correspondiente.

## 7. Catalogs

Los catálogos permitirán administrar valores reutilizables como estado civil, escolaridad, sexo u otros que se requieran posteriormente.

```text
pk: string -> uuid
sk: string -> 'CATALOG#type'
name: string
options: string[]
created_at: datetime
updated_at: datetime
```

### Catálogos iniciales

**Estado civil**

```text
sk: 'CATALOG#MARITAL_STATUS'
name: 'Estado civil'
options: [
    'Soltero',
    'En una relación',
    'Casado',
    'Divorciado',
    'Viudo'
]
```

**Escolaridad**

```text
sk: 'CATALOG#SCHOOL'
name: 'Escolaridad'
options: [
    'Kinder',
    'Primaria',
    'Secundaria',
    'Preparatoria',
    'Universidad',
    'Sin estudios'
]
```

**Género**

```text
sk: 'CATALOG#GENDER'
name: 'Género'
options: [
    'Masculino',
    'Femenino'
]
```

### Reglas de negocio

- Los catálogos serán globales y no pertenecerán a una clínica específica.
- Los usuarios autenticados podrán consultar los catálogos disponibles.
- Los roles `clinic` y `therapist` no podrán crear, modificar ni eliminar catálogos.
- Las operaciones de administración de catálogos quedarán reservadas para una capacidad administrativa global que se definirá posteriormente.
- El tipo de catálogo será inmutable.
- Los catálogos iniciales no podrán eliminarse.

## 8. Password Recovery

Esta entidad permitirá administrar los códigos de verificación utilizados para recuperar contraseñas.

Los códigos de recuperación son independientes de los JWT de sesión.

```text
pk: string -> uuid del usuario
sk: string -> 'PASSWORD_RECOVERY'
code_hash: string
expires_at: datetime
attempts: number
created_at: datetime
ttl: number -> Unix timestamp en segundos
```

### Reglas de negocio

- Cada solicitud de recuperación generará un código numérico aleatorio de 6 dígitos.
- El código tendrá una vigencia de 5 minutos desde su creación.
- El código se enviará exclusivamente al correo electrónico asociado al usuario.
- El envío de correo se realizará mediante Resend.
- La plantilla del correo de recuperación se almacenará en un archivo independiente dentro del backend.
- El código original nunca se almacenará en texto plano.
- `code_hash` contendrá únicamente una representación segura del código.
- Para códigos de seis dígitos, el hash deberá protegerse mediante un mecanismo resistente a búsquedas exhaustivas, como un HMAC con clave secreta del servidor.
- Solo podrá existir un código de recuperación vigente por usuario.
- Cuando se genere un nuevo código, el anterior quedará invalidado.
- Cada código permitirá un máximo de 5 intentos fallidos.
- Al superar el número máximo de intentos, el código quedará invalidado.
- Los códigos expirados no podrán utilizarse.
- La validación del código deberá comprobar su correspondencia con el usuario, su vigencia y el número de intentos.
- La verificación y el incremento de intentos deberán realizarse de manera segura ante solicitudes concurrentes.
- Después de actualizar correctamente la contraseña, el registro de recuperación deberá eliminarse.
- El consumo del código y la actualización de la contraseña deberán coordinarse para impedir que dos solicitudes concurrentes reutilicen el mismo código.
- El proceso de recuperación no iniciará automáticamente una sesión autenticada.
- La respuesta de solicitud de recuperación no deberá revelar si el correo electrónico existe en el sistema.
- Se deberán aplicar límites de frecuencia para evitar solicitudes abusivas y ataques de fuerza bruta.

### Expiración automática

El atributo `ttl` se utilizará para permitir que DynamoDB elimine automáticamente los registros de recuperación expirados.

```text
ttl = Unix timestamp de expires_at
```

La eliminación mediante DynamoDB TTL es eventual y no garantiza que el registro desaparezca inmediatamente al cumplirse su vigencia.

Por lo tanto, el backend deberá validar siempre `expires_at` antes de aceptar un código, independientemente de que el registro todavía exista en DynamoDB.

### Relación con Users

Cada registro `PASSWORD_RECOVERY` estará asociado a un usuario mediante su UUID.

```text
User:
    pk: uuid
    sk: 'USER'

PasswordRecovery:
    pk: mismo uuid del usuario
    sk: 'PASSWORD_RECOVERY'
```

Esta estructura permite consultar directamente el código de recuperación asociado a un usuario mediante su clave compuesta.

## 9. Reglas generales de persistencia

### Single Table Design

- Todas las entidades utilizarán la misma tabla de DynamoDB.
- Cada entidad tendrá una clave primaria compuesta por `pk` y `sk`.
- El atributo `sk` identificará el tipo de entidad.
- Las relaciones entre entidades se representarán mediante referencias, según lo definido en cada modelo.
- Las consultas deberán respetar las restricciones de clínica, usuario y rol correspondientes.
- Los campos `created_at` y `updated_at` se administrarán desde el backend.
- Las operaciones que requieran consistencia entre varios registros deberán utilizar mecanismos apropiados de DynamoDB, incluyendo transacciones cuando corresponda.

### Seguridad

- Las contraseñas se almacenarán exclusivamente mediante hashes seguros.
- Los códigos de recuperación se almacenarán exclusivamente mediante representaciones protegidas.
- Los JWT de sesión no se almacenarán en DynamoDB.
- No existirán registros de Public Operation Token.
- No se almacenarán refresh tokens.
- No se consultará DynamoDB para buscar el valor de un JWT de sesión.
- Los permisos de acceso se validarán en el backend a partir de la identidad autenticada y las reglas de negocio correspondientes.
- Ningún endpoint deberá confiar en identificadores de usuario o clínica enviados por el cliente para sustituir la identidad de la sesión autenticada.

### Sesiones

La administración de sesiones corresponderá al módulo Auth y no requerirá una entidad de persistencia en DynamoDB.

El JWT de sesión tendrá una vigencia de 5 minutos y se enviará mediante la cookie `vera_balance_session`.

La renovación se realizará antes de su expiración mientras exista actividad del usuario. El frontend deberá finalizar la sesión después de un máximo de 5 minutos de inactividad.

Los JWT expirados no podrán renovarse utilizando únicamente el JWT vencido.

La validación de sesión y las comprobaciones de autorización podrán consultar los datos actuales del usuario cuando sea necesario, pero no utilizarán una tabla de tokens o sesiones persistidas.