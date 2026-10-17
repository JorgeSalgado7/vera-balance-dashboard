# US — Update User

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero actualizar la información de un usuario,  
para mantener sus datos personales y profesionales actualizados de acuerdo con mis permisos.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir modificar la información de un usuario existente sin alterar los campos que no formen parte de la actualización.

La operación se realizará mediante el endpoint:

```http
PUT /v1/users/{id}
```

Este endpoint requiere una sesión autenticada válida mediante la cookie `vera_balance_session`.

Los permisos dependerán del rol del usuario autenticado:

- `clinic`: podrá actualizar usuarios pertenecientes a su misma clínica, incluyendo los campos administrativos autorizados.
- `therapist`: únicamente podrá actualizar los campos permitidos de su propio perfil.

No se permitirá modificar la clínica asociada al usuario mediante este endpoint.

El estatus del usuario se modificará exclusivamente mediante:

```http
PATCH /v1/users/{id}/status
```

La contraseña se modificará mediante los endpoints correspondientes del módulo Auth.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita actualizar un usuario,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una sesión autenticada válida.

Si la cookie de sesión no existe, el JWT es inválido o ha expirado,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

No deberá modificarse información del usuario.

### CA-02 - Validar autorización

Dado que existe una sesión autenticada válida,  
cuando se solicita actualizar un usuario,  
entonces el sistema debe validar el rol, estatus y permisos del usuario autenticado.

Las reglas de autorización serán:

- Un usuario con rol `clinic` podrá actualizar usuarios pertenecientes a su misma clínica.
- Un usuario con rol `therapist` únicamente podrá actualizar su propio perfil.
- Un terapeuta no podrá modificar campos administrativos como `role`, `clinic` o `status`.

Si el usuario autenticado no cuenta con los permisos necesarios,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

### CA-03 - Validar identificador

Dado que se solicita actualizar un usuario,  
cuando el sistema recibe el identificador mediante el parámetro `id`,  
entonces debe validar que tenga un formato UUID válido.

Si el identificador no cumple con el formato esperado,  
entonces el sistema debe rechazar la solicitud con `400 Bad Request`.

### CA-04 - Actualizar usuario existente

Dado que existe un usuario con el identificador proporcionado,  
y el usuario autenticado tiene autorización para modificarlo,  
cuando se proporciona información válida,  
entonces el sistema debe guardar los cambios correctamente.

Los cambios deberán aplicarse únicamente a los campos autorizados.

### CA-05 - Actualización parcial

Dado que únicamente se proporcionan algunos campos,  
cuando se actualiza el usuario,  
entonces los campos no proporcionados deben conservar su valor actual.

La operación no deberá reemplazar información existente con valores `null` o vacíos cuando dichos valores no estén permitidos.

La actualización deberá respetar el comportamiento parcial definido para este endpoint.

### CA-06 - Información obligatoria

Dado que se proporciona un nuevo valor para alguno de los siguientes campos:

- `name`
- `email`
- `professional_license`

Cuando se valida la actualización,  
entonces el valor proporcionado no puede estar vacío.

Los campos que no se proporcionen deberán conservar su valor actual.

### CA-07 - Validar formato del email

Dado que se proporciona un nuevo email,  
cuando el sistema valida la información,  
entonces debe comprobar que tenga un formato válido.

Si el formato no es válido,  
entonces el sistema debe rechazar la actualización.

### CA-08 - Email único

Dado que se proporciona un nuevo email,  
cuando ese email ya pertenece a otro usuario,  
entonces el sistema debe rechazar la actualización con `409 Conflict`.

Dado que el email pertenece al mismo usuario que se está actualizando,  
entonces el sistema debe permitir conservarlo.

La validación deberá utilizar el mismo criterio de normalización de email establecido para la creación de usuarios.

La unicidad deberá mantenerse incluso ante solicitudes concurrentes, utilizando los mecanismos de persistencia correspondientes.

### CA-09 - Actualizar rol

Dado que un administrador autenticado tiene rol `clinic`,  
y solicita actualizar el rol de un usuario perteneciente a su clínica,  
cuando proporciona un nuevo rol,  
entonces únicamente debe permitirse uno de los siguientes valores:

