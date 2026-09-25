## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero registrar la información de una sesión de un proceso terapéutico,
para mantener el seguimiento de la atención brindada al paciente.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir crear registros de sesión asociados a un proceso terapéutico activo.

Un usuario con rol `clinic` puede crear registros para cualquier proceso terapéutico perteneciente a su clínica.

Un usuario con rol `therapist` únicamente puede crear registros para procesos donde sea el terapeuta asignado.

El registro corresponde a una sesión del día actual. No se permite registrar sesiones con fechas futuras ni anteriores.

Cuando la sesión incluye tareas, las Home Works se crean previamente mediante su endpoint como parte del mismo flujo de registro de sesión. El frontend recupera los identificadores de las tareas creadas y posteriormente los envía en `home_work_ids` al crear el Record.

Cuando el paciente no asiste a la sesión, el registro debe conservar la información de asistencia, pero `resume`, `tools` y las tareas asociadas deben permanecer vacíos.

## Criterios de aceptación

### CA-01 - Crear Record como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el proceso terapéutico pertenece a su clínica,
cuando se proporciona información válida,
entonces el sistema debe crear el Record.

### CA-02 - Crear Record como therapist

Dado que existe una sesión autenticada con rol `therapist`
y el usuario es el terapeuta asignado al proceso,
cuando se proporciona información válida,
entonces el sistema debe crear el Record.

### CA-03 - Impedir creación por therapist no asignado

Dado que el usuario tiene rol `therapist`
y no es el terapeuta asignado al proceso,
cuando intenta crear un Record,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir creación entre clínicas

Dado que el proceso terapéutico pertenece a otra clínica,
cuando el usuario intenta crear un Record,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Requerir proceso activo

Dado que el proceso terapéutico tiene un `status` diferente de `active`,
cuando se intenta crear un Record,
entonces el sistema debe rechazar la operación.

### CA-06 - Crear Record para el día actual

Dado que se registra una sesión,
cuando se proporciona `session_date`,
entonces la fecha debe corresponder al día actual.

### CA-07 - Rechazar fecha futura

Dado que `session_date` corresponde a una fecha futura,
cuando se intenta crear el Record,
entonces el sistema debe rechazar la solicitud.

### CA-08 - Rechazar fecha anterior

Dado que `session_date` corresponde a un día anterior,
cuando se intenta crear el Record,
entonces el sistema debe rechazar la solicitud.

### CA-09 - Registrar asistencia

Dado que el paciente asistió a la sesión,
cuando se crea el Record con `is_attendance = true`,
entonces el sistema debe permitir registrar `resume`, `tools` y las tareas relacionadas.

### CA-10 - Registrar inasistencia

Dado que el paciente no asistió a la sesión,
cuando se crea el Record con `is_attendance = false`,
entonces `resume` y `tools` deben almacenarse como `null`
y no deben existir tareas asociadas al Record.

### CA-11 - Asociar Home Works creadas durante el flujo

Dado que durante el flujo de registro de la sesión se crearon una o más Home Works
y el frontend obtuvo sus identificadores,
cuando se crea el Record enviando dichos identificadores en `home_work_ids`,
entonces el sistema debe asociar las Home Works al Record.

### CA-12 - Validar Home Works proporcionadas

Dado que se proporcionan identificadores en `home_work_ids`,
cuando se crea el Record,
entonces los identificadores deben corresponder a Home Works existentes.

### CA-13 - Crear Record sin Home Works

Dado que la sesión no requiere tareas,
cuando se crea el Record,
entonces el sistema debe permitir su creación sin Home Works asociadas.

### CA-14 - Impedir registros duplicados

Dado que ya existe un Record para el mismo proceso terapéutico y `session_date`,
cuando se intenta crear otro,
entonces el sistema debe rechazar la operación por conflicto.

### CA-15 - Proceso inexistente

Dado que no existe el proceso terapéutico proporcionado,
cuando se intenta crear el Record,
entonces el sistema debe rechazar la operación.

### CA-16 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta crear un Record,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede crear Records para cualquier proceso de su clínica.
* `therapist` únicamente puede crear Records para procesos donde sea el terapeuta asignado.
* Solo pueden crearse Records para procesos con `status = active`.
* `session_date` debe corresponder al día actual.
* No se permiten Records retroactivos ni con fechas futuras.
* No puede existir más de un Record para el mismo proceso terapéutico y `session_date`.
* Cuando `is_attendance = false`, `resume` y `tools` deben ser `null` y no deben existir tareas asociadas.
* Las Home Works forman parte del flujo de registro de una sesión, pero se crean mediante su propio endpoint.
* El frontend crea primero las Home Works necesarias, recupera sus identificadores y posteriormente los envía en `home_work_ids` al crear el Record.
* Los identificadores proporcionados en `home_work_ids` deben corresponder a Home Works existentes.
* Un Record puede crearse sin Home Works asociadas.

## Dependencias

* El proceso terapéutico debe existir.
* El proceso terapéutico debe estar `active`.
* Cuando la sesión incluya tareas, las Home Works deben haberse creado previamente dentro del mismo flujo de registro de sesión.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La creación de Home Works y la creación del Record se realizan mediante endpoints independientes.
* La asociación entre el Record y las Home Works se establece mediante `home_work_ids`.

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
