## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar la información de un paciente específico,
para poder conocer sus datos cuando tenga autorización para acceder a ellos.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir obtener un paciente específico mediante su identificador respetando las reglas de acceso del usuario autenticado.

Un usuario con rol `clinic` puede consultar un paciente cuando este pertenece a su clínica.

Un usuario con rol `therapist` únicamente puede consultar un paciente cuando existe una relación con él mediante alguno de sus procesos terapéuticos.

La existencia del paciente no debe permitir omitir las restricciones de acceso definidas por clínica y terapeuta.

## Criterios de aceptación

### CA-01 - Consultar paciente como clínica

Dado que existe una sesión autenticada con rol `clinic`
y el paciente pertenece a la misma clínica,
cuando se consulta el paciente por su identificador,
entonces el sistema debe devolver su información.

### CA-02 - Consultar paciente como terapeuta

Dado que existe una sesión autenticada con rol `therapist`
y el paciente participa en al menos uno de sus procesos terapéuticos,
cuando se consulta el paciente por su identificador,
entonces el sistema debe devolver su información.

### CA-03 - Impedir acceso de terapeuta sin relación

Dado que existe una sesión autenticada con rol `therapist`
y el paciente no participa en ninguno de sus procesos terapéuticos,
cuando se intenta consultar el paciente,
entonces el sistema debe rechazar la operación como no autorizada para ese recurso.

### CA-04 - Impedir acceso a paciente de otra clínica

Dado que el paciente pertenece a una clínica diferente de la del usuario autenticado,
cuando se intenta consultar el paciente,
entonces el sistema debe rechazar la operación como no autorizada para ese recurso.

### CA-05 - Paciente inexistente

Dado que no existe un paciente con el identificador proporcionado,
cuando se intenta consultarlo,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-06 - Identificador inválido

Dado que el identificador proporcionado no cumple con el formato esperado,
cuando se intenta consultar el paciente,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-07 - Devolver información del paciente

Dado que el paciente existe
y el usuario autenticado tiene acceso a él,
cuando se consulta el paciente,
entonces el sistema debe devolver la información definida para el paciente en el contrato del API.

### CA-08 - Requerir sesión autenticada

Dado que no existe una sesión autenticada válida,
cuando se intenta consultar un paciente,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Los roles `clinic` y `therapist` pueden consultar pacientes de acuerdo con sus permisos.
* Un usuario `clinic` puede consultar pacientes pertenecientes a su clínica.
* Un usuario `therapist` únicamente puede consultar pacientes relacionados con sus propios procesos terapéuticos.
* La pertenencia del paciente a la misma clínica no otorga automáticamente acceso al terapeuta.
* La relación entre paciente y terapeuta se determina mediante los procesos terapéuticos.
* No puede consultarse información de pacientes pertenecientes a otra clínica.
* La existencia de un paciente no elimina las reglas de autorización sobre el recurso.

## Dependencias

* Para validar el acceso de un terapeuta deben poder consultarse sus procesos terapéuticos.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* El identificador del paciente debe validarse de acuerdo con el formato definido por el contrato.
* La autorización debe evaluarse utilizando la sesión autenticada, la clínica del paciente y, cuando corresponda, su relación mediante procesos terapéuticos.

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