```text
clinic
therapist
```

Si se proporciona un rol diferente,  
entonces el sistema debe rechazar la operación.

Un usuario con rol `therapist` no podrá modificar su propio rol ni el de otros usuarios.

### CA-10 - Impedir modificación de clínica

Dado que se solicita actualizar un usuario,  
cuando el request intenta modificar su asociación con una clínica,  
entonces el sistema debe rechazar la modificación.

El campo `clinic` o `clinic_id` no deberá ser editable mediante este endpoint.

El usuario deberá conservar su asociación con la clínica actual.

No se permitirá transferir usuarios entre clínicas mediante esta operación.

### CA-11 - Impedir modificación de estado

Dado que se solicita actualizar un usuario,  
cuando el request contiene el campo `status`,  
entonces el sistema debe rechazar la modificación de ese campo.

El estatus únicamente podrá modificarse mediante:

```http
PATCH /v1/users/{id}/status
```

Los estados disponibles seguirán siendo:

```text
active
inactive
```

### CA-12 - Impedir modificación de contraseña

Dado que se solicita actualizar un usuario,  
cuando el request contiene campos relacionados con contraseñas,  
entonces el sistema debe rechazar su modificación mediante este endpoint.

Los campos no permitidos incluyen:

- `password`
- `password_confirmation`
- `password_hash`

La contraseña y su hash deberán conservarse sin modificaciones.

El cambio de contraseña se realizará mediante el módulo Auth.

### CA-13 - Permitir al terapeuta actualizar su propio perfil

Dado que un usuario autenticado tiene rol `therapist`,  
cuando solicita actualizar su propio perfil,  
entonces el sistema debe permitir modificar únicamente los siguientes campos:

- `name`
- `email`
- `professional_license`

El identificador solicitado deberá coincidir con el identificador del usuario autenticado.

No se permitirá modificar campos administrativos.

### CA-14 - Impedir al terapeuta actualizar otros usuarios

Dado que un usuario autenticado tiene rol `therapist`,  
cuando solicita actualizar un usuario cuyo identificador es diferente al suyo,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

No deberá modificarse información del usuario solicitado.

### CA-15 - Impedir actualización de usuarios de otras clínicas

Dado que un administrador autenticado tiene rol `clinic`,  
cuando solicita actualizar un usuario perteneciente a otra clínica,  
entonces el sistema debe rechazar la operación.

Para evitar revelar la existencia de usuarios de otras clínicas, el sistema deberá responder con `404 Not Found`.

No deberá modificarse información del usuario solicitado.

### CA-16 - Validar estado del usuario autenticado

Dado que un usuario autenticado solicita actualizar información,  
cuando el sistema valida sus permisos,  
entonces debe comprobar que su estatus actual sea `active`.

Si el usuario autenticado se encuentra inactivo,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

### CA-17 - Validar clínica activa

Dado que un usuario autenticado solicita actualizar información,  
cuando el sistema identifica su clínica,  
entonces debe validar que la clínica exista y tenga estatus `active`.

Si la clínica no existe o se encuentra inactiva,  
entonces el sistema debe rechazar la operación.

No deberá modificarse información del usuario solicitado.

### CA-18 - Proteger al último administrador activo

Dado que un administrador solicita modificar el rol de un usuario,  
cuando el usuario solicitado es el último usuario activo con rol `clinic` de su clínica,  
entonces el sistema no debe permitir cambiar su rol a `therapist`.

La operación deberá rechazarse con `409 Conflict`.

La clínica deberá conservar al menos un usuario activo con rol `clinic`.

### CA-19 - Fecha de actualización

Dado que la información del usuario fue modificada correctamente,  
cuando finaliza la operación,  
entonces el sistema debe actualizar el campo:

```text
updated_at
```

La fecha de creación deberá conservarse sin modificaciones:

```text
created_at
```

Si la solicitud no produce cambios efectivos, no será necesario modificar `updated_at`.

### CA-20 - Usuario inexistente

Dado que no existe un usuario con el identificador proporcionado,  
cuando se intenta actualizar,  
entonces el sistema debe responder con `404 Not Found`.

