# US-CATALOG-004 — Update Catalog

## Historia de usuario

Como administrador global autorizado de Vera Balance,  
quiero actualizar un catálogo global existente,  
para mantener actualizados los valores reutilizables disponibles en el sistema.

**Scope:** Backend  
**Status:** Backlog

## Descripción

El sistema debe permitir modificar la información administrable de un catálogo global mediante:

`PUT /v1/catalogs/{id}`

Los catálogos son recursos globales y no pertenecen a una clínica.

Las modificaciones realizadas sobre ellos pueden afectar a todos los módulos que los utilizan.

Únicamente podrán modificarse los campos `name` y `options`.

El identificador y el `type` del catálogo deberán conservarse sin modificaciones.

La operación requiere permisos de administración global. Los usuarios con rol `clinic` o `therapist` no podrán ejecutarla.

Esta funcionalidad permanecerá en Backlog hasta que exista un mecanismo de administración global aprobado.

La historia no contempla crear un nuevo rol administrativo.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita actualizar un catálogo,  
cuando el sistema recibe la solicitud,  
entonces debe validar la identidad mediante el mecanismo de autenticación administrativa global aprobado.

Si no existe autenticación válida, debe responder con `401 Unauthorized`.

### CA-02 - Validar autorización global

Dado que existe una identidad autenticada,  
cuando solicita actualizar un catálogo,  
entonces el sistema debe comprobar que tenga permisos administrativos globales.

Si no tiene dichos permisos, debe responder con `403 Forbidden`.

### CA-03 - Impedir actualización desde roles de clínica

Dado que un usuario tiene rol `clinic` o `therapist`,  
cuando intenta actualizar un catálogo,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

La administración de una clínica no concede permisos para administrar catálogos globales.

### CA-04 - Validar identificador

Dado que se solicita actualizar un catálogo,  
cuando se recibe el parámetro `id`,  
entonces debe validarse conforme al formato definido para Catalogs.

Si el identificador es inválido, debe responder con `400 Bad Request`.

### CA-05 - Verificar existencia

Dado que se solicita actualizar un catálogo,  
cuando el sistema procesa la operación,  
entonces debe comprobar que exista un catálogo con el identificador proporcionado.

### CA-06 - Catálogo inexistente

Dado que no existe el catálogo solicitado,  
cuando se intenta actualizar,  
entonces debe responder con `404 Not Found`.

No deberá crearse un catálogo nuevo.

### CA-07 - Actualizar catálogo existente

Dado que existe el catálogo y la identidad cuenta con autorización global,  
cuando se proporciona información válida,  
entonces el sistema debe guardar los cambios correspondientes.

### CA-08 - Actualización parcial

Dado que se proporcionan únicamente algunos campos modificables,  
cuando se actualiza el catálogo,  
entonces los campos no proporcionados deben conservar su valor actual.

### CA-09 - Actualizar nombre

Dado que se proporciona un nuevo `name`,  
cuando se valida la actualización,  
entonces el sistema debe comprobar que sea un valor válido y no vacío.

Si es válido, deberá almacenarse el nuevo nombre.

### CA-10 - Actualizar opciones

Dado que se proporciona una nueva colección `options`,  
cuando se valida la actualización,  
entonces el sistema debe comprobar que cumpla la estructura definida para Catalogs.

Si es válida, deberá sustituir la colección de opciones del catálogo conforme al contrato del endpoint.

Si `options` no se proporciona, deberá conservarse la colección existente.

### CA-11 - Impedir modificación del tipo

Dado que existe un catálogo,  
cuando se solicita actualizarlo,  
entonces el campo `type` deberá conservarse sin modificaciones.

Si el request intenta modificar `type`, deberá rechazarse.

### CA-12 - Impedir modificación del identificador

Dado que se solicita actualizar un catálogo,  
cuando el request intenta modificar su identificador,  
entonces el sistema debe rechazar la operación.

El identificador del recurso deberá permanecer inmutable.

### CA-13 - Mantener alcance global

Dado que se modifica un catálogo,  
cuando se persisten los cambios,  
entonces la modificación debe aplicarse al recurso global.

No deberá asociarse el catálogo con una clínica.

### CA-14 - Impedir asociación con clínica

Dado que se solicita actualizar un catálogo,  
cuando el request contiene `clinic` o `clinic_id`,  
entonces el sistema debe rechazar dichos campos.

### CA-15 - Actualizar fecha de modificación

Dado que el catálogo fue modificado correctamente,  
cuando finaliza la operación,  
entonces debe actualizarse `updated_at`.

El campo `created_at` deberá conservarse.

Si no existen cambios efectivos, no será necesario modificar `updated_at`.

### CA-16 - Conservar información no modificada

Dado que se actualiza un catálogo,  
cuando finaliza la operación,  
entonces todos los campos no autorizados o no proporcionados deberán conservarse sin modificaciones.

### CA-17 - Respuesta correcta

Dado que el catálogo existe y los cambios son válidos,  
cuando finaliza la actualización,  
entonces el sistema debe responder con `200 OK`.

La respuesta deberá contener la información pública actualizada conforme a OpenAPI.

### CA-18 - Evitar actualizaciones inconsistentes

