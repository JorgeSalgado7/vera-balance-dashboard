# US — Delete User

## Historia de usuario

Como usuario autorizado de Vera Balance con rol `clinic`,  
quiero eliminar un usuario perteneciente a mi clínica,  
para retirar del sistema a una persona que ya no debe permanecer registrada, respetando la integridad de la información clínica.

**Scope:** Backend  
**Status:** Under Review

## Descripción

El sistema debe permitir eliminar un usuario existente mediante su identificador único, siempre que cumpla las reglas de autorización e integridad correspondientes.

La operación se realizará mediante el endpoint:

```http
DELETE /v1/users/{id}
```

Este endpoint requiere una sesión autenticada válida mediante la cookie `vera_balance_session`.

Únicamente los usuarios con rol `clinic` y estatus `active` podrán eliminar usuarios pertenecientes a su propia clínica.

No se permitirá eliminar usuarios de otras clínicas.

Tampoco se permitirá eliminar al último administrador activo de una clínica.

La eliminación física únicamente podrá realizarse cuando el usuario no tenga información histórica o relaciones que deban conservarse.

Cuando el usuario tenga procesos terapéuticos o registros clínicos asociados, la eliminación deberá rechazarse. En esos casos, el administrador podrá utilizar el endpoint de cambio de estatus para desactivar al usuario, sin eliminar su historial.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita eliminar un usuario,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una sesión autenticada válida.

Si la cookie de sesión no existe, el JWT es inválido o ha expirado,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

No deberá eliminarse información del usuario.

### CA-02 - Validar autorización

Dado que existe una sesión autenticada válida,  
cuando se solicita eliminar un usuario,  
entonces el sistema debe validar que el usuario autenticado tenga rol `clinic` y estatus `active`.

Si el usuario tiene rol `therapist` o no cuenta con los permisos necesarios,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

No deberá eliminarse información del usuario.

### CA-03 - Validar identificador

Dado que se solicita eliminar un usuario,  
cuando el sistema recibe el identificador mediante el parámetro `id`,  
entonces debe validar que tenga un formato UUID válido.

Si el identificador no cumple con el formato esperado,  
entonces el sistema debe rechazar la solicitud con `400 Bad Request`.

### CA-04 - Verificar existencia

Dado que se solicita eliminar un usuario,  
cuando el sistema procesa la operación,  
entonces debe verificar previamente que el usuario exista.

La verificación deberá realizarse mediante su identificador único.

### CA-05 - Usuario inexistente

Dado que no existe un usuario con el identificador proporcionado,  
cuando se solicita eliminarlo,  
entonces el sistema debe responder con `404 Not Found`.

No deberá modificarse información de otros usuarios.

### CA-06 - Validar pertenencia a la clínica

Dado que un administrador autenticado solicita eliminar un usuario,  
cuando el sistema obtiene la información del usuario solicitado,  
entonces debe comprobar que pertenezca a la misma clínica del administrador.

La clínica del administrador deberá obtenerse desde el contexto autenticado.

Si el usuario solicitado pertenece a otra clínica,  
entonces el sistema debe rechazar la operación con `404 Not Found` para evitar revelar su existencia.

### CA-07 - Validar clínica activa

Dado que un administrador autenticado solicita eliminar un usuario,  
cuando el sistema identifica su clínica,  
entonces debe validar que la clínica exista y tenga estatus `active`.

Si la clínica no existe o se encuentra inactiva,  
entonces el sistema debe rechazar la operación.

No deberá eliminarse información del usuario.

### CA-08 - Proteger al último administrador activo

Dado que se solicita eliminar un usuario con rol `clinic`,  
cuando el sistema valida los administradores activos de la clínica,  
entonces debe comprobar que la eliminación no deje a la clínica sin administradores activos.

Si el usuario solicitado es el último administrador activo,  
entonces el sistema debe rechazar la operación con `409 Conflict`.

La clínica deberá conservar al menos un usuario activo con rol `clinic`.

Esta restricción deberá mantenerse incluso ante solicitudes concurrentes.

### CA-09 - Validar relaciones con procesos terapéuticos

Dado que se solicita eliminar un usuario,  
cuando el sistema valida sus relaciones,  
entonces debe comprobar que no tenga ni haya tenido procesos terapéuticos asociados que requieran conservar su identidad profesional.

Si existen procesos terapéuticos asociados,  
entonces el sistema debe rechazar la eliminación física con `409 Conflict`.

No deberán eliminarse ni modificarse automáticamente los procesos terapéuticos.

### CA-10 - Validar relaciones con registros clínicos

