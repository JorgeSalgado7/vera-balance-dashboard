## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero actualizar un registro de sesión,
para corregir o complementar la información documentada de una sesión terapéutica.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir actualizar un Record existente respetando los permisos sobre el proceso terapéutico relacionado.

Un usuario con rol `clinic` puede actualizar cualquier Record correspondiente a un proceso de su clínica.

Un usuario con rol `therapist` únicamente puede actualizar Records correspondientes a procesos donde sea el terapeuta asignado.

Las reglas de consistencia de asistencia, fecha y tareas deben mantenerse después de cualquier actualización.

## Criterios de aceptación

### CA-01 - Actualizar como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el Record pertenece a un proceso de su clínica,
cuando proporciona información válida,
entonces el sistema debe actualizar el Record.

### CA-02 - Actualizar como therapist

Dado que existe una sesión autenticada con rol `therapist`
y el Record pertenece a uno de sus procesos,
cuando proporciona información válida,
entonces el sistema debe actualizar el Record.

### CA-03 - Impedir actualización por therapist no asignado

Dado que el Record pertenece a un proceso asignado a otro terapeuta,
cuando un usuario con rol `therapist` intenta modificarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir actualización entre clínicas

Dado que el Record pertenece a un proceso de otra clínica,
cuando el usuario intenta modificarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Mantener fecha válida

Dado que se modifica `session_date`,
cuando se actualiza el Record,
entonces la fecha debe cumplir las reglas establecidas para los registros de sesión.

### CA-06 - Impedir duplicado mediante actualización

Dado que la modificación de `session_date` provocaría que existieran dos Records para el mismo proceso y fecha,
cuando se intenta actualizar,
entonces el sistema debe rechazar la operación por conflicto.

### CA-07 - Actualizar asistencia a false

Dado que `is_attendance` cambia a `false`,
cuando se actualiza el Record,
entonces `resume` y `tools` deben quedar en `null`
y el Record no debe conservar tareas asociadas.

### CA-08 - Actualizar asistencia a true

Dado que `is_attendance` es `true`,
cuando se actualiza el Record,
entonces el sistema debe permitir actualizar `resume`, `tools` y las tareas asociadas.

### CA-09 - Asociar Home Works existentes

Dado que se modifican `home_work_ids`,
cuando se actualiza el Record,
entonces los identificadores proporcionados deben corresponder a tareas previamente creadas.

### CA-10 - Record inexistente

Dado que el Record no existe,
cuando se intenta actualizar,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-11 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta actualizar el Record,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede actualizar cualquier Record perteneciente a procesos de su clínica.
* `therapist` únicamente puede actualizar Records correspondientes a sus procesos.
* No puede generarse un duplicado para el mismo proceso terapéutico y `session_date`.
* Cuando `is_attendance = false`, `resume` y `tools` deben ser `null` y no deben existir tareas asociadas.
* Las Home Works deben existir previamente antes de ser relacionadas con el Record.

## Dependencias

* El Record debe existir.
* El proceso terapéutico relacionado debe existir.
* Las Home Works proporcionadas deben existir previamente.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

* `docs/DB.md`
* `docs/baas-vera-balance-dashboard.yaml`
* `docs/DEFINITIONS.md`
* `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] La implementación fue revisada.
