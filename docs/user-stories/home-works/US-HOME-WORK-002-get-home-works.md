## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar las tareas asociadas a los registros de sesión a los que tengo acceso,
para revisar las actividades asignadas durante los procesos terapéuticos.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar Home Works de acuerdo con el acceso que el usuario autenticado tiene sobre los Records donde se encuentran asociadas.

Las Home Works no almacenan directamente información sobre clínica, terapeuta, paciente o proceso terapéutico. Su contexto y visibilidad se determinan mediante los Records que las referencian a través de `home_work_ids`.

Un usuario con rol `clinic` puede consultar Home Works relacionadas con Records pertenecientes a procesos de su clínica.

Un usuario con rol `therapist` puede consultar Home Works relacionadas con Records pertenecientes a procesos donde sea el terapeuta asignado.

## Criterios de aceptación

### CA-01 - Consultar Home Works como clinic

Dado que existe una sesión autenticada con rol `clinic`,
cuando consulta las Home Works,
entonces el sistema debe devolver las tareas asociadas a Records de procesos pertenecientes a su clínica.

### CA-02 - Consultar Home Works de diferentes terapeutas como clinic

Dado que existen Records de diferentes terapeutas pertenecientes a la misma clínica,
cuando un usuario con rol `clinic` consulta las Home Works,
entonces debe poder obtener las tareas asociadas a dichos Records.

### CA-03 - Consultar Home Works como therapist

Dado que existe una sesión autenticada con rol `therapist`,
cuando consulta las Home Works,
entonces el sistema debe devolver únicamente las tareas asociadas a Records de procesos donde sea el terapeuta asignado.

### CA-04 - No mostrar Home Works de otros terapeutas

Dado que existen Home Works asociadas a Records de procesos asignados a otros terapeutas,
cuando un usuario con rol `therapist` realiza la consulta,
entonces dichas tareas no deben incluirse.

### CA-05 - No mostrar Home Works de otras clínicas

Dado que existen Home Works asociadas a Records de procesos pertenecientes a otras clínicas,
cuando el usuario realiza la consulta,
entonces dichas tareas no deben incluirse.

### CA-06 - Determinar visibilidad mediante Records

Dado que una Home Work no almacena directamente información de clínica o terapeuta,
cuando se determina si el usuario puede consultarla,
entonces el acceso debe resolverse mediante los Records donde se encuentra asociada.

### CA-07 - Devolver colección vacía

Dado que no existen Home Works accesibles para el usuario,
cuando realiza la consulta,
entonces el sistema debe devolver una colección vacía.

### CA-08 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intentan consultar las Home Works,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Las Home Works se consultan en el contexto de los Records donde se encuentran asociadas.
* La visibilidad de una Home Work se determina mediante los Records que la referencian.
* `clinic` puede consultar Home Works asociadas a Records de procesos pertenecientes a su clínica.
* `therapist` puede consultar Home Works asociadas a Records de procesos donde sea el terapeuta asignado.
* No deben exponerse Home Works asociadas exclusivamente a Records a los que el usuario no tenga acceso.
* Si no existen Home Works accesibles, se devuelve una colección vacía.

## Dependencias

* Debe existir una sesión autenticada.
* La determinación de acceso depende de las relaciones existentes entre Home Works y Records.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La autorización debe resolverse mediante los Records que contienen el identificador de la Home Work en `home_work_ids`.

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
