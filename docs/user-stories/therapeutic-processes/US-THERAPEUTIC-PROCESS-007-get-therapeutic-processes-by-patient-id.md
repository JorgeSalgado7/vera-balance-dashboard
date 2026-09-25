## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar los procesos terapéuticos asociados a un paciente,
para conocer su historial de procesos cuando tenga autorización para acceder a dicha información.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar los procesos terapéuticos relacionados con un paciente específico.

El acceso debe respetar tanto la clínica a la que pertenece el paciente como los permisos del usuario autenticado.

Un usuario con rol `clinic` puede consultar los procesos del paciente cuando este pertenece a su clínica.

Un usuario con rol `therapist` únicamente puede obtener, dentro de los procesos asociados al paciente, aquellos donde se encuentre asignado como terapeuta responsable.

## Criterios de aceptación

### CA-01 - Consultar por paciente como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el paciente pertenece a su clínica,
cuando se consultan sus procesos terapéuticos,
entonces el sistema debe devolver los procesos asociados al paciente dentro de dicha clínica.

### CA-02 - Consultar por paciente como therapist

Dado que existe una sesión autenticada con rol `therapist`
y el paciente pertenece a su clínica,
cuando se consultan sus procesos terapéuticos,
entonces el sistema debe devolver únicamente los procesos del paciente donde el usuario autenticado sea el terapeuta asignado.

### CA-03 - No exponer procesos de otros terapeutas

Dado que el paciente tiene procesos con diferentes terapeutas,
cuando un usuario con rol `therapist` consulta sus procesos,
entonces no deben incluirse aquellos donde otro terapeuta sea el responsable.

### CA-04 - Consultar todos los procesos como clinic

Dado que el paciente tiene procesos con diferentes terapeutas de la clínica,
cuando un usuario con rol `clinic` consulta sus procesos,
entonces deben incluirse los procesos accesibles de ese paciente independientemente del terapeuta asignado.

### CA-05 - Impedir acceso a paciente de otra clínica

Dado que el paciente pertenece a otra clínica,
cuando el usuario intenta consultar sus procesos,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-06 - Incluir diferentes estados

Dado que el paciente tiene procesos con diferentes estados,
cuando se realiza la consulta,
entonces deben poder recuperarse los procesos accesibles independientemente de su `status`.

### CA-07 - Paciente sin procesos accesibles

Dado que el paciente existe pero no tiene procesos terapéuticos accesibles para el usuario,
cuando se realiza la consulta,
entonces el sistema debe devolver una colección vacía.

### CA-08 - Paciente inexistente

Dado que no existe un paciente con el identificador proporcionado,
cuando se consultan sus procesos,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-09 - Identificador inválido

Dado que el identificador del paciente no cumple con el formato esperado,
cuando se realiza la consulta,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-10 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intentan consultar los procesos del paciente,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Un paciente puede estar relacionado con múltiples procesos terapéuticos.
* `clinic` puede consultar los procesos de pacientes pertenecientes a su clínica.
* `therapist` únicamente puede obtener los procesos donde sea el terapeuta asignado.
* La pertenencia del terapeuta y del paciente a la misma clínica no otorga por sí sola acceso a procesos asignados a otro terapeuta.
* No deben exponerse procesos ni información de pacientes pertenecientes a otra clínica.
* La consulta puede incluir procesos con cualquier `status`.
* Si el paciente existe pero no existen procesos accesibles para el usuario, se devuelve una colección vacía.

## Dependencias

* El paciente debe existir.
* Debe existir una sesión autenticada.
* El acceso a los procesos debe respetar el rol y la clínica del usuario autenticado.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La consulta debe considerar que un mismo paciente puede participar en diferentes procesos con diferentes terapeutas.

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
