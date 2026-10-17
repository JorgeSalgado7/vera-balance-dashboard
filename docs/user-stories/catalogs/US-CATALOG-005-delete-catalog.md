# US-CATALOG-005 — Delete Catalog

## Historia de usuario

Como administrador global autorizado de Vera Balance,  
quiero eliminar catálogos globales que ya no son necesarios,  
para mantener actualizados los recursos reutilizables del sistema sin afectar su integridad.

**Scope:** Backend  
**Status:** Backlog

## Descripción

El sistema debe permitir eliminar un catálogo global mediante:

`DELETE /v1/catalogs/{id}`

Los catálogos son recursos globales y no pertenecen a una clínica.

Los catálogos iniciales de Vera Balance forman parte de la configuración base del sistema y no podrán eliminarse:

- `MARITAL_STATUS`
- `SCHOOL`
- `GENDER`

Los catálogos adicionales únicamente podrán eliminarse cuando no existan referencias que requieran conservarlos.

La operación requiere permisos de administración global.

Los usuarios con rol `clinic` o `therapist` no podrán eliminar catálogos.

Esta funcionalidad permanecerá en Backlog hasta que exista un mecanismo de administración global aprobado.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita eliminar un catálogo,  
cuando el sistema recibe la solicitud,  
entonces debe validar la identidad mediante el mecanismo de autenticación administrativa global aprobado.

Si no existe autenticación válida, debe responder con `401 Unauthorized`.

### CA-02 - Validar autorización global

Dado que existe una identidad autenticada,  
cuando se solicita eliminar un catálogo,  
entonces debe comprobarse que tenga permisos administrativos globales.

Si no cuenta con dichos permisos, debe responder con `403 Forbidden`.

### CA-03 - Impedir eliminación desde roles de clínica

Dado que un usuario autenticado tiene rol `clinic` o `therapist`,  
cuando solicita eliminar un catálogo,  
entonces el sistema debe rechazar la operación con `403 Forbidden`.

### CA-04 - Validar identificador

Dado que se solicita eliminar un catálogo,  
cuando se recibe el parámetro `id`,  
entonces debe validarse conforme al formato definido para Catalogs.

Si el identificador es inválido, debe responder con `400 Bad Request`.

### CA-05 - Verificar existencia

Dado que se solicita eliminar un catálogo,  
cuando el sistema procesa la operación,  
entonces debe comprobar que exista un catálogo con el identificador proporcionado.

### CA-06 - Catálogo inexistente

Dado que no existe el catálogo solicitado,  
cuando se intenta eliminar,  
entonces el sistema debe responder con `404 Not Found`.

### CA-07 - Proteger MARITAL_STATUS

Dado que existe el catálogo `MARITAL_STATUS`,  
cuando se solicita eliminarlo,  
entonces el sistema debe rechazar la operación con `409 Conflict`.

### CA-08 - Proteger SCHOOL

Dado que existe el catálogo `SCHOOL`,  
cuando se solicita eliminarlo,  
entonces el sistema debe rechazar la operación con `409 Conflict`.

### CA-09 - Proteger GENDER

Dado que existe el catálogo `GENDER`,  
cuando se solicita eliminarlo,  
entonces el sistema debe rechazar la operación con `409 Conflict`.

### CA-10 - Validar referencias existentes

Dado que se solicita eliminar un catálogo adicional,  
cuando el sistema comprueba sus relaciones,  
entonces debe verificar que no existan referencias persistidas que requieran conservarlo.

Si existen referencias que impiden su eliminación, debe responder con `409 Conflict`.

### CA-11 - Eliminar catálogo permitido

Dado que existe un catálogo adicional,  
y la identidad cuenta con permisos administrativos globales,  
y el catálogo no pertenece a los tipos protegidos,  
y no existen relaciones que impidan su eliminación,  
cuando se solicita eliminarlo,  
entonces el sistema debe eliminar el catálogo correspondiente.

### CA-12 - Mantener alcance global

Dado que se elimina un catálogo,  
cuando se ejecuta la operación,  
entonces la eliminación debe aplicarse exclusivamente al recurso global solicitado.

No deberá modificar información de una clínica específica por el simple hecho de eliminar el catálogo.

### CA-13 - No eliminar información relacionada

Dado que se elimina un catálogo,  
cuando finaliza la operación,  
entonces no deberán eliminarse automáticamente pacientes, usuarios, procesos terapéuticos ni registros clínicos.

### CA-14 - Mantener consistencia de persistencia

Dado que un catálogo cumple las condiciones para eliminarse,  
cuando el sistema ejecuta la operación,  
entonces deberá mantener la integridad de las referencias y restricciones correspondientes.

Si ocurre un error, no deberán quedar registros inconsistentes.

### CA-15 - Respuesta correcta

Dado que el catálogo fue eliminado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `204 No Content`.

La respuesta no deberá contener información del catálogo eliminado.

### CA-16 - Proteger contra CSRF

Dado que la operación utiliza autenticación mediante cookies,  
cuando se solicita eliminar un catálogo,  
entonces deben aplicarse los controles CSRF establecidos para Vera Balance.

### CA-17 - Evitar condiciones de carrera

