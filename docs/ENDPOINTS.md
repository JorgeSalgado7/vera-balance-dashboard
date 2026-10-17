# DEFINICIÓN DE LOS ENDPOINTS

Todos los endpoints de Vera Balance utilizan el prefijo:

```text
/v1
```

Vera Balance utiliza dos modalidades de acceso:

- **Endpoints públicos:** no requieren autenticación previa.
- **Endpoints protegidos:** requieren una sesión autenticada válida mediante una cookie `HttpOnly`.

La autenticación utiliza un único JWT de sesión, entregado mediante la cookie:

```text
vera_balance_session
```

Configuración:

```text
HttpOnly: true
Secure: true
SameSite: Lax
Path: /
Max-Age: 300 segundos
```

El JWT tiene una vigencia de 5 minutos y no se almacena en DynamoDB.

No se utilizan Public Operation Tokens ni refresh tokens independientes.

La definición técnica de seguridad, los esquemas de entrada y salida y los códigos de respuesta se encuentran en:

```text
docs/baas-vera-balance-dashboard.yaml
```

Las reglas funcionales se encuentran en `docs/DEFINITIONS.md` y las estructuras de persistencia en `docs/DB.md`.

## Endpoints públicos

Los siguientes endpoints no requieren una sesión autenticada:

```text
POST /v1/auth/sign-in
POST /v1/auth/forgot-password
POST /v1/auth/forgot-password/reset
```

La creación de usuarios no es una operación pública.

El endpoint `POST /v1/users` requiere autenticación y autorización del rol `clinic`.

Los endpoints de recuperación de contraseña utilizan un código de verificación enviado por correo electrónico. Este código no representa una sesión autenticada.

## Endpoints protegidos

Todos los demás endpoints requieren una sesión autenticada válida.

El backend deberá verificar la identidad del usuario y aplicar las reglas de autorización correspondientes a su rol, clínica y recursos asociados.

La autenticación no implica automáticamente autorización para acceder a cualquier recurso.

Las operaciones que modifican información y utilizan autenticación mediante cookies deberán incorporar protección contra CSRF, además de las restricciones `SameSite` y las políticas de origen correspondientes.

## 1. Clinics

Todos los endpoints de Clinics requieren una sesión autenticada.

```text
POST    /v1/clinics
GET     /v1/clinics
GET     /v1/clinics/{id}
GET     /v1/clinics/user/{userId}
PUT     /v1/clinics/{id}
DELETE  /v1/clinics/{id}
```

Las operaciones deberán respetar las reglas de acceso y administración de clínicas.

Un usuario no podrá consultar ni modificar recursos de otra clínica sin autorización.

### 1.1 Create Clinic

```text
POST /v1/clinics
```

Requiere una sesión autenticada y autorización administrativa correspondiente.

La creación de una clínica no debe permitir que cualquier usuario autenticado genere clínicas arbitrariamente.

El backend deberá aplicar las reglas de aprovisionamiento establecidas para Vera Balance.

La creación de la primera clínica y su primer usuario administrador se realizará mediante un procedimiento de inicialización restringido, independiente de los endpoints públicos.

### 1.2 Get Clinics

```text
GET /v1/clinics
```

Requiere una sesión autenticada.

El backend únicamente deberá devolver las clínicas que el usuario tenga autorización para consultar.

Un usuario con rol `clinic` no podrá utilizar este endpoint para obtener información administrativa de otras clínicas.

### 1.3 Get Clinic By ID

```text
GET /v1/clinics/{id}
```

Requiere una sesión autenticada.

El backend deberá validar que el usuario tenga autorización para consultar la clínica solicitada.

No será suficiente que el identificador de la clínica exista.

### 1.4 Get Clinic By User

```text
GET /v1/clinics/user/{userId}
```

Requiere una sesión autenticada.

El backend deberá validar que el usuario solicitado pertenezca a una clínica que el usuario autenticado tenga autorización para consultar.

El identificador recibido no deberá utilizarse para omitir las restricciones de acceso entre clínicas.

### 1.5 Update Clinic

```text
PUT /v1/clinics/{id}
```

