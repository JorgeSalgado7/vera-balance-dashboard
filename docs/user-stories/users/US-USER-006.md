# US — Change User Status

## Historia de usuario

Como usuario autorizado de Vera Balance con rol `clinic`,  
quiero cambiar el estado de un usuario perteneciente a mi clínica,  
para activar o desactivar su acceso al sistema sin eliminar su información.

**Scope:** Backend  
**Status:** Under Review

## Descripción

El sistema debe permitir modificar únicamente el estado de un usuario existente.

La operación se realizará mediante el endpoint:

`PATCH /v1/users/{id}/status`

Este endpoint requiere una sesión autenticada válida mediante la cookie `vera_balance_session`.

Únicamente los usuarios con rol `clinic` y estado `active` podrán modificar el estado de usuarios pertenecientes a su propia clínica.

Los estados disponibles son:

- `active`: el usuario puede acceder al sistema conforme a su rol y permisos.
- `inactive`: el usuario no puede autenticarse ni utilizar funcionalidades protegidas.

La desactivación no implica eliminar al usuario ni sus relaciones con pacientes, procesos terapéuticos o registros clínicos.

El cambio de estado deberá realizarse independientemente de la actualización general del usuario.

No se permitirá desactivar al último administrador activo de una clínica.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita cambiar el estado de un usuario,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una sesión autenticada válida.

Si la cookie de sesión no existe, el JWT es inválido o ha expirado,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

No deberá modificarse el estado del usuario.

### CA-02 - Validar autorización

Dado que existe una sesión autenticada válida,  
cuando se solicita cambiar el estado de un usuario,  
entonces el sistema debe validar que el usuario autenticado tenga rol `clinic` y estado `active`.

Si el usuario autenticado tiene rol `therapist` o no cuenta con los permisos necesarios,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

No deberá modificarse el estado del usuario.

### CA-03 - Validar identificador

Dado que se solicita cambiar el estado de un usuario,  
cuando el sistema recibe el identificador mediante el parámetro `id`,  
entonces debe validar que tenga formato UUID válido.

Si el identificador no cumple con el formato esperado,  
entonces el sistema debe rechazar la solicitud con `400 Bad Request`.

### CA-04 - Verificar existencia del usuario

Dado que se solicita cambiar el estado de un usuario,  
cuando el sistema procesa la operación,  
entonces debe verificar que el usuario exista.

La búsqueda deberá realizarse mediante su identificador único.

### CA-05 - Usuario inexistente

Dado que no existe un usuario con el identificador proporcionado,  
cuando se solicita cambiar su estado,  
entonces el sistema debe responder con `404 Not Found`.

No deberá modificarse información de otros usuarios.

### CA-06 - Validar pertenencia a la clínica

Dado que un administrador autenticado solicita cambiar el estado de un usuario,  
cuando el sistema obtiene la información del usuario solicitado,  
entonces debe comprobar que pertenezca a la misma clínica del administrador.

La clínica del administrador deberá obtenerse desde el contexto autenticado.

Si el usuario solicitado pertenece a otra clínica,  
entonces el sistema debe rechazar la operación con `404 Not Found` para evitar revelar su existencia.

### CA-07 - Validar clínica activa

Dado que un administrador autenticado solicita cambiar el estado de un usuario,  
cuando el sistema identifica su clínica,  
entonces debe validar que la clínica exista y tenga estado `active`.

Si la clínica no existe o se encuentra inactiva,  
entonces el sistema debe rechazar la operación.

No deberá modificarse el estado del usuario solicitado.

### CA-08 - Validar estado solicitado

Dado que se solicita cambiar el estado de un usuario,  
cuando el sistema recibe el nuevo estado,  
entonces únicamente debe permitir los siguientes valores:

- `active`
- `inactive`

Si se proporciona un estado diferente, vacío o `null`,  
entonces el sistema debe rechazar la operación con `400 Bad Request`.

### CA-09 - Activar usuario

Dado que existe un usuario con estado `inactive`,  
y el administrador autenticado tiene autorización para modificarlo,  
cuando solicita cambiar su estado a `active`,  
entonces el sistema debe actualizar correctamente el estado.

El usuario deberá quedar registrado con estado `active`.

A partir de ese momento podrá iniciar una nueva sesión, siempre que su clínica también se encuentre activa y cumpla los requisitos de autenticación.

La activación no deberá crear automáticamente una sesión para el usuario.

### CA-10 - Desactivar usuario

Dado que existe un usuario con estado `active`,  
y el administrador autenticado tiene autorización para modificarlo,  
cuando solicita cambiar su estado a `inactive`,  
entonces el sistema debe actualizar correctamente el estado.

El usuario deberá quedar registrado con estado `inactive`.

El sistema deberá impedir que el usuario inicie nuevas sesiones.

Las solicitudes posteriores que utilicen una sesión existente deberán ser rechazadas cuando se compruebe que el usuario se encuentra inactivo.

### CA-11 - Proteger al último administrador activo

Dado que se solicita desactivar un usuario con rol `clinic`,  
cuando el sistema valida los administradores activos de la clínica,  
entonces debe comprobar que la operación no deje a la clínica sin administradores activos.

