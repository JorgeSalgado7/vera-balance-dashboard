# US-BAAS-USERS-004 — Actualizar usuario por ID

**Aplicación:** BAAS  
**Módulo:** Users  
**Endpoint:** `PATCH /users/{userId}`  
**Status:** `approved`

## Historia de usuario

Como usuario autorizado del sistema, quiero actualizar la información de un usuario mediante su identificador único para mantener sus datos actualizados de acuerdo con los permisos de mi rol.

## Reglas de negocio

1. El endpoint deberá permitir actualizar parcialmente la información de un usuario mediante su UUID.
2. Los usuarios con rol `admin` podrán actualizar cualquier usuario registrado en el sistema.
3. Los usuarios con rol `clinic` únicamente podrán actualizar usuarios pertenecientes a su clínica.
4. Los usuarios con rol `therapist` únicamente podrán actualizar su propia información, respetando los campos permitidos por OpenAPI.
5. La búsqueda del usuario deberá realizarse mediante `GetItem`, utilizando `pk = userId` y `sk = 'USER'`.
6. La actualización deberá realizarse mediante `UpdateItem`, modificando únicamente los campos proporcionados en la solicitud.
7. No se deberán utilizar operaciones `Scan`.
8. Los campos permitidos para actualización deberán respetar estrictamente el esquema definido en OpenAPI.
9. No se permitirá modificar directamente `pk`, `sk`, `created_at` ni los atributos internos de DynamoDB.
10. **Únicamente los usuarios con rol `admin` podrán modificar el campo `email` de cualquier usuario.**
11. Los usuarios con rol `clinic` o `therapist` no podrán modificar el correo electrónico, incluso cuando se trate de su propia cuenta.
12. Si un usuario sin rol `admin` incluye el campo `email` con un valor diferente al almacenado, se deberá responder `403 Forbidden` sin aplicar ninguna modificación.
13. Cuando un administrador modifique el correo electrónico, deberá normalizarse, validarse su unicidad y actualizarse `gsi3pk`.
14. Si se modifica la clínica asociada, deberán actualizarse `gsi2pk` y `gsi2sk`. Cuando la clínica sea `null`, dichos atributos deberán eliminarse.
15. No se permitirá modificar la contraseña mediante este endpoint. Deberá utilizarse el endpoint correspondiente al cambio de contraseña.
16. El estado del usuario deberá modificarse mediante el endpoint específico de cambio de estatus.
17. No se permitirá modificar el rol ni la clínica de un usuario sin contar con los permisos correspondientes.
18. Si el usuario solicitado no existe, se deberá responder `404 Not Found`.
19. Si el solicitante no tiene permisos para actualizar el recurso, se deberá responder `403 Forbidden`.
20. La respuesta deberá respetar estrictamente el contrato definido en OpenAPI.
21. No se deberá exponer el campo `password`, su hash ni los atributos internos de DynamoDB.
22. La implementación deberá respetar los modelos, campos y contratos definidos en OpenAPI y DynamoDB.

## Criterios de aceptación

