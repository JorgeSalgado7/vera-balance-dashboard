# US — Create User

## Historia de usuario

Como usuario autorizado de Vera Balance con rol `clinic`,  
quiero registrar un usuario dentro de mi clínica,  
para permitirle utilizar las funcionalidades correspondientes a su rol.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir registrar usuarios de Vera Balance con su información personal, profesional y de acceso.

Un usuario puede tener el rol `clinic` o `therapist` y siempre debe estar asociado a una clínica.

La creación de usuarios se realizará mediante el endpoint:

```http
POST /v1/users
```

Este endpoint es protegido y requiere una sesión autenticada válida mediante la cookie `vera_balance_session`.

Únicamente los usuarios con rol `clinic` y estatus `active` podrán registrar nuevos usuarios.

El nuevo usuario deberá pertenecer a la misma clínica del administrador autenticado.

La clínica se determinará a partir de la identidad autenticada y no mediante un identificador proporcionado libremente por el cliente.

La creación del primer usuario administrador se realizará mediante un procedimiento de inicialización restringido (*bootstrap*) y no mediante este endpoint.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita crear un usuario,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una sesión autenticada válida.

Si la cookie de sesión no existe, el JWT es inválido o ha expirado,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

No debe persistirse información del nuevo usuario.

### CA-02 - Validar autorización

Dado que existe una sesión autenticada válida,  
cuando se solicita crear un usuario,  
entonces el sistema debe validar que el usuario autenticado tenga rol `clinic` y estatus `active`.

Si el usuario tiene rol `therapist`, se encuentra inactivo o no cuenta con los permisos necesarios,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

No debe persistirse información del nuevo usuario.

### CA-03 - Validar datos antes de la creación

Dado que un usuario autorizado solicita crear un usuario,  
cuando el sistema recibe la información,  
entonces debe validar los datos proporcionados antes de realizar cualquier operación de persistencia relacionada con su creación.

Si alguno de los datos no cumple con las reglas definidas para el usuario,  
entonces el sistema debe rechazar la operación.

No debe persistirse información del nuevo usuario.

### CA-04 - Información obligatoria

Dado que se intenta crear un usuario,  
cuando alguno de los siguientes campos está vacío o no fue proporcionado:

- `name`
- `email`
- `password`
- `password_confirmation`
- `professional_license`
- `role`

Entonces el sistema debe rechazar la operación.

La clínica no se recibirá como un campo obligatorio del request, ya que será determinada mediante la sesión del administrador autenticado.

### CA-05 - Validar formato del email

Dado que se proporciona un email,  
cuando el sistema valida la información del usuario,  
entonces debe comprobar que tenga un formato válido.

Si el formato no es válido,  
entonces el sistema debe rechazar la creación.

### CA-06 - Validar que un usuario no existe

Dado que se proporciona información válida,  
cuando se solicita crear un usuario,  
entonces el sistema debe validar que el email proporcionado no se encuentre registrado.

En caso de existir un usuario con el mismo email,  
entonces el sistema debe rechazar la creación con `409 Conflict`.

La unicidad del email deberá garantizarse incluso cuando existan solicitudes concurrentes.

### CA-07 - Validar confirmación de contraseña

Dado que se proporciona una contraseña y su confirmación,  
cuando el sistema valida los datos del usuario,  
entonces debe comprobar que `password` y `password_confirmation` coincidan.

Si ambos valores son diferentes,  
entonces el sistema debe rechazar la operación.

La confirmación de contraseña es únicamente un dato de entrada y nunca debe persistirse.

### CA-08 - Protección de contraseña

Dado que se proporciona una contraseña válida,  
cuando se crea el usuario,  
entonces la contraseña debe convertirse en un hash seguro antes de ser persistida.

La contraseña original no debe almacenarse en la base de datos.

La contraseña, su confirmación y el hash generado no deben exponerse mediante el API ni registrarse en logs.

### CA-09 - Rol válido

Dado que se crea un usuario,  
cuando se proporciona su rol,  
entonces únicamente debe permitirse uno de los siguientes valores:

```text
clinic
therapist
```

Si se proporciona un rol diferente,  
entonces el sistema debe rechazar la operación.

El usuario autenticado no podrá utilizar este endpoint para asignar roles distintos de los definidos.

### CA-10 - Asociación obligatoria con clínica

Dado que un administrador autenticado solicita crear un usuario,  
cuando el sistema valida la solicitud,  
entonces debe identificar la clínica a la que pertenece el administrador.

El nuevo usuario deberá asociarse obligatoriamente con esa misma clínica.

La asociación con una clínica no puede ser `null`.

El backend no debe permitir crear usuarios pertenecientes a otras clínicas.

La referencia de la clínica debe almacenarse de acuerdo con el modelo definido en `docs/DB.md`.