Requiere una sesión autenticada y rol `clinic`.

El usuario únicamente podrá modificar la información de su propia clínica.

El backend deberá validar la pertenencia de la clínica antes de actualizar sus datos.

### 1.6 Delete Clinic

```text
DELETE /v1/clinics/{id}
```

Requiere una sesión autenticada y autorización administrativa específica.

La eliminación de una clínica no deberá concederse automáticamente a cualquier usuario con rol `clinic`.

La operación deberá respetar las restricciones de integridad de los usuarios, pacientes y procesos terapéuticos asociados.

La política definitiva de eliminación y conservación de información clínica deberá definirse antes de habilitar esta operación.

## 2. Users

Todos los endpoints de Users requieren una sesión autenticada.

```text
POST    /v1/users
GET     /v1/users
GET     /v1/users/{id}
PUT     /v1/users/{id}
DELETE  /v1/users/{id}
PATCH   /v1/users/{id}/status
```

La administración de usuarios estará limitada a los recursos pertenecientes a la clínica del usuario autenticado.

Los usuarios con rol `therapist` no podrán crear, eliminar ni administrar otros usuarios.

### 2.1 Create User

```text
POST /v1/users
```

**Endpoint protegido.**

Requiere:

- Sesión autenticada válida.
- Usuario autenticado con estatus `active`.
- Rol `clinic`.
- Autorización para administrar usuarios de su clínica.

El endpoint no permitirá registros públicos ni la creación anónima de usuarios.

El backend deberá:

1. Obtener la identidad del administrador desde la sesión autenticada.
2. Validar que el administrador exista y tenga estatus `active`.
3. Validar que el administrador tenga rol `clinic`.
4. Identificar la clínica del administrador autenticado.
5. Validar los datos del nuevo usuario.
6. Comprobar que el email no se encuentre registrado.
7. Validar que la contraseña y su confirmación coincidan.
8. Generar un hash seguro de la contraseña.
9. Asociar al nuevo usuario con la clínica del administrador.
10. Persistir el usuario con los datos y permisos autorizados.

Los roles disponibles son:

```text
clinic
therapist
```

La asignación de roles deberá respetar los permisos definidos para la administración de usuarios.

El backend no deberá confiar en un `clinic_id` enviado por el frontend para determinar la clínica del nuevo usuario.

La clínica deberá obtenerse desde el contexto autenticado.

Si el contrato de entrada incluye `clinic_id`, su valor no podrá utilizarse para crear usuarios en una clínica distinta de la del administrador autenticado.

El email deberá ser único dentro del sistema.

La contraseña y su confirmación deberán coincidir antes de generar el hash.

La contraseña se almacenará únicamente mediante un hash seguro.

La confirmación de contraseña no deberá persistirse.

La contraseña, su confirmación y su hash nunca deberán exponerse en las respuestas del API.

El nuevo usuario tendrá uno de los siguientes estatus:

```text
active
inactive
```

El estatus inicial deberá corresponder a las reglas de creación definidas en el contrato del API.

#### Creación del primer usuario

El primer usuario de Vera Balance no se creará mediante una solicitud pública a `POST /v1/users`.

Se utilizará un procedimiento de inicialización restringido, también denominado *bootstrap*.

Este procedimiento permitirá crear:

- La clínica inicial.
- El primer usuario con rol `clinic`.
- La relación entre el usuario administrador y su clínica.

El procedimiento deberá ejecutarse desde un entorno administrativo autorizado.

No deberá exponerse como una operación pública sin autenticación.

Una vez creado el primer administrador, los usuarios adicionales se crearán mediante `POST /v1/users`, utilizando una sesión válida con rol `clinic`.

### 2.2 Get Users

```text
GET /v1/users
```

Requiere una sesión autenticada.

El usuario con rol `clinic` podrá consultar los usuarios pertenecientes a su clínica.

El usuario con rol `therapist` no podrá utilizar este endpoint para consultar el directorio administrativo de usuarios.

El backend deberá limitar los resultados conforme a la clínica y los permisos del usuario autenticado.

No deberán devolverse usuarios de otras clínicas.

