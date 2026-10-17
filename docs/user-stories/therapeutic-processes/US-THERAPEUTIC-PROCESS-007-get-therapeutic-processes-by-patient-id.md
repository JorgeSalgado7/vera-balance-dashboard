# US-PROCESS-007 — Get Therapeutic Processes By Patient

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero consultar los procesos terapéuticos asociados a un paciente,  
para conocer su historial de procesos cuando tenga autorización para acceder a esa información.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir consultar procesos asociados a un paciente mediante `GET /v1/patients/{id}/therapeutic-processes`.

Un usuario `clinic` podrá consultar todos los procesos del paciente cuando este pertenezca a su clínica.

Un usuario `therapist` únicamente podrá consultar, dentro de los procesos del paciente, aquellos donde sea el terapeuta responsable.

La consulta deberá incluir procesos accesibles independientemente de su estado y no deberá modificar información persistida.

## Criterios de aceptación

### CA-01 - Requerir autenticación

Dado que se solicita consultar procesos de un paciente,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar roles

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá consultar conforme a sus permisos.

### CA-03 - Validar usuario y clínica activos

Dado que se solicita consultar procesos de un paciente,  
cuando el usuario o su clínica están inactivos,  
entonces deberá rechazarse la operación.

### CA-04 - Validar identificador del paciente

Dado que se proporciona el parámetro `id`,  
cuando no cumple el formato definido para Patient,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-05 - Consultar como clinic

Dado que el usuario tiene rol `clinic` y el paciente pertenece a su clínica,  
cuando solicita sus procesos,  
entonces deberán devolverse todos los procesos asociados al paciente dentro de esa clínica.

### CA-06 - Incluir procesos de diferentes terapeutas para clinic

Dado que el paciente tiene procesos asignados a distintos terapeutas de la clínica,  
cuando un usuario `clinic` realiza la consulta,  
entonces deberán incluirse todos los procesos del paciente.

### CA-07 - Consultar como therapist

Dado que el usuario tiene rol `therapist` y el paciente pertenece a su clínica,  
cuando solicita sus procesos,  
entonces únicamente deberán devolverse aquellos cuyo `therapist_id` corresponda al usuario autenticado.

### CA-08 - Excluir procesos de otros terapeutas

Dado que el paciente tiene procesos con otros terapeutas,  
cuando un usuario `therapist` realiza la consulta,  
entonces dichos procesos no deberán incluirse.

### CA-09 - Impedir acceso entre clínicas

Dado que el paciente pertenece a otra clínica,  
cuando se solicitan sus procesos,  
entonces el sistema debe responder con `404 Not Found`.

### CA-10 - Paciente inexistente

Dado que no existe el paciente solicitado,  
cuando se consultan sus procesos,  
entonces el sistema debe responder con `404 Not Found`.

### CA-11 - Consultar todos los estados

Dado que el paciente tiene procesos accesibles con estado `active`, `inactive`, `discharged` o `unfinished`,  
cuando se realiza la consulta,  
entonces deberán poder recuperarse independientemente de su estado.

### CA-12 - Devolver colección vacía para clinic

Dado que el paciente pertenece a la clínica pero no tiene procesos,  
cuando un usuario `clinic` realiza la consulta,  
entonces deberá devolverse una colección vacía.

### CA-13 - Devolver colección vacía para therapist

Dado que el paciente pertenece a la misma clínica del terapeuta pero no tiene procesos asignados a ese usuario,  
cuando el terapeuta realiza la consulta,  
entonces deberá devolverse una colección vacía sin exponer procesos de otros terapeutas.

### CA-14 - Evitar procesos duplicados

Dado que el paciente aparece en distintas relaciones de consulta,  
cuando se construye la colección,  
entonces cada proceso deberá aparecer una sola vez.

### CA-15 - Devolver información definida en OpenAPI

Dado que existen procesos accesibles,  
cuando se construye la respuesta,  
entonces deberá incluirse la información definida en el contrato sin exponer atributos internos.

### CA-16 - No modificar información

Dado que se realiza la consulta,  
cuando finaliza,  
entonces no deberán modificarse pacientes, procesos, estados ni fechas de auditoría.

### CA-17 - Respuesta correcta

Dado que el paciente existe, pertenece a la clínica y la consulta está autorizada,  
cuando se completa,  
entonces el sistema debe responder con `200 OK`, incluso si la colección está vacía.

## Reglas de negocio

- Un paciente puede participar en múltiples procesos terapéuticos.
- `clinic` puede consultar todos los procesos de pacientes de su clínica.
- `therapist` solo puede consultar procesos donde sea responsable.
- El usuario y su clínica deben estar activos.
- Compartir clínica no concede acceso a procesos de otros terapeutas.
- No deben exponerse pacientes ni procesos de otras clínicas.
- Los procesos accesibles pueden tener cualquier estado.
- Un paciente existente sin procesos accesibles produce una colección vacía.
- Cada proceso debe aparecer una sola vez.
- La consulta no modifica información.

## Dependencias

- Auth.
- Users.
- Clinics.
- Patients.
- Therapeutic Processes.

## Consideraciones técnicas

### Endpoint

`GET /v1/patients/{id}/therapeutic-processes`

### Autenticación y autorización

- Validar sesión, usuario y clínica activos.
- Validar identificador del paciente.
- Comprobar pertenencia del paciente a la clínica.
- Para `clinic`, recuperar todos los procesos del paciente.
- Para `therapist`, filtrar exclusivamente procesos donde sea responsable.
- No revelar información de pacientes de otras clínicas.

### Persistencia

- Respetar DynamoDB Single Table.
- Utilizar las relaciones entre paciente y procesos.
- No depender de una asignación directa de terapeuta en Patient.
- Considerar que un paciente puede participar en múltiples procesos.
- Deduplicar mediante identificador de proceso.
- Gestionar paginación conforme a OpenAPI.
- No modificar información persistida.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Procesos consultados correctamente, incluida una colección vacía. |
| `400 Bad Request` | Identificador de paciente inválido. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin autorización para la operación. |
| `404 Not Found` | Paciente inexistente o de otra clínica. |

### Arquitectura

- `presentation`: validación del identificador y respuesta.
- `application`: caso de uso Get Therapeutic Processes By Patient.
- `domain`: reglas de visibilidad por clínica y terapeuta.
- `infrastructure`: consultas de relaciones paciente-proceso.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la consulta de `clinic`.
- [ ] Se verificó la consulta de `therapist`.
- [ ] Se verificó la exclusión de procesos de otros terapeutas.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó la consulta de todos los estados.
- [ ] Se verificó la colección vacía.
- [ ] Se verificó la ausencia de procesos duplicados.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
