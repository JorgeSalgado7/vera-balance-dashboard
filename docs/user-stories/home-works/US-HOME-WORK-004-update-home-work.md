# US-HOME-WORK-004 — Update Home Work

**Scope:** Backend  
**Status:** Approved

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero actualizar una tarea asociada a un registro de sesión, para modificar su descripción o registrar si fue completada.

## Descripción

El sistema debe permitir actualizar Home Works existentes respetando los permisos sobre el Record al que pertenecen.

Los usuarios `clinic` pueden actualizar tareas de Records de su clínica.

Los usuarios `therapist` únicamente pueden actualizar tareas de Records correspondientes a sus procesos.

Los campos editables son `description` e `is_completed`.

La relación de la Home Work con su Record no puede modificarse mediante esta operación.

## Criterios de aceptación

### CA-01 — Actualizar como clinic
Dado que la Home Work pertenece a un Record de su clínica, cuando `clinic` proporciona información válida, entonces debe actualizarse la tarea.

### CA-02 — Actualizar como therapist
Dado que la Home Work pertenece a un Record de un proceso donde `therapist` es responsable, cuando proporciona información válida, entonces debe actualizarse la tarea.

### CA-03 — Impedir actualización por therapist no asignado
Dado que la tarea pertenece al proceso de otro terapeuta, cuando `therapist` intenta modificarla, entonces debe rechazarse la operación.

### CA-04 — Impedir actualización entre clínicas
Dado que la tarea pertenece a otra clínica, cuando se intenta modificarla, entonces debe rechazarse la operación.

### CA-05 — Actualizar descripción
Dado que se proporciona una nueva `description` válida, cuando se actualiza la Home Work, entonces debe almacenarse el nuevo valor.

### CA-06 — Marcar como completada
Dado que el paciente realizó la tarea, cuando un usuario autorizado establece `is_completed = true`, entonces debe registrarse como completada.

### CA-07 — Marcar como no completada
Dado que corresponde registrar que la tarea no fue completada, cuando se establece `is_completed = false`, entonces debe almacenarse el estado indicado.

### CA-08 — Permitir descripciones duplicadas
Dado que la nueva descripción coincide con otra Home Work, cuando se actualiza, entonces dicha coincidencia no debe impedir la operación.

### CA-09 — Mantener asociación con Record
Dado que la Home Work pertenece a un Record, cuando se actualiza, entonces su relación con dicho Record debe permanecer sin cambios.

### CA-10 — Rechazar modificación de asociación
Dado que una solicitud intenta cambiar el Record propietario de la Home Work, cuando se procesa la actualización, entonces debe rechazarse el cambio.

### CA-11 — Actualizar tarea histórica
Dado que el proceso relacionado ya no está activo, cuando un usuario autorizado actualiza `description` o `is_completed`, entonces debe permitirse la operación.

### CA-12 — Home Work inexistente
Dado que la Home Work no existe, cuando se intenta actualizar, entonces debe indicarse que el recurso no fue encontrado.

### CA-13 — Identificador inválido
Dado que el identificador no cumple con el formato esperado, cuando se intenta actualizar, entonces debe rechazarse la solicitud.

### CA-14 — No aplicar cambios parciales
Dado que la actualización contiene información inválida, cuando se rechaza, entonces la Home Work debe conservar sus valores anteriores.

### CA-15 — Requerir autenticación
Dado que no existe una sesión válida, cuando se intenta actualizar la Home Work, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- `clinic` puede actualizar tareas de su clínica.
- `therapist` únicamente puede actualizar tareas de sus procesos.
- `description` es editable.
- `is_completed` es editable y representa el cumplimiento registrado manualmente.
- Se permiten descripciones duplicadas.
- La relación de la tarea con el Record es inmutable.
- Actualizar una Home Work no modifica la fecha ni la asistencia del Record.
- No deben aplicarse actualizaciones parciales ante errores.

## Dependencias

- Home Work existente.
- Record asociado.
- Therapeutic Process relacionado.
- Sesión autenticada.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`.
- Respetar `docs/DB.md`.
- Respetar `docs/DEFINITIONS.md`.
- Respetar `docs/PROJECT_ARCHITECTURE.md`.
- Validar únicamente los campos editables definidos por el contrato.
- Conservar la asociación original de la Home Work.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se agregaron o actualizaron las pruebas necesarias.
- [ ] Las pruebas pasan correctamente.
- [ ] La implementación fue revisada.