### 2.3 Get User By ID

```text
GET /v1/users/{id}
```

Requiere una sesión autenticada.

El usuario con rol `clinic` podrá consultar los perfiles de los usuarios pertenecientes a su clínica.

El usuario con rol `therapist` podrá consultar su propio perfil.

Un terapeuta no podrá consultar información administrativa de otros usuarios mediante identificadores arbitrarios.

No deberán exponerse contraseñas ni hashes.

### 2.4 Update User

```text
PUT /v1/users/{id}
```

Requiere una sesión autenticada.

El usuario con rol `clinic` podrá editar usuarios pertenecientes a su clínica.

El usuario con rol `therapist` únicamente podrá editar su propio perfil, conforme a los campos permitidos.

El backend deberá validar la identidad, rol y clínica del usuario autenticado.

La operación no deberá permitir transferir usuarios entre clínicas.

Los campos relacionados con autorización, rol o pertenencia a una clínica deberán estar sujetos a permisos administrativos.

Un terapeuta no podrá modificar su propio rol para convertirse en administrador.

El estatus no deberá modificarse mediante este endpoint.

Los cambios de estatus se realizarán exclusivamente mediante:

```text
PATCH /v1/users/{id}/status
```

El cambio de contraseña se realizará mediante el módulo Auth.

### 2.5 Delete User

```text
DELETE /v1/users/{id}
```

Requiere una sesión autenticada y rol `clinic`.

El administrador únicamente podrá eliminar usuarios pertenecientes a su clínica.

El backend deberá validar las relaciones existentes antes de ejecutar la eliminación.

No se deberá permitir eliminar al último usuario activo con rol `clinic` de una clínica.

La eliminación deberá respetar las reglas de conservación e integridad de los procesos terapéuticos, pacientes y registros relacionados.

La política de eliminación física o lógica de usuarios con historial clínico asociado deberá definirse antes de permitir su eliminación definitiva.

Los usuarios con rol `therapist` no podrán ejecutar esta operación.

### 2.6 Change User Status

```text
PATCH /v1/users/{id}/status
```

Requiere una sesión autenticada y rol `clinic`.

El cambio de estatus del usuario se realiza exclusivamente mediante este endpoint.

Estados disponibles:

```text
active
inactive
```

Ejemplo:

```json
{
  "status": "inactive"
}
```

El backend deberá validar que el usuario solicitado pertenezca a la misma clínica del administrador autenticado.

No se permitirá modificar el estatus de usuarios pertenecientes a otras clínicas.

No se deberá permitir desactivar al último usuario activo con rol `clinic` de una clínica.

Únicamente los usuarios con estatus `active` podrán iniciar sesión.

Un usuario inactivo no deberá conservar acceso autorizado a los recursos protegidos.

La validación de autorización deberá considerar el estatus actual del usuario, además de la validez criptográfica del JWT.

## 3. Auth

```text
POST /v1/auth/sign-in
POST /v1/auth/sign-out
POST /v1/auth/verify
POST /v1/auth/refresh
POST /v1/auth/reset-password
POST /v1/auth/forgot-password
POST /v1/auth/forgot-password/reset
```

El módulo Auth administra la autenticación, verificación, renovación y cierre de sesión, así como el cambio y recuperación de contraseñas.

No se utiliza un endpoint para generar Public Operation Tokens.

### 3.1 Sign In

```text
POST /v1/auth/sign-in
```

Es un endpoint público.

No requiere una sesión autenticada ni un token previo.

El request debe proporcionar:

```json
{
  "email": "user@example.com",
  "password": "CurrentPassword123!"
}
```

El backend deberá:

1. Buscar al usuario mediante su email.
2. Validar que el usuario exista.
3. Validar que su estatus sea `active`.
4. Validar que su clínica se encuentre habilitada para operar.
5. Comparar la contraseña proporcionada contra el hash almacenado.
6. Generar un JWT de sesión si las credenciales son válidas.
7. Entregar el JWT mediante la cookie `vera_balance_session`.

El JWT tendrá una vigencia de 5 minutos.

