# US — Get User By ID

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero consultar un usuario específico,  
para conocer su información dentro del sistema de acuerdo con mis permisos.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir obtener un usuario mediante su identificador único.

La consulta se realizará mediante el endpoint:

```http
GET /v1/users/{id}
```

Este endpoint requiere una sesión autenticada válida mediante la cookie `vera_balance_session`.

El acceso a la información dependerá del rol del usuario autenticado:

- `clinic`: podrá consultar los usuarios pertenecientes a su misma clínica.
- `therapist`: únicamente podrá consultar su propio perfil.

El backend deberá validar que el usuario solicitado exista y que el usuario autenticado tenga autorización para consultar su información.

La respuesta deberá contener únicamente los datos permitidos por el contrato del API, sin exponer contraseñas, hashes ni información sensible de autenticación.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita consultar un usuario específico,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una sesión autenticada válida.

Si la cookie de sesión no existe, el JWT es inválido o ha expirado,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

No deberá devolverse información del usuario solicitado.

### CA-02 - Validar autorización

Dado que existe una sesión autenticada válida,  
cuando se solicita consultar un usuario,  
entonces el sistema debe validar el rol, estatus y permisos del usuario autenticado.

Las reglas de autorización serán:

- Un usuario con rol `clinic` podrá consultar usuarios pertenecientes a su clínica.
- Un usuario con rol `therapist` únicamente podrá consultar su propio perfil.

Si el usuario autenticado no cuenta con los permisos necesarios,  
entonces el sistema debe rechazar la operación con `403 Forbidden`, salvo que corresponda responder `404 Not Found` para evitar revelar la existencia de un recurso no autorizado.

### CA-03 - Validar identificador

Dado que se solicita consultar un usuario,  
cuando el sistema recibe el identificador mediante el parámetro `id`,  
entonces debe validar que tenga un formato UUID válido.

Si el identificador no cumple con el formato esperado,  
entonces el sistema debe rechazar la solicitud con `400 Bad Request`.

### CA-04 - Consultar usuario existente

Dado que existe un usuario con el identificador proporcionado,  
y el usuario autenticado tiene autorización para consultarlo,  
cuando se solicita su información,  
entonces el sistema debe devolver el usuario correspondiente.

La información deberá obtenerse mediante el identificador único del usuario.

### CA-05 - Información pública

Dado que el usuario existe y la consulta está autorizada,  
cuando se devuelve su información,  
entonces la respuesta deberá incluir los campos definidos en el contrato OpenAPI.

La información pública del usuario podrá incluir:

- `id`
- `name`
- `email`
- `professional_license`
- `clinic`
- `role`
- `status`
- `created_at`
- `updated_at`

La estructura y obligatoriedad de los campos deberán respetar `docs/baas-vera-balance-dashboard.yaml`.

### CA-06 - Proteger información sensible

Dado que el usuario existe,  
cuando se devuelve su información,  
entonces la respuesta no debe incluir:

- Contraseña original.
- Hash de contraseña.
- Confirmación de contraseña.
- JWT de sesión.
- Información interna de autenticación.

La información sensible no deberá exponerse mediante el API.

### CA-07 - Usuario inexistente

Dado que no existe un usuario con el identificador proporcionado,  
cuando se intenta consultarlo,  
entonces el sistema debe responder con `404 Not Found`.

No deberá devolverse información de otros usuarios.

### CA-08 - Consultar usuario de la misma clínica

Dado que un usuario autenticado tiene rol `clinic`,  
y el usuario solicitado pertenece a su misma clínica,  
cuando se consulta su información,  
entonces el sistema debe permitir la operación.

La autorización deberá comprobarse mediante la relación entre la clínica del administrador autenticado y la clínica del usuario solicitado.

### CA-09 - Impedir acceso a usuarios de otras clínicas

Dado que un administrador autenticado solicita consultar un usuario,  
cuando el usuario solicitado pertenece a una clínica diferente,  
entonces el sistema debe rechazar la operación.

No deberá devolverse información del usuario perteneciente a otra clínica.

Para evitar revelar la existencia de usuarios de otras clínicas, el sistema deberá responder con `404 Not Found`.

### CA-10 - Permitir al terapeuta consultar su propio perfil

Dado que un usuario autenticado tiene rol `therapist`,  
cuando solicita consultar su propio usuario mediante su identificador,  
entonces el sistema debe permitir la operación.

El identificador solicitado deberá coincidir con el identificador del usuario autenticado.

### CA-11 - Impedir al terapeuta consultar otros usuarios

Dado que un usuario autenticado tiene rol `therapist`,  
cuando solicita consultar un usuario cuyo identificador es diferente al suyo,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

El terapeuta no podrá consultar información administrativa de otros usuarios, aunque pertenezcan a su misma clínica.

### CA-12 - Validar estado del usuario autenticado

Dado que un usuario autenticado solicita consultar información,  
cuando el sistema valida sus permisos,  
entonces debe comprobar que su estatus actual sea `active`.

Si el usuario autenticado se encuentra inactivo,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

### CA-13 - Validar clínica activa