Dado que se solicita eliminar un usuario,  
cuando el sistema valida sus relaciones con registros clínicos,  
entonces debe comprobar que su eliminación no afecte la integridad del historial clínico.

Si existen registros que requieran conservar una referencia al usuario,  
entonces el sistema debe rechazar la eliminación física con `409 Conflict`.

Los registros clínicos no deberán eliminarse automáticamente como consecuencia de esta operación.

### CA-11 - Eliminar usuario existente

Dado que existe un usuario con el identificador proporcionado,  
y el administrador autenticado tiene autorización para eliminarlo,  
y el usuario no es el último administrador activo de la clínica,  
y no existen relaciones que impidan su eliminación,  
cuando se solicita eliminarlo,  
entonces el sistema debe eliminar físicamente al usuario.

La eliminación deberá realizarse utilizando su identificador único.

### CA-12 - Mantener integridad de persistencia

Dado que un usuario cumple las condiciones para ser eliminado,  
cuando el sistema ejecuta la operación,  
entonces debe eliminar su registro y las referencias técnicas de unicidad que correspondan.

La operación deberá mantener la consistencia de la base de datos.

Si ocurre un error durante la eliminación,  
entonces el sistema no deberá dejar información inconsistente ni referencias de email reservadas incorrectamente.

### CA-13 - No eliminar información relacionada

Dado que se elimina correctamente un usuario,  
cuando finaliza la operación,  
entonces no deberán eliminarse automáticamente clínicas, pacientes, procesos terapéuticos, registros de sesión ni tareas.

La eliminación deberá limitarse a la información del usuario y a las referencias técnicas cuya eliminación esté permitida.

### CA-14 - Impedir eliminación por terapeutas

Dado que un usuario autenticado tiene rol `therapist`,  
cuando solicita eliminar un usuario, incluido su propio perfil,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

Los terapeutas no podrán eliminar usuarios.

### CA-15 - Desactivación como alternativa

Dado que un usuario tiene relaciones clínicas que impiden su eliminación física,  
cuando un administrador necesita retirarle el acceso al sistema,  
entonces deberá utilizar el endpoint:

```http
PATCH /v1/users/{id}/status
```

Con el siguiente estado:

```json
{
  "status": "inactive"
}
```

La desactivación deberá conservar la información del usuario y sus relaciones históricas.

La desactivación no forma parte de la operación `DELETE`.

### CA-16 - Operación completada

Dado que el usuario existe,  
y cumple todas las condiciones para ser eliminado,  
cuando la operación finaliza correctamente,  
entonces el sistema debe responder con `204 No Content`.

La respuesta no deberá contener información del usuario eliminado.

### CA-17 - Proteger la operación contra solicitudes no autorizadas

Dado que el endpoint utiliza autenticación mediante cookies,  
cuando se recibe una solicitud de eliminación,  
entonces el backend debe aplicar los controles de protección CSRF definidos para Vera Balance.

Si la solicitud no cumple las políticas de seguridad correspondientes,  
entonces debe rechazarse sin eliminar información.

### CA-18 - Evitar condiciones de carrera

Dado que se solicita eliminar un usuario,  
cuando existen operaciones concurrentes que pueden modificar su rol, estatus o relaciones,  
entonces el sistema debe garantizar que las restricciones de integridad sigan cumpliéndose al momento de ejecutar la eliminación.

No deberá ser posible eliminar al último administrador activo mediante solicitudes simultáneas.

Tampoco deberá permitirse una eliminación que deje referencias clínicas inconsistentes.

## Reglas de negocio

- La eliminación requiere una sesión autenticada válida.
- Únicamente los usuarios con rol `clinic` y estatus `active` pueden eliminar usuarios.
- Los usuarios con rol `therapist` no pueden eliminar usuarios.
- Un administrador únicamente puede eliminar usuarios pertenecientes a su propia clínica.
- No se permite eliminar usuarios de otras clínicas.
- La clínica del administrador debe obtenerse desde el contexto autenticado.
- La clínica debe existir y encontrarse activa.
- La eliminación debe realizarse mediante el identificador único del usuario.
- El identificador debe tener formato UUID válido.
- Un usuario inexistente no puede ser eliminado.
- No se permite eliminar al último administrador activo de una clínica.
- No se permite eliminar físicamente usuarios con historial clínico que requiera conservar su identidad.
- No se permite eliminar automáticamente procesos terapéuticos ni registros clínicos asociados.
- Los usuarios con relaciones clínicas que impidan su eliminación podrán desactivarse mediante el endpoint correspondiente.
- La eliminación física deberá mantener la integridad de la información persistida.
- La eliminación no deberá afectar a otros usuarios ni a recursos relacionados.
- Las validaciones de autorización deben realizarse en el backend.
- Una eliminación exitosa deberá responder con `204 No Content`.