No se devolverá en el cuerpo de la respuesta.

El frontend no deberá almacenar ni intentar leer el JWT.

El JWT no se almacenará en DynamoDB.

El backend deberá implementar controles de frecuencia para reducir intentos automatizados de autenticación.

### 3.2 Sign Out

```text
POST /v1/auth/sign-out
```

Requiere una sesión autenticada.

El backend elimina la cookie de sesión.

El cliente no debe enviar el JWT en el cuerpo de la solicitud.

El frontend deberá eliminar su estado de autenticación y redirigir al usuario a la pantalla de inicio de sesión.

Como el JWT es stateless y no se almacena en DynamoDB, eliminar la cookie no revoca automáticamente copias del JWT emitidas anteriormente.

Estas copias podrían seguir siendo válidas hasta su expiración.

El cierre de sesión deberá aplicar las medidas de protección CSRF correspondientes.

### 3.3 Verify

```text
POST /v1/auth/verify
```

Requiere una sesión autenticada.

El backend obtiene el JWT desde la cookie de sesión.

Deberá validar:

- Existencia del JWT.
- Formato.
- Firma.
- Fecha de expiración.
- Identidad autenticada.
- Estatus actual del usuario.
- Permisos aplicables.
- Estado de la clínica cuando corresponda.

El JWT no se recibe ni se devuelve en el cuerpo de la solicitud o respuesta.

Si la sesión es válida, el backend devuelve el resultado correspondiente.

Si el JWT es inválido o expiró, la operación deberá rechazarse.

El frontend podrá utilizar este endpoint para comprobar periódicamente el estado de autenticación.

La verificación no deberá renovar automáticamente una sesión inactiva.

### 3.4 Refresh

```text
POST /v1/auth/refresh
```

Requiere una sesión autenticada válida.

Permite renovar el JWT de sesión mientras el usuario continúa activo.

El backend deberá:

1. Obtener el JWT desde la cookie.
2. Validar su firma y expiración.
3. Comprobar que la sesión todavía sea válida.
4. Validar que el usuario continúe activo y autorizado.
5. Generar un nuevo JWT con vigencia de 5 minutos.
6. Reemplazar el JWT anterior mediante la cookie `vera_balance_session`.

El nuevo JWT no se almacenará en DynamoDB.

No se utilizará un refresh token independiente.

No se permitirá renovar una sesión utilizando únicamente un JWT expirado.

El frontend será responsable de detectar actividad real y solicitar la renovación antes del vencimiento del JWT.

Las solicitudes automáticas o procesos en segundo plano no deberán considerarse actividad del usuario.

El frontend deberá cerrar la sesión después de 5 minutos de inactividad.

La renovación deberá contar con protección CSRF.

El backend no puede demostrar la actividad real del usuario únicamente a partir de un JWT stateless. Por ello, el control de inactividad depende del frontend y no constituye por sí solo una garantía de expiración por inactividad verificable desde el servidor.

### 3.5 Reset Password

```text
POST /v1/auth/reset-password
```

Requiere una sesión autenticada.

La identidad del usuario se obtiene de la sesión.

El request debe proporcionar:

