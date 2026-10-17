# US-HOME-WORK-005 — Delete Home Work

**Scope:** Backend  
**Status:** Approved

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero eliminar una tarea asociada a un registro de sesión sobre el que tengo permisos, para retirar una actividad que ya no debe permanecer registrada.

## Descripción

El sistema debe permitir eliminar físicamente una Home Work.

Los usuarios `clinic` pueden eliminar tareas de Records pertenecientes a procesos de su clínica.

Los usuarios `therapist` únicamente pueden eliminar tareas de Records de sus procesos.

Cuando se elimina una Home Work, también debe retirarse su identificador de `home_work_ids` del Record asociado.

La eliminación no debe afectar al Record ni a sus demás Home Works.

## Criterios de aceptación

### CA-01 — Eliminar como clinic
Dado que la Home Work pertenece a un Record de su clínica, cuando `clinic` solicita eliminarla, entonces debe permitirse la operación.

### CA-02 — Eliminar como therapist
Dado que la Home Work pertenece a un Record de un proceso donde `therapist` es responsable, cuando solicita eliminarla, entonces debe permitirse la operación.

### CA-03 — Impedir eliminación por therapist no asignado
Dado que la tarea pertenece al proceso de otro terapeuta, cuando `therapist` intenta eliminarla, entonces debe rechazarse la operación.

### CA-04 — Impedir eliminación entre clínicas
Dado que la tarea pertenece a otra clínica, cuando se intenta eliminar, entonces debe rechazarse la operación.

### CA-05 — Eliminar físicamente
Dado que la operación está autorizada, cuando finaliza, entonces la Home Work debe dejar de existir en persistencia.

### CA-06 — Retirar referencia del Record
Dado que el identificador de la tarea se encuentra en `home_work_ids`, cuando se elimina, entonces debe retirarse de la colección.

### CA-07 — Conservar Record
Dado que la Home Work pertenece a un Record, cuando se elimina, entonces el Record debe continuar existiendo.

### CA-08 — Conservar otras tareas
Dado que existen otras Home Works asociadas al Record, cuando se elimina una, entonces las demás deben conservarse.

### CA-09 — Mantener consistencia
Dado que se elimina una Home Work, cuando finaliza la operación, entonces no deben quedar referencias a dicha tarea en `home_work_ids`.

### CA-10 — Home Work inexistente
Dado que no existe una Home Work con el identificador proporcionado, cuando se intenta eliminar, entonces debe indicarse que el recurso no fue encontrado.

### CA-11 — Identificador inválido
Dado que el identificador tiene un formato inválido, cuando se intenta eliminar, entonces debe rechazarse la solicitud.

### CA-12 — Responder sin contenido
Dado que la Home Work se eliminó correctamente, cuando finaliza la operación, entonces debe responderse sin contenido.

### CA-13 — Requerir autenticación
Dado que no existe una sesión válida, cuando se intenta eliminar la Home Work, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- `clinic` puede eliminar Home Works de Records de su clínica.
- `therapist` únicamente puede eliminar Home Works de Records de sus procesos.
- La eliminación es física.
- Al eliminar una Home Work debe retirarse su referencia de `home_work_ids`.
- La eliminación de una tarea no elimina su Record.
- Las demás Home Works deben conservarse.
- No deben quedar referencias a tareas eliminadas.

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
- La eliminación de la tarea y la actualización de las referencias del Record deben mantener consistencia.
- Verificar permisos antes de realizar la eliminación.

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