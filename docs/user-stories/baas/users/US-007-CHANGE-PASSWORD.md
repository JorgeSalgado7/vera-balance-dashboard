# US-BAAS-USERS-007 — Cambiar contraseña de un usuario

**Aplicación:** BAAS  
**Módulo:** Users  
**Endpoint:** `PATCH /users/{userId}/password`  
**Status:** `under review`

## Historia de usuario

Como usuario autorizado del sistema, quiero cambiar la contraseña de mi cuenta mediante mi identificador único para mantener actualizadas y protegidas mis credenciales de acceso.

## Reglas de negocio

1. El endpoint deberá permitir cambiar la contraseña de un usuario mediante su UUID.
2. Los usuarios con rol `admin`, `clinic` y `therapist` podrán cambiar su propia contraseña.
3. Ningún usuario podrá cambiar la contraseña de otro usuario mediante este endpoint.
4. El usuario autenticado deberá coincidir con el identificador `userId` proporcionado en la ruta.
5. La solicitud deberá contener la contraseña actual y la nueva contraseña, respetando el esquema definido en OpenAPI.
6. La contraseña actual deberá validarse contra el hash almacenado en DynamoDB.
7. La nueva contraseña deberá cumplir las reglas de seguridad y validación definidas en OpenAPI.
8. La nueva contraseña deberá ser diferente de la contraseña actual.
9. La contraseña deberá almacenarse exclusivamente mediante un hash seguro, utilizando el mecanismo existente del proyecto.
10. La búsqueda del usuario deberá realizarse mediante `GetItem`, utilizando `pk = userId` y `sk = 'USER'`.
11. La actualización deberá realizarse mediante `UpdateItem`, modificando únicamente los campos `password` y `updated_at`.
12. No se deberán utilizar índices secundarios ni operaciones `Scan`.
13. Si la contraseña actual es incorrecta, no se deberá realizar ninguna modificación.
14. Si la nueva contraseña no cumple las validaciones, no se deberá realizar ninguna modificación.
15. No se deberán exponer contraseñas ni hashes en las respuestas, logs o mensajes de error.
16. Si el usuario solicitado no existe, se deberá responder `404 Not Found`.
17. Si el solicitante intenta cambiar la contraseña de otro usuario, se deberá responder `403 Forbidden`.
18. La respuesta deberá respetar estrictamente el contrato definido en OpenAPI.
19. Esta historia no contempla la recuperación de contraseñas olvidadas, ya que corresponde a los endpoints del módulo Auth.
20. La implementación deberá respetar los modelos, campos y contratos definidos en OpenAPI y DynamoDB.

## Criterios de aceptación

