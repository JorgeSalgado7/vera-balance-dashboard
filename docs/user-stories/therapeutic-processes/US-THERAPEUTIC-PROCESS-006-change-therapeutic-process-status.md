# US-PROCESS-006 — Change Therapeutic Process Status

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero cambiar el estado de un proceso terapéutico,  
para representar su situación actual sin eliminar su historial.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir modificar específicamente el estado de un proceso mediante `PATCH /v1/therapeutic-processes/{id}/status`.

Los estados disponibles son:

- `active`
- `inactive`
- `discharged`
- `unfinished`

Los usuarios `clinic` podrán modificar el estado de cualquier proceso de su clínica.

Los usuarios `therapist` únicamente podrán modificar el estado de los procesos donde sean responsables.

El cambio de estado no deberá eliminar el proceso ni su información clínica. La actualización general mediante `PUT` también podrá modificar `status`.

## Criterios de aceptación

### CA-01 - Requerir autenticación

Dado que se solicita cambiar el estado de un proceso,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar roles

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá cambiar estados conforme a sus permisos.

### CA-03 - Validar usuario y clínica activos

Dado que se solicita cambiar un estado,  
cuando el usuario o su clínica están inactivos,  
entonces deberá rechazarse la operación.

### CA-04 - Validar identificador

Dado que se proporciona el parámetro `id`,  
cuando no cumple el formato definido,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-05 - Cambiar estado como clinic

Dado que el usuario tiene rol `clinic` y el proceso pertenece a su clínica,  
cuando solicita un estado válido,  
entonces deberá actualizarse `status`.

### CA-06 - Cambiar estado como therapist responsable

Dado que el usuario tiene rol `therapist` y es responsable del proceso,  
cuando solicita un estado válido,  
entonces deberá actualizarse `status`.

### CA-07 - Impedir cambio por otro terapeuta

Dado que el usuario tiene rol `therapist` y no es responsable del proceso,  
cuando intenta modificar su estado,  
entonces el sistema debe responder con `404 Not Found`.

### CA-08 - Impedir cambio entre clínicas

Dado que el proceso pertenece a otra clínica,  
cuando se intenta modificar su estado,  
entonces el sistema debe responder con `404 Not Found`.

### CA-09 - Cambiar a active

Dado que el usuario está autorizado,  
cuando solicita `active`,  
entonces el proceso deberá quedar con estado `active`.

### CA-10 - Cambiar a inactive

Dado que el usuario está autorizado,  
cuando solicita `inactive`,  
entonces el proceso deberá quedar con estado `inactive`.

### CA-11 - Cambiar a discharged

Dado que el usuario está autorizado,  
cuando solicita `discharged`,  
entonces el proceso deberá quedar con estado `discharged`.

### CA-12 - Cambiar a unfinished

Dado que el usuario está autorizado,  
cuando solicita `unfinished`,  
entonces el proceso deberá quedar con estado `unfinished`.

### CA-13 - Rechazar estado inválido

Dado que se proporciona un valor distinto de los cuatro estados permitidos,  
cuando se solicita el cambio,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-14 - Requerir campo status

Dado que la solicitud no proporciona `status` o lo proporciona vacío o nulo,  
cuando se valida,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-15 - Rechazar campos adicionales

Dado que se utiliza el endpoint específico de cambio de estado,  
cuando se proporcionan campos distintos de `status`,  
entonces la solicitud deberá rechazarse.

### CA-16 - Modificar únicamente el estado

Dado que la solicitud es válida,  
cuando se persiste el cambio,  
entonces únicamente deberán modificarse `status` y `updated_at`, cuando exista un cambio efectivo.

### CA-17 - Conservar historial

Dado que se cambia el estado,  
cuando finaliza la operación,  
entonces deberán conservarse pacientes, terapeuta, sesiones, registros y demás información terapéutica.

### CA-18 - Permitir cambios entre estados válidos

Dado que el proceso tiene cualquiera de los estados permitidos,  
cuando se solicita otro estado válido,  
entonces deberá permitirse el cambio, salvo que una regla de transición expresamente definida en `docs/DEFINITIONS.md` establezca una restricción.

### CA-19 - Evitar modificaciones innecesarias

Dado que se solicita el mismo estado que ya tiene el proceso,  
cuando se procesa la solicitud,  
entonces deberá responderse correctamente sin modificar innecesariamente `updated_at`.

### CA-20 - Proceso inexistente

Dado que no existe el proceso solicitado,  
cuando se intenta cambiar su estado,  
entonces el sistema debe responder con `404 Not Found`.

### CA-21 - Respuesta correcta

Dado que la operación se completa correctamente,  
cuando finaliza,  
entonces el sistema debe responder con `200 OK` y la información definida en OpenAPI.

### CA-22 - Proteger contra CSRF

Dado que se utiliza autenticación mediante cookies,  
cuando se recibe la solicitud,  
entonces deberán aplicarse los controles CSRF correspondientes.

## Reglas de negocio

- Los estados permitidos son `active`, `inactive`, `discharged` y `unfinished`.
- `clinic` puede cambiar el estado de procesos de su clínica.
- `therapist` solo puede cambiar el estado de procesos donde sea responsable.
- El usuario y su clínica deben estar activos.
- El cambio de estado no elimina el proceso.
- El `PATCH` modifica exclusivamente `status` y su fecha de actualización cuando corresponda.
- No deben modificarse pacientes, terapeuta ni información clínica.
- El `status` también puede actualizarse mediante `PUT`.
- No se establecen restricciones adicionales entre estados salvo las definidas expresamente en las reglas funcionales.
- El manejo de estados es el mecanismo habitual para administrar el ciclo de vida.

## Dependencias

- Auth.
- Users.
- Clinics.
- Therapeutic Processes.

## Consideraciones técnicas

### Endpoint

`PATCH /v1/therapeutic-processes/{id}/status`

### Request

El cuerpo deberá contener únicamente `status` con uno de los valores permitidos.

### Autenticación y autorización

- Validar sesión, usuario y clínica activos.
- Validar rol.
- Comprobar pertenencia del proceso a la clínica.
- Para `therapist`, comprobar coincidencia con `therapist_id`.
- Aplicar protección CSRF.

### Persistencia

- Respetar DynamoDB Single Table.
- Modificar exclusivamente `status` y `updated_at` cuando corresponda.
- Conservar el resto de los campos.
- Evitar actualizaciones parciales.
- No eliminar ni alterar registros clínicos.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Estado actualizado correctamente. |
| `400 Bad Request` | Identificador, estado o cuerpo inválido. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin permiso de operación. |
| `404 Not Found` | Proceso inexistente o fuera del alcance autorizado. |

### Arquitectura

- `presentation`: validación del estado y respuesta HTTP.
- `application`: caso de uso Change Therapeutic Process Status.
- `domain`: estados permitidos y reglas de transición.
- `infrastructure`: actualización del estado.

El caso de uso deberá mantenerse separado de Update Therapeutic Process.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificaron permisos de ambos roles.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificaron los cuatro estados permitidos.
- [ ] Se verificó el rechazo de estados inválidos.
- [ ] Se verificó que únicamente cambie `status` y su fecha cuando corresponda.
- [ ] Se verificó la conservación del historial.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
