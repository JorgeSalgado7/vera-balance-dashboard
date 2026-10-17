# US-CATALOG-003 — Get Catalog By ID

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero consultar un catálogo global mediante su identificador,  
para conocer sus opciones y utilizarlas en los diferentes módulos del sistema.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir consultar un catálogo global existente mediante el endpoint:

`GET /v1/catalogs/{id}`

La operación requiere una sesión autenticada válida mediante la cookie `vera_balance_session`.

Los usuarios con rol `clinic` o `therapist` podrán consultar cualquier catálogo global, siempre que su cuenta y su clínica estén activas.

Los catálogos no pertenecen a una clínica específica. La consulta deberá devolver la misma información independientemente de la clínica del usuario autenticado.

La operación es exclusivamente de lectura y no deberá modificar información persistida.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita consultar un catálogo,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una sesión autenticada válida.

Si la cookie no existe, el JWT es inválido o ha expirado,  
entonces debe responder con `401 Unauthorized`.

### CA-02 - Validar autorización

Dado que existe una sesión válida,  
cuando se solicita consultar un catálogo,  
entonces el sistema debe permitir la operación a usuarios con rol `clinic` o `therapist`.

Si el usuario no cuenta con los permisos necesarios,  
entonces debe responder con `403 Forbidden`.

### CA-03 - Validar usuario activo

Dado que un usuario autenticado solicita consultar un catálogo,  
cuando el sistema verifica su estado actual,  
entonces debe comprobar que sea `active`.

Si se encuentra inactivo, debe rechazar la operación con `403 Forbidden`.

### CA-04 - Validar clínica activa

Dado que un usuario autenticado solicita consultar un catálogo,  
cuando el sistema identifica su clínica,  
entonces debe comprobar que exista y tenga estado `active`.

Si la clínica no existe o está inactiva, debe rechazar la operación.

### CA-05 - Validar identificador

Dado que se solicita consultar un catálogo,  
cuando el sistema recibe el parámetro `id`,  
entonces debe validar que cumpla el formato de identificador definido para Catalogs.

Si el identificador es inválido, debe responder con `400 Bad Request`.

### CA-06 - Consultar catálogo existente

Dado que existe un catálogo con el identificador proporcionado,  
cuando un usuario autorizado solicita consultarlo,  
entonces el sistema debe recuperar y devolver el catálogo correspondiente.

### CA-07 - Devolver información del catálogo

Dado que se obtiene un catálogo,  
cuando se construye la respuesta,  
entonces debe incluir los campos públicos definidos en OpenAPI.

La información deberá contemplar:

- `id`
- `type`
- `name`
- `options`
- `created_at`
- `updated_at`

### CA-08 - Incluir opciones

Dado que un catálogo contiene opciones registradas,  
cuando se consulta,  
entonces el sistema debe devolver sus opciones conforme a la estructura definida en el contrato del API.

No deberán agregarse, eliminarse ni modificarse opciones durante la consulta.

### CA-09 - Mantener alcance global

Dado que los catálogos son globales,  
cuando un usuario autorizado consulta un catálogo,  
entonces el resultado no debe depender de la clínica a la que pertenezca.

La consulta no deberá filtrar por identificador de clínica.

### CA-10 - Catálogo inexistente

Dado que no existe un catálogo con el identificador solicitado,  
cuando se realiza la consulta,  
entonces el sistema debe responder con `404 Not Found`.

### CA-11 - No modificar información

Dado que se consulta un catálogo,  
cuando se ejecuta la operación,  
entonces no deberá modificarse información persistida.

Los campos `created_at` y `updated_at` deberán conservarse.

### CA-12 - Respuesta correcta

Dado que el catálogo existe y el usuario tiene autorización,  
cuando la consulta finaliza correctamente,  
entonces el sistema debe responder con `200 OK`.

La respuesta deberá contener el catálogo solicitado conforme a OpenAPI.

### CA-13 - No requerir administración global

Dado que el usuario autenticado tiene rol `clinic` o `therapist`,  
cuando consulta un catálogo,  
entonces no debe requerirse un permiso de administración global.

### CA-14 - No exponer información interna

Dado que se obtiene un catálogo,  
cuando se genera la respuesta,  
entonces no deberán exponerse claves internas de DynamoDB ni detalles de infraestructura que no formen parte del contrato público.

## Reglas de negocio

- La consulta requiere autenticación.
- Los roles `clinic` y `therapist` pueden consultar catálogos.
- El usuario debe tener estado `active`.
- La clínica debe existir y estar activa.
- Los catálogos son globales.
- Los catálogos no pertenecen a ninguna clínica.
- La consulta debe utilizar el identificador definido para Catalogs.
- No debe filtrarse por clínica.
- Un catálogo inexistente debe devolver `404 Not Found`.
- La consulta no debe modificar información.
- No se requieren permisos administrativos globales para consultar.
- La respuesta debe respetar el contrato OpenAPI.

## Dependencias

- Auth.
- Users.
- Clinics.
- Catalogs.

## Consideraciones técnicas

### Endpoint

`GET /v1/catalogs/{id}`

### Parámetros

El endpoint recibe el identificador del catálogo mediante:

`id`

El formato deberá corresponder al definido en `docs/DB.md` y OpenAPI. No deberá asumirse que es UUID si el modelo de Catalogs utiliza otro identificador.

### Autenticación y autorización

- El JWT debe obtenerse desde `vera_balance_session`.
- Debe verificarse la firma y expiración del JWT.
- Debe validarse el estado actual del usuario.
- Debe validarse que su clínica esté activa.
- Los roles `clinic` y `therapist` pueden ejecutar la consulta.
- No debe requerirse administración global.

### Consulta

- El catálogo debe consultarse mediante su identificador.
- Debe utilizarse el patrón de acceso definido para Catalogs.
- No debe aplicarse un filtro de clínica.
- Debe devolverse `404 Not Found` cuando no exista.
- No deben modificarse registros ni fechas.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Catálogo consultado correctamente. |
| `400 Bad Request` | Identificador inválido. |
| `401 Unauthorized` | Sesión inexistente, inválida o expirada. |
| `403 Forbidden` | Usuario sin permisos suficientes o inactivo. |
| `404 Not Found` | Catálogo inexistente. |

Los códigos definitivos deberán respetar OpenAPI.

### Arquitectura

- `presentation`: recepción del identificador, autenticación y respuesta HTTP.
- `application`: ejecución del caso de uso Get Catalog By ID.
- `domain`: representación del catálogo y sus reglas.
- `infrastructure`: consulta mediante adaptadores de persistencia.

El caso de uso no deberá depender directamente de Dynamoose, cookies ni controladores HTTP.

### Contratos y documentación

- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La persistencia debe respetar `docs/DB.md`.
- Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
- Los endpoints deben respetar `docs/ENDPOINTS.md`.
- La arquitectura debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la autenticación y autorización.
- [ ] Se verificó la consulta para `clinic` y `therapist`.
- [ ] Se verificó el rechazo de usuarios y clínicas inactivas.
- [ ] Se verificó la consulta por identificador.
- [ ] Se verificó la respuesta para catálogos inexistentes.
- [ ] Se verificó que la consulta no dependa de la clínica.
- [ ] Se verificó que no se modifique información persistida.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