Si el usuario solicitado es el último administrador activo,  
entonces el sistema debe rechazar la operación con `409 Conflict`.

La clínica deberá conservar al menos un usuario activo con rol `clinic`.

Esta restricción deberá mantenerse incluso ante solicitudes concurrentes.

### CA-12 - Impedir cambio de estado por terapeutas

Dado que un usuario autenticado tiene rol `therapist`,  
cuando solicita activar o desactivar un usuario, incluido su propio perfil,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

Los terapeutas no podrán modificar estados de usuarios.

### CA-13 - Mantener información del usuario

Dado que se modifica el estado de un usuario,  
cuando finaliza la operación,  
entonces el resto de su información deberá conservarse sin modificaciones.

No deberán modificarse:

- `id`
- `name`
- `email`
- `professional_license`
- `clinic`
- `role`
- `created_at`
- Hash de contraseña.

Únicamente deberán modificarse `status` y `updated_at` cuando exista un cambio efectivo de estado.

### CA-14 - Conservar relaciones clínicas

Dado que un usuario tiene pacientes, procesos terapéuticos o registros clínicos asociados,  
cuando su estado cambia a `inactive`,  
entonces el sistema debe conservar esas relaciones.

La desactivación no deberá eliminar ni modificar automáticamente:

- Pacientes.
- Procesos terapéuticos.
- Registros de sesión.
- Tareas.
- Información histórica del profesional.

La desactivación deberá afectar exclusivamente la posibilidad de acceso del usuario al sistema.

### CA-15 - Actualizar fecha de modificación

Dado que el estado de un usuario fue modificado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe actualizar el campo `updated_at`.

El campo `created_at` deberá conservarse sin modificaciones.

### CA-16 - Estado sin cambios

Dado que un usuario ya tiene el estado solicitado,  
cuando un administrador autorizado solicita establecer ese mismo estado,  
entonces el sistema debe completar la operación correctamente sin modificar otros campos.

No será necesario actualizar `updated_at` cuando no exista un cambio efectivo.

### CA-17 - Respuesta correcta

Dado que el usuario existe,  
y el administrador autenticado tiene autorización para modificarlo,  
y el estado solicitado es válido,  
cuando la operación finaliza correctamente,  
entonces el sistema debe responder con `200 OK`.

La respuesta deberá contener la información pública actualizada del usuario conforme al contrato OpenAPI.

No deberá incluir contraseñas, hashes ni información sensible de autenticación.

### CA-18 - Validar estado en sesiones existentes

Dado que un usuario fue desactivado,  
cuando intenta utilizar una sesión emitida anteriormente que todavía no ha expirado,  
entonces el backend debe verificar su estado actual antes de autorizar operaciones protegidas.

Si el usuario se encuentra en estado `inactive`,  
entonces deberá rechazarse la solicitud.

La validez criptográfica del JWT no deberá ser suficiente para permitir el acceso de un usuario desactivado.

### CA-19 - Proteger la operación contra solicitudes no autorizadas

Dado que el endpoint utiliza autenticación mediante cookies,  
cuando se recibe una solicitud de cambio de estado,  
entonces el backend debe aplicar los controles de protección CSRF definidos para Vera Balance.

Si la solicitud no cumple las políticas de seguridad correspondientes,  
entonces debe rechazarse sin modificar información.

### CA-20 - Mantener consistencia ante solicitudes concurrentes

Dado que se solicita modificar el estado de un usuario,  
cuando existen solicitudes simultáneas que pueden afectar los administradores activos de una clínica,  
entonces el sistema debe garantizar que la clínica conserve al menos un administrador activo.

No deberá ser posible desactivar a todos los administradores mediante operaciones concurrentes.

La actualización deberá ejecutarse mediante un mecanismo de persistencia que mantenga esta restricción.

## Reglas de negocio

- El cambio de estado requiere una sesión autenticada válida.
- Únicamente los usuarios con rol `clinic` y estado `active` pueden modificar estados.
- Los usuarios con rol `therapist` no pueden activar ni desactivar usuarios.
- Un administrador únicamente puede modificar usuarios pertenecientes a su propia clínica.
- No se permite modificar usuarios de otras clínicas.
- La clínica del administrador debe obtenerse desde el contexto autenticado.
- La clínica debe existir y encontrarse activa.
- El identificador del usuario debe tener formato UUID válido.
- El usuario debe existir antes de modificar su estado.
- Los únicos estados permitidos son `active` e `inactive`.
- Un usuario inactivo no puede iniciar sesión.
- Un usuario inactivo no puede utilizar endpoints protegidos, aunque conserve un JWT criptográficamente válido.
- La activación de un usuario no crea automáticamente una sesión.
- No se permite desactivar al último administrador activo de una clínica.
- La desactivación no elimina al usuario.
- La desactivación no elimina ni modifica su historial clínico.
- El cambio de estado no debe modificar otros campos del usuario.
- La fecha de creación debe conservarse.
- `updated_at` debe actualizarse cuando exista un cambio efectivo.
- El cambio de estado debe permanecer separado de la actualización general del usuario.
- Las validaciones de autorización deben realizarse en el backend.