### CA-11 - Validar clínica del administrador

Dado que se solicita crear un usuario,  
cuando el sistema obtiene la clínica del administrador autenticado,  
entonces debe validar que la clínica exista y tenga estatus `active`.

Si la clínica no existe o se encuentra inactiva,  
entonces el sistema debe rechazar la operación.

No debe persistirse información del nuevo usuario.

### CA-12 - Generar identificador

Dado que se crea un usuario,  
cuando se procesa la solicitud,  
entonces el sistema debe generar un identificador único mediante UUID.

El identificador deberá utilizarse conforme al modelo de persistencia definido para Users.

### CA-13 - Estado inicial

Dado que se crea un nuevo usuario,  
cuando el usuario es registrado,  
entonces debe iniciar con estado:

```text
active
```

El estado inicial no debe depender de un valor proporcionado por el cliente.

Los cambios posteriores de estatus deberán realizarse exclusivamente mediante:

```http
PATCH /v1/users/{id}/status
```

### CA-14 - Fechas de auditoría

Dado que se registra un usuario,  
cuando finaliza su creación,  
entonces el sistema debe generar las fechas de creación y última actualización.

Los campos serán:

- `created_at`
- `updated_at`

Ambos deberán establecerse con la fecha y hora de creación del usuario.

### CA-15 - Crear usuario correctamente

Dado que existe una sesión autenticada válida,  
y el usuario autenticado tiene rol `clinic`,  
y su clínica se encuentra activa,  
y se proporciona información válida,  
y el email no se encuentra registrado,  
cuando se solicita crear un usuario,  
entonces el sistema debe registrar correctamente al nuevo usuario.

El usuario deberá quedar asociado a la clínica del administrador autenticado.

La creación no deberá generar automáticamente una sesión autenticada para el nuevo usuario.

### CA-16 - Respuesta

Dado que el usuario fue creado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `201 Created`.

La respuesta deberá contener la información pública del usuario conforme al contrato OpenAPI.

Podrá incluir:

- `id`
- `name`
- `email`
- `professional_license`
- `clinic`
- `role`
- `status`
- `created_at`
- `updated_at`

La contraseña, su confirmación y el hash no deben formar parte de la respuesta.

### CA-17 - Evitar creación de usuarios en otras clínicas

Dado que un administrador autenticado solicita crear un usuario,  
cuando la solicitud contiene un identificador de clínica diferente al de su sesión,  
entonces el sistema no debe utilizar ese identificador para asociar al nuevo usuario.

La clínica deberá determinarse exclusivamente desde el contexto autenticado.

El sistema deberá rechazar los intentos de asignación explícita a una clínica diferente.

### CA-18 - Proteger la operación contra solicitudes no autorizadas

Dado que el endpoint utiliza autenticación mediante cookies,  
cuando se recibe una solicitud de creación de usuario,  
entonces el backend debe aplicar los controles de protección CSRF definidos para Vera Balance.

Si la solicitud no cumple las políticas de seguridad correspondientes,  
entonces debe rechazarse sin crear el usuario.

### CA-19 - Evitar creación parcial

Dado que se solicita crear un usuario,  
cuando ocurre un error durante la operación,  
entonces el sistema no debe dejar información parcial que represente un usuario creado incorrectamente.

La creación del usuario y la reserva de unicidad de su email deberán mantenerse consistentes.

Si la operación falla, no deberá quedar un email reservado sin su usuario correspondiente.

### CA-20 - Restringir la creación del primer administrador

Dado que una clínica todavía no tiene un usuario administrador inicial,  
cuando se requiere registrar su primer usuario con rol `clinic`,  
entonces el sistema deberá utilizar el procedimiento de inicialización restringido definido para Vera Balance.

El endpoint `POST /v1/users` no deberá permitir crear usuarios sin una sesión autenticada.

No deberá existir una excepción pública para crear el primer administrador.

## Reglas de negocio

- La creación de usuarios requiere una sesión autenticada válida.
- Únicamente los usuarios con rol `clinic` y estatus `active` pueden crear usuarios.
- Los usuarios con rol `therapist` no pueden registrar usuarios.
- Los datos del usuario deben validarse antes de realizar su creación.
- Si los datos proporcionados no son válidos, no debe realizarse ninguna operación de persistencia para crear el usuario.
- El email de un usuario debe ser único dentro de Vera Balance.
- La unicidad del email debe garantizarse ante solicitudes concurrentes.
- Los roles permitidos son `clinic` y `therapist`.
- Todo usuario debe estar asociado a una clínica.
- La asociación con una clínica es obligatoria y no puede ser `null`.
- La clínica del nuevo usuario se determina desde la sesión del administrador autenticado.
- No se permite crear usuarios pertenecientes a otras clínicas.
- La clínica debe existir y encontrarse activa.
- Un usuario nuevo inicia con estado `active`.
- El estado inicial no puede ser modificado desde el request de creación.
- La contraseña y su confirmación deben coincidir.
- Las contraseñas nunca deben almacenarse en texto plano.
- La confirmación de contraseña nunca debe persistirse.
- La contraseña, su confirmación y su hash nunca deben exponerse mediante el API.
- La creación de un usuario no inicia automáticamente una sesión para él.
- El primer administrador de una clínica se crea mediante un procedimiento de inicialización restringido.
- No se permite registrar usuarios de manera pública.
- Las operaciones de creación deben aplicar los controles de seguridad correspondientes a la autenticación mediante cookies.

