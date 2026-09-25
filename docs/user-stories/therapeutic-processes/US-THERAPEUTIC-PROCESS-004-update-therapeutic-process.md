## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero actualizar la información de un proceso terapéutico,
para mantener vigente la información relacionada con la atención del paciente.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir actualizar un proceso terapéutico existente.

Los roles `clinic` y `therapist` pueden actualizar procesos sobre los que tengan acceso.

Un usuario `therapist` únicamente puede actualizar procesos donde sea el terapeuta asignado y no puede reasignar el proceso a otro terapeuta.

Un usuario `clinic` puede actualizar cualquier proceso perteneciente a su clínica y puede cambiar el terapeuta responsable.

El `PUT` también puede modificar el `status` del proceso.

## Criterios de aceptación

### CA-01 - Actualizar como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el proceso pertenece a su clínica,
cuando envía información válida,
entonces el sistema debe actualizar el proceso.

### CA-02 - Actualizar como therapist

Dado que existe una sesión autenticada con rol `therapist`
y el usuario es el terapeuta asignado,
cuando envía información válida,
entonces el sistema debe actualizar el proceso.

### CA-03 - Impedir actualización por therapist no asignado

Dado que el usuario tiene rol `therapist`
y no es el terapeuta asignado,
cuando intenta actualizar el proceso,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir actualización entre clínicas

Dado que el proceso pertenece a otra clínica,
cuando el usuario intenta actualizarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Reasignar terapeuta como clinic

Dado que el usuario tiene rol `clinic`,
cuando actualiza el terapeuta responsable del proceso,
entonces el sistema debe permitir la reasignación cuando el nuevo terapeuta sea válido para la clínica.

### CA-06 - Impedir reasignación como therapist

Dado que el usuario tiene rol `therapist`,
cuando intenta modificar el terapeuta responsable,
entonces el sistema debe rechazar la reasignación.

### CA-07 - Validar pacientes actualizados

Dado que se modifica la lista de pacientes,
cuando se actualiza el proceso,
entonces todos los pacientes deben existir
y pertenecer a la clínica correspondiente al proceso.

### CA-08 - Mantener al menos un paciente

Dado que se modifica la lista de pacientes,
cuando la actualización dejaría el proceso sin pacientes,
entonces el sistema debe rechazar la solicitud.

### CA-09 - Validar terapia de pareja

Dado que el proceso corresponde a terapia de pareja,
cuando se modifica su información,
entonces el proceso debe mantener exactamente dos pacientes.

### CA-10 - Validar terapia familiar

Dado que el proceso corresponde a terapia familiar,
cuando se modifica su información,
entonces debe mantener al menos un paciente
y puede contener múltiples pacientes sin un límite máximo definido.

### CA-11 - Validar therapy_type

Dado que se modifica `therapy_type`,
cuando se actualiza el proceso,
entonces el nuevo tipo debe existir entre los `therapy_types` configurados para la clínica.

### CA-12 - Modificar status

Dado que se proporciona un `status` válido en la actualización,
cuando se procesa el `PUT`,
entonces el sistema debe actualizar el estado del proceso.

### CA-13 - Validar status

Dado que se intenta establecer un estado no permitido,
cuando se actualiza el proceso,
entonces el sistema debe rechazar la solicitud.

### CA-14 - Proceso inexistente

Dado que el proceso no existe,
cuando se intenta actualizar,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-15 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta actualizar el proceso,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede actualizar cualquier proceso perteneciente a su clínica.
* `therapist` únicamente puede actualizar procesos donde sea el terapeuta asignado.
* Solo `clinic` puede cambiar el terapeuta responsable.
* Los pacientes del proceso deben pertenecer a la misma clínica.
* Todo proceso debe mantener al menos un paciente.
* Terapia de pareja requiere exactamente dos pacientes.
* Terapia familiar permite múltiples pacientes sin límite máximo definido.
* `therapy_type` debe estar configurado en la clínica.
* El `PUT` puede modificar el `status`.
* Los estados permitidos son `active`, `inactive`, `discharged` y `unfinished`.

## Dependencias

* El proceso debe existir.
* Los pacientes proporcionados deben existir.
* El tipo de terapia debe estar configurado para la clínica.
* Cuando exista una reasignación, el terapeuta proporcionado debe ser válido para la clínica.

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