```json
{
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

La contraseña y su confirmación deben coincidir antes de generar el nuevo hash.

El email o identificador del usuario no se utiliza para determinar qué cuenta debe modificarse.

La nueva contraseña deberá almacenarse únicamente como hash.

La confirmación de contraseña nunca deberá persistirse.

Este endpoint corresponde al cambio de contraseña de un usuario autenticado y es independiente del flujo de recuperación de contraseña olvidada.

La operación deberá estar protegida contra CSRF.

El cambio de contraseña no revoca automáticamente los JWT emitidos previamente. La revocación inmediata requeriría un mecanismo adicional que no forma parte del diseño stateless actual.

### 3.6 Forgot Password

```text
POST /v1/auth/forgot-password
```

Es un endpoint público.

No requiere una sesión autenticada ni un token previo.

Permite iniciar el proceso de recuperación de contraseña.

El request recibe:

```json
{
  "email": "user@example.com"
}
```

La respuesta no debe revelar si el email proporcionado corresponde a un usuario existente.

Si existe un usuario asociado al email y puede utilizar el flujo de recuperación:

1. El backend genera un código numérico de 6 dígitos.
2. El código se asocia al usuario correspondiente.
3. El código tendrá una vigencia de 5 minutos.
4. El código permitirá un máximo de 5 intentos fallidos.
5. El código se enviará al correo electrónico registrado.
6. El código no se devolverá en la respuesta del API.
7. La contraseña actual del usuario no se modificará.

El envío de correo se realizará mediante Resend.

El backend deberá utilizar una plantilla independiente para el correo de recuperación.

El módulo Auth deberá consumir una abstracción del módulo Email, sin depender directamente del SDK de Resend.

#### Persistencia del código

El código de verificación se almacenará mediante la entidad:

```text
PASSWORD_RECOVERY
```

Únicamente se almacenará una representación protegida del código, nunca su valor en texto plano.

La estructura incluirá:

```text
pk: uuid del usuario
sk: 'PASSWORD_RECOVERY'
code_hash: string
expires_at: datetime
attempts: number
created_at: datetime
ttl: number
```

El código deberá protegerse mediante un mecanismo adecuado para secretos de baja entropía, como HMAC con una clave secreta del servidor.

Reglas:

- Solo podrá existir un código vigente por usuario.
- Solicitar otro código invalidará el anterior.
- El código expirará después de 5 minutos.
- El backend deberá validar explícitamente su expiración.
- No se dependerá únicamente de DynamoDB TTL.
- El código tendrá un máximo de 5 intentos fallidos.
- Al alcanzar el límite de intentos, quedará invalidado.
- Se deberán aplicar límites de frecuencia a las solicitudes de recuperación.
- No se deberán registrar códigos de recuperación ni contraseñas en logs.

### 3.7 Reset Forgotten Password

```text
POST /v1/auth/forgot-password/reset
```

Es un endpoint público.

No requiere una sesión autenticada.

La verificación de identidad se realiza mediante el email y el código enviado al correo registrado.

El request debe proporcionar:

```json
{
  "email": "user@example.com",
  "verification_code": "123456",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

El backend deberá:

1. Identificar al usuario asociado al email.
2. Obtener el registro de recuperación correspondiente.
3. Validar que el código proporcionado coincida con el código generado.
4. Comprobar que el código no haya expirado.
5. Comprobar que no haya sido consumido.
6. Comprobar que no se haya alcanzado el límite de intentos.
7. Validar que la nueva contraseña y su confirmación coincidan.
8. Generar el hash de la nueva contraseña.
9. Actualizar la contraseña del usuario.
10. Consumir y eliminar el registro de recuperación.

Cuando el código sea incorrecto:

- Se incrementará el número de intentos fallidos de manera segura.
- Se rechazará la operación.
- No se modificará la contraseña.

Después de 5 intentos fallidos, el código quedará invalidado.

El usuario deberá solicitar un nuevo código para continuar.

Cuando la contraseña se actualice correctamente:

- La nueva contraseña se almacenará únicamente como hash.
- `password_confirmation` no se persistirá.
- El código quedará consumido.
- El código no podrá reutilizarse.
- El registro de recuperación deberá eliminarse.
- No se creará automáticamente una sesión autenticada.

El usuario deberá iniciar sesión posteriormente mediante el flujo normal de autenticación.

La actualización de contraseña y el consumo del código deberán coordinarse de manera atómica o mediante un mecanismo equivalente que impida su reutilización ante solicitudes concurrentes.

## 4. Catalogs

Todos los endpoints de Catalogs requieren una sesión autenticada.

```text
POST    /v1/catalogs
GET     /v1/catalogs
GET     /v1/catalogs/{id}
PATCH   /v1/catalogs/{id}
DELETE  /v1/catalogs/{id}
```

Los catálogos permiten administrar valores reutilizables utilizados por otros módulos.

Los usuarios autenticados podrán consultar los catálogos conforme a sus permisos.

Las operaciones de creación, modificación y eliminación estarán sujetas a las reglas de administración establecidas para el sistema.

Los roles `clinic` y `therapist` no tendrán permisos para administrar catálogos globales.

Las operaciones administrativas de catálogos deberán permanecer restringidas hasta que se defina un mecanismo de administración del sistema.

## 5. Patients

Todos los endpoints de Patients requieren una sesión autenticada.

```text
POST    /v1/patients
GET     /v1/patients
GET     /v1/patients/{id}
PUT     /v1/patients/{id}
DELETE  /v1/patients/{id}
```

Cada paciente pertenece obligatoriamente a una clínica.

Los usuarios únicamente podrán acceder a pacientes conforme a su rol y a las relaciones de clínica y proceso terapéutico.

El usuario con rol `clinic` podrá administrar los pacientes de su clínica.

El usuario con rol `therapist` podrá crear y editar pacientes conforme a las reglas de asignación y propiedad de sus procesos terapéuticos.

Un terapeuta no podrá eliminar directamente pacientes.

Un paciente únicamente podrá eliminarse físicamente cuando no tenga ni haya tenido procesos terapéuticos asociados.

Si un paciente tiene o ha tenido un proceso terapéutico, su información deberá conservarse.

El paciente no tendrá un estatus propio.

El estado se administra mediante sus procesos terapéuticos.

El backend deberá validar la pertenencia a la clínica y los permisos del usuario antes de consultar, crear, modificar o eliminar pacientes.

## 6. Therapeutic Processes

Todos los endpoints de Therapeutic Processes requieren una sesión autenticada.

```text
POST    /v1/therapeutic-processes
GET     /v1/therapeutic-processes
GET     /v1/therapeutic-processes/{id}
GET     /v1/therapeutic-processes/patient/{patientId}
PUT     /v1/therapeutic-processes/{id}
DELETE  /v1/therapeutic-processes/{id}
PATCH   /v1/therapeutic-processes/{id}/status
```

Cada proceso terapéutico se relaciona con un terapeuta y uno o varios pacientes.

Los usuarios únicamente podrán consultar y modificar procesos conforme a sus permisos.

El usuario con rol `clinic` podrá administrar procesos terapéuticos pertenecientes a su clínica.

El usuario con rol `therapist` podrá crear y editar sus propios procesos terapéuticos.

Un terapeuta no podrá consultar ni modificar procesos asignados a otros terapeutas sin una autorización explícita.

El backend deberá validar que los pacientes y el terapeuta relacionados pertenezcan a la clínica correspondiente.

### 6.1 Change Therapeutic Process Status

```text
PATCH /v1/therapeutic-processes/{id}/status
```

Ejemplo:

```json
{
  "status": "inactive"
}
```

Estados disponibles:

```text
active
inactive
discharged
unfinished
```

El estado pertenece al proceso terapéutico y no al paciente.

El backend deberá validar los permisos del usuario autenticado antes de modificar el estado.

## 7. Records

Todos los endpoints de Records requieren una sesión autenticada.

```text
POST    /v1/records
GET     /v1/records
GET     /v1/records/{id}
GET     /v1/records/therapeutic-process/{therapeuticProcessId}
PUT     /v1/records/{id}
DELETE  /v1/records/{id}
```

Cada registro pertenece a un proceso terapéutico.

Los registros deberán respetar las reglas de acceso del proceso terapéutico correspondiente.

El usuario con rol `clinic` podrá administrar registros pertenecientes a procesos de su clínica.

El usuario con rol `therapist` podrá crear y editar registros correspondientes a sus propios procesos terapéuticos.

Un terapeuta no podrá consultar ni modificar registros pertenecientes a procesos asignados a otros terapeutas.

Las tareas se seleccionarán desde las tareas existentes y se almacenarán mediante referencias.

El backend deberá validar los permisos del usuario sobre el proceso terapéutico antes de permitir operaciones sobre sus registros.

## 8. Home Works

Todos los endpoints de Home Works requieren una sesión autenticada.

```text
POST    /v1/home-works
GET     /v1/home-works
GET     /v1/home-works/{id}
PUT     /v1/home-works/{id}
DELETE  /v1/home-works/{id}
```

Las tareas son entidades independientes que pueden asociarse a los registros de sesión.

Las operaciones deberán respetar los permisos del usuario y las relaciones con los procesos terapéuticos correspondientes.

El usuario con rol `clinic` podrá administrar las tareas autorizadas de su clínica.

El usuario con rol `therapist` podrá crear y editar tareas relacionadas con sus pacientes y procesos terapéuticos.

El backend deberá validar las relaciones correspondientes antes de permitir modificaciones.

Las tareas no deberán permitir acceso indirecto a registros o procesos terapéuticos pertenecientes a otras clínicas.

## 9. Reglas generales de seguridad

### 9.1 Autenticación

- Los endpoints públicos no requieren una sesión autenticada.
- `POST /v1/users` no es público.
- Los endpoints protegidos requieren un JWT válido enviado mediante cookie `HttpOnly`.
- El JWT tendrá una vigencia de 5 minutos.
- El JWT no se almacenará en DynamoDB.
- No existirán Public Operation Tokens.
- No existirán refresh tokens independientes.
- Los JWT expirados no podrán renovarse utilizando únicamente el token vencido.
- El backend deberá rechazar solicitudes protegidas sin autenticación válida.
- Los usuarios inactivos no podrán acceder a los recursos protegidos.
- El backend deberá comprobar el estado del usuario cuando sea necesario para aplicar los permisos actuales.

### 9.2 Autorización

- La autenticación no implica acceso automático a todos los recursos.
- Los permisos deberán validarse en el backend.
- Los usuarios con rol `clinic` únicamente podrán administrar recursos de su clínica.
- Los usuarios con rol `therapist` únicamente podrán acceder a los recursos autorizados de sus procesos terapéuticos.
- El backend no deberá confiar en identificadores enviados por el frontend para sustituir la identidad autenticada.
- La clínica del usuario autenticado deberá determinarse desde un contexto de identidad confiable.
- Ningún usuario podrá administrar recursos de otra clínica sin una autorización explícita.
- Los terapeutas no podrán crear ni administrar usuarios.
- La creación de usuarios requerirá el rol `clinic`.
- No se permitirá eliminar ni desactivar al último administrador activo de una clínica.
- Las validaciones de autorización deberán realizarse en el backend y no depender de restricciones visuales del frontend.

### 9.3 Sesiones

- El frontend deberá detectar la actividad del usuario.
- La sesión deberá renovarse antes de la expiración del JWT mientras exista actividad.
- Las solicitudes automáticas no deberán considerarse actividad.
- El frontend deberá finalizar la sesión después de 5 minutos de inactividad.
- El cierre de sesión eliminará la cookie.
- No existirá persistencia de JWT en DynamoDB.
- El cierre de sesión no garantizará la revocación inmediata de copias de JWT emitidas anteriormente.
- El frontend no deberá almacenar JWT en `localStorage`, `sessionStorage` ni Redux.
- El backend deberá aplicar protección CSRF a las operaciones que la requieran.
- El control de inactividad implementado únicamente en el frontend no garantiza que el backend pueda comprobar la ausencia de actividad real.

### 9.4 Recuperación de contraseña

- El código de recuperación tendrá 6 dígitos.
- Su vigencia será de 5 minutos.
- Permitirá un máximo de 5 intentos fallidos.
- Solo podrá utilizarse una vez.
- Únicamente se almacenará su representación protegida.
- Se enviará por correo mediante Resend.
- No permitirá acceder a endpoints protegidos.
- No generará automáticamente una sesión autenticada.
- El backend deberá impedir su reutilización, incluso ante solicitudes concurrentes.
- Las solicitudes deberán tener controles de frecuencia.
- No deberán exponerse códigos ni contraseñas en respuestas o logs.

### 9.5 Creación y administración de usuarios

- No existirá registro público de usuarios.
- `POST /v1/users` requerirá sesión autenticada y rol `clinic`.
- El primer usuario administrador se creará mediante un procedimiento de inicialización restringido.
- Los usuarios nuevos pertenecerán a la clínica del administrador autenticado.
- No se permitirá utilizar identificadores de clínica proporcionados por el cliente para evadir las reglas de autorización.
- El email deberá ser único.
- Las contraseñas deberán almacenarse únicamente como hashes seguros.
- Las contraseñas y sus confirmaciones nunca deberán exponerse en respuestas.
- Los terapeutas únicamente podrán modificar los campos autorizados de su propio perfil.
- Los terapeutas no podrán modificar su rol ni transferirse a otra clínica.
- El estatus del usuario se modificará exclusivamente mediante `PATCH /v1/users/{id}/status`.
- La modificación de datos generales del usuario no deberá alterar implícitamente su estatus.

### 9.6 Protección de operaciones mediante cookies

La autenticación mediante cookies requiere protección adicional frente a solicitudes realizadas desde orígenes no autorizados.

El backend deberá aplicar los controles correspondientes, incluyendo:

- Validación de origen para solicitudes que modifican información.
- Protección CSRF mediante un mecanismo adecuado.
- Configuración restrictiva de CORS cuando corresponda.
- Uso de cookies `HttpOnly` y `Secure`.
- Configuración `SameSite=Lax` conforme al diseño de autenticación.
- Rechazo de solicitudes que no cumplan las políticas de seguridad aplicables.

La propiedad `SameSite=Lax` no deberá considerarse por sí sola una protección CSRF suficiente.

### 9.7 Respuestas de seguridad

Los endpoints deberán utilizar los códigos de respuesta definidos en OpenAPI.

De manera general:

- `401 Unauthorized`: no existe una sesión válida o la autenticación ha expirado.
- `403 Forbidden`: el usuario está autenticado, pero no tiene autorización para realizar la operación.
- `404 Not Found`: el recurso solicitado no existe o no debe revelarse su existencia al usuario.
- `409 Conflict`: la operación entra en conflicto con una restricción de integridad o unicidad.
- `422 Unprocessable Entity`: los datos no cumplen las reglas de validación, cuando así lo establezca el contrato.
- `429 Too Many Requests`: se ha superado un límite de frecuencia.

La respuesta concreta de cada endpoint deberá respetar el contrato OpenAPI.

## 10. Consistencia de la documentación

Las implementaciones deberán respetar los siguientes documentos:

```text
docs/DEFINITIONS.md
docs/ENDPOINTS.md
docs/DB.md
docs/baas-vera-balance-dashboard.yaml
```

`docs/DEFINITIONS.md` establece las reglas funcionales y de negocio.

`docs/ENDPOINTS.md` documenta las rutas disponibles, sus requisitos de autenticación y las reglas generales de autorización.

`docs/DB.md` define las estructuras de persistencia.

`docs/baas-vera-balance-dashboard.yaml` establece el contrato técnico de las operaciones, solicitudes, respuestas y esquemas.

Las historias de usuario deberán respetar estas definiciones.

Cuando una historia de usuario requiera modificar una regla existente, deberán actualizarse los documentos correspondientes para mantener la consistencia del sistema.

## 11. Decisiones pendientes

Las siguientes decisiones requieren una definición adicional antes de habilitar las operaciones correspondientes:

1. **Aprovisionamiento de clínicas:** determinar el mecanismo administrativo autorizado para crear nuevas clínicas después de la inicialización inicial.
2. **Eliminación de clínicas:** definir las reglas de conservación, desactivación y eliminación de clínicas con información asociada.
3. **Eliminación de usuarios:** definir el tratamiento de usuarios con procesos terapéuticos o registros históricos asociados.
4. **Administración de catálogos globales:** establecer el mecanismo o identidad administrativa que podrá crearlos, modificarlos y eliminarlos.
5. **Revocación inmediata de sesiones:** decidir si se requiere invalidar JWT emitidos previamente ante cambios de contraseña, desactivación o eventos de seguridad.
6. **Control de inactividad del lado del servidor:** determinar si el requisito de cinco minutos debe garantizarse también desde el backend o si se mantendrá como un control del frontend.

Estas decisiones no deberán resolverse mediante la exposición de endpoints públicos o la concesión implícita de permisos adicionales a los roles existentes.