## Dependencias

- US-USER-003 — Get User By ID.
- Auth.
- Clinics.
- Users.
- Therapeutic Processes.
- Records.

## Consideraciones técnicas

### Endpoint

```http
DELETE /v1/users/{id}
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
DELETE /v1/users/7cb3a81a-e137-4ef4-aafd-6e387c8c7390
```

El identificador deberá validarse antes de ejecutar la eliminación.

### Autenticación y autorización

- El JWT deberá obtenerse desde la cookie `vera_balance_session`.
- La validación de sesión deberá realizarse mediante las capacidades del módulo Auth.
- El backend deberá validar el rol y estatus actual del usuario autenticado.
- La identidad autenticada deberá obtenerse desde el contexto de sesión.
- La clínica deberá identificarse desde el contexto autenticado.
- El backend deberá validar que la clínica exista y se encuentre activa.
- Únicamente los usuarios con rol `clinic` podrán ejecutar la eliminación.
- El usuario solicitado deberá pertenecer a la misma clínica del administrador.
- La autorización deberá aplicarse en el backend y no depender del frontend.

### Validaciones previas

Antes de eliminar al usuario, el sistema deberá:

1. Validar el identificador.
2. Validar la sesión autenticada.
3. Validar el rol y estatus del administrador.
4. Identificar la clínica del administrador.
5. Validar que la clínica esté activa.
6. Consultar al usuario solicitado.
7. Validar que pertenezca a la clínica autorizada.
8. Comprobar que no sea el último administrador activo.
9. Comprobar que no existan procesos terapéuticos asociados que impidan su eliminación.
10. Comprobar que no existan registros clínicos o relaciones históricas que deban conservarse.
11. Ejecutar la eliminación mediante un mecanismo consistente de persistencia.

### Integridad de información clínica

- No deberán eliminarse automáticamente procesos terapéuticos.
- No deberán eliminarse automáticamente registros de sesión.
- No deberán eliminarse automáticamente pacientes.
- No deberán eliminarse automáticamente tareas.
- La eliminación no deberá producir referencias inválidas.
- Las relaciones clínicas históricas deberán conservarse cuando corresponda.
- La desactivación deberá utilizarse como alternativa cuando la eliminación física no esté permitida.

### Persistencia

- La persistencia deberá respetar el modelo Single Table de DynamoDB definido en `docs/DB.md`.
- El acceso al usuario deberá realizarse mediante las abstracciones del módulo Users.
- La eliminación deberá utilizar el patrón de acceso definido para usuarios.
- La eliminación del registro y de las referencias de unicidad deberá realizarse de forma consistente.
- Deberán utilizarse operaciones condicionales o transacciones cuando sea necesario.
- Las validaciones previas deberán mantenerse correctas ante solicitudes concurrentes.
- Los detalles específicos de DynamoDB no deberán exponerse en el dominio.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `204 No Content` | Usuario eliminado correctamente. |
| `400 Bad Request` | Identificador inválido. |
| `401 Unauthorized` | Sesión inexistente, inválida o expirada. |
| `403 Forbidden` | Usuario autenticado sin permisos suficientes. |
| `404 Not Found` | Usuario inexistente o fuera del alcance autorizado. |
| `409 Conflict` | La eliminación incumple una restricción de integridad. |

Los códigos y esquemas definitivos deberán respetar `docs/baas-vera-balance-dashboard.yaml`.

### Arquitectura

La implementación deberá respetar la arquitectura definida en `docs/PROJECT_ARCHITECTURE.md`.

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, validación del identificador, autenticación y construcción de la respuesta HTTP.
- `application`: ejecución del caso de uso Delete User, autorización y coordinación de las validaciones de integridad.
- `domain`: reglas e invariantes de eliminación de usuarios.
- `infrastructure`: consultas, transacciones y eliminación mediante adaptadores de persistencia.

El caso de uso deberá utilizar abstracciones para consultar al usuario, verificar sus relaciones y ejecutar la eliminación.

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
- [ ] Se verificó que los terapeutas no puedan eliminar usuarios.
- [ ] Se verificó la protección del último administrador activo.
- [ ] Se verificaron las restricciones de integridad del historial clínico.
- [ ] Se verificó que la eliminación no afecte recursos relacionados.
- [ ] Se verificó la consistencia de la persistencia.
- [ ] Se confirmó la consistencia con el contrato OpenAPI.
- [ ] La implementación fue revisada después de los ajustes.
