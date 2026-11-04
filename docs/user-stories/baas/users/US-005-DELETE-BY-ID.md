# US-BAAS-USERS-005 — Eliminar usuario por ID

**Aplicación:** BAAS  
**Módulo:** Users  
**Endpoint:** `DELETE /users/{userId}`  
**Status:** `under review`

## Historia de usuario

Como administrador del sistema, quiero eliminar un usuario mediante su identificador único para gestionar los usuarios registrados y mantener actualizada la información del sistema.

## Reglas de negocio

1. El endpoint deberá permitir eliminar un usuario mediante su UUID.
2. Únicamente los usuarios con rol `admin` podrán eliminar usuarios registrados en el sistema.
3. Los usuarios con rol `clinic` o `therapist` no podrán eliminar usuarios, incluso cuando se trate de su propia cuenta.
4. La búsqueda del usuario deberá realizarse mediante `GetItem`, utilizando `pk = userId` y `sk = 'USER'`.
5. La eliminación deberá realizarse mediante `DeleteItem`, utilizando las claves principales del usuario.
6. No se deberán utilizar índices secundarios ni operaciones `Scan` para localizar al usuario.
7. Se podrán eliminar usuarios con estado `Activo` o `Inactivo`.
8. La eliminación será física, por lo que el registro dejará de existir en DynamoDB.
9. No se deberán eliminar automáticamente clínicas, pacientes, procesos terapéuticos, registros ni tareas relacionadas con el usuario.
10. Antes de eliminar un usuario con rol `therapist`, se deberá verificar si tiene procesos terapéuticos asociados.
11. Si el terapeuta tiene procesos terapéuticos asociados, no se permitirá su eliminación para evitar referencias inválidas.
12. La validación de procesos asociados deberá realizarse mediante `Query` sobre GSI3, utilizando `gsi3pk = 'THERAPIST#' + userId`.
13. Si el usuario solicitado no existe, se deberá responder `404 Not Found`.
14. Si el solicitante no tiene permisos para eliminar usuarios, se deberá responder `403 Forbidden`.
15. La respuesta deberá respetar estrictamente el contrato definido en OpenAPI.
16. La implementación deberá respetar los modelos, campos y contratos definidos en OpenAPI y DynamoDB.

## Criterios de aceptación

- **CA01:** Un usuario con rol `admin` puede eliminar usuarios registrados en el sistema.
- **CA02:** Un usuario con rol `clinic` recibe `403 Forbidden` al intentar eliminar un usuario.
- **CA03:** Un usuario con rol `therapist` recibe `403 Forbidden` al intentar eliminar un usuario, incluso su propia cuenta.
- **CA04:** La búsqueda utiliza `GetItem` con `pk = userId` y `sk = 'USER'`.
- **CA05:** La eliminación utiliza `DeleteItem` y elimina físicamente el registro de DynamoDB.
- **CA06:** Se pueden eliminar usuarios con estado `Activo` o `Inactivo`.
- **CA07:** Si el usuario es terapeuta, se verifica mediante GSI3 si tiene procesos terapéuticos asociados.
- **CA08:** No se permite eliminar un terapeuta que tenga procesos terapéuticos asociados.
- **CA09:** La eliminación de un usuario no provoca la eliminación automática de otras entidades.
- **CA10:** El endpoint devuelve la respuesta exitosa definida en OpenAPI cuando el usuario se elimina correctamente.
- **CA11:** El endpoint devuelve `404 Not Found` cuando el usuario solicitado no existe.
- **CA12:** El endpoint devuelve `400 Bad Request` cuando el identificador proporcionado no tiene un formato UUID válido.
- **CA13:** El endpoint devuelve `401 Unauthorized` cuando no existe una autenticación válida.
- **CA14:** El endpoint devuelve `403 Forbidden` cuando el solicitante no tiene permisos suficientes.
- **CA15:** Cuando existen relaciones que impiden la eliminación, se devuelve una respuesta de conflicto conforme al contrato OpenAPI.
- **CA16:** Una vez eliminado el usuario, una consulta mediante `GET /users/{userId}` devuelve `404 Not Found`.
- **CA17:** El usuario eliminado deja de aparecer en las consultas globales y por clínica una vez propagados los cambios a los índices.
- **CA18:** No se utilizan operaciones `Scan`.

