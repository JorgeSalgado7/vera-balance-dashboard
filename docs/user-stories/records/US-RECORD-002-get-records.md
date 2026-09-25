## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar los registros de sesiones a los que tengo acceso,
para revisar el seguimiento de los procesos terapéuticos correspondientes.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar los Records respetando el rol, la clínica y los procesos terapéuticos accesibles para el usuario autenticado.

Un usuario con rol `clinic` puede consultar todos los Records correspondientes a procesos terapéuticos de su clínica.

Un usuario con rol `therapist` únicamente puede consultar Records correspondientes a procesos donde sea el terapeuta asignado.

## Criterios de aceptación

### CA-01 - Consultar Records como clinic

Dado que existe una sesión autenticada con rol `clinic`,
cuando se consultan los Records,
entonces el sistema debe devolver los registros correspondientes a procesos de su clínica.

### CA-02 - Consultar Records de otros terapeutas como clinic

Dado que existen Records de procesos asignados a diferentes terapeutas de la clínica,
cuando un usuario con rol `clinic` realiza la consulta,
entonces dichos Records deben incluirse en la respuesta.

### CA-03 - Consultar Records como therapist

Dado que existe una sesión autenticada con rol `therapist`,
cuando consulta los Records,
entonces únicamente deben devolverse aquellos correspondientes a procesos donde sea el terapeuta asignado.

### CA-04 - No mostrar Records de otros terapeutas

Dado que existen Records correspondientes a procesos asignados a otros terapeutas,
cuando un usuario con rol `therapist` realiza la consulta,
entonces dichos Records no deben incluirse.

### CA-05 - No mostrar Records de otras clínicas

Dado que existen Records correspondientes a procesos de otras clínicas,
cuando el usuario realiza la consulta,
entonces dichos Records no deben incluirse.

### CA-06 - Consultar Records históricos

Dado que existen Records correspondientes a procesos cuyo estado posteriormente cambió,
cuando un usuario autorizado realiza la consulta,
entonces dichos Records deben continuar disponibles conforme a sus permisos.

### CA-07 - Devolver colección vacía

Dado que no existen Records accesibles para el usuario,
cuando realiza la consulta,
entonces el sistema debe devolver una colección vacía.

### CA-08 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intentan consultar los Records,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* `clinic` puede consultar todos los Records de procesos pertenecientes a su clínica.
* `therapist` únicamente puede consultar Records de procesos donde sea el terapeuta asignado.
* No deben exponerse Records correspondientes a otras clínicas.
* El cambio posterior de `status` del proceso no elimina sus Records existentes.

## Dependencias

* Debe existir una sesión autenticada que permita determinar el usuario, rol y clínica.

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
