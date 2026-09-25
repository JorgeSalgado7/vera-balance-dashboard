## Historia de usuario

Como usuario con rol de clínica,
quiero eliminar un paciente que no tenga historial terapéutico,
para poder retirar registros creados que no deban conservarse.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir eliminar físicamente un paciente únicamente cuando la operación sea realizada por un usuario con rol `clinic`, el paciente pertenezca a su clínica y nunca haya tenido un proceso terapéutico asociado.

Los terapeutas no pueden eliminar pacientes.

Si un paciente tiene o ha tenido al menos un proceso terapéutico, su información debe conservarse para mantener la integridad del historial clínico.

El paciente no posee un estatus propio. Por lo tanto, impedir su eliminación no debe provocar un cambio de estado sobre el paciente.

Cuando sea necesario finalizar, dar de alta o marcar como inactivo un tratamiento, dicho cambio debe realizarse sobre el proceso terapéutico correspondiente.

## Criterios de aceptación

### CA-01 - Eliminar paciente como clínica

Dado que existe una sesión autenticada con rol `clinic`,
el paciente pertenece a la misma clínica
y nunca ha tenido un proceso terapéutico asociado,
cuando se solicita eliminar al paciente,
entonces el sistema debe eliminar físicamente su registro.

### CA-02 - Impedir eliminación por terapeuta

Dado que existe una sesión autenticada con rol `therapist`,
cuando se intenta eliminar un paciente,
entonces el sistema debe rechazar la operación como no permitida.

### CA-03 - Impedir eliminación de paciente de otra clínica

Dado que existe una sesión autenticada con rol `clinic`
y el paciente pertenece a otra clínica,
cuando se intenta eliminar al paciente,
entonces el sistema debe rechazar la operación como no autorizada para ese recurso.

### CA-04 - Impedir eliminación con proceso activo

Dado que el paciente participa en un proceso terapéutico activo,
cuando se intenta eliminar al paciente,
entonces el sistema debe rechazar la operación por conflicto
y conservar la información del paciente.

### CA-05 - Impedir eliminación con proceso inactivo

Dado que el paciente tiene un proceso terapéutico con estatus `inactive`,
cuando se intenta eliminar al paciente,
entonces el sistema debe rechazar la operación por conflicto
y conservar la información del paciente.

### CA-06 - Impedir eliminación de paciente dado de alta

Dado que el paciente tiene un proceso terapéutico con estatus `discharged`,
cuando se intenta eliminar al paciente,
entonces el sistema debe rechazar la operación por conflicto
y conservar la información del paciente.

### CA-07 - Impedir eliminación con proceso no finalizado

Dado que el paciente tiene un proceso terapéutico con estatus `unfinished`,
cuando se intenta eliminar al paciente,
entonces el sistema debe rechazar la operación por conflicto
y conservar la información del paciente.

### CA-08 - Considerar todo el historial de procesos

Dado que un paciente tiene o ha tenido uno o más procesos terapéuticos,
cuando se evalúa si puede eliminarse,
entonces la existencia de cualquier proceso asociado debe impedir su eliminación física independientemente de su estatus.

### CA-09 - No modificar procesos terapéuticos

Dado que la eliminación del paciente es rechazada porque existe historial terapéutico,
cuando se procesa la solicitud,
entonces el sistema no debe modificar el estatus ni la información de ninguno de sus procesos terapéuticos.

### CA-10 - No utilizar estatus de paciente

Dado que el paciente tiene historial terapéutico y no puede eliminarse,
cuando se rechaza la eliminación,
entonces el sistema no debe intentar marcar al paciente como activo o inactivo porque el paciente no posee un estatus propio.

### CA-11 - Paciente inexistente

Dado que no existe un paciente con el identificador proporcionado,
cuando se intenta eliminarlo,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-12 - Identificador inválido

Dado que el identificador proporcionado no cumple con el formato esperado,
cuando se intenta eliminar al paciente,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-13 - Confirmar eliminación sin contenido

Dado que el paciente puede eliminarse,
cuando la eliminación se completa correctamente,
entonces el sistema debe confirmar la operación sin devolver información del paciente eliminado.

### CA-14 - Requerir sesión autenticada

Dado que no existe una sesión autenticada válida,
cuando se intenta eliminar un paciente,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Únicamente un usuario con rol `clinic` puede eliminar pacientes.
* El usuario `clinic` únicamente puede eliminar pacientes pertenecientes a su propia clínica.
* Un usuario con rol `therapist` no puede eliminar pacientes.
* Un paciente únicamente puede eliminarse físicamente cuando nunca ha tenido procesos terapéuticos asociados.
* La existencia de cualquier proceso terapéutico asociado impide la eliminación independientemente de su estatus.
* Los estados `active`, `inactive`, `discharged` y `unfinished` pertenecen al proceso terapéutico y no al paciente.
* El paciente no tiene un estatus propio.
* Una solicitud de eliminación de paciente no debe modificar automáticamente ningún proceso terapéutico.
* No deben eliminarse procesos terapéuticos ni registros clínicos como consecuencia de eliminar un paciente.
* La gestión del estado de un tratamiento debe realizarse mediante el proceso terapéutico correspondiente.

## Dependencias

* Debe poder determinarse si existen procesos terapéuticos asociados al paciente antes de realizar su eliminación.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Antes de eliminar físicamente al paciente debe verificarse la existencia de cualquier proceso terapéutico asociado.
* Si existe al menos un proceso terapéutico asociado, la operación debe rechazarse sin modificar al paciente ni sus procesos.

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