## Dependencias

- US-USER-003 — Get User By ID.
- Auth.
- Clinics.
- Users.

## Consideraciones técnicas

### Endpoint

`PATCH /v1/users/{id}/status`

El endpoint requiere autenticación mediante la cookie `vera_balance_session`.

### Parámetros

El endpoint recibe el identificador único del usuario mediante el parámetro de ruta:

`id: UUID`

Ejemplo:

`PATCH /v1/users/7cb3a81a-e137-4ef4-aafd-6e387c8c7390/status`

El identificador deberá validarse antes de ejecutar la actualización.

### Request

El request deberá respetar el esquema definido en OpenAPI.

Ejemplo de activación:

```json
{
  "status": "active"
}
```

Ejemplo de desactivación:

```json
{
  "status": "inactive"
}
```

No deberán aceptarse campos adicionales que intenten modificar otra información del usuario.

### Autenticación y autorización

- El JWT deberá obtenerse desde la cookie `vera_balance_session`.
- La validación de sesión deberá realizarse mediante las capacidades del módulo Auth.
- El backend deberá validar el rol y estado actual del administrador autenticado.
- La identidad autenticada deberá obtenerse desde el contexto de sesión.
- La clínica deberá identificarse desde el contexto autenticado.
- El backend deberá validar que la clínica exista y se encuentre activa.
- Únicamente los usuarios con rol `clinic` podrán ejecutar la operación.
- El usuario solicitado deberá pertenecer a la misma clínica del administrador.
- La autorización deberá aplicarse en el backend y no depender del frontend.

### Validación

- El identificador deberá tener formato UUID válido.
- El usuario solicitado deberá existir.
- El estado deberá ser `active` o `inactive`.
- No deberán aceptarse valores vacíos, `null` ni estados diferentes.
- No deberán aceptarse campos adicionales.
- El cambio deberá afectar únicamente el estado y la fecha de actualización.
- La desactivación deberá respetar la protección del último administrador activo.

### Restricción del último administrador

- El backend deberá comprobar si el usuario solicitado tiene rol `clinic`.
- Si se solicita desactivarlo, deberá validar que exista otro administrador activo en la misma clínica.
- Una consulta previa por sí sola no garantiza esta restricción ante solicitudes concurrentes.
- La implementación deberá utilizar un mecanismo de consistencia que impida desactivar simultáneamente a todos los administradores.
- Esta restricción deberá mantenerse coherente con las operaciones Update User y Delete User.

### Sesiones y control de acceso

- Un usuario inactivo no deberá poder iniciar sesión.
- Los endpoints protegidos deberán verificar que el usuario autenticado conserve estado `active`.
- Si el usuario es desactivado, sus solicitudes posteriores deberán ser rechazadas.
- El JWT emitido anteriormente no necesitará eliminarse de una base de datos, ya que la sesión es stateless.
- La verificación del estado actual del usuario será necesaria para impedir el acceso con un JWT todavía vigente.
- La reactivación no deberá generar automáticamente una sesión nueva.

### Persistencia

- La persistencia deberá respetar el modelo Single Table de DynamoDB definido en `docs/DB.md`.
- El acceso al usuario deberá realizarse mediante las abstracciones del módulo Users.
- La operación deberá actualizar únicamente `status` y, cuando corresponda, `updated_at`.
- Los demás atributos deberán conservar sus valores.
- Deberán utilizarse operaciones condicionales o transacciones cuando sea necesario mantener las restricciones de integridad.
- Los detalles específicos de DynamoDB no deberán exponerse en el dominio.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Estado actualizado o confirmado correctamente. |
| `400 Bad Request` | Identificador o estado inválido. |
| `401 Unauthorized` | Sesión inexistente, inválida o expirada. |
| `403 Forbidden` | Usuario autenticado sin permisos suficientes. |
| `404 Not Found` | Usuario inexistente o fuera del alcance autorizado. |
| `409 Conflict` | La operación dejaría a la clínica sin administradores activos. |

Los códigos y esquemas definitivos deberán respetar `docs/baas-vera-balance-dashboard.yaml`.

### Arquitectura

La implementación deberá respetar la arquitectura definida en `docs/PROJECT_ARCHITECTURE.md`.

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, validación del identificador, autenticación, validación de entrada y construcción de la respuesta HTTP.
- `application`: ejecución del caso de uso Change User Status, autorización y coordinación de las validaciones de integridad.
- `domain`: reglas e invariantes de cambio de estado.
- `infrastructure`: consultas y actualización mediante adaptadores de persistencia.

El caso de uso deberá permanecer separado de Update User.

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
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó que los terapeutas no puedan cambiar estados.
- [ ] Se verificó la protección del último administrador activo.
- [ ] Se verificó que los usuarios inactivos no puedan utilizar sesiones existentes.
- [ ] Se verificó que el historial clínico permanezca intacto.
- [ ] Se verificó que únicamente cambien `status` y `updated_at`.
- [ ] Se confirmó la consistencia con el contrato OpenAPI.
- [ ] La implementación fue revisada después de los ajustes.
