## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar los registros de un proceso terapéutico específico,
para revisar el historial de sesiones correspondiente a dicho proceso.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar los Records asociados a un proceso terapéutico específico.

Un usuario con rol `clinic` puede consultar los Records de cualquier proceso perteneciente a su clínica.

Un usuario con rol `therapist` únicamente puede consultar los Records cuando sea el terapeuta asignado al proceso.

La consulta debe permitir recuperar el historial existente aunque el proceso ya no se encuentre `active`.

## Criterios de aceptación

### CA-01 - Consultar Records del proceso como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el proceso pertenece a su clínica,
cuando consulta sus Records,
entonces el sistema debe devolver los registros asociados al proceso.

### CA-02 - Consultar Records del proceso como therapist

Dado que existe una sesión autenticada con rol `therapist`
y el usuario es el terapeuta asignado al proceso,
cuando consulta sus Records,
entonces el sistema debe devolver los registros asociados.

### CA-03 - Impedir consulta por therapist no asignado

Dado que el proceso está asignado a otro terapeuta,
cuando un usuario con rol `therapist` intenta consultar sus Records,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir consulta entre clínicas

Dado que el proceso pertenece a otra clínica,
cuando el usuario intenta consultar sus Records,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Consultar historial de proceso no activo

Dado que el proceso tiene un `status` diferente de `active`,
cuando un usuario autorizado consulta sus Records,
entonces el sistema debe devolver el historial existente.

### CA-06 - Proceso sin Records

Dado que el proceso existe pero todavía no tiene Records,
cuando un usuario autorizado realiza la consulta,
entonces el sistema debe devolver una colección vacía.

### CA-07 - Proceso inexistente

Dado que no existe el proceso terapéutico proporcionado,
cuando se consultan sus Records,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-08 - Identificador inválido

Dado que el identificador del proceso no cumple con el formato esperado,
cuando se realiza la consulta,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-09 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intentan consultar los Records,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede consultar los Records de cualquier proceso perteneciente a su clínica.
* `therapist` únicamente puede consultar los Records de procesos donde sea el terapeuta asignado.
* Los Records existentes pueden consultarse aunque el proceso ya no tenga estado `active`.
* Un proceso terapéutico puede contener múltiples Records correspondientes a diferentes fechas.
* Si el proceso existe pero no contiene Records, se devuelve una colección vacía.

## Dependencias

* El proceso terapéutico debe existir.
* Debe existir una sesión autenticada.
* El usuario debe tener acceso al proceso terapéutico.

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