Dado que se solicita eliminar un catálogo,  
cuando existen operaciones concurrentes que pueden crear nuevas referencias al catálogo,  
entonces el sistema debe garantizar que la eliminación no deje referencias inválidas.

Una comprobación previa de referencias no será suficiente si no existe un mecanismo de consistencia que proteja la operación.

### CA-18 - Mantener funcionalidad restringida

Dado que el mecanismo de administración global no está definido,  
cuando se despliega Vera Balance,  
entonces el endpoint no deberá quedar habilitado para los roles `clinic` o `therapist`.

La implementación permanecerá pendiente hasta contar con autorización global aprobada.

## Reglas de negocio

- Los catálogos son globales.
- No pertenecen a una clínica.
- La eliminación requiere permisos administrativos globales.
- Los roles `clinic` y `therapist` no pueden eliminar catálogos.
- La eliminación debe realizarse mediante el identificador definido para Catalogs.
- El catálogo debe existir.
- `MARITAL_STATUS` no puede eliminarse.
- `SCHOOL` no puede eliminarse.
- `GENDER` no puede eliminarse.
- Los catálogos adicionales pueden eliminarse únicamente cuando no existan restricciones de integridad.
- La eliminación no debe afectar automáticamente otros recursos.
- No deben generarse referencias inválidas.
- No debe implementarse un nuevo rol administrativo.
- La funcionalidad permanece pendiente hasta definir la administración global.

## Dependencias

- Definición del mecanismo de administración global.
- Catalogs.
- Definición de las relaciones entre catálogos y módulos consumidores.
- Política de integridad referencial para eliminación.

## Consideraciones técnicas

### Endpoint

`DELETE /v1/catalogs/{id}`

### Parámetros

`id`: identificador del catálogo conforme al modelo definido.

### Autenticación y autorización

- Debe utilizarse el mecanismo de administración global aprobado.
- No debe utilizarse el rol `clinic` como administrador global.
- Los roles `clinic` y `therapist` no pueden eliminar catálogos.
- Si se utilizan cookies, deben aplicarse controles CSRF.
- El endpoint no debe habilitarse sin autorización global.

### Validaciones previas

Antes de eliminar el catálogo, el sistema deberá:

1. Validar la autenticación.
2. Validar los permisos administrativos globales.
3. Validar el identificador.
4. Consultar el catálogo solicitado.
5. Comprobar que exista.
6. Comprobar que su `type` no sea uno de los tipos protegidos.
7. Comprobar que no existan referencias que impidan su eliminación.
8. Ejecutar la eliminación mediante un mecanismo consistente de persistencia.

### Catálogos protegidos

Los siguientes tipos deberán conservarse permanentemente como catálogos base:

- `MARITAL_STATUS`
- `SCHOOL`
- `GENDER`

La protección deberá basarse en el `type` persistido del catálogo, no en un identificador fijo asumido.

### Integridad de referencias

- No deberán eliminarse automáticamente registros de otros módulos.
- Deberán comprobarse las relaciones que requieran conservar el catálogo.
- La política de integridad deberá definirse antes de implementar la operación.
- No deberán quedar referencias inválidas después de eliminar un catálogo.
- Las comprobaciones deberán mantenerse correctas ante solicitudes concurrentes.

### Persistencia

- Debe respetarse el modelo Single Table de DynamoDB.
- La eliminación debe utilizar el patrón de acceso definido para Catalogs.
- Deben utilizarse operaciones condicionales o transacciones cuando corresponda.
- No deben eliminarse registros pertenecientes a otros módulos.
- Los detalles de DynamoDB no deben exponerse en el dominio.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `204 No Content` | Catálogo eliminado correctamente. |
| `400 Bad Request` | Identificador inválido. |
| `401 Unauthorized` | Autenticación inexistente o inválida. |
| `403 Forbidden` | Identidad sin permisos globales. |
| `404 Not Found` | Catálogo inexistente. |
| `409 Conflict` | Catálogo protegido o con referencias que impiden su eliminación. |

Los códigos definitivos deberán respetar OpenAPI.

### Arquitectura

- `presentation`: recepción del request, autenticación, validación y respuesta HTTP.
- `application`: ejecución del caso de uso Delete Catalog y coordinación de validaciones.
- `domain`: reglas de protección de catálogos e integridad.
- `infrastructure`: consultas, validación de referencias y eliminación mediante adaptadores.

La lógica de eliminación deberá permanecer separada de Create Catalog, Update Catalog y las consultas.

### Contratos y documentación

- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La persistencia debe respetar `docs/DB.md`.
- Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
- Los endpoints deben respetar `docs/ENDPOINTS.md`.
- La arquitectura debe respetar `docs/PROJECT_ARCHITECTURE.md`.

Antes de implementar deberá definirse el mecanismo de administración global y la política de eliminación para catálogos referenciados.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Se definió y aprobó el mecanismo de administración global.
- [ ] Se definió la política de integridad para catálogos referenciados.
- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó que `clinic` y `therapist` no puedan eliminar catálogos.
- [ ] Se verificó la protección de los tres catálogos iniciales.
- [ ] Se verificó el rechazo de catálogos inexistentes.
- [ ] Se verificó la eliminación de catálogos permitidos.
- [ ] Se verificó que no se eliminen recursos relacionados.
- [ ] Se verificó la consistencia ante solicitudes concurrentes.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
