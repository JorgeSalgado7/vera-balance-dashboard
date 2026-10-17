# US-CATALOG-002 — Get Catalogs

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero consultar los catálogos globales disponibles,  
para utilizar sus valores en los diferentes módulos del sistema.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir consultar todos los catálogos globales registrados mediante el endpoint:

`GET /v1/catalogs`

La operación requiere una sesión autenticada válida mediante la cookie `vera_balance_session`.

Los usuarios con rol `clinic` o `therapist` podrán consultar los catálogos, siempre que su cuenta y su clínica se encuentren activas.

Los catálogos son recursos globales del sistema y no pertenecen a ninguna clínica. Por lo tanto, los usuarios autorizados deberán obtener los mismos catálogos, independientemente de la clínica a la que pertenezcan.

Inicialmente, Vera Balance cuenta con los siguientes catálogos:

- `MARITAL_STATUS`
- `SCHOOL`
- `GENDER`

La consulta no deberá limitarse a estos tipos. Cualquier catálogo global incorporado posteriormente deberá incluirse automáticamente en los resultados.

Este endpoint es exclusivamente de lectura y no deberá crear, actualizar ni eliminar información.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita consultar los catálogos,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una sesión autenticada válida.

Si la cookie de sesión no existe, el JWT es inválido o ha expirado,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

### CA-02 - Validar autorización

Dado que existe una sesión autenticada válida,  
cuando se solicita consultar los catálogos,  
entonces el sistema debe validar que el usuario autenticado tenga uno de los siguientes roles:

- `clinic`
- `therapist`

Ambos roles podrán consultar los catálogos globales.

Si el usuario no cuenta con los permisos correspondientes,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

### CA-03 - Validar usuario activo

Dado que un usuario autenticado solicita consultar los catálogos,  
cuando el sistema valida su información actual,  
entonces debe comprobar que su estado sea `active`.

Si el usuario se encuentra en estado `inactive`,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

La existencia de un JWT criptográficamente válido no deberá permitir el acceso a un usuario desactivado.

### CA-04 - Validar clínica activa

Dado que un usuario autenticado solicita consultar los catálogos,  
cuando el sistema identifica su clínica,  
entonces debe comprobar que la clínica exista y tenga estado `active`.

Si la clínica no existe o se encuentra inactiva,  
entonces el sistema debe rechazar la operación.

### CA-05 - Consultar catálogos registrados

Dado que existen catálogos globales registrados,  
cuando un usuario autorizado solicita la lista,  
entonces el sistema debe consultar y devolver todos los catálogos disponibles.

La información deberá obtenerse desde la persistencia correspondiente.

### CA-06 - Devolver información del catálogo

Dado que se obtiene un catálogo,  
cuando el sistema construye la respuesta,  
entonces debe incluir los campos públicos definidos en OpenAPI.

La información deberá contemplar:

- `id`
- `type`
- `name`
- `options`
- `created_at`
- `updated_at`

La estructura exacta de cada catálogo y sus opciones deberá respetar el contrato del API.

### CA-07 - Mantener alcance global

Dado que los catálogos son globales,  
cuando un usuario autorizado consulta los catálogos,  
entonces el sistema debe devolver los mismos recursos independientemente de la clínica a la que pertenezca.

La consulta no deberá filtrar los catálogos utilizando el identificador de la clínica.

### CA-08 - Consultar catálogos iniciales

Dado que los catálogos iniciales se encuentran registrados en la base de datos,  
cuando se solicita la lista de catálogos,  
entonces la respuesta debe incluir:

- `MARITAL_STATUS`
- `SCHOOL`
- `GENDER`

La disponibilidad de estos catálogos depende de que hayan sido inicializados previamente.

La operación de consulta no deberá crearlos automáticamente.

### CA-09 - Consultar catálogos adicionales

Dado que posteriormente se registran nuevos catálogos globales,  
cuando se solicita la lista,  
entonces el sistema también debe devolver dichos catálogos.

No deberá existir una lista fija de tipos permitidos dentro del caso de uso de consulta.

### CA-10 - Sin catálogos registrados

Dado que no existen catálogos registrados,  
cuando un usuario autorizado solicita la lista,  
entonces el sistema debe responder con `200 OK` y una colección vacía conforme al contrato OpenAPI.

La ausencia de catálogos no deberá considerarse un error.

### CA-11 - Mantener opciones registradas

Dado que un catálogo contiene opciones,  
cuando se consulta,  
entonces el sistema debe devolver sus opciones conforme a la estructura persistida y al contrato público.

La consulta no deberá agregar, eliminar ni modificar opciones.

### CA-12 - No modificar información

Dado que se consultan los catálogos,  
cuando se ejecuta la operación,  
entonces no deberá modificarse información persistida.

No deberán actualizarse:

- `created_at`
- `updated_at`
- `type`
- `name`
- `options`

La consulta tampoco deberá crear nuevos registros.

### CA-13 - Respuesta correcta

Dado que el usuario está autenticado y autorizado,  
cuando la consulta se ejecuta correctamente,  
entonces el sistema debe responder con `200 OK`.

La respuesta deberá contener la colección de catálogos definida en OpenAPI.

### CA-14 - No requerir permisos administrativos globales

Dado que un usuario tiene rol `clinic` o `therapist`,  
cuando solicita consultar los catálogos,  
entonces el sistema debe permitir la operación sin requerir permisos de administración global.

Los permisos administrativos globales serán necesarios únicamente para las operaciones de administración de catálogos que así lo establezcan.

### CA-15 - No exponer información interna

Dado que se consultan los catálogos,  
cuando el sistema genera la respuesta,  
entonces únicamente debe devolver los campos públicos definidos en OpenAPI.

No deberán exponerse atributos internos de DynamoDB ni detalles técnicos de persistencia.

## Reglas de negocio

- La consulta requiere una sesión autenticada válida.
- Los usuarios con rol `clinic` pueden consultar catálogos.
- Los usuarios con rol `therapist` pueden consultar catálogos.
- El usuario autenticado debe tener estado `active`.
- La clínica del usuario debe existir y encontrarse activa.
- Los catálogos son recursos globales.
- Los catálogos no pertenecen a una clínica.
- La consulta no debe filtrar por clínica.
- Los catálogos iniciales son `MARITAL_STATUS`, `SCHOOL` y `GENDER`.
- Los catálogos iniciales deben existir previamente en la persistencia.
- La consulta debe devolver todos los catálogos disponibles, incluidos los incorporados posteriormente.
- No debe utilizarse una lista fija de tipos para limitar los resultados.
- Una colección sin catálogos debe devolverse como lista vacía.
- La consulta no debe crear catálogos.
- La consulta no debe actualizar catálogos.
- La consulta no debe eliminar catálogos.
- La consulta no debe modificar las fechas de auditoría.
- No se requieren permisos administrativos globales para consultar.
- Las validaciones de autenticación y autorización deben realizarse en el backend.

## Dependencias

- Auth.
- Users.
- Clinics.
- Catalogs.
- Inicialización de catálogos globales para disponer de los valores por defecto.

La consulta no depende de la implementación de Create Catalog ni del mecanismo de administración global.

## Consideraciones técnicas

### Endpoint

`GET /v1/catalogs`

El endpoint requiere autenticación mediante la cookie:

`vera_balance_session`

### Request

El endpoint no requiere un cuerpo de solicitud.

No requiere un identificador de clínica.

No deberán utilizarse parámetros de clínica para filtrar los resultados.

### Autenticación y autorización

- El JWT deberá obtenerse desde la cookie `vera_balance_session`.
- La validación de sesión deberá realizarse mediante las capacidades del módulo Auth.
- El backend deberá validar el rol y estado actual del usuario autenticado.
- La identidad autenticada deberá obtenerse desde el contexto de sesión.
- La clínica deberá identificarse desde el contexto autenticado únicamente para validar que exista y se encuentre activa.
- Los roles `clinic` y `therapist` podrán consultar los catálogos.
- No deberán requerirse permisos administrativos globales.
- La autorización deberá aplicarse en el backend y no depender del frontend.

### Consulta de catálogos

- La consulta deberá obtener todos los catálogos globales registrados.
- No deberá filtrar por clínica.
- No deberá limitarse a `MARITAL_STATUS`, `SCHOOL` y `GENDER`.
- No deberá contener una lista fija de tipos como condición para consultar los registros.
- Deberá utilizar el patrón de acceso definido en `docs/DB.md`.
- Si el mecanismo de persistencia utiliza paginación interna, deberán recuperarse los registros necesarios para cumplir el contrato de consulta de todos los catálogos.
- La consulta deberá devolver una colección vacía cuando no existan registros.

### Catálogos iniciales

Los catálogos iniciales son:

- `MARITAL_STATUS`
- `SCHOOL`
- `GENDER`

Estos catálogos deberán tratarse como datos iniciales del sistema.

Su creación deberá realizarse mediante el mecanismo de inicialización de datos definido para Vera Balance.

No deberán crearse dentro del caso de uso Get Catalogs.

No deberán generarse registros de catálogo como consecuencia de una solicitud `GET`.

### Response

La respuesta deberá respetar el esquema definido en OpenAPI.

Cada catálogo deberá incluir la información pública correspondiente:

- `id`
- `type`
- `name`
- `options`
- `created_at`
- `updated_at`

La estructura exacta de la colección y de sus opciones deberá respetar `docs/baas-vera-balance-dashboard.yaml`.

### Persistencia

- La persistencia deberá respetar el modelo Single Table de DynamoDB definido en `docs/DB.md`.
- El acceso a los catálogos deberá realizarse mediante las abstracciones del módulo Catalogs.
- La consulta deberá utilizar el patrón de acceso correspondiente a los recursos globales.
- No deberá utilizarse el identificador de clínica como parte del filtro de resultados.
- La operación deberá ser exclusivamente de lectura.
- No deberán modificarse registros ni fechas de auditoría.
- Los detalles específicos de DynamoDB no deberán exponerse en el dominio.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Catálogos consultados correctamente, incluida una colección vacía. |
| `401 Unauthorized` | Sesión inexistente, inválida o expirada. |
| `403 Forbidden` | Usuario autenticado sin permisos suficientes o inactivo. |

Los códigos y esquemas definitivos deberán respetar `docs/baas-vera-balance-dashboard.yaml`.

### Arquitectura

La implementación deberá respetar la arquitectura definida en `docs/PROJECT_ARCHITECTURE.md`.

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, autenticación, autorización y construcción de la respuesta HTTP.
- `application`: ejecución del caso de uso Get Catalogs.
- `domain`: representación y reglas de los catálogos globales.
- `infrastructure`: consulta de catálogos mediante adaptadores de persistencia.

El caso de uso deberá utilizar abstracciones para consultar los catálogos.

No deberá depender directamente de controladores HTTP, cookies, Dynamoose ni implementaciones concretas de infraestructura.

La lógica de consulta deberá permanecer separada de los casos de uso Create Catalog, Update Catalog y Delete Catalog.

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

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la autenticación y autorización.
- [ ] Se verificó que los roles `clinic` y `therapist` puedan consultar los catálogos.
- [ ] Se verificó el rechazo de usuarios y clínicas inactivas.
- [ ] Se verificó que la consulta sea independiente de la clínica.
- [ ] Se verificó la consulta de los tres catálogos iniciales.
- [ ] Se verificó que los catálogos adicionales también sean devueltos.
- [ ] Se verificó la respuesta con una colección vacía.
- [ ] Se verificó que la consulta no modifique información persistida.
- [ ] Se confirmó la consistencia con el contrato OpenAPI.
- [ ] La implementación fue revisada.
