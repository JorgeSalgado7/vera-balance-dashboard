## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar los pacientes a los que tengo acceso,
para poder conocer y administrar la información de los pacientes correspondiente a mi rol.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar pacientes respetando la clínica y los permisos del usuario autenticado.

Un usuario con rol `clinic` puede consultar los pacientes pertenecientes a su clínica.

Un usuario con rol `therapist` únicamente puede consultar pacientes relacionados con sus propios procesos terapéuticos.

La pertenencia de un paciente a una clínica y su relación con un terapeuta representan conceptos diferentes. La clínica se encuentra asociada directamente al paciente, mientras que el acceso del terapeuta se determina mediante los procesos terapéuticos en los que participa.

La consulta nunca debe exponer pacientes de otra clínica ni pacientes a los que el usuario autenticado no tenga acceso.

## Criterios de aceptación

### CA-01 - Consultar pacientes como clínica

Dado que existe una sesión autenticada con rol `clinic`,
cuando se consultan los pacientes,
entonces el sistema debe devolver los pacientes pertenecientes a la misma clínica del usuario autenticado.

### CA-02 - Incluir pacientes de los terapeutas de la clínica

Dado que existe una sesión autenticada con rol `clinic`,
cuando se consultan los pacientes,
entonces la respuesta puede incluir pacientes atendidos por los terapeutas pertenecientes a la misma clínica.

### CA-03 - Consultar pacientes como terapeuta

Dado que existe una sesión autenticada con rol `therapist`,
cuando se consultan los pacientes,
entonces el sistema debe devolver únicamente los pacientes relacionados con procesos terapéuticos del terapeuta autenticado.

### CA-04 - No mostrar pacientes sin relación con el terapeuta

Dado que un paciente pertenece a la misma clínica que un terapeuta pero no participa en ninguno de sus procesos terapéuticos,
cuando el terapeuta consulta sus pacientes,
entonces dicho paciente no debe incluirse en la respuesta.

### CA-05 - No exponer pacientes de otra clínica

Dado que existen pacientes pertenecientes a otras clínicas,
cuando un usuario consulta pacientes,
entonces dichos pacientes no deben incluirse en la respuesta.

### CA-06 - Evitar pacientes duplicados en la respuesta

Dado que un paciente participa en más de un proceso terapéutico del mismo terapeuta,
cuando el terapeuta consulta sus pacientes,
entonces el paciente debe aparecer una sola vez en la respuesta.

### CA-07 - Devolver colección vacía

Dado que el usuario autenticado no tiene pacientes disponibles de acuerdo con sus permisos,
cuando consulta los pacientes,
entonces el sistema debe devolver una colección vacía.

### CA-08 - Requerir sesión autenticada

Dado que no existe una sesión autenticada válida,
cuando se intenta consultar los pacientes,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Los roles `clinic` y `therapist` pueden consultar pacientes.
* Un usuario `clinic` puede consultar los pacientes pertenecientes a su clínica.
* Un usuario `therapist` únicamente puede consultar pacientes relacionados con sus propios procesos terapéuticos.
* La pertenencia a la misma clínica no otorga por sí sola a un terapeuta acceso a todos los pacientes de esa clínica.
* La relación entre terapeuta y paciente se determina mediante los procesos terapéuticos.
* Un paciente puede participar en diferentes procesos terapéuticos.
* Un paciente debe aparecer una sola vez en la colección aunque tenga múltiples procesos con el mismo terapeuta.
* No deben exponerse pacientes pertenecientes a otras clínicas.
* Si no existen pacientes accesibles, se devuelve una colección vacía.

## Dependencias

* Para determinar los pacientes accesibles por un terapeuta deben poder consultarse sus procesos terapéuticos.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La clínica y el usuario autenticado deben obtenerse de la sesión.
* La visibilidad de pacientes para un terapeuta debe determinarse mediante la relación definida en los procesos terapéuticos.

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
