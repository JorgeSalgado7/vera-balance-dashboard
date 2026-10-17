# US-PROCESS-004 — Update Therapeutic Process

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero actualizar la información de un proceso terapéutico,  
para mantener vigente la información relacionada con la atención del paciente.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir actualizar procesos mediante `PUT /v1/therapeutic-processes/{id}`.

Los usuarios `clinic` podrán actualizar cualquier proceso de su clínica, incluida la reasignación del terapeuta responsable.

Los usuarios `therapist` únicamente podrán actualizar procesos donde sean responsables y no podrán reasignarlos.

La operación podrá modificar los campos autorizados del proceso, incluido `status`.

La actualización deberá validar el estado final del proceso, conservando las reglas de pertenencia a clínica, pacientes, cardinalidad y tipos de terapia.

## Criterios de aceptación

### CA-01 - Requerir autenticación

Dado que se solicita actualizar un proceso,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar roles

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá actualizar procesos conforme a sus permisos.

### CA-03 - Validar usuario y clínica activos

Dado que se solicita actualizar un proceso,  
cuando el usuario o su clínica están inactivos,  
entonces deberá rechazarse la operación.

### CA-04 - Validar identificador

Dado que se proporciona el parámetro `id`,  
cuando no cumple el formato definido,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-05 - Actualizar como clinic

Dado que el usuario tiene rol `clinic` y el proceso pertenece a su clínica,  
cuando proporciona una actualización válida,  
entonces el sistema debe guardar los cambios.

### CA-06 - Actualizar como therapist responsable

Dado que el usuario tiene rol `therapist` y es responsable del proceso,  
cuando proporciona una actualización válida,  
entonces el sistema debe guardar los cambios permitidos.

### CA-07 - Impedir actualización por otro terapeuta

Dado que el usuario tiene rol `therapist` y no es responsable del proceso,  
cuando intenta actualizarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-08 - Impedir actualización entre clínicas

Dado que el proceso pertenece a otra clínica,  
cuando se intenta actualizarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-09 - Reasignar terapeuta como clinic

Dado que el usuario tiene rol `clinic`,  
cuando proporciona un nuevo `therapist_id`,  
entonces el sistema debe permitir la reasignación si el usuario indicado existe, está activo, pertenece a la misma clínica y tiene rol `clinic` o `therapist`.

### CA-10 - Impedir reasignación como therapist

Dado que el usuario tiene rol `therapist`,  
cuando intenta proporcionar o modificar `therapist_id`,  
entonces el sistema debe responder con `403 Forbidden`.

### CA-11 - Mantener clínica e identificador

Dado que se actualiza un proceso,  
cuando se persisten los cambios,  
entonces su identificador y clínica deberán permanecer sin modificaciones.

### CA-12 - Permitir actualización parcial

Dado que se proporcionan algunos campos modificables,  
cuando se procesa el `PUT`,  
entonces los campos omitidos deberán conservar sus valores.

La validación deberá realizarse sobre el estado final completo.

### CA-13 - Validar existencia de pacientes

Dado que se modifica la lista de pacientes,  
cuando se valida la actualización,  
entonces todos los pacientes deberán existir.

### CA-14 - Validar clínica de pacientes

Dado que se modifica la lista de pacientes,  
cuando se valida la actualización,  
entonces todos deberán pertenecer a la clínica del proceso.

### CA-15 - Rechazar pacientes duplicados

Dado que la lista contiene el mismo identificador más de una vez,  
cuando se intenta actualizar,  
entonces la solicitud deberá rechazarse.

### CA-16 - Mantener al menos un paciente

Dado que se modifica la lista de pacientes,  
cuando el resultado dejaría el proceso sin pacientes,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-17 - Validar terapia de pareja

Dado que el estado final corresponde a terapia de pareja,  
cuando se actualiza el proceso,  
entonces deberán existir exactamente dos pacientes diferentes.

### CA-18 - Validar terapia familiar

Dado que el estado final corresponde a terapia familiar,  
cuando se actualiza el proceso,  
entonces deberá mantenerse al menos un paciente y permitirse múltiples pacientes sin límite máximo de negocio.

### CA-19 - Validar tipo de terapia

Dado que se modifica `therapy_type`,  
cuando se valida el nuevo valor,  
entonces deberá existir en `therapy_types` de la clínica.

### CA-20 - Validar combinación final

Dado que se modifica `therapy_type`, la lista de pacientes o ambos,  
cuando se procesa la actualización,  
entonces deberá validarse conjuntamente la cardinalidad correspondiente al tipo de terapia resultante.

### CA-21 - Actualizar información terapéutica

Dado que se proporcionan cambios válidos en motivo de consulta, objetivos u otros campos modificables,  
cuando se procesa la solicitud,  
entonces deberán guardarse conforme a OpenAPI.

### CA-22 - Modificar status

Dado que se proporciona un `status` permitido,  
cuando se procesa el `PUT`,  
entonces deberá actualizarse el estado del proceso.