Dado que se solicita actualizar un catálogo,  
cuando ocurre un error durante la persistencia,  
entonces el sistema no deberá dejar información parcialmente modificada.

### CA-19 - Proteger integridad de opciones utilizadas

Dado que se solicita modificar las opciones de un catálogo,  
cuando alguna opción existente está referenciada por información persistida en otros módulos,  
entonces el sistema debe aplicar la política de integridad definida para esas referencias.

No deberá eliminarse ni modificarse una opción utilizada de manera que produzca referencias inválidas.

Si la política de integridad impide el cambio, deberá rechazarse con `409 Conflict`.

### CA-20 - Mantener funcionalidad restringida

Dado que el mecanismo de administración global no está definido,  
cuando se despliega Vera Balance,  
entonces el endpoint no deberá quedar habilitado para usuarios con rol `clinic` o `therapist`.

La implementación deberá permanecer pendiente hasta contar con autorización global aprobada.

## Reglas de negocio

- Los catálogos son globales.
- No pertenecen a ninguna clínica.
- La actualización requiere permisos administrativos globales.
- Los roles `clinic` y `therapist` no pueden actualizar catálogos.
- El identificador del catálogo es inmutable.
- El campo `type` es inmutable.
- Únicamente pueden actualizarse `name` y `options`.
- Los campos no proporcionados deben conservarse.
- El nombre no puede estar vacío.
- Las opciones deben respetar su estructura contractual.
- La actualización de opciones no debe producir referencias inválidas.
- `created_at` debe conservarse.
- `updated_at` debe modificarse cuando existan cambios efectivos.
- La operación no puede asociar el catálogo a una clínica.
- No debe implementarse un nuevo rol administrativo.
- La funcionalidad permanece pendiente hasta definir la administración global.

## Dependencias

- Definición del mecanismo de administración global.
- Catalogs.
- Definición de la política de integridad para opciones referenciadas.

## Consideraciones técnicas

### Endpoint

`PUT /v1/catalogs/{id}`

### Parámetros

`id`: identificador del catálogo conforme al modelo definido.

### Request

El request podrá incluir:

- `name`
- `options`

Ejemplo ilustrativo:

```json
{
  "name": "Nombre actualizado"
}
```

La estructura de `options` deberá respetar el esquema OpenAPI.

No deberán aceptarse modificaciones de:

- `id`
- `type`
- `clinic`
- `clinic_id`
- `created_at`
- `updated_at`

### Autenticación y autorización

- Debe utilizarse el mecanismo de administración global aprobado.
- No debe utilizarse el rol `clinic` como administrador global.
- Los roles `clinic` y `therapist` no tienen permisos de actualización.
- Si se utilizan cookies, deberán aplicarse controles CSRF.
- El endpoint no deberá habilitarse sin autorización global.

### Validación

- Debe comprobarse que el catálogo exista.
- El identificador debe cumplir el formato definido.
- `name`, cuando se proporciona, no puede estar vacío.
- `options`, cuando se proporciona, debe respetar el esquema correspondiente.
- Los campos no proporcionados deben conservarse.
- `type` e `id` deben permanecer inmutables.
- Debe aplicarse la política de integridad para opciones referenciadas.

### Persistencia

- Debe respetarse el modelo Single Table de DynamoDB.
- La actualización debe utilizar el patrón de acceso de Catalogs.
- Deben modificarse únicamente los campos autorizados.
- No debe modificarse la asociación con una clínica porque los catálogos son globales.
- Deben conservarse las fechas de creación.
- Deben utilizarse operaciones condicionales cuando corresponda para evitar actualizaciones inconsistentes.
- Los detalles de DynamoDB no deben exponerse en el dominio.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Catálogo actualizado correctamente. |
| `400 Bad Request` | Identificador o información inválida. |
| `401 Unauthorized` | Autenticación inexistente o inválida. |
| `403 Forbidden` | Identidad sin permisos globales. |
| `404 Not Found` | Catálogo inexistente. |
| `409 Conflict` | Actualización incompatible con restricciones de integridad. |

Los códigos definitivos deberán respetar OpenAPI.

### Arquitectura

- `presentation`: recepción del request, autenticación, validación y respuesta HTTP.
- `application`: ejecución del caso de uso Update Catalog.
- `domain`: reglas de inmutabilidad e integridad.
- `infrastructure`: persistencia y adaptadores de autorización.

La lógica de actualización deberá permanecer separada de Create Catalog y de las consultas.

### Contratos y documentación

- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La persistencia debe respetar `docs/DB.md`.
- Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
- Los endpoints deben respetar `docs/ENDPOINTS.md`.
- La arquitectura debe respetar `docs/PROJECT_ARCHITECTURE.md`.

Antes de implementar deberá definirse el mecanismo de administración global y la política de integridad de las opciones utilizadas.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Se definió y aprobó el mecanismo de administración global.
- [ ] Se definió la política de integridad para opciones referenciadas.
- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó que `clinic` y `therapist` no puedan actualizar catálogos.
- [ ] Se verificó la actualización parcial.
- [ ] Se verificó la inmutabilidad de `id` y `type`.
- [ ] Se verificó la actualización de nombre y opciones.
- [ ] Se verificó la conservación de los campos no modificados.
- [ ] Se verificó la integridad de las referencias.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
