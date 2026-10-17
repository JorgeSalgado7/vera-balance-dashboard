# US-PROCESS-003 — Get Therapeutic Process By ID

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero consultar un proceso terapéutico específico,  
para conocer su información cuando tenga autorización para acceder a él.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir consultar un proceso mediante `GET /v1/therapeutic-processes/{id}`.

Un usuario `clinic` podrá consultar cualquier proceso de su clínica.

Un usuario `therapist` únicamente podrá consultar procesos donde figure como terapeuta responsable.

La autorización deberá evaluarse independientemente del estado del proceso.

## Criterios de aceptación

### CA-01 - Requerir autenticación

Dado que se solicita consultar un proceso,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar roles

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá consultar procesos conforme a sus permisos.

### CA-03 - Validar usuario y clínica activos

Dado que se solicita consultar un proceso,  
cuando el usuario o su clínica están inactivos,  
entonces deberá rechazarse la operación.

### CA-04 - Validar identificador

Dado que se proporciona el parámetro `id`,  
cuando no cumple el formato definido para el proceso,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-05 - Consultar como clinic

Dado que el usuario tiene rol `clinic` y el proceso pertenece a su clínica,  
cuando solicita consultarlo,  
entonces deberá devolverse su información.

### CA-06 - Consultar como therapist responsable

Dado que el usuario tiene rol `therapist` y corresponde al `therapist_id` del proceso,  
cuando solicita consultarlo,  
entonces deberá devolverse su información.

### CA-07 - Impedir acceso a otro terapeuta

Dado que el usuario tiene rol `therapist` y no es responsable del proceso,  
cuando intenta consultarlo,  
entonces el sistema debe responder con `404 Not Found` para no revelar información fuera de su alcance.

### CA-08 - Impedir acceso entre clínicas

Dado que el proceso pertenece a otra clínica,  
cuando se intenta consultarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-09 - Consultar independientemente del estado

Dado que el usuario tiene acceso al proceso,  
cuando lo consulta,  
entonces deberá poder recuperarlo si su estado es `active`, `inactive`, `discharged` o `unfinished`.

### CA-10 - Proceso inexistente

Dado que no existe un proceso con el identificador proporcionado,  
cuando se consulta,  
entonces el sistema debe responder con `404 Not Found`.

### CA-11 - Devolver información definida en OpenAPI

Dado que el proceso existe y el usuario tiene autorización,  
cuando se construye la respuesta,  
entonces deberá incluirse la información definida por el contrato.

### CA-12 - No modificar información

Dado que se consulta un proceso,  
cuando finaliza la operación,  
entonces no deberán modificarse sus datos, estado ni fechas.

### CA-13 - Respuesta correcta

Dado que el proceso existe y el usuario está autorizado,  
cuando se completa la consulta,  
entonces el sistema debe responder con `200 OK`.

## Reglas de negocio

- `clinic` puede consultar procesos de su clínica.
- `therapist` únicamente puede consultar procesos donde sea responsable.
- El usuario y su clínica deben estar activos.
- La pertenencia a una misma clínica no otorga acceso a procesos de otros terapeutas.
- No pueden consultarse procesos de otras clínicas.
- El estado no elimina el acceso cuando el usuario mantiene autorización.
- Los procesos inexistentes o fuera del alcance autorizado devuelven `404 Not Found`.
- La consulta no modifica información.

## Dependencias

- Auth.
- Users.
- Clinics.
- Therapeutic Processes.

## Consideraciones técnicas

### Endpoint

`GET /v1/therapeutic-processes/{id}`

### Autorización

- Validar sesión y roles.
- Validar usuario y clínica activos.
- Validar formato del identificador.
- Comprobar pertenencia a clínica.
- Para `therapist`, comprobar coincidencia con `therapist_id`.
- No exponer el proceso antes de completar la autorización.

### Persistencia

- Consultar mediante el identificador definido en el modelo.
- No modificar información.
- No consultar información de otras clínicas para construir respuestas.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Proceso consultado correctamente. |
| `400 Bad Request` | Identificador inválido. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin permiso para la operación. |
| `404 Not Found` | Proceso inexistente o fuera del alcance autorizado. |

### Arquitectura

- `presentation`: validación del identificador y respuesta.
- `application`: caso de uso Get Therapeutic Process By ID.
- `domain`: reglas de autorización.
- `infrastructure`: consulta del proceso.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó el acceso de `clinic`.
- [ ] Se verificó el acceso del terapeuta responsable.
- [ ] Se verificó el rechazo de otros terapeutas.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó la consulta de todos los estados.
- [ ] Se verificaron identificadores inválidos e inexistentes.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
