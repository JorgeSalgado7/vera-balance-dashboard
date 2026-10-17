# US-PROCESS-002 — Get Therapeutic Processes

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero consultar los procesos terapéuticos a los que tengo acceso,  
para conocer y administrar la atención correspondiente a mis permisos.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir consultar procesos mediante `GET /v1/therapeutic-processes`.

Los usuarios `clinic` podrán consultar todos los procesos pertenecientes a su clínica, incluidos aquellos asignados a otros terapeutas.

Los usuarios `therapist` únicamente podrán consultar procesos donde sean el terapeuta responsable.

La consulta deberá considerar todos los estados y no modificar información persistida.

## Criterios de aceptación

### CA-01 - Requerir autenticación

Dado que se solicita consultar procesos,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar roles

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá consultar procesos conforme a sus permisos.

### CA-03 - Validar usuario y clínica activos

Dado que se solicita consultar procesos,  
cuando el usuario o su clínica están inactivos,  
entonces deberá rechazarse la operación.

### CA-04 - Consultar procesos como clinic

Dado que el usuario tiene rol `clinic`,  
cuando solicita la colección,  
entonces deberán devolverse los procesos pertenecientes a su clínica.

### CA-05 - Incluir procesos de otros terapeutas

Dado que existen procesos asignados a distintos terapeutas de la clínica,  
cuando un usuario `clinic` consulta la colección,  
entonces deberán incluirse todos los procesos de su clínica.

### CA-06 - Consultar procesos como therapist

Dado que el usuario tiene rol `therapist`,  
cuando solicita la colección,  
entonces únicamente deberán devolverse los procesos cuyo `therapist_id` corresponda al usuario autenticado.

### CA-07 - Excluir procesos de otros terapeutas

Dado que existen procesos asignados a otros terapeutas,  
cuando un usuario `therapist` consulta la colección,  
entonces dichos procesos no deberán incluirse.

### CA-08 - Excluir procesos de otras clínicas

Dado que existen procesos pertenecientes a otras clínicas,  
cuando un usuario consulta procesos,  
entonces no deberán incluirse en la respuesta.

### CA-09 - Consultar todos los estados

Dado que existen procesos accesibles con estado `active`, `inactive`, `discharged` o `unfinished`,  
cuando se realiza la consulta,  
entonces deberán poder recuperarse independientemente de su estado.

### CA-10 - Evitar duplicados

Dado que un proceso contiene varios pacientes,  
cuando se construye la colección,  
entonces deberá aparecer una sola vez.

### CA-11 - Devolver colección vacía

Dado que no existen procesos accesibles,  
cuando se realiza la consulta,  
entonces el sistema debe responder con `200 OK` y una colección vacía.

### CA-12 - Respetar contrato de respuesta

Dado que se recuperan procesos,  
cuando se construye la respuesta,  
entonces deberán incluirse los campos definidos en OpenAPI, sin exponer atributos internos de persistencia.

### CA-13 - No modificar información

Dado que se ejecuta la consulta,  
cuando finaliza,  
entonces no deberán modificarse procesos, pacientes, estados ni fechas de auditoría.

### CA-14 - Respuesta correcta

Dado que la consulta se completa correctamente,  
cuando finaliza,  
entonces el sistema debe responder con `200 OK`.

## Reglas de negocio

- Los roles `clinic` y `therapist` pueden consultar procesos.
- El usuario y su clínica deben estar activos.
- `clinic` puede consultar todos los procesos de su clínica.
- `therapist` solo puede consultar procesos donde sea responsable.
- Pertenecer a la misma clínica no otorga acceso a procesos de otros terapeutas.
- No deben exponerse procesos de otras clínicas.
- Todos los estados son consultables.
- Cada proceso aparece una sola vez.
- La consulta no modifica información.

## Dependencias

- Auth.
- Users.
- Clinics.
- Therapeutic Processes.

## Consideraciones técnicas

### Endpoint

`GET /v1/therapeutic-processes`

### Autenticación y autorización

- Validar sesión, usuario y clínica activos.
- Obtener identidad, rol y clínica desde la sesión.
- Aplicar los filtros de autorización en la consulta.
- No aceptar identificadores de otra clínica para ampliar el alcance.

### Persistencia

- Utilizar los patrones de acceso definidos en `docs/DB.md`.
- Para `clinic`, consultar procesos por clínica.
- Para `therapist`, consultar procesos por terapeuta y clínica.
- Evitar escaneos globales indiscriminados.
- Gestionar la paginación según OpenAPI.
- Evitar duplicados por identificador de proceso.
- No modificar información persistida.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Procesos consultados correctamente, incluida una colección vacía. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin autorización. |

### Arquitectura

- `presentation`: autenticación y respuesta.
- `application`: caso de uso Get Therapeutic Processes.
- `domain`: reglas de visibilidad por rol.
- `infrastructure`: consultas de procesos.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la consulta para `clinic`.
- [ ] Se verificó la consulta para `therapist`.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó la consulta de todos los estados.
- [ ] Se verificó la ausencia de procesos duplicados.
- [ ] Se verificó la colección vacía.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
