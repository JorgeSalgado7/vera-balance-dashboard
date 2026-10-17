# US-RECORD-004 — Update Record

**Scope:** Backend  
**Status:** Approved  
**Método:** `PUT /v1/records/{id}`

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero actualizar la información de un registro de sesión, para corregir o complementar su contenido y asociar las tareas creadas para dicha sesión.

## Descripción

El sistema debe permitir actualizar un Record existente, respetando los permisos sobre su proceso terapéutico.

El campo `session_date` es inmutable. La actualización puede realizarse sobre Records históricos, sin modificar la fecha registrada originalmente.

El flujo de asociación de tareas consiste en crear primero el Record, crear posteriormente las Home Works con su `record_id` y, finalmente, actualizar el Record con los identificadores correspondientes en `home_work_ids`.

Las Home Works deben existir y pertenecer al mismo Record. No se permite asociar tareas de otro Record.

## Criterios de aceptación

### CA-01 — Actualizar como clinic
Dado que el Record pertenece a un proceso de su clínica, cuando un usuario `clinic` envía una actualización válida, entonces debe actualizarse el registro.

### CA-02 — Actualizar como therapist
Dado que el Record pertenece a un proceso donde el usuario `therapist` es responsable, cuando envía una actualización válida, entonces debe actualizarse el registro.

### CA-03 — Impedir actualización por therapist no asignado
Dado que el proceso está asignado a otro terapeuta, cuando `therapist` intenta actualizar su Record, entonces debe rechazarse la operación.

### CA-04 — Impedir actualización entre clínicas
Dado que el Record pertenece a otra clínica, cuando se intenta actualizar, entonces debe rechazarse la operación.

### CA-05 — Mantener session_date inmutable
Dado que existe un Record, cuando se actualiza su información, entonces `session_date` debe conservar exactamente su valor original.

### CA-06 — Rechazar modificación de session_date
Dado que una solicitud intenta modificar `session_date`, cuando se procesa la actualización, entonces debe rechazarse el cambio sin modificar el Record.

### CA-07 — Actualizar Record histórico
Dado que el Record corresponde a una sesión anterior, cuando un usuario autorizado modifica sus campos permitidos, entonces debe permitirse la actualización sin alterar su fecha.

### CA-08 — Actualizar asistencia a false
Dado que `is_attendance` cambia a `false`, cuando se actualiza el Record, entonces `resume` y `tools` deben quedar en `null` y `home_work_ids` debe quedar vacío. Las Home Works previamente asociadas deben eliminarse para mantener la consistencia.

### CA-09 — Actualizar asistencia a true
Dado que `is_attendance = true`, cuando se actualiza el Record, entonces debe permitirse modificar `resume`, `tools` y las referencias a Home Works.

### CA-10 — Asociar Home Works existentes
Dado que se proporcionan identificadores en `home_work_ids`, cuando se actualiza el Record, entonces cada Home Work debe existir y estar asociada al mismo Record.

### CA-11 — Impedir Home Works de otro Record
Dado que una Home Work pertenece a un Record diferente, cuando se intenta incluir su identificador, entonces debe rechazarse la actualización.

### CA-12 — Impedir identificadores duplicados
Dado que `home_work_ids` contiene el mismo identificador más de una vez, cuando se procesa la actualización, entonces debe rechazarse la solicitud como inválida.

### CA-13 — Actualizar sin Home Works
Dado que la sesión no requiere tareas, cuando se actualiza el Record, entonces debe permitirse mantener `home_work_ids` vacío.

### CA-14 — Mantener relación con el proceso
Dado que el Record pertenece a un proceso terapéutico, cuando se actualiza, entonces su asociación con el proceso no debe modificarse.

### CA-15 — Record inexistente
Dado que el Record no existe, cuando se intenta actualizar, entonces debe indicarse que el recurso no fue encontrado.

### CA-16 — Identificador inválido
Dado que el identificador no cumple con el formato esperado, cuando se intenta actualizar, entonces debe rechazarse la solicitud.

### CA-17 — No aplicar cambios parciales
Dado que alguna validación falla, cuando se rechaza la actualización, entonces deben conservarse los datos anteriores del Record.

### CA-18 — Requerir autenticación
Dado que no existe una sesión válida, cuando se intenta actualizar el Record, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- `clinic` puede actualizar Records de su clínica.
- `therapist` únicamente puede actualizar Records de sus procesos.
- `session_date` no puede modificarse después de la creación.
- Los Records históricos pueden actualizarse conforme a los permisos.
- La relación entre Record y Therapeutic Process es inmutable.
- Las Home Works deben crearse con una asociación válida al Record.
- `home_work_ids` únicamente puede contener identificadores de tareas pertenecientes al mismo Record.
- No se permiten identificadores duplicados.
- Cuando `is_attendance = false`, `resume` y `tools` son `null` y no existen Home Works asociadas.
- La actualización debe mantener la consistencia entre las referencias del Record y las Home Works existentes.

## Dependencias

- Record existente.
- Therapeutic Process asociado.
- Home Works creadas previamente, cuando corresponda.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`, `docs/DB.md`, `docs/DEFINITIONS.md` y `docs/PROJECT_ARCHITECTURE.md`.
- Validar el estado final del Record antes de persistirlo.
- Evitar inconsistencias entre `home_work_ids` y la relación de cada Home Work con su Record.
- Si la actualización requiere eliminar tareas por inasistencia, asegurar una operación consistente.
- No permitir que el cliente modifique `session_date` ni el identificador del proceso asociado.

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se agregaron o actualizaron las pruebas necesarias.
- [ ] Las pruebas pasan correctamente.
- [ ] La implementación fue revisada.