## Documentación de referencia

La implementación deberá apoyarse obligatoriamente en los siguientes archivos:

- `/docs/DB.md`
- `/docs/baas-vera-balance-dashboard.yml`
- `/docs/DEFINITIONS.md`
- `/docs/PROJECT_ARCHITECTURE.md`
- `/docs/ARCHITECTURE_GUIDELINES.md`

Los contratos de entrada y salida deberán respetar OpenAPI y la persistencia deberá seguir las definiciones de DynamoDB.

## Consideraciones técnicas

- Implementar la funcionalidad siguiendo Clean Architecture y la separación por módulos del BAAS.
- Utilizar DynamoDB Single Table Design.
- Obtener el usuario mediante `GetItem`, utilizando `pk = userId` y `sk = 'USER'`.
- Eliminar el usuario mediante `DeleteItem`, utilizando las mismas claves principales.
- Validar el formato UUID del parámetro `userId`.
- Restringir el acceso al endpoint exclusivamente a usuarios con rol `admin`.
- Verificar la existencia del usuario antes de realizar la eliminación.
- Si el usuario tiene rol `therapist`, consultar GSI3 mediante `gsi3pk = 'THERAPIST#' + userId` para identificar procesos terapéuticos asociados.
- Evitar la eliminación de usuarios que mantengan relaciones que comprometan la integridad de los datos.
- Utilizar condiciones de escritura que impidan eliminar registros inexistentes o modificados durante la operación.
- Considerar la consistencia eventual de GSI3 al validar las relaciones y garantizar que no se generen referencias inválidas durante eliminaciones concurrentes.
- No eliminar automáticamente entidades relacionadas.
- No modificar el estado del usuario como sustituto de la eliminación física.
- No eliminar manualmente entradas de GSI1, GSI2 o GSI3; DynamoDB actualizará los índices al eliminar el registro principal.
- Utilizar el repositorio y las abstracciones existentes del módulo Users.
- Respetar el contrato `DELETE /users/{userId}` definido en OpenAPI.
- No agregar campos ni modificar el contrato del endpoint.
- No crear índices adicionales ni modificar la estructura de la base de datos.
- No introducir dependencias ni abstracciones innecesarias.
- No modificar funcionalidades ajenas a esta historia de usuario.
- No agregar tests nuevos salvo que se soliciten explícitamente.

## Definition of Done (DoD)

- [x] La funcionalidad cumple todos los criterios de aceptación.
- [x] La implementación respeta los cinco documentos de referencia.
- [x] La búsqueda utiliza correctamente `GetItem` con `pk` y `sk`.
- [x] La eliminación utiliza `DeleteItem`.
- [x] No se utilizan operaciones `Scan`.
- [x] Únicamente los usuarios con rol `admin` pueden eliminar usuarios.
- [x] Se verifica la existencia de procesos terapéuticos asociados cuando corresponde.
- [x] No se permite eliminar usuarios cuando existan relaciones que comprometan la integridad de los datos.
- [x] La eliminación es física y no modifica otras entidades.
- [x] La respuesta cumple con el contrato OpenAPI.
- [x] Se implementaron los códigos de respuesta correspondientes.
- [x] No se modificó código innecesario.
- [x] No se realizaron refactorizaciones ajenas al alcance de la historia.
- [x] No se introdujeron cambios que afecten funcionalidades existentes.
- [x] La implementación está lista para revisión.

## Estado de la historia

La historia permanecerá en estado `approved` durante su implementación. Una vez completados todos los puntos del Definition of Done, cambiará a `under review` para su revisión.