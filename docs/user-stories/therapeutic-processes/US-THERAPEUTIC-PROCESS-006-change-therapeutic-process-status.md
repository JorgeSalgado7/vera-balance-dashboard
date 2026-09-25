## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero cambiar el estado de un proceso terapéutico,
para representar correctamente la situación actual del proceso sin eliminar su historial.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir modificar específicamente el `status` de un proceso terapéutico mediante la operación destinada al cambio de estado.

Esta operación permite administrar el ciclo de vida del proceso sin realizar una eliminación física.

Los estados contemplados son `active`, `inactive`, `discharged` y `unfinished`.

El hecho de contar con una operación específica para cambiar el estado no impide que `status` también pueda modificarse mediante la actualización general del proceso.

## Criterios de aceptación

### CA-01 - Cambiar status como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el proceso pertenece a su clínica,
cuando solicita un cambio a un estado válido,
entonces el sistema debe actualizar el `status`.

### CA-02 - Cambiar status como therapist asignado

Dado que existe una sesión autenticada con rol `therapist`
y el usuario es el terapeuta asignado,
cuando solicita un cambio a un estado válido,
entonces el sistema debe actualizar el `status`.

### CA-03 - Impedir cambio por therapist no asignado

Dado que existe una sesión autenticada con rol `therapist`
y el usuario no es el terapeuta asignado,
cuando intenta modificar el estado,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir cambio entre clínicas

Dado que el proceso pertenece a otra clínica,
cuando el usuario intenta modificar su estado,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Cambiar a active

Dado que el proceso es accesible para el usuario,
cuando se solicita `active`,
entonces el proceso debe quedar con estado `active`.

### CA-06 - Cambiar a inactive

Dado que el proceso es accesible para el usuario,
cuando se solicita `inactive`,
entonces el proceso debe quedar con estado `inactive`.

### CA-07 - Cambiar a discharged

Dado que el proceso es accesible para el usuario,
cuando se solicita `discharged`,
entonces el proceso debe quedar con estado `discharged`.

### CA-08 - Cambiar a unfinished

Dado que el proceso es accesible para el usuario,
cuando se solicita `unfinished`,
entonces el proceso debe quedar con estado `unfinished`.

### CA-09 - Rechazar status inválido

Dado que se proporciona un valor diferente de los estados permitidos,
cuando se intenta realizar el cambio,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-10 - Modificar únicamente status

Dado que se utiliza la operación específica de cambio de estado,
cuando la solicitud es válida,
entonces debe modificarse el `status`
sin alterar los demás datos del proceso.

### CA-11 - Proceso inexistente

Dado que el proceso no existe,
cuando se intenta cambiar su estado,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-12 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta cambiar el estado,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Los estados disponibles son `active`, `inactive`, `discharged` y `unfinished`.
* `clinic` puede cambiar el estado de procesos pertenecientes a su clínica.
* `therapist` puede cambiar el estado únicamente de procesos donde sea el terapeuta asignado.
* El cambio de estado no elimina el proceso terapéutico.
* El `PATCH` modifica específicamente el estado.
* El `status` también puede modificarse mediante el `PUT` general del proceso.
* El manejo mediante estados constituye el mecanismo habitual para administrar el ciclo de vida de un proceso.

## Dependencias

* El proceso debe existir.
* El usuario debe tener acceso al proceso.

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
