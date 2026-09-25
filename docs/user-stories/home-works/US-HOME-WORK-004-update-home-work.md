## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero actualizar una tarea asociada a un registro de sesión,
para modificar su información o registrar si fue completada.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir actualizar una Home Work existente respetando el acceso al Record donde se encuentra asociada.

Un usuario con rol `clinic` puede actualizar Home Works asociadas a Records de procesos pertenecientes a su clínica.

Un usuario con rol `therapist` puede actualizar Home Works asociadas a Records de procesos donde sea el terapeuta asignado.

La actualización permite modificar `description` e `is_completed`. El estado `is_completed` es actualizado manualmente por el usuario autorizado para representar si el paciente realizó la tarea.

## Criterios de aceptación

### CA-01 - Actualizar como clinic

Dado que existe una sesión autenticada con rol `clinic`
y la Home Work está asociada a un Record de un proceso de su clínica,
cuando proporciona información válida,
entonces el sistema debe actualizar la Home Work.

### CA-02 - Actualizar como therapist

Dado que existe una sesión autenticada con rol `therapist`
y la Home Work está asociada a un Record de uno de sus procesos,
cuando proporciona información válida,
entonces el sistema debe actualizar la Home Work.

### CA-03 - Impedir actualización por therapist sin acceso

Dado que la Home Work está asociada a un Record de un proceso asignado a otro terapeuta,
cuando un usuario con rol `therapist` intenta actualizarla,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir actualización entre clínicas

Dado que la Home Work está asociada a un Record de un proceso perteneciente a otra clínica,
cuando el usuario intenta actualizarla,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Actualizar descripción

Dado que se proporciona una nueva `description`,
cuando se actualiza la Home Work,
entonces el sistema debe almacenar la nueva descripción.

### CA-06 - Marcar como completada

Dado que el paciente realizó la tarea,
cuando el usuario autorizado establece `is_completed = true`,
entonces el sistema debe registrar la Home Work como completada.

### CA-07 - Marcar como no completada

Dado que corresponde registrar que la tarea no fue completada,
cuando el usuario autorizado establece `is_completed = false`,
entonces el sistema debe registrar la Home Work como no completada.

### CA-08 - Permitir descripciones duplicadas

Dado que la nueva descripción coincide con la descripción de otra Home Work,
cuando se actualiza la tarea,
entonces dicha coincidencia no debe impedir la actualización.

### CA-09 - Home Work inexistente

Dado que la Home Work no existe,
cuando se intenta actualizar,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-10 - Identificador inválido

Dado que el identificador no cumple con el formato esperado,
cuando se intenta actualizar la Home Work,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-11 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta actualizar la Home Work,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* La autorización para actualizar una Home Work se determina mediante el Record donde está asociada.
* `clinic` puede actualizar Home Works asociadas a Records de procesos pertenecientes a su clínica.
* `therapist` puede actualizar Home Works asociadas a Records de procesos donde sea el terapeuta asignado.
* `description` puede ser modificada.
* `is_completed` puede modificarse manualmente para representar el cumplimiento de la tarea.
* Pueden existir diferentes Home Works con la misma descripción.

## Dependencias

* La Home Work debe existir.
* Debe existir una sesión autenticada.
* La autorización depende de la relación de la Home Work con un Record.

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
