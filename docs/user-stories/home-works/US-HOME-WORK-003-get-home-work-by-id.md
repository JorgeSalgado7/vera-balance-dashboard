## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar una tarea específica asociada a un registro de sesión,
para revisar su descripción y estado de cumplimiento cuando tenga acceso a ella.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar una Home Work mediante su identificador.

La Home Work no almacena directamente información de clínica, terapeuta, paciente o proceso terapéutico. El acceso se determina mediante el Record donde se encuentra asociada.

Un usuario con rol `clinic` puede consultar una Home Work asociada a un Record perteneciente a un proceso de su clínica.

Un usuario con rol `therapist` puede consultar una Home Work asociada a un Record perteneciente a un proceso donde sea el terapeuta asignado.

## Criterios de aceptación

### CA-01 - Consultar Home Work como clinic

Dado que existe una sesión autenticada con rol `clinic`
y la Home Work se encuentra asociada a un Record de un proceso de su clínica,
cuando se consulta mediante su identificador,
entonces el sistema debe devolver su información.

### CA-02 - Consultar Home Work como therapist

Dado que existe una sesión autenticada con rol `therapist`
y la Home Work está asociada a un Record de un proceso donde el usuario es el terapeuta asignado,
cuando se consulta mediante su identificador,
entonces el sistema debe devolver su información.

### CA-03 - Impedir acceso a therapist sin relación

Dado que la Home Work está asociada a un Record de un proceso asignado a otro terapeuta,
cuando un usuario con rol `therapist` intenta consultarla,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Impedir acceso entre clínicas

Dado que la Home Work está asociada a un Record de un proceso perteneciente a otra clínica,
cuando el usuario intenta consultarla,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-05 - Determinar acceso mediante Record

Dado que la Home Work no contiene información directa de propiedad,
cuando se evalúa la autorización,
entonces el sistema debe determinar el acceso mediante el Record donde se encuentra asociada.

### CA-06 - Home Work inexistente

Dado que no existe una Home Work con el identificador proporcionado,
cuando se intenta consultarla,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-07 - Identificador inválido

Dado que el identificador proporcionado no cumple con el formato esperado,
cuando se intenta consultar la Home Work,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-08 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta consultar la Home Work,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Una Home Work se consulta dentro del contexto del Record donde está asociada.
* El acceso a una Home Work se determina mediante dicho Record.
* `clinic` puede consultar Home Works asociadas a Records de procesos pertenecientes a su clínica.
* `therapist` puede consultar Home Works asociadas a Records de procesos donde sea el terapeuta asignado.
* No deben exponerse Home Works cuando el usuario no tenga acceso al Record correspondiente.

## Dependencias

* La Home Work debe existir.
* Debe existir una sesión autenticada.
* La autorización depende de la relación de la Home Work con un Record.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La relación con el Record se determina mediante `home_work_ids`.

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
