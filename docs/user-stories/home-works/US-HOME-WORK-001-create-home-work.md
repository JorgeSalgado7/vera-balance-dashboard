# US-HOME-WORK-001 — Create Home Work

**Scope:** Backend  
**Status:** Approved

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero crear una tarea asociada a un registro de sesión existente, para asignar al paciente actividades que apoyen su proceso terapéutico.

## Descripción

El sistema debe permitir crear Home Works como parte del flujo de registro de una sesión terapéutica.

La creación de una Home Work requiere que previamente exista un Record. Cada tarea debe quedar asociada a dicho Record desde su creación.

Los usuarios con rol `clinic` pueden crear tareas para Records de procesos pertenecientes a su clínica.

Los usuarios con rol `therapist` únicamente pueden crear tareas para Records de procesos donde sean los terapeutas asignados.

La Home Work almacena `description`, `is_completed` y la referencia necesaria para identificar su Record.

El frontend crea primero el Record, posteriormente las Home Works y finalmente actualiza el Record incorporando los identificadores de las tareas mediante `home_work_ids`.

## Criterios de aceptación

### CA-01 — Crear Home Work como clinic
Dado que existe una sesión autenticada con rol `clinic` y el Record pertenece a un proceso de su clínica, cuando proporciona información válida, entonces el sistema debe crear la Home Work asociada al Record.

### CA-02 — Crear Home Work como therapist
Dado que existe una sesión autenticada con rol `therapist` y el Record pertenece a un proceso donde es responsable, cuando proporciona información válida, entonces el sistema debe crear la Home Work.

### CA-03 — Requerir Record existente
Dado que se solicita crear una Home Work, cuando se procesa la solicitud, entonces el sistema debe comprobar que el Record proporcionado existe.

### CA-04 — Impedir creación sin Record
Dado que no se proporciona una referencia válida al Record, cuando se intenta crear la tarea, entonces el sistema debe rechazar la solicitud.

### CA-05 — Impedir creación por therapist no asignado
Dado que el Record pertenece a un proceso asignado a otro terapeuta, cuando `therapist` intenta crear una Home Work, entonces debe rechazarse la operación.

### CA-06 — Impedir creación entre clínicas
Dado que el Record pertenece a un proceso de otra clínica, cuando se intenta crear una Home Work, entonces debe rechazarse la operación.

### CA-07 — Registrar descripción
Dado que se proporciona `description`, cuando se crea la Home Work, entonces debe almacenarse su descripción.

### CA-08 — Registrar estado de cumplimiento
Dado que se proporciona `is_completed`, cuando se crea la Home Work, entonces debe almacenarse el valor booleano indicado.

### CA-09 — Requerir campos obligatorios
Dado que falta `description`, `is_completed` o la referencia al Record, cuando se intenta crear la tarea, entonces debe rechazarse la solicitud como inválida.

### CA-10 — Devolver identificador
Dado que la Home Work se creó correctamente, cuando finaliza la operación, entonces debe devolverse su identificador.

### CA-11 — Permitir múltiples tareas
Dado que un Record puede contener varias Home Works, cuando se crean diferentes tareas para el mismo Record, entonces cada una debe tener un identificador independiente.

### CA-12 — Permitir descripciones duplicadas
Dado que existe una Home Work con la misma descripción, cuando se crea otra, entonces debe permitirse su creación como recurso independiente.

### CA-13 — Impedir tareas en sesiones sin asistencia
Dado que el Record tiene `is_attendance = false`, cuando se intenta crear una Home Work, entonces debe rechazarse la operación.

### CA-14 — Mantener asociación obligatoria
Dado que la Home Work se crea correctamente, cuando se almacena, entonces debe conservar una referencia válida a su Record.

### CA-15 — Actualización posterior del Record
Dado que se crearon Home Works asociadas al Record, cuando el frontend recupera sus identificadores, entonces debe poder enviarlos mediante Update Record para actualizar `home_work_ids`.

### CA-16 — Requerir autenticación
Dado que no existe una sesión autenticada válida, cuando se intenta crear una Home Work, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- `clinic` puede crear Home Works para Records de su clínica.
- `therapist` únicamente puede crear Home Works para Records de sus procesos.
- El Record debe existir antes de crear la Home Work.
- Toda Home Work debe estar asociada a un Record.
- No se permiten Home Works huérfanas.
- `description` e `is_completed` son obligatorios.
- Pueden existir tareas con descripciones idénticas.
- Una sesión sin asistencia no puede tener Home Works.
- La creación de Home Works y la actualización del Record se realizan mediante endpoints independientes.
- La actualización posterior de `home_work_ids` no modifica la pertenencia original de la tarea.

## Dependencias

- Sesión autenticada.
- Record existente.
- Therapeutic Process asociado.
- Permisos sobre el proceso terapéutico.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`.
- Respetar `docs/DB.md`.
- Respetar `docs/DEFINITIONS.md`.
- Respetar `docs/PROJECT_ARCHITECTURE.md`.
- El modelo debe permitir identificar el Record propietario de la Home Work.
- La autorización debe resolverse mediante Record → Therapeutic Process → Clinic.
- La creación debe evitar asociaciones inválidas ante operaciones concurrentes.

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