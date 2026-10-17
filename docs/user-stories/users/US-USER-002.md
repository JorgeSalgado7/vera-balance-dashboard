# US — Get Users

## Historia de usuario

Como usuario autorizado de Vera Balance con rol `clinic`,  
quiero consultar los usuarios registrados en mi clínica,  
para conocer las personas que tienen acceso al sistema y administrar su información.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir consultar los usuarios registrados que pertenecen a la clínica del administrador autenticado.

La consulta se realizará mediante el endpoint:

```http
GET /v1/users
```

Este endpoint requiere una sesión autenticada válida mediante la cookie `vera_balance_session`.

Únicamente los usuarios con rol `clinic` podrán consultar el listado de usuarios de su clínica.

Los usuarios con rol `therapist` no podrán consultar el listado administrativo de usuarios.

La clínica utilizada para filtrar los resultados deberá obtenerse desde el contexto autenticado y no desde un identificador proporcionado por el cliente.

La respuesta deberá incluir únicamente la información autorizada de los usuarios, sin exponer contraseñas, hashes ni otros datos sensibles de autenticación.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita consultar los usuarios registrados,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una sesión autenticada válida.

Si la cookie de sesión no existe, el JWT es inválido o ha expirado,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

No deberá devolverse información de los usuarios.

### CA-02 - Validar autorización

Dado que existe una sesión autenticada válida,  
cuando se solicita consultar los usuarios,  
entonces el sistema debe validar que el usuario autenticado tenga rol `clinic` y estatus `active`.

Si el usuario tiene rol `therapist` o no cuenta con los permisos necesarios,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

No deberá devolverse información de los usuarios.

### CA-03 - Identificar clínica del usuario autenticado

Dado que un administrador autorizado solicita consultar los usuarios,  
cuando el sistema procesa la solicitud,  
entonces debe identificar la clínica asociada al administrador autenticado.

La clínica deberá obtenerse desde el contexto de autenticación.

El sistema no deberá utilizar identificadores de clínica proporcionados por el cliente para determinar el alcance de la consulta.

### CA-04 - Consultar usuarios de la clínica

Dado que existen usuarios registrados en la clínica del administrador autenticado,  
cuando se solicita la lista de usuarios,  
entonces el sistema debe devolver únicamente los usuarios pertenecientes a esa clínica.

No deberán incluirse usuarios registrados en otras clínicas.

### CA-05 - Información del usuario

Dado que se obtiene un usuario autorizado,  
cuando el sistema construye la respuesta,  
entonces la información deberá incluir los campos definidos en el contrato OpenAPI.

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

Dado que se obtiene la información de los usuarios,  
cuando el sistema genera la respuesta,  
entonces no debe incluir:

- Contraseña original.
- Hash de contraseña.
- Confirmación de contraseña.
- JWT de sesión.
- Información interna de autenticación.

La información sensible no deberá exponerse en ninguna respuesta del endpoint.

### CA-07 - Sin usuarios disponibles

Dado que no existen usuarios registrados que cumplan los criterios de autorización de la consulta,  
cuando se solicita la lista,  
entonces el sistema debe devolver una lista vacía.

La ausencia de resultados no deberá considerarse un error.

La respuesta deberá respetar la estructura definida en OpenAPI.

### CA-08 - Impedir acceso a usuarios de otras clínicas

Dado que existen usuarios registrados en diferentes clínicas,  
cuando un administrador solicita el listado de usuarios,  
entonces el sistema debe limitar los resultados a su propia clínica.

Los usuarios de otras clínicas no deberán formar parte de la respuesta.

Esta restricción deberá aplicarse desde el backend y no depender de filtros implementados únicamente en el frontend.

### CA-09 - Validar estado del usuario autenticado

Dado que un usuario autenticado solicita consultar los usuarios,  
cuando el sistema valida sus permisos,  
entonces debe comprobar que su estatus actual sea `active`.

Si el usuario autenticado se encuentra inactivo,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

### CA-10 - Validar clínica activa

Dado que un administrador autenticado solicita consultar los usuarios,  
cuando el sistema identifica su clínica,  
entonces debe validar que la clínica exista y tenga estatus `active`.

Si la clínica no existe o se encuentra inactiva,  
entonces el sistema debe rechazar la operación.

No deberá devolverse información de los usuarios.

### CA-11 - No modificar información

Dado que se solicita consultar los usuarios,  
cuando el sistema ejecuta la operación,  
entonces únicamente debe recuperar la información autorizada.

