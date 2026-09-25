## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar los procesos terapéuticos a los que tengo acceso,
para conocer y administrar la atención terapéutica correspondiente a mis permisos.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar los procesos terapéuticos respetando el rol y la clínica del usuario autenticado.

Un usuario con rol `clinic` puede consultar todos los procesos pertenecientes a su clínica.

Un usuario con rol `therapist` únicamente puede consultar los procesos en los que se encuentra asignado como terapeuta responsable.

La consulta debe considerar los procesos independientemente de su estado.

## Criterios de aceptación

### CA-01 - Consultar procesos como clinic

Dado que existe una sesión autenticada con rol `clinic`,
cuando se consultan los procesos terapéuticos,
entonces el sistema debe devolver los procesos pertenecientes a su clínica.

### CA-02 - Consultar procesos de otros terapeutas como clinic

Dado que existe una sesión autenticada con rol `clinic`,
cuando existen procesos asignados a otros terapeutas de su clínica,
entonces dichos procesos deben incluirse en la respuesta.

### CA-03 - Consultar procesos como therapist

Dado que existe una sesión autenticada con rol `therapist`,
cuando se consultan los procesos terapéuticos,
entonces únicamente deben devolverse los procesos donde el usuario autenticado sea el terapeuta asignado.

### CA-04 - No mostrar procesos de otros terapeutas

Dado que existe una sesión autenticada con rol `therapist`,
cuando existen procesos asignados a otros terapeutas,
entonces dichos procesos no deben incluirse en la respuesta.

### CA-05 - No mostrar procesos de otra clínica

Dado que existen procesos pertenecientes a otras clínicas,
cuando el usuario realiza la consulta,
entonces dichos procesos no deben incluirse.

### CA-06 - Consultar procesos independientemente del status

Dado que el usuario tiene acceso a procesos con diferentes estados,
cuando realiza la consulta,
entonces los procesos accesibles deben poder ser recuperados independientemente de su `status`.

### CA-07 - Devolver colección vacía

Dado que no existen procesos accesibles para el usuario,
cuando realiza la consulta,
entonces el sistema debe devolver una colección vacía.

### CA-08 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intentan consultar los procesos,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede consultar todos los procesos pertenecientes a su clínica.
* `therapist` únicamente puede consultar procesos donde sea el terapeuta asignado.
* Un terapeuta no obtiene acceso a procesos de otros terapeutas por pertenecer a la misma clínica.
* No deben exponerse procesos pertenecientes a otras clínicas.
* La visibilidad de un proceso no depende exclusivamente de que su estado sea `active`.

## Dependencias

* Debe existir una sesión autenticada que permita identificar al usuario, su rol y su clínica.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* El alcance de la consulta debe determinarse mediante la sesión autenticada.

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
