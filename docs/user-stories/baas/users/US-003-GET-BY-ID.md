# US-BAAS-USERS-003 — Obtener usuario por ID

**Aplicación:** BAAS  
**Módulo:** Users  
**Endpoint:** `GET /users/{userId}`  
**Status:** `under review`

## Historia de usuario

Como usuario autorizado del sistema, quiero obtener la información de un usuario mediante su identificador único para consultar sus datos y gestionar su información de acuerdo con los permisos de mi rol.

## Reglas de negocio

1. El endpoint deberá permitir consultar un usuario mediante su UUID.
2. Los usuarios con rol `admin` podrán consultar cualquier usuario registrado en el sistema.
3. Los usuarios con rol `clinic` únicamente podrán consultar usuarios pertenecientes a su clínica.
4. Los usuarios con rol `therapist` únicamente podrán consultar su propia información.
5. La consulta deberá realizarse mediante `GetItem` utilizando las claves principales `pk` y `sk`.
6. La búsqueda utilizará `pk = userId` y `sk = 'USER'`.
7. No se deberán utilizar índices secundarios para obtener usuarios por ID.
8. No se permitirá utilizar operaciones `Scan`.
9. Se podrán consultar usuarios con estado `Activo` o `Inactivo`, siempre que el solicitante tenga autorización.
10. Si el usuario solicitado no existe, se deberá responder `404 Not Found`.
11. Si el usuario autenticado no tiene permisos para consultar el recurso, se deberá responder `403 Forbidden`.
12. La respuesta deberá respetar estrictamente el esquema `User` definido en OpenAPI.
13. No se deberá exponer el campo `password`, su hash ni los atributos internos de DynamoDB.
14. La implementación deberá respetar los modelos, campos y contratos definidos en OpenAPI y DynamoDB.

## Criterios de aceptación

- **CA01:** Un usuario con rol `admin` puede obtener cualquier usuario mediante su UUID.
- **CA02:** Un usuario con rol `clinic` puede obtener usuarios pertenecientes a su clínica.
- **CA03:** Un usuario con rol `clinic` recibe `403 Forbidden` al intentar consultar usuarios de otra clínica.
- **CA04:** Un usuario con rol `therapist` puede consultar su propia información.
- **CA05:** Un usuario con rol `therapist` recibe `403 Forbidden` al intentar consultar información de otro usuario.
- **CA06:** La consulta utiliza `GetItem` con `pk = userId` y `sk = 'USER'`, sin utilizar `Scan` ni índices secundarios.
- **CA07:** El endpoint devuelve `200 OK` cuando el usuario existe y el solicitante tiene autorización.
- **CA08:** El endpoint devuelve `404 Not Found` cuando el usuario solicitado no existe.
- **CA09:** El endpoint devuelve `400 Bad Request` cuando el identificador proporcionado no tiene un formato válido.
- **CA10:** El endpoint devuelve `401 Unauthorized` cuando no existe una autenticación válida.
- **CA11:** La respuesta cumple con el esquema `User` de OpenAPI y no expone contraseñas ni atributos internos de persistencia.
- **CA12:** La consulta permite recuperar usuarios con estado `Activo` o `Inactivo`, respetando las reglas de autorización.

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
- No utilizar operaciones `Scan` ni índices secundarios para la búsqueda por ID.
- Validar el formato UUID del parámetro `userId`.
- Implementar las restricciones de autorización correspondientes a los roles `admin`, `clinic` y `therapist`.
- Verificar la relación del usuario solicitado con la clínica del solicitante cuando corresponda.
- Utilizar el repositorio y las abstracciones existentes del módulo Users.
- No exponer el campo `password` ni atributos internos de DynamoDB.
- Respetar el contrato `GET /users/{userId}` definido en OpenAPI.
- No agregar campos ni modificar el contrato del endpoint.
- No crear índices adicionales ni modificar la estructura de la base de datos.
- No introducir dependencias ni abstracciones innecesarias.
- No modificar funcionalidades ajenas a esta historia de usuario.
- Mantener los tests relacionados con la funcionalidad dentro de `src/modules/users/__tests__/`, respetando la organización existente del proyecto.

## Definition of Done (DoD)

- [x] La funcionalidad cumple todos los criterios de aceptación.
- [x] La implementación respeta los cinco documentos de referencia.
- [x] La consulta utiliza correctamente `GetItem` con `pk` y `sk`.
- [x] No se utilizan operaciones `Scan` ni índices secundarios.
- [x] Se implementaron las restricciones de acceso correspondientes.
- [x] La respuesta cumple con el contrato OpenAPI.
- [x] Se implementaron y validaron los códigos de respuesta correspondientes.
- [x] Todos los tests relacionados con la funcionalidad se completaron y pasan correctamente.
- [x] No se modificó código innecesario.
- [x] No se realizaron refactorizaciones ajenas al alcance de la historia.
- [x] No se introdujeron cambios que afecten funcionalidades existentes.
- [x] La implementación está lista para revisión.

## Estado de la historia

La historia permanecerá en estado `approved` durante su implementación. Una vez completados todos los puntos del Definition of Done, cambiará a `under review` para su revisión.