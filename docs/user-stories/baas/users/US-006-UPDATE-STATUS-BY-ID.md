# US-BAAS-USERS-006 — Actualizar estatus de un usuario

**Aplicación:** BAAS  
**Módulo:** Users  
**Endpoint:** `PATCH /users/{userId}/status`  
**Status:** `under review`

## Historia de usuario

Como usuario autorizado del sistema, quiero actualizar el estatus de un usuario mediante su identificador único para gestionar su estado dentro del sistema de acuerdo con los permisos de mi rol.

## Reglas de negocio

1. El endpoint deberá permitir actualizar el estatus de un usuario mediante su UUID.
2. Los usuarios con rol `admin` podrán modificar el estatus de cualquier usuario registrado en el sistema.
3. Los usuarios con rol `clinic` únicamente podrán modificar el estatus de usuarios con rol `therapist` pertenecientes a su clínica.
4. Los usuarios con rol `therapist` no podrán modificar el estatus de ningún usuario, incluido el propio.
5. No se permitirá que un usuario modifique su propio estatus.
6. Los únicos valores permitidos para el campo `status` serán `Activo` e `Inactivo`.
7. La búsqueda del usuario deberá realizarse mediante `GetItem`, utilizando `pk = userId` y `sk = 'USER'`.
8. La actualización deberá realizarse mediante `UpdateItem`, modificando únicamente los campos `status` y `updated_at`.
9. No se deberán utilizar índices secundarios ni operaciones `Scan` para localizar al usuario.
10. Si el usuario ya tiene el estatus solicitado, no será necesario realizar una actualización en DynamoDB.
11. El cambio de estatus no deberá modificar el rol, la clínica ni ningún otro atributo del usuario.
12. Se podrán actualizar usuarios con estatus `Activo` o `Inactivo`.
13. Si el usuario solicitado no existe, se deberá responder `404 Not Found`.
14. Si el solicitante no tiene permisos para modificar el estatus, se deberá responder `403 Forbidden`.
15. La respuesta deberá respetar estrictamente el contrato definido en OpenAPI.
16. La implementación deberá respetar los modelos, campos y contratos definidos en OpenAPI y DynamoDB.

## Criterios de aceptación

- **CA01:** Un usuario con rol `admin` puede cambiar el estatus de cualquier usuario registrado.
- **CA02:** Un usuario con rol `clinic` puede cambiar el estatus de terapeutas pertenecientes a su clínica.
- **CA03:** Un usuario con rol `clinic` recibe `403 Forbidden` al intentar modificar usuarios de otra clínica o usuarios con roles diferentes a `therapist`.
- **CA04:** Un usuario con rol `therapist` recibe `403 Forbidden` al intentar modificar el estatus de cualquier usuario.
- **CA05:** Ningún usuario puede modificar su propio estatus.
- **CA06:** El endpoint acepta únicamente los valores `Activo` e `Inactivo`.
- **CA07:** La búsqueda utiliza `GetItem` con `pk = userId` y `sk = 'USER'`.
- **CA08:** La actualización utiliza `UpdateItem` y modifica únicamente `status` y `updated_at`.
- **CA09:** Cuando el usuario ya tiene el estatus solicitado, se devuelve la respuesta exitosa correspondiente sin realizar escrituras innecesarias.
- **CA10:** El endpoint devuelve la respuesta exitosa definida en OpenAPI cuando el cambio de estatus se realiza correctamente.
- **CA11:** El endpoint devuelve `404 Not Found` cuando el usuario solicitado no existe.
- **CA12:** El endpoint devuelve `400 Bad Request` cuando el UUID o el estatus proporcionado no cumplen las validaciones.
- **CA13:** El endpoint devuelve `401 Unauthorized` cuando no existe una autenticación válida.
- **CA14:** El endpoint devuelve `403 Forbidden` cuando el solicitante no tiene permisos suficientes.
- **CA15:** El cambio de estatus de `Activo` a `Inactivo` se almacena correctamente en DynamoDB.
- **CA16:** El cambio de estatus de `Inactivo` a `Activo` se almacena correctamente en DynamoDB.
- **CA17:** El cambio de estatus no modifica otros atributos del usuario.
- **CA18:** La respuesta cumple con el contrato OpenAPI y no expone contraseñas ni atributos internos de DynamoDB.
- **CA19:** No se utilizan operaciones `Scan`.

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
- Actualizar el estatus mediante `UpdateItem`, aplicando condiciones que eviten modificar registros inexistentes.
- Validar el formato UUID del parámetro `userId`.
- Validar que el campo `status` contenga exclusivamente `Activo` o `Inactivo`.
- Implementar las restricciones de autorización correspondientes a los roles `admin`, `clinic` y `therapist`.
- Verificar que los usuarios con rol `clinic` únicamente puedan modificar terapeutas asociados a su clínica.
- Impedir que cualquier usuario modifique su propio estatus.
- Validar los permisos antes de realizar operaciones de actualización.
- No realizar escrituras cuando el estatus solicitado coincida con el actual.
- Actualizar `updated_at` únicamente cuando se realice un cambio efectivo de estatus.
- Conservar todos los demás atributos del usuario.
- No modificar la estructura de GSI1, GSI2 ni GSI3.
- No crear índices adicionales ni modificar la estructura de la base de datos.
- No utilizar operaciones `Scan`.
- Utilizar el repositorio y las abstracciones existentes del módulo Users.
- Respetar el contrato `PATCH /users/{userId}/status` definido en OpenAPI.
- No agregar campos ni modificar el contrato del endpoint.
- No introducir dependencias ni abstracciones innecesarias.
- No modificar funcionalidades ajenas a esta historia de usuario.
- No agregar tests nuevos salvo que se soliciten explícitamente.

## Definition of Done (DoD)

- [x] La funcionalidad cumple todos los criterios de aceptación.
- [x] La implementación respeta los cinco documentos de referencia.
- [x] La búsqueda utiliza correctamente `GetItem` con `pk` y `sk`.
- [x] La actualización utiliza `UpdateItem` y modifica únicamente `status` y `updated_at`.
- [x] No se utilizan operaciones `Scan`.
- [x] Se implementaron las restricciones de acceso correspondientes a cada rol.
- [x] Ningún usuario puede modificar su propio estatus.
- [x] Únicamente se permiten los valores `Activo` e `Inactivo`.
- [x] Se permite cambiar el estatus en ambas direcciones.
- [x] No se realizan escrituras innecesarias cuando el estatus no cambia.
- [x] No se modifican otros atributos del usuario.
- [x] La respuesta cumple con el contrato OpenAPI.
- [x] Se implementaron los códigos de respuesta correspondientes.
- [x] No se modificó código innecesario.
- [x] No se realizaron refactorizaciones ajenas al alcance de la historia.
- [x] No se introdujeron cambios que afecten funcionalidades existentes.
- [x] La implementación está lista para revisión.

## Estado de la historia

La historia permanecerá en estado `approved` durante su implementación. Una vez completados todos los puntos del Definition of Done, cambiará a `under review` para su revisión.