La consulta no deberá modificar:

- Información personal de los usuarios.
- Roles.
- Estatus.
- Asociación con la clínica.
- Fechas de auditoría.

### CA-12 - Respuesta correcta

Dado que un administrador autorizado solicita consultar los usuarios de su clínica,  
cuando la operación finaliza correctamente,  
entonces el sistema debe responder con `200 OK`.

La respuesta deberá contener la colección de usuarios autorizados conforme al contrato OpenAPI.

No deberá incluir información sensible ni usuarios pertenecientes a otras clínicas.

## Reglas de negocio

- La consulta de usuarios requiere una sesión autenticada válida.
- Únicamente los usuarios con rol `clinic` y estatus `active` pueden consultar el listado administrativo de usuarios.
- Los usuarios con rol `therapist` no pueden consultar el listado de usuarios.
- Cada usuario pertenece obligatoriamente a una clínica.
- El administrador únicamente puede consultar usuarios pertenecientes a su propia clínica.
- La clínica del administrador debe obtenerse desde el contexto autenticado.
- No se permite consultar usuarios de otras clínicas.
- La clínica debe existir y encontrarse activa.
- La respuesta debe contener únicamente los campos autorizados.
- Las contraseñas, sus hashes y las confirmaciones nunca deben exponerse mediante el API.
- La consulta no debe modificar información de los usuarios.
- Si no existen usuarios que cumplan los criterios de consulta, debe devolverse una lista vacía.
- Las validaciones de autorización deben realizarse en el backend.

## Dependencias

- Auth.
- Clinics.
- Users.

## Consideraciones técnicas

### Endpoint

```http
GET /v1/users
```

El endpoint requiere autenticación mediante la cookie:

```text
vera_balance_session
```

La operación debe validar que el usuario autenticado tenga rol `clinic`.

### Autenticación y autorización

- El JWT deberá obtenerse desde la cookie `vera_balance_session`.
- La validación de sesión deberá realizarse mediante las capacidades del módulo Auth.
- El backend deberá validar el rol y estatus actual del usuario autenticado.
- La clínica deberá obtenerse desde el contexto autenticado.
- El backend deberá validar que la clínica exista y se encuentre activa.
- La consulta deberá limitarse a los usuarios de la clínica autorizada.
- Los identificadores proporcionados por el cliente no deberán sustituir la identidad autenticada.
- La autorización deberá aplicarse en el backend y no depender del frontend.

### Consulta

- La consulta deberá obtener únicamente los usuarios pertenecientes a la clínica autorizada.
- El filtrado por clínica deberá realizarse en la capa de persistencia cuando el modelo de acceso lo permita.
- No deberá realizarse una consulta global de usuarios para posteriormente filtrar los resultados en el frontend.
- La consulta no deberá modificar los registros.
- La ausencia de usuarios deberá producir una colección vacía.
- La implementación deberá respetar la estructura de respuesta definida en OpenAPI.

### Protección de información

- La respuesta deberá construirse mediante un esquema público de usuario.
- No deberán serializarse directamente las entidades de persistencia cuando contengan información sensible.
- La contraseña y su hash nunca deberán exponerse.
- No deberán devolverse datos internos de autenticación.
- La respuesta deberá incluir únicamente los campos autorizados por el contrato HTTP.

### Persistencia

- La consulta deberá respetar el modelo Single Table de DynamoDB definido en `docs/DB.md`.
- El acceso a los usuarios deberá realizarse mediante las abstracciones del módulo Users.
- La implementación deberá utilizar los índices o patrones de acceso definidos para consultar usuarios por clínica.
- Los detalles específicos de DynamoDB no deberán exponerse en el dominio.
- No deberán realizarse modificaciones de persistencia durante la consulta.

### Arquitectura

La implementación deberá respetar la arquitectura definida en `docs/PROJECT_ARCHITECTURE.md`.

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, autenticación, autorización y construcción de la respuesta HTTP.
- `application`: ejecución del caso de uso Get Users.
- `domain`: reglas de acceso y representación de usuarios.
- `infrastructure`: consulta de usuarios mediante los adaptadores de persistencia.

El caso de uso deberá utilizar abstracciones para consultar los usuarios autorizados.

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

- [] Todos los criterios de aceptación fueron implementados.
- [] La consulta requiere autenticación y rol `clinic`.
- [] Los resultados están limitados a la clínica del administrador autenticado.
- [] La respuesta no expone información sensible.
- [] La consulta no modifica información de los usuarios.
- [] La implementación fue revisada.
