## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero eliminar un registro de sesión sobre el que tengo permisos,
para retirar un registro cuando sea necesario.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir eliminar físicamente un Record respetando los permisos del usuario autenticado.

Un usuario con rol `clinic` puede eliminar cualquier Record correspondiente a procesos de su clínica.

Un usuario con rol `therapist` puede eliminar únicamente Records correspondientes a procesos donde sea el terapeuta asignado.

Las Home Works relacionadas tienen un ciclo de vida independiente y su existencia no depende de la eliminación del Record.

## Criterios de aceptación

### CA-01 - Eliminar como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el Record pertenece a un proceso de su clínica,
cuando solicita su eliminación,
entonces el sistema debe eliminar el Record.

### CA-02 - Eliminar como therapist

Dado que existe una sesión autenticada con rol `therapist`
y el Record pertenece a uno de sus procesos,
cuando solicita su eliminación,
entonces el sistema debe eliminar el Record.

### CA-03 - Impedir eliminación por therapist no asignado

Dado que el Record pertenece a un proceso asignado a otro terapeuta,
cuando un usuario con rol `therapist` intenta eliminarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir eliminación entre clínicas

Dado que el Record pertenece a un proceso de otra clínica,
cuando el usuario intenta eliminarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Mantener Home Works

Dado que el Record tiene Home Works relacionadas,
cuando el Record es eliminado,
entonces las Home Works no deben eliminarse automáticamente.

### CA-06 - Eliminar físicamente

Dado que la operación fue autorizada,
cuando finaliza correctamente,
entonces el Record debe dejar de existir en la persistencia.

### CA-07 - Record inexistente

Dado que no existe el Record proporcionado,
cuando se intenta eliminar,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-08 - Identificador inválido

Dado que el identificador no cumple con el formato esperado,
cuando se intenta eliminar el Record,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-09 - Responder sin contenido

Dado que el Record fue eliminado correctamente,
cuando finaliza la operación,
entonces el sistema debe responder sin contenido.

### CA-10 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta eliminar el Record,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede eliminar Records de cualquier proceso perteneciente a su clínica.
* `therapist` únicamente puede eliminar Records correspondientes a sus procesos.
* La eliminación del Record es física.
* Las Home Works existen de manera independiente.
* Eliminar un Record no elimina automáticamente las Home Works relacionadas.

## Dependencias

* El Record debe existir.
* El usuario debe tener acceso al proceso terapéutico relacionado.

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