## Dependencias

- Auth.
- Clinics.
- Users.

## Consideraciones técnicas

### Endpoint

```http
POST /v1/users
```

El endpoint requiere autenticación mediante la cookie:

```text
vera_balance_session
```

La operación debe validar que el usuario autenticado tenga rol `clinic`.

### Request

El request deberá respetar el esquema definido en OpenAPI.

Los campos necesarios para la creación son:

```json
{
  "name": "Nombre del usuario",
  "email": "usuario@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!",
  "professional_license": "12345678",
  "role": "therapist"
}
```

La clínica no debe determinarse mediante un valor enviado por el cliente.

Si el esquema OpenAPI conserva el campo `clinic` o `clinic_id` como dato de entrada, deberá actualizarse para reflejar esta regla antes de implementar el endpoint.

### Autenticación y autorización

- El JWT deberá obtenerse desde la cookie `vera_balance_session`.
- La validación de sesión deberá realizarse mediante las capacidades del módulo Auth.
- La identidad autenticada no deberá obtenerse desde el cuerpo de la solicitud.
- El backend deberá validar el rol y estatus actual del administrador.
- La clínica deberá obtenerse desde el contexto autenticado y validarse mediante las capacidades del módulo Clinics.
- No se permitirá crear usuarios fuera de la clínica del administrador.
- La autorización deberá aplicarse en el backend y no depender del frontend.

### Validación

- Los datos de entrada deberán validarse antes de persistir el usuario.
- El email deberá normalizarse de manera consistente para evitar registros duplicados por diferencias de mayúsculas y minúsculas.
- La contraseña y su confirmación deberán validarse antes de generar el hash.
- El rol deberá pertenecer a los valores permitidos.
- Los campos obligatorios no deberán aceptar valores vacíos.
- El estatus inicial deberá asignarse desde el backend.

### Contraseña

- La contraseña deberá procesarse mediante un algoritmo de hashing adecuado para contraseñas, como bcrypt.
- La contraseña original no deberá persistirse.
- La confirmación de contraseña no deberá persistirse.
- La contraseña y su hash no deberán devolverse en respuestas.
- Las credenciales no deberán registrarse en logs.

### Persistencia

- La persistencia deberá respetar el modelo Single Table de DynamoDB definido en `docs/DB.md`.
- La verificación previa de unicidad del email no será suficiente por sí sola.
- Deberá implementarse una restricción de unicidad mediante escrituras condicionales o transacciones de DynamoDB.
- La creación del usuario y la reserva de su email deberán ejecutarse de forma consistente.
- Los detalles específicos de DynamoDB no deberán exponerse en el dominio.

### Arquitectura

La implementación deberá respetar la arquitectura definida en `docs/architecture-guidelines.md`.

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, autenticación, autorización y validación de entrada.
- `application`: ejecución del caso de uso Create User.
- `domain`: reglas e invariantes del usuario.
- `infrastructure`: persistencia, hashing y adaptadores externos.

El caso de uso deberá utilizar abstracciones para consultar la identidad autorizada, validar la clínica y persistir el usuario.

No deberá depender directamente de controladores HTTP, cookies, Dynamoose ni implementaciones concretas de infraestructura.

### Contratos y documentación

- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La persistencia debe respetar `docs/DB.md`.
- Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
- Los endpoints y sus permisos deben respetar `docs/ENDPOINTS.md`.
- La implementación debe respetar `docs/architecture-guidelines.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/architecture-guidelines.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] El endpoint requiere autenticación y rol `clinic`.
- [ ] La asociación con la clínica se obtiene desde el contexto autenticado.
- [ ] Se impide crear usuarios en otras clínicas.
- [ ] La unicidad del email está garantizada ante solicitudes concurrentes.
- [ ] Las contraseñas se almacenan únicamente mediante hashes seguros.
- [ ] La respuesta no expone información sensible.
- [ ] El contrato OpenAPI y la implementación son consistentes.
- [ ] La implementación fue revisada.
