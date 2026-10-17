# US-RECORD-001 — Create Record

**Scope:** Backend  
**Status:** Approved  
**Método:** `POST /v1/records`

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero registrar la información de una sesión de un proceso terapéutico, para mantener el seguimiento de la atención brindada al paciente.

## Descripción

El sistema debe permitir crear un Record asociado a un proceso terapéutico activo.

Los usuarios con rol `clinic` pueden crear Records para cualquier proceso de su clínica. Los usuarios con rol `therapist` únicamente pueden crearlos para procesos donde sean el terapeuta responsable.

La sesión debe registrarse con la fecha actual. Una vez creado el Record, su `session_date` no puede modificarse.

El Record se crea inicialmente sin Home Works. Las tareas se crean posteriormente mediante su endpoint, asociándolas al Record existente, y después se actualiza el Record con sus identificadores en `home_work_ids`.

Cuando `is_attendance = false`, `resume` y `tools` deben ser `null`, y el Record no puede tener tareas asociadas.

## Criterios de aceptación

### CA-01 — Crear Record como clinic
Dado que existe una sesión autenticada con rol `clinic` y el proceso pertenece a su clínica, cuando envía una solicitud válida, entonces el sistema debe crear el Record asociado al proceso.

### CA-02 — Crear Record como therapist
Dado que existe una sesión autenticada con rol `therapist` y el usuario es el terapeuta asignado al proceso, cuando envía una solicitud válida, entonces el sistema debe crear el Record.

### CA-03 — Impedir creación por terapeuta no asignado
Dado que un usuario `therapist` no es responsable del proceso, cuando intenta crear un Record, entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 — Impedir creación entre clínicas
Dado que el proceso pertenece a otra clínica, cuando se intenta registrar una sesión, entonces el sistema debe rechazar la operación.

### CA-05 — Requerir proceso activo
Dado que el proceso tiene un `status` diferente de `active`, cuando se intenta crear el Record, entonces el sistema debe rechazar la operación.

### CA-06 — Registrar fecha actual
Dado que se proporciona `session_date`, cuando se crea el Record, entonces debe corresponder al día actual conforme a la zona horaria definida para la operación.

### CA-07 — Rechazar fecha anterior o futura
Dado que `session_date` no corresponde al día actual, cuando se intenta crear el Record, entonces el sistema debe rechazar la solicitud como inválida.

### CA-08 — Registrar asistencia
Dado que `is_attendance = true`, cuando se crea el Record, entonces el sistema debe permitir registrar `resume` y `tools` conforme al contrato.

### CA-09 — Registrar inasistencia
Dado que `is_attendance = false`, cuando se crea el Record, entonces `resume` y `tools` deben almacenarse como `null` y `home_work_ids` debe permanecer vacío.

### CA-10 — Crear Record sin Home Works
Dado que la sesión todavía no tiene tareas, cuando se crea el Record, entonces debe permitirse su registro sin Home Works asociadas.

### CA-11 — No crear Home Works automáticamente
Dado que se crea un Record, cuando finaliza la operación, entonces el sistema no debe crear Home Works automáticamente.

### CA-12 — Impedir registros duplicados
Dado que ya existe un Record para el mismo proceso y `session_date`, cuando se intenta crear otro, entonces el sistema debe rechazar la solicitud por conflicto.

### CA-13 — Proceso inexistente
Dado que el proceso no existe, cuando se intenta crear el Record, entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-14 — Persistencia consistente
Dado que alguna validación falla, cuando se rechaza la solicitud, entonces no debe persistirse un Record parcial.

### CA-15 — Requerir autenticación
Dado que no existe una sesión válida, cuando se intenta crear un Record, entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

- `clinic` puede crear Records de procesos de su clínica.
- `therapist` únicamente puede crear Records de sus procesos.
- Solo pueden crearse Records en procesos `active`.
- `session_date` debe corresponder al día actual y es inmutable.
- No puede existir más de un Record por proceso y fecha.
- Un Record puede existir sin Home Works.
- Las Home Works se crean después del Record y se vinculan mediante `home_work_ids` en una actualización posterior.
- Si `is_attendance = false`, `resume` y `tools` son `null` y no existen tareas asociadas.

## Dependencias

- Autenticación y autorización.
- Therapeutic Process.
- Existencia de un proceso activo y accesible.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`, `docs/DB.md`, `docs/DEFINITIONS.md` y `docs/PROJECT_ARCHITECTURE.md`.
- La comprobación de duplicidad debe ser segura ante solicitudes concurrentes.
- La fecha de la sesión debe persistirse de forma consistente.
- La creación del Record no debe depender de que existan Home Works.

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se agregaron o actualizaron las pruebas necesarias.
- [ ] Las pruebas pasan correctamente.
- [ ] La implementación fue revisada.