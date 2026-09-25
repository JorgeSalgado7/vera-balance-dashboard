## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero eliminar una tarea asociada a un registro de sesión sobre el que tengo permisos,
para retirar una actividad que ya no debe permanecer registrada.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir eliminar físicamente una Home Work respetando los permisos existentes sobre el Record donde se encuentra asociada.

Un usuario con rol `clinic` puede eliminar Home Works asociadas a Records de procesos pertenecientes a su clínica.

Un usuario con rol `therapist` puede eliminar Home Works asociadas a Records de procesos donde sea el terapeuta asignado.

Cuando una Home Work es eliminada, también debe eliminarse su referencia de `home_work_ids` del Record correspondiente. La eliminación de la Home Work no debe eliminar el Record ni afectar sus demás tareas.

## Criterios de aceptación

### CA-01 - Eliminar como clinic

Dado que existe una sesión autenticada con rol `clinic`
y la Home Work está asociada a un Record de un proceso de su clínica,
cuando solicita su eliminación,
entonces el sistema debe permitir eliminar la Home Work.

### CA-02 - Eliminar como therapist

Dado que existe una sesión autenticada con rol `therapist`
y la Home Work está asociada a un Record de uno de sus procesos,
cuando solicita su eliminación,
entonces el sistema debe permitir eliminar la Home Work.

### CA-03 - Impedir eliminación por therapist sin acceso

Dado que la Home Work está asociada a un Record de un proceso asignado a otro terapeuta,
cuando un usuario con rol `therapist` intenta eliminarla,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir eliminación entre clínicas

Dado que la Home Work está asociada a un Record de un proceso perteneciente a otra clínica,
cuando el usuario intenta eliminarla,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Eliminar Home Work asociada

Dado que la Home Work está asociada a un Record,
cuando un usuario autorizado solicita su eliminación,
entonces el sistema debe permitir eliminarla.

### CA-06 - Eliminar asociación del Record

Dado que la Home Work está referenciada en `home_work_ids`,
cuando se elimina la tarea,
entonces su identificador debe eliminarse del Record correspondiente.

### CA-07 - Mantener el Record

Dado que una Home Work es eliminada,
cuando finaliza la operación,
entonces el Record al que pertenecía debe permanecer existente.

### CA-08 - Mantener las demás Home Works

Dado que el Record tiene otras Home Works asociadas,
cuando se elimina una de ellas,
entonces las demás asociaciones deben permanecer sin cambios.

### CA-09 - Eliminar físicamente

Dado que la eliminación fue autorizada,
cuando finaliza correctamente,
entonces la Home Work debe dejar de existir en la persistencia.

### CA-10 - Home Work inexistente

Dado que no existe una Home Work con el identificador proporcionado,
cuando se intenta eliminar,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-11 - Identificador inválido

Dado que el identificador no cumple con el formato esperado,
cuando se intenta eliminar la Home Work,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-12 - Responder sin contenido

Dado que la Home Work fue eliminada correctamente,
cuando finaliza la operación,
entonces el sistema debe responder sin contenido.

### CA-13 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta eliminar la Home Work,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* La autorización para eliminar una Home Work se determina mediante el Record donde está asociada.
* `clinic` puede eliminar Home Works asociadas a Records de procesos pertenecientes a su clínica.
* `therapist` puede eliminar Home Works asociadas a Records de procesos donde sea el terapeuta asignado.
* La eliminación de la Home Work es física.
* Al eliminar una Home Work debe eliminarse también su referencia desde `home_work_ids`.
* La eliminación de una Home Work no elimina el Record.
* La eliminación de una Home Work no afecta las demás tareas asociadas al Record.

## Dependencias

* La Home Work debe existir.
* Debe existir una sesión autenticada.
* Debe identificarse el Record que contiene la referencia a la Home Work.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La eliminación debe mantener consistente la colección `home_work_ids` del Record relacionado.

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
