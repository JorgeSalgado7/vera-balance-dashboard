## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar un proceso terapéutico específico,
para conocer su información cuando tenga autorización para acceder a él.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar un proceso terapéutico mediante su identificador respetando las reglas de acceso correspondientes al usuario autenticado.

Un usuario con rol `clinic` puede consultar cualquier proceso perteneciente a su clínica.

Un usuario con rol `therapist` únicamente puede consultar el proceso cuando se encuentra asignado como terapeuta responsable.

## Criterios de aceptación

### CA-01 - Consultar proceso como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el proceso pertenece a su clínica,
cuando se consulta mediante su identificador,
entonces el sistema debe devolver su información.

### CA-02 - Consultar proceso como therapist asignado

Dado que existe una sesión autenticada con rol `therapist`
y el usuario es el terapeuta asignado al proceso,
cuando se consulta mediante su identificador,
entonces el sistema debe devolver su información.

### CA-03 - Impedir acceso a therapist no asignado

Dado que existe una sesión autenticada con rol `therapist`
y otro terapeuta se encuentra asignado al proceso,
cuando se intenta consultar,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir acceso entre clínicas

Dado que el proceso pertenece a otra clínica,
cuando un usuario intenta consultarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Consultar independientemente del status

Dado que el usuario tiene acceso al proceso,
cuando lo consulta,
entonces el estado actual del proceso no debe impedir su consulta.

### CA-06 - Proceso inexistente

Dado que no existe un proceso con el identificador proporcionado,
cuando se intenta consultarlo,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-07 - Identificador inválido

Dado que el identificador proporcionado no cumple con el formato esperado,
cuando se intenta consultar el proceso,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-08 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta consultar el proceso,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede consultar cualquier proceso perteneciente a su clínica.
* `therapist` únicamente puede consultar procesos donde sea el terapeuta asignado.
* Un terapeuta no puede consultar procesos de otro terapeuta únicamente por pertenecer a la misma clínica.
* No pueden consultarse procesos pertenecientes a otra clínica.
* El estado del proceso no elimina el acceso cuando el usuario mantiene permisos sobre el mismo.

## Dependencias

* Debe existir una sesión autenticada.
* El proceso debe existir para poder ser recuperado.

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