Dado que un usuario autenticado solicita consultar información,  
cuando el sistema identifica su clínica,  
entonces debe validar que la clínica exista y tenga estatus `active`.

Si la clínica no existe o se encuentra inactiva,  
entonces el sistema debe rechazar la operación.

No deberá devolverse información del usuario solicitado.

### CA-14 - No modificar información

Dado que se solicita consultar un usuario,  
cuando el sistema ejecuta la operación,  
entonces únicamente debe recuperar la información autorizada.

La consulta no deberá modificar:

- Información personal.
- Email.
- Cédula profesional.
- Rol.
- Estatus.
- Asociación con la clínica.
- Fechas de auditoría.

### CA-15 - Respuesta correcta

Dado que el usuario solicitado existe,  
y el usuario autenticado tiene autorización para consultarlo,  
cuando la operación finaliza correctamente,  
entonces el sistema debe responder con `200 OK`.

La respuesta deberá contener la información pública del usuario conforme al contrato OpenAPI.

No deberá incluir información sensible de autenticación.

## Reglas de negocio

- La consulta requiere una sesión autenticada válida.
- Únicamente los usuarios con estatus `active` pueden consultar información protegida.
- El identificador del usuario debe tener formato UUID válido.
- Los usuarios con rol `clinic` pueden consultar usuarios pertenecientes a su misma clínica.
- Los usuarios con rol `therapist` únicamente pueden consultar su propio perfil.
- Ningún usuario puede consultar información de usuarios pertenecientes a otras clínicas.
- La clínica del usuario autenticado debe obtenerse desde el contexto de autenticación.
- La clínica debe existir y encontrarse activa.
- La respuesta debe contener únicamente los campos autorizados.
- Las contraseñas, sus hashes y confirmaciones nunca deben exponerse mediante el API.
- Si el usuario solicitado no existe, debe devolverse `404 Not Found`.
- Si el usuario pertenece a otra clínica, debe evitarse revelar su existencia.
- La consulta no debe modificar información del usuario.
- Las validaciones de autorización deben realizarse en el backend.

## Dependencias

- Auth.
- Clinics.
- Users.

## Consideraciones técnicas

### Endpoint

```http
GET /v1/users/{id}
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
GET /v1/users/7cb3a81a-e137-4ef4-aafd-6e387c8c7390
```

El identificador deberá validarse antes de ejecutar la consulta.

### Autenticación y autorización

- El JWT deberá obtenerse desde la cookie `vera_balance_session`.
- La validación de sesión deberá realizarse mediante las capacidades del módulo Auth.
- El backend deberá validar el rol y estatus actual del usuario autenticado.
- La identidad autenticada deberá obtenerse desde el contexto de sesión.
- La clínica deberá identificarse desde el contexto autenticado.
- El backend deberá validar que la clínica exista y se encuentre activa.
- El usuario con rol `clinic` podrá consultar usuarios de su clínica.
- El usuario con rol `therapist` únicamente podrá consultar su propio perfil.
- La autorización deberá aplicarse en el backend y no depender del frontend.

### Consulta

- La consulta deberá realizarse mediante el identificador único del usuario.
- El backend deberá comprobar que el usuario exista.
- El backend deberá validar que el usuario solicitado pertenezca al alcance autorizado.
- No deberá devolverse información de usuarios pertenecientes a otras clínicas.
- La consulta no deberá modificar el registro.
- Si el usuario no existe, deberá responderse con `404 Not Found`.
- La implementación deberá respetar la estructura de respuesta definida en OpenAPI.

### Protección de información

- La respuesta deberá construirse mediante un esquema público de usuario.
- No deberán serializarse directamente entidades de persistencia que contengan información sensible.
- La contraseña y su hash nunca deberán exponerse.
- No deberán devolverse datos internos de autenticación.
- La respuesta deberá incluir únicamente los campos autorizados por el contrato HTTP.

### Persistencia

- La consulta deberá respetar el modelo Single Table de DynamoDB definido en `docs/DB.md`.
- El acceso al usuario deberá realizarse mediante las abstracciones del módulo Users.
- La búsqueda deberá utilizar el patrón de acceso definido para obtener usuarios mediante su identificador.
- Los detalles específicos de DynamoDB no deberán exponerse en el dominio.
- No deberán realizarse modificaciones de persistencia durante la consulta.

### Arquitectura

La implementación deberá respetar la arquitectura definida en `docs/PROJECT_ARCHITECTURE.md`.

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, validación del identificador, autenticación, autorización y construcción de la respuesta HTTP.
- `application`: ejecución del caso de uso Get User By ID.
- `domain`: reglas de acceso y representación de usuarios.
- `infrastructure`: consulta del usuario mediante los adaptadores de persistencia.

El caso de uso deberá utilizar abstracciones para consultar el usuario solicitado y validar los permisos correspondientes.

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

- [] Los criterios de aceptación originales fueron implementados.
- [ ] Se validó la autenticación y autorización según los nuevos criterios.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó que los terapeutas únicamente puedan consultar su propio perfil.
- [ ] Se verificó que la respuesta no exponga información sensible.
- [ ] Se confirmó la consistencia con el contrato OpenAPI.
- [ ] La implementación fue revisada después de los ajustes.
