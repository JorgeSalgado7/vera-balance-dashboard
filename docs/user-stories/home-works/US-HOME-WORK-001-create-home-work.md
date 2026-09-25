## Historia de usuario

Como terapeuta de Vera Balance,
quiero crear una tarea como parte del registro de una sesión,
para asignar al paciente actividades que apoyen su proceso terapéutico.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir crear Home Works como parte del flujo de creación de un Record.

Los usuarios con rol `clinic` y `therapist` pueden crear Home Works.

La creación de la Home Work y la creación del Record se realizan mediante endpoints independientes. El frontend crea primero las Home Works necesarias, recupera sus identificadores y posteriormente envía dichos identificadores mediante `home_work_ids` al crear el Record.

La Home Work no almacena directamente información sobre clínica, terapeuta, paciente, proceso terapéutico o Record. La relación con la sesión se establece desde el Record mediante `home_work_ids`.

Una Home Work sin asociación a un Record representa únicamente un estado transitorio dentro del flujo de creación y no un estado funcional esperado del sistema.

## Criterios de aceptación

### CA-01 - Crear Home Work como clinic

Dado que existe una sesión autenticada con rol `clinic`,
cuando se proporciona información válida para una tarea,
entonces el sistema debe crear la Home Work.

### CA-02 - Crear Home Work como therapist

Dado que existe una sesión autenticada con rol `therapist`,
cuando se proporciona información válida para una tarea,
entonces el sistema debe crear la Home Work.

### CA-03 - Registrar descripción

Dado que se crea una Home Work,
cuando se proporciona `description`,
entonces el sistema debe almacenar la descripción de la tarea.

### CA-04 - Registrar estado de cumplimiento

Dado que se crea una Home Work,
cuando se proporciona `is_completed`,
entonces el sistema debe almacenar el estado indicado.

### CA-05 - Recuperar identificador

Dado que la Home Work fue creada correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver su identificador para permitir que posteriormente sea asociado al Record.

### CA-06 - Asociar posteriormente al Record

Dado que una Home Work fue creada durante el flujo de registro de una sesión,
cuando el frontend crea el Record,
entonces debe poder utilizar el identificador obtenido dentro de `home_work_ids`.

### CA-07 - Permitir múltiples Home Works

Dado que una sesión puede tener más de una tarea,
cuando se crean varias Home Works,
entonces cada una debe ser creada como un recurso independiente y obtener su propio identificador.

### CA-08 - Permitir tareas con la misma descripción

Dado que ya existe una Home Work con determinada descripción,
cuando se crea otra con la misma descripción,
entonces el sistema debe permitir su creación como un recurso independiente.

### CA-09 - Requerir campos obligatorios

Dado que no se proporciona `description` o `is_completed`,
cuando se intenta crear la Home Work,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-10 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta crear una Home Work,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Los roles `clinic` y `therapist` pueden crear Home Works.
* Las Home Works se crean como parte del flujo de creación de un Record.
* La creación de Home Works y Records se realiza mediante endpoints independientes.
* El frontend crea las Home Works, recupera sus identificadores y posteriormente los envía mediante `home_work_ids` al crear el Record.
* La Home Work no almacena directamente clínica, terapeuta, paciente, proceso terapéutico o Record.
* Una Home Work sin asociación a un Record representa un estado transitorio y no un estado funcional esperado.
* `description` e `is_completed` son obligatorios durante la creación.
* Pueden existir diferentes Home Works con la misma descripción.

## Dependencias

* Debe existir una sesión autenticada.
* La asociación de la Home Work con la sesión depende posteriormente de la creación del Record.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* No se requiere almacenar `record_id`, `therapeutic_process_id`, `clinic_id` o `therapist_id` dentro de la Home Work.
* La asociación se establece desde el Record mediante `home_work_ids`.

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