- **CA01:** Un usuario con rol `admin` puede actualizar cualquier usuario registrado en el sistema, respetando los campos permitidos.
- **CA02:** Un usuario con rol `clinic` puede actualizar usuarios pertenecientes a su clínica, únicamente en los campos autorizados.
- **CA03:** Un usuario con rol `clinic` recibe `403 Forbidden` al intentar actualizar usuarios de otra clínica.
- **CA04:** Un usuario con rol `therapist` puede actualizar su propia información dentro de los campos autorizados.
- **CA05:** Un usuario con rol `therapist` recibe `403 Forbidden` al intentar actualizar otro usuario.
- **CA06:** La búsqueda utiliza `GetItem` con `pk = userId` y `sk = 'USER'`.
- **CA07:** La actualización modifica únicamente los campos proporcionados y conserva los demás valores.
- **CA08:** Un administrador puede modificar el correo electrónico de cualquier usuario, siempre que el nuevo correo sea válido y único.
- **CA09:** Los usuarios con rol `clinic` o `therapist` reciben `403 Forbidden` al intentar modificar el correo electrónico, incluso el propio.
- **CA10:** Cuando un administrador modifica el correo electrónico, se actualiza correctamente GSI3.
- **CA11:** Cuando una solicitud contiene un cambio de correo no autorizado, no se modifica ningún campo del usuario.
- **CA12:** Si se modifica la clínica mediante una operación autorizada, se actualiza correctamente GSI2.
- **CA13:** El endpoint devuelve la respuesta exitosa definida en OpenAPI cuando la actualización se realiza correctamente.
- **CA14:** El endpoint devuelve `404 Not Found` cuando el usuario no existe.
- **CA15:** El endpoint devuelve `400 Bad Request` cuando el UUID o los datos proporcionados no cumplen las validaciones.
- **CA16:** El endpoint devuelve `401 Unauthorized` cuando no existe una autenticación válida.
- **CA17:** El endpoint devuelve `403 Forbidden` cuando el solicitante no tiene permisos suficientes.
- **CA18:** No se permite modificar contraseñas, estatus ni atributos internos mediante este endpoint.
- **CA19:** La respuesta cumple con OpenAPI y no expone contraseñas ni atributos internos de persistencia.
- **CA20:** El campo `updated_at` se actualiza cuando se modifica correctamente el usuario.
- **CA21:** No se utilizan operaciones `Scan`.

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
- Actualizar los atributos mediante `UpdateItem`, aplicando condiciones que eviten actualizar registros inexistentes.
- Validar el formato UUID del parámetro `userId`.
- Validar únicamente los campos de actualización definidos en OpenAPI.
- Implementar las restricciones de autorización correspondientes a los roles `admin`, `clinic` y `therapist`.
- Verificar la relación del usuario con la clínica cuando corresponda.
- **Restringir la modificación del campo `email` exclusivamente al rol `admin`.**
- Validar los permisos sobre `email` en la capa de autorización del backend, independientemente de las validaciones del DTO.
- Rechazar con `403 Forbidden` cualquier intento de modificación del correo por parte de usuarios con rol `clinic` o `therapist`.
- Garantizar que una solicitud rechazada por autorización no genere actualizaciones parciales.
- Normalizar el correo electrónico y validar su unicidad cuando sea modificado por un administrador.
- Garantizar la consistencia de los cambios de correo y sus mecanismos de unicidad, incluso ante solicitudes concurrentes.
- Actualizar `gsi3pk` cuando cambie el correo electrónico.
- Actualizar los atributos de GSI2 cuando cambie la clínica asociada mediante una operación autorizada.
- Evitar modificaciones no autorizadas de rol o asignación de clínica.
- No permitir la modificación de atributos internos de DynamoDB desde el cuerpo de la solicitud.
- Actualizar `updated_at` y conservar `created_at`.
- Utilizar el repositorio y las abstracciones existentes del módulo Users.
- No exponer el campo `password` ni atributos internos de DynamoDB.
- Respetar el contrato `PATCH /users/{userId}` definido en OpenAPI.
- No agregar campos ni modificar el contrato del endpoint.
- No crear índices adicionales ni modificar la estructura de la base de datos.
- No introducir dependencias ni abstracciones innecesarias.
- No modificar funcionalidades ajenas a esta historia de usuario.
- Mantener los tests relacionados con la funcionalidad dentro de `src/modules/users/__tests__/`, respetando la organización existente del proyecto.

## Definition of Done (DoD)

- [X] La funcionalidad cumple todos los criterios de aceptación.
- [X] La implementación respeta los cinco documentos de referencia.
- [x] La búsqueda utiliza correctamente `GetItem` con `pk` y `sk`.
- [x] La actualización utiliza `UpdateItem` y modifica únicamente los campos permitidos.
- [x] No se utilizan operaciones `Scan`.
- [x] Se implementaron las restricciones de acceso correspondientes a cada rol.
- [x] Únicamente el rol `admin` puede modificar el correo electrónico.
- [x] Los intentos no autorizados de modificar `email` devuelven `403 Forbidden` sin modificar datos.
- [x] Los cambios autorizados de correo y clínica mantienen actualizados los índices correspondientes.
- [x] La respuesta cumple con el contrato OpenAPI.
- [x] Se implementaron y validaron los códigos de respuesta correspondientes.
- [x] No se permite modificar contraseñas ni estatus mediante este endpoint.
- [x] Todos los tests relacionados con la funcionalidad se completaron y pasan correctamente.
- [x] No se modificó código innecesario.
- [x] No se realizaron refactorizaciones ajenas al alcance de la historia.
- [x] No se introdujeron cambios que afecten funcionalidades existentes.
- [ ] La implementación está lista para revisión.

## Estado de la historia

La historia permanecerá en estado `approved` durante su implementación. Una vez completados todos los puntos del Definition of Done, cambiará a `under review` para su revisión.