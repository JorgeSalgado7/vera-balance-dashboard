# US-CATALOG-001 — Create Catalog

## Historia de usuario

Como administrador global autorizado de Vera Balance,  
quiero crear catálogos globales,  
para incorporar nuevos valores reutilizables que puedan ser utilizados por los diferentes módulos del sistema.

**Scope:** Backend  
**Status:** Backlog

## Descripción

El sistema debe permitir crear catálogos globales mediante el endpoint:

`POST /v1/catalogs`

Los catálogos contienen información reutilizable que puede ser consultada por los diferentes módulos de Vera Balance.

Cada catálogo se identifica mediante un `type` único y contiene un nombre y una colección de opciones.

Los catálogos son recursos globales del sistema y no pertenecen a ninguna clínica.

La creación requiere autorización administrativa global. Los usuarios con rol `clinic` o `therapist` no tienen permisos para realizar esta operación.

Actualmente, Vera Balance no cuenta con un mecanismo definido de administración global. Por lo tanto, esta funcionalidad permanecerá en Backlog hasta que dicho mecanismo sea diseñado y aprobado.

Esta historia no contempla crear un nuevo rol administrativo ni implementar el mecanismo de administración global.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita crear un catálogo,  
cuando el sistema recibe la solicitud,  
entonces debe validar que exista una identidad autenticada mediante el mecanismo de seguridad autorizado para la administración global.

Si no existe una autenticación válida,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

No deberá persistirse información del catálogo.

### CA-02 - Validar autorización administrativa global

Dado que existe una identidad autenticada,  
cuando se solicita crear un catálogo,  
entonces el sistema debe comprobar que dicha identidad cuenta con permisos administrativos globales.

Si no cuenta con dichos permisos,  
entonces debe rechazar la operación con `403 Forbidden`.

Los usuarios con rol `clinic` o `therapist` no podrán crear catálogos.

### CA-03 - Validar información antes de la creación

Dado que un administrador global autorizado solicita crear un catálogo,  
cuando el sistema recibe la información,  
entonces debe validar los datos antes de ejecutar operaciones de persistencia relacionadas con su creación.

Si la información no cumple las reglas definidas,  
entonces debe rechazar la operación.

No deberá persistirse información del nuevo catálogo.

### CA-04 - Información obligatoria

Dado que se solicita crear un catálogo,  
cuando alguno de los siguientes campos no se proporciona o está vacío:

- `type`
- `name`
- `options`

Entonces el sistema debe rechazar la operación.

El campo `options` deberá contener una colección válida y no vacía.

### CA-05 - Validar tipo de catálogo

Dado que se proporciona un `type`,  
cuando el sistema valida la información,  
entonces debe comprobar que cumple con el formato definido para Catalogs.

El valor deberá utilizarse como identificador lógico del catálogo.

No deberá aceptarse un valor vacío o compuesto únicamente por espacios.

### CA-06 - Validar unicidad del tipo

Dado que se proporciona un `type` válido,  
cuando se solicita crear el catálogo,  
entonces el sistema debe verificar que no exista otro catálogo con el mismo tipo.

Si ya existe,  
entonces debe rechazar la creación con `409 Conflict`.

La unicidad deberá mantenerse incluso ante solicitudes concurrentes.

### CA-07 - Validar nombre

Dado que se proporciona el nombre del catálogo,  
cuando el sistema valida la información,  
entonces debe comprobar que sea un valor válido y no vacío.

Si el nombre no cumple las reglas definidas,  
entonces debe rechazar la operación.

### CA-08 - Validar opciones

Dado que se proporciona una colección de opciones,  
cuando el sistema valida la información,  
entonces debe comprobar que corresponda a la estructura definida para Catalogs.

Si la colección está vacía o contiene elementos inválidos,  
entonces debe rechazar la operación.

### CA-09 - Crear catálogo correctamente

Dado que existe una identidad con permisos administrativos globales,  
y la información proporcionada es válida,  
y no existe un catálogo con el mismo `type`,  
cuando se solicita crear el catálogo,  
entonces el sistema debe registrarlo correctamente.

### CA-10 - Almacenar opciones

Dado que se crea un catálogo,  
cuando se persiste su información,  
entonces el sistema debe almacenar las opciones proporcionadas.

Las opciones deberán conservar la estructura definida en `docs/DB.md`.

### CA-11 - Mantener alcance global

Dado que se crea un catálogo,  
cuando se persiste,  
entonces no deberá asociarse a ninguna clínica.

El catálogo deberá quedar disponible como recurso global del sistema, sujeto a las reglas de lectura correspondientes.

### CA-12 - Generar fechas de auditoría

Dado que se registra un catálogo,  
cuando finaliza su creación,  
entonces el sistema debe generar:

- `created_at`
- `updated_at`

Ambos campos deberán establecerse con la fecha y hora de creación.

### CA-13 - No permitir administración desde roles de clínica

Dado que un usuario autenticado tiene rol `clinic` o `therapist`,  
cuando intenta crear un catálogo,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

La pertenencia a una clínica no concede permisos de administración global.

### CA-14 - No permitir asociación con clínica

Dado que se solicita crear un catálogo,  
cuando el request contiene un identificador de clínica,  
entonces el sistema debe rechazar ese campo.

