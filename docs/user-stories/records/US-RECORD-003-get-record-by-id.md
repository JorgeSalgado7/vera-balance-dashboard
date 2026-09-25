## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar un registro de sesión específico,
para revisar la información documentada durante una sesión terapéutica.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar un Record mediante su identificador respetando los permisos del usuario autenticado.

Un usuario con rol `clinic` puede consultar Records pertenecientes a cualquier proceso de su clínica.

Un usuario con rol `therapist` únicamente puede consultar Records pertenecientes a procesos donde sea el terapeuta asignado.

## Criterios de aceptación

### CA-01 - Consultar Record como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el Record pertenece a un proceso de su clínica,
cuando se consulta mediante su identificador,
entonces el sistema debe devolver su información.

### CA-02 - Consultar Record como therapist

Dado que existe una sesión autenticada con rol `therapist`
y el Record pertenece a un proceso donde el usuario es el terapeuta asignado,
cuando se consulta mediante su identificador,
entonces el sistema debe devolver su información.

### CA-03 - Impedir acceso a therapist no asignado

Dado que el Record pertenece a un proceso asignado a otro terapeuta,
cuando un usuario con rol `therapist` intenta consultarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir acceso entre clínicas

Dado que el Record pertenece a un proceso de otra clínica,
cuando el usuario intenta consultarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Consultar Record histórico

Dado que el proceso relacionado ya no tiene estado `active`,
cuando un usuario con permisos consulta un Record existente,
entonces el sistema debe permitir su consulta.

### CA-06 - Record inexistente

Dado que no existe un Record con el identificador proporcionado,
cuando se intenta consultarlo,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-07 - Identificador inválido

Dado que el identificador no cumple con el formato esperado,
cuando se intenta consultar el Record,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-08 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta consultar el Record,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede consultar Records de cualquier proceso de su clínica.
* `therapist` únicamente puede consultar Records correspondientes a sus procesos.
* Los Records históricos continúan disponibles aunque cambie el estado del proceso.
* No deben exponerse Records pertenecientes a otra clínica.

## Dependencias

* El Record debe existir.
* Debe existir una sesión autenticada.

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