- **CA01:** Un usuario con rol `admin` puede cambiar su propia contraseña.
- **CA02:** Un usuario con rol `clinic` puede cambiar su propia contraseña.
- **CA03:** Un usuario con rol `therapist` puede cambiar su propia contraseña.
- **CA04:** Ningún usuario puede cambiar la contraseña de otra cuenta mediante este endpoint.
- **CA05:** El endpoint devuelve `403 Forbidden` cuando `userId` no corresponde al usuario autenticado.
- **CA06:** La búsqueda utiliza `GetItem` con `pk = userId` y `sk = 'USER'`.
- **CA07:** La contraseña actual se valida correctamente contra el hash almacenado.
- **CA08:** Cuando la contraseña actual es incorrecta, la operación se rechaza sin modificar información.
- **CA09:** La nueva contraseña debe cumplir las validaciones establecidas en OpenAPI.
- **CA10:** No se permite establecer una contraseña idéntica a la actual.
- **CA11:** La nueva contraseña se almacena utilizando un hash seguro.
- **CA12:** La actualización utiliza `UpdateItem` y modifica únicamente `password` y `updated_at`.
- **CA13:** El endpoint devuelve la respuesta exitosa definida en OpenAPI cuando el cambio se realiza correctamente.
- **CA14:** El endpoint devuelve `404 Not Found` cuando el usuario solicitado no existe.
- **CA15:** El endpoint devuelve `400 Bad Request` cuando el UUID o los datos proporcionados no cumplen las validaciones.
- **CA16:** El endpoint devuelve `401 Unauthorized` cuando no existe una autenticación válida.
- **CA17:** El endpoint devuelve `403 Forbidden` cuando el solicitante no tiene permisos suficientes.
- **CA18:** La respuesta no expone contraseñas, hashes ni atributos internos de DynamoDB.
- **CA19:** El campo `updated_at` se actualiza cuando el cambio de contraseña se realiza correctamente.
- **CA20:** El cambio de contraseña no modifica otros atributos del usuario.
- **CA21:** No se utilizan operaciones `Scan`.
- **CA22:** La funcionalidad no modifica los endpoints de recuperación de contraseña del módulo Auth.

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
- Actualizar la contraseña mediante `UpdateItem`, aplicando condiciones que eviten modificar registros inexistentes.
- Validar el formato UUID del parámetro `userId`.
- Verificar que el identificador del usuario autenticado coincida con `userId`.
- Restringir la operación exclusivamente al cambio de contraseña de la propia cuenta.
- Validar la estructura del cuerpo de la solicitud conforme a OpenAPI.
- Verificar la contraseña actual utilizando el mecanismo de comparación de hashes existente.
- Validar que la nueva contraseña cumpla los requisitos de seguridad establecidos.
- Impedir que la nueva contraseña sea igual a la actual.
- Generar el hash de la nueva contraseña utilizando el mecanismo existente del proyecto.
- No almacenar contraseñas en texto plano.
- No incluir contraseñas ni hashes en logs, excepciones o respuestas.
- Garantizar que las validaciones se completen antes de realizar la actualización.
- Actualizar únicamente `password` y `updated_at`.
- Conservar todos los demás atributos del usuario.
- No modificar GSI1, GSI2 ni GSI3.
- No crear índices adicionales ni modificar la estructura de la base de datos.
- No utilizar operaciones `Scan`.
- Utilizar el repositorio y las abstracciones existentes del módulo Users.
- Reutilizar los mecanismos de hash y validación de contraseñas existentes en el proyecto.
- Respetar el contrato `PATCH /users/{userId}/password` definido en OpenAPI.
- No agregar campos ni modificar el contrato del endpoint.
- No implementar recuperación de contraseñas dentro de esta historia.
- No introducir dependencias ni abstracciones innecesarias.
- No modificar funcionalidades ajenas a esta historia de usuario.
- No agregar tests nuevos salvo que se soliciten explícitamente.

## Definition of Done (DoD)

- [x] La funcionalidad cumple todos los criterios de aceptación.
- [x] La implementación respeta los cinco documentos de referencia.
- [x] La búsqueda utiliza correctamente `GetItem` con `pk` y `sk`.
- [x] La actualización utiliza `UpdateItem` y modifica únicamente `password` y `updated_at`.
- [x] No se utilizan operaciones `Scan`.
- [x] Los usuarios únicamente pueden cambiar su propia contraseña.
- [x] Se valida correctamente la contraseña actual.
- [x] La nueva contraseña cumple los requisitos de seguridad establecidos.
- [x] No se permite reutilizar la contraseña actual.
- [x] La nueva contraseña se almacena mediante un hash seguro.
- [x] No se exponen contraseñas ni hashes.
- [x] La respuesta cumple con el contrato OpenAPI.
- [x] Se implementaron los códigos de respuesta correspondientes.
- [x] No se modificaron los endpoints de recuperación de contraseña.
- [x] No se modificó código innecesario.
- [x] No se realizaron refactorizaciones ajenas al alcance de la historia.
- [x] No se introdujeron cambios que afecten funcionalidades existentes.
- [x] La implementación está lista para revisión.

## Estado de la historia

La historia permanecerá en estado `approved` durante su implementación. Una vez completados todos los puntos del Definition of Done, cambiará a `under review` para su revisión.