No deberá utilizarse `clinic` ni `clinic_id` para determinar la pertenencia del catálogo.

### CA-15 - Respuesta correcta

Dado que el catálogo fue creado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `201 Created`.

La respuesta deberá contener la información definida en el contrato OpenAPI.

### CA-16 - Evitar creación inconsistente

Dado que se solicita crear un catálogo,  
cuando ocurre un error durante la persistencia,  
entonces el sistema no deberá dejar información parcial o inconsistente.

La unicidad de `type` deberá mantenerse correctamente.

### CA-17 - Mantener la funcionalidad restringida

Dado que el mecanismo de administración global todavía no está definido,  
cuando se despliega Vera Balance,  
entonces el endpoint no deberá quedar habilitado para usuarios ordinarios.

La creación de catálogos permanecerá pendiente hasta que exista un mecanismo de autorización global aprobado.

No deberá implementarse una excepción que permita utilizar el rol `clinic` como administrador global.

## Reglas de negocio

- Los catálogos son recursos globales de Vera Balance.
- Los catálogos no pertenecen a ninguna clínica.
- La creación requiere permisos administrativos globales.
- Los usuarios con rol `clinic` no pueden crear catálogos.
- Los usuarios con rol `therapist` no pueden crear catálogos.
- El campo `type` identifica lógicamente al catálogo.
- No pueden existir dos catálogos con el mismo `type`.
- La unicidad debe mantenerse ante solicitudes concurrentes.
- Los campos `type`, `name` y `options` son obligatorios.
- La colección `options` no puede estar vacía.
- Las opciones deben respetar el modelo definido para Catalogs.
- El catálogo no debe contener una asociación con clínica.
- Deben generarse `created_at` y `updated_at`.
- No debe crearse un nuevo rol administrativo como parte de esta historia.
- No debe implementarse la creación hasta que exista un mecanismo de administración global aprobado.
- Las validaciones de autorización deben realizarse en el backend.

## Dependencias

- Definición y aprobación del mecanismo de administración global.
- Auth o mecanismo equivalente de autenticación administrativa.
- Catalogs.

## Consideraciones técnicas

### Endpoint

`POST /v1/catalogs`

El endpoint deberá permanecer restringido hasta que exista un mecanismo de administración global autorizado.

### Request

El request deberá respetar el esquema definido en OpenAPI.

Los campos principales son:

- `type`
- `name`
- `options`

La estructura interna de `options` deberá respetar el contrato y el modelo de persistencia existentes.

No deberán aceptarse identificadores de clínica como parte de la creación.

### Autenticación y autorización

- La creación requiere autenticación administrativa global.
- No debe utilizarse el rol `clinic` como sustituto de un administrador global.
- Los roles `clinic` y `therapist` no tienen permisos de creación.
- El mecanismo de autorización deberá definirse antes de implementar esta historia.
- No deberán utilizarse credenciales administrativas incrustadas en el código.
- No deberá exponerse públicamente un endpoint de creación sin autorización.
- Si el endpoint utiliza cookies, deberá aplicar las protecciones CSRF correspondientes.

### Validación

- `type` es obligatorio.
- `name` es obligatorio.
- `options` es obligatorio y no puede ser una colección vacía.
- Los datos deben validarse antes de la persistencia.
- El formato de `type` debe respetar el modelo definido.
- Las opciones deben respetar su estructura contractual.
- No debe permitirse la asociación con una clínica.

### Unicidad

- El sistema deberá comprobar si existe un catálogo con el mismo `type`.
- La consulta previa no será suficiente para garantizar unicidad ante solicitudes concurrentes.
- Deberá utilizarse una escritura condicional o un mecanismo equivalente de DynamoDB.
- No deberán generarse catálogos duplicados.

### Persistencia

- La persistencia deberá respetar el modelo Single Table de DynamoDB definido en `docs/DB.md`.
- El catálogo deberá utilizar el patrón de acceso definido para Catalogs.
- No deberá almacenarse una referencia de clínica.
- Deberán generarse las fechas de auditoría.
- Los detalles específicos de DynamoDB no deberán exponerse en el dominio.

### Arquitectura

La implementación deberá respetar `docs/PROJECT_ARCHITECTURE.md`.

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, validación de entrada y aplicación del mecanismo de autenticación.
- `application`: ejecución del caso de uso Create Catalog y autorización administrativa.
- `domain`: reglas e invariantes de Catalogs.
- `infrastructure`: persistencia y mecanismos concretos de autorización.

El caso de uso deberá permanecer separado de las operaciones de consulta, actualización y eliminación de catálogos.

No deberá depender directamente de controladores HTTP, Dynamoose ni implementaciones concretas de infraestructura.

### Contratos y documentación

- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La persistencia debe respetar `docs/DB.md`.
- Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
- Los endpoints y sus permisos deben respetar `docs/ENDPOINTS.md`.
- La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

Antes de iniciar el desarrollo deberá documentarse el mecanismo de administración global y actualizar los contratos afectados.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Se definió y aprobó el mecanismo de administración global.
- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó que `clinic` y `therapist` no puedan crear catálogos.
- [ ] Se verificó la validación de los campos obligatorios.
- [ ] Se verificó la unicidad de `type`.
- [ ] Se verificó que los catálogos no se asocien a clínicas.
- [ ] Se verificó la consistencia de la persistencia.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