No deberá crearse un usuario nuevo como resultado de esta operación.

### CA-21 - Proteger información sensible

Dado que un usuario fue actualizado correctamente,  
cuando el sistema genera la respuesta,  
entonces no debe incluir:

- Contraseña original.
- Hash de contraseña.
- Confirmación de contraseña.
- JWT de sesión.
- Información interna de autenticación.

La respuesta deberá contener únicamente los campos autorizados por el contrato OpenAPI.

### CA-22 - Respuesta correcta

Dado que el usuario existe,  
y el usuario autenticado tiene autorización para modificarlo,  
y los datos proporcionados son válidos,  
cuando la operación finaliza correctamente,  
entonces el sistema debe responder con `200 OK`.

La respuesta deberá contener la información pública actualizada del usuario conforme al contrato OpenAPI.

### CA-23 - Proteger la operación contra solicitudes no autorizadas

Dado que el endpoint utiliza autenticación mediante cookies,  
cuando se recibe una solicitud de actualización,  
entonces el backend debe aplicar los controles de protección CSRF definidos para Vera Balance.

Si la solicitud no cumple las políticas de seguridad correspondientes,  
entonces debe rechazarse sin modificar información.

### CA-24 - Evitar actualizaciones parciales inconsistentes

Dado que se solicita actualizar un usuario,  
cuando ocurre un error durante la operación,  
entonces el sistema no debe dejar información inconsistente.

Si se modifica el email, la actualización del usuario y la actualización de su referencia de unicidad deberán realizarse de forma consistente.

Si la operación falla, deberán conservarse los valores anteriores.

## Reglas de negocio

- La actualización requiere una sesión autenticada válida.
- Únicamente los usuarios con estatus `active` pueden realizar operaciones protegidas.
- Los usuarios con rol `clinic` pueden actualizar usuarios pertenecientes a su misma clínica.
- Los usuarios con rol `therapist` únicamente pueden actualizar su propio perfil.
- Los terapeutas únicamente pueden modificar `name`, `email` y `professional_license`.
- Los terapeutas no pueden modificar roles ni información administrativa.
- Ningún usuario puede actualizar usuarios pertenecientes a otras clínicas.
- La clínica del usuario autenticado debe obtenerse desde el contexto de autenticación.
- La clínica debe existir y encontrarse activa.
- El identificador del usuario debe tener formato UUID válido.
- Los campos no proporcionados deben conservar su valor actual.
- Los valores proporcionados para campos obligatorios no pueden estar vacíos.
- El email debe ser único dentro de Vera Balance.
- La unicidad del email debe mantenerse ante solicitudes concurrentes.
- Los roles permitidos son `clinic` y `therapist`.
- No se permite modificar la clínica asociada mediante este endpoint.
- No se permite modificar el estatus mediante este endpoint.
- No se permite modificar contraseñas mediante este endpoint.
- No se permite eliminar el último administrador activo mediante un cambio de rol.
- La fecha de creación debe conservarse.
- La fecha de actualización debe modificarse cuando existan cambios efectivos.
- Las contraseñas nunca deben almacenarse en texto plano.
- La contraseña y su hash nunca deben exponerse mediante el API.
- Las validaciones de autorización deben realizarse en el backend.

## Dependencias

- US-USER-003 — Get User By ID.
- Auth.
- Clinics.
- Users.

## Consideraciones técnicas

### Endpoint

```http
PUT /v1/users/{id}
```

El endpoint requiere autenticación mediante la cookie:

```text
vera_balance_session
```

### Parámetros

El endpoint recibe el identificador único del usuario mediante el parámetro de ruta:

```text
id: UUID
```

Ejemplo:

```http
PUT /v1/users/7cb3a81a-e137-4ef4-aafd-6e387c8c7390
```

El identificador deberá validarse antes de ejecutar la actualización.

### Request

El request deberá respetar el esquema definido en OpenAPI.

Ejemplo de actualización de información personal:

```json
{
  "name": "Nombre actualizado",
  "email": "usuario.actualizado@example.com",
  "professional_license": "87654321"
}
```

Ejemplo de actualización administrativa del rol:

```json
{
  "role": "therapist"
}
```

La actualización del rol únicamente estará disponible para usuarios autorizados con rol `clinic`.

No deberán aceptarse los siguientes campos:

- `clinic`
- `clinic_id`
- `status`
- `password`
- `password_confirmation`
- `password_hash`
- `created_at`
- `updated_at`

El identificador del usuario tampoco podrá modificarse mediante el cuerpo de la solicitud.

### Autenticación y autorización

- El JWT deberá obtenerse desde la cookie `vera_balance_session`.
- La validación de sesión deberá realizarse mediante las capacidades del módulo Auth.
- El backend deberá validar el rol y estatus actual del usuario autenticado.
- La identidad autenticada deberá obtenerse desde el contexto de sesión.
- La clínica deberá identificarse desde el contexto autenticado.
- El backend deberá validar que la clínica exista y se encuentre activa.
- Los usuarios con rol `clinic` podrán actualizar usuarios de su clínica.
- Los usuarios con rol `therapist` únicamente podrán actualizar su propio perfil.
- La autorización deberá aplicarse en el backend y no depender del frontend.

### Validación

- Los datos proporcionados deberán validarse antes de persistir los cambios.
- Los campos no proporcionados deberán conservar su valor actual.
- Los campos obligatorios no deberán aceptar valores vacíos.
- El email deberá tener un formato válido.
- El email deberá normalizarse de manera consistente.
- El rol deberá pertenecer a los valores permitidos.
- No deberán aceptarse campos administrativos no autorizados.
- La actualización no deberá permitir modificar el identificador del usuario.

### Email único

- Si el email no cambia, deberá conservarse la referencia existente.
- Si el email cambia, deberá comprobarse que no pertenezca a otro usuario.
- La verificación previa no será suficiente para garantizar unicidad ante solicitudes concurrentes.
- La actualización del email y su referencia de unicidad deberán ejecutarse mediante un mecanismo consistente de persistencia.
- Si la operación falla, no deberán quedar referencias de email inconsistentes.

### Contraseña

- La contraseña no se actualizará en esta historia de usuario.
- El hash almacenado deberá conservarse sin modificaciones.
- No deberán aceptarse contraseñas ni confirmaciones en el request.
- Las contraseñas y sus hashes nunca deberán exponerse mediante el API.

### Persistencia

- La persistencia deberá respetar el modelo Single Table de DynamoDB definido en `docs/DB.md`.
- El acceso al usuario deberá realizarse mediante las abstracciones del módulo Users.
- La actualización deberá modificar únicamente los campos autorizados.
- Los campos no proporcionados deberán conservar sus valores actuales.
- Las operaciones que afecten restricciones de unicidad o integridad deberán ejecutarse de manera consistente.
- Los detalles específicos de DynamoDB no deberán exponerse en el dominio.

### Arquitectura

La implementación deberá respetar la arquitectura definida en `docs/PROJECT_ARCHITECTURE.md`.

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, validación del identificador, autenticación, validación de entrada y construcción de la respuesta HTTP.
- `application`: ejecución del caso de uso Update User y aplicación de las reglas de autorización.
- `domain`: reglas e invariantes de actualización del usuario.
- `infrastructure`: consulta y actualización mediante adaptadores de persistencia.

El caso de uso deberá utilizar abstracciones para consultar el usuario solicitado, validar los permisos y persistir los cambios.

No deberá depender directamente de controladores HTTP, cookies, Dynamoose ni implementaciones concretas de infraestructura.

### Contratos y documentación

- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La persistencia debe respetar `docs/DB.md`.
- Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
- Los endpoints y sus permisos deben respetar `docs/ENDPOINTS.md`.
- La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [x] Los criterios de aceptación originales fueron implementados.
- [ ] Se verificó la autenticación y autorización según los nuevos criterios.
- [ ] Se verificó que los terapeutas únicamente puedan actualizar su propio perfil.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó que `clinic`, `status` y las contraseñas no puedan modificarse mediante este endpoint.
- [ ] Se verificó la protección del último administrador activo.
- [ ] Se verificó la consistencia de la unicidad del email.
- [ ] Se confirmó la consistencia con el contrato OpenAPI.
- [ ] La implementación fue revisada después de los ajustes.