### CA-23 - Validar status

Dado que se proporciona un estado diferente de `active`, `inactive`, `discharged` o `unfinished`,  
cuando se solicita actualizar el proceso,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-24 - Permitir actualización de procesos no activos

Dado que el usuario tiene autorización sobre un proceso,  
cuando su estado es `inactive`, `discharged` o `unfinished`,  
entonces el estado no deberá impedir por sí solo su actualización.

### CA-25 - Proceso inexistente

Dado que no existe el proceso solicitado,  
cuando se intenta actualizarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-26 - Conservar información ante errores

Dado que falla alguna validación,  
cuando se rechaza la actualización,  
entonces no deberá persistirse ningún cambio parcial.

### CA-27 - Actualizar fecha

Dado que se modifican datos del proceso,  
cuando se persisten correctamente,  
entonces deberá actualizarse `updated_at` y conservarse `created_at`.

### CA-28 - Mantener integridad de relaciones

Dado que se modifica la lista de pacientes,  
cuando se persisten los cambios,  
entonces deberán mantenerse consistentes las relaciones utilizadas para consultar procesos por paciente y pacientes por terapeuta.

### CA-29 - Respuesta correcta

Dado que el proceso fue actualizado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `200 OK` y la información definida en OpenAPI.

### CA-30 - Proteger contra CSRF

Dado que se utiliza autenticación mediante cookies,  
cuando se recibe la solicitud,  
entonces deberán aplicarse los controles CSRF correspondientes.

## Reglas de negocio

- `clinic` puede actualizar cualquier proceso de su clínica.
- `therapist` únicamente puede actualizar procesos donde sea responsable.
- Solo `clinic` puede reasignar al terapeuta responsable.
- El nuevo terapeuta debe pertenecer a la misma clínica y estar habilitado para brindar atención.
- La clínica y el identificador del proceso son inmutables.
- Los campos omitidos conservan sus valores.
- Todos los pacientes deben existir y pertenecer a la clínica.
- No pueden repetirse pacientes.
- Todo proceso debe mantener al menos un paciente.
- La terapia de pareja requiere exactamente dos pacientes.
- La terapia familiar permite múltiples pacientes sin límite máximo de negocio.
- `therapy_type` debe estar configurado en la clínica.
- Los estados permitidos son `active`, `inactive`, `discharged` y `unfinished`.
- El `PUT` puede modificar `status`.
- La actualización debe validar el estado final completo.
- No deben persistirse cambios parciales ante errores.

## Dependencias

- Auth.
- Users.
- Clinics.
- Patients.
- Therapeutic Processes.
- Configuración de `therapy_types`.

## Consideraciones técnicas

### Endpoint

`PUT /v1/therapeutic-processes/{id}`

El contrato deberá documentar expresamente que se permite actualización parcial mediante `PUT`.

### Autorización

- Validar sesión, rol, usuario y clínica activos.
- Comprobar pertenencia del proceso a la clínica.
- Para `therapist`, comprobar coincidencia con `therapist_id`.
- Reservar la reasignación a `clinic`.
- Rechazar cambios de identificador o clínica.

### Validación del estado final

- Recuperar el proceso actual.
- Combinar campos existentes con cambios proporcionados.
- Validar terapeuta responsable cuando cambie.
- Validar pacientes y clínica.
- Validar cardinalidad según el tipo de terapia resultante.
- Validar `therapy_type` contra la configuración de la clínica.
- Validar `status` y campos terapéuticos.
- Persistir únicamente después de completar todas las validaciones.

### Persistencia

- Respetar DynamoDB Single Table.
- Mantener índices y relaciones por terapeuta y paciente.
- Evitar referencias a pacientes inexistentes.
- Conservar `created_at`.
- Actualizar `updated_at` cuando existan cambios efectivos.
- Garantizar consistencia frente a actualizaciones concurrentes.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Proceso actualizado correctamente. |
| `400 Bad Request` | Datos, cardinalidad, tipo de terapia o estado inválidos. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Operación prohibida, incluida reasignación por `therapist`. |
| `404 Not Found` | Proceso o paciente inexistente o fuera del alcance autorizado. |
| `409 Conflict` | Conflicto de integridad o concurrencia. |

### Arquitectura

- `presentation`: DTO, autenticación y respuesta HTTP.
- `application`: caso de uso Update Therapeutic Process.
- `domain`: reglas de cardinalidad, estados y asignación.
- `infrastructure`: consultas y actualización de relaciones.

El caso de uso deberá permanecer separado de Create Therapeutic Process.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificaron permisos de `clinic` y `therapist`.
- [ ] Se verificó la reasignación exclusiva de `clinic`.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó la actualización parcial.
- [ ] Se verificaron pacientes y cardinalidad.
- [ ] Se verificó la validación de `therapy_type`.
- [ ] Se verificó la modificación de `status`.
- [ ] Se verificó la consistencia de relaciones e índices.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
