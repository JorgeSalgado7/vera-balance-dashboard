# US-PATIENT-002 — Get Patients

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero consultar los pacientes a los que tengo acceso,  
para conocer su información conforme a mi rol y mis relaciones terapéuticas.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir consultar pacientes mediante:

`GET /v1/patients`

La operación requiere una sesión autenticada válida.

Los usuarios con rol `clinic` podrán consultar todos los pacientes pertenecientes a su clínica.

Los usuarios con rol `therapist` únicamente podrán consultar pacientes relacionados con sus propios procesos terapéuticos.

La relación entre terapeuta y paciente se determina mediante los procesos terapéuticos, no mediante un campo de terapeuta almacenado directamente en el paciente.

La consulta deberá ser exclusivamente de lectura.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita consultar pacientes,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar rol

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá consultar los pacientes correspondientes a sus permisos.

Cualquier otro rol no autorizado deberá recibir `403 Forbidden`.

### CA-03 - Validar usuario activo

Dado que un usuario solicita consultar pacientes,  
cuando su estado actual es `inactive`,  
entonces el sistema debe rechazar la operación.

### CA-04 - Validar clínica activa

Dado que existe un usuario autenticado,  
cuando su clínica no existe o está inactiva,  
entonces el sistema debe rechazar la consulta.

### CA-05 - Consultar pacientes como clínica

Dado que un usuario tiene rol `clinic`,  
cuando solicita la lista de pacientes,  
entonces el sistema debe devolver los pacientes pertenecientes a su clínica.

### CA-06 - Incluir pacientes atendidos por terapeutas

Dado que un paciente pertenece a la clínica del administrador,  
cuando se consulta la lista,  
entonces deberá incluirse aunque sea atendido por uno o varios terapeutas de esa clínica.

### CA-07 - Incluir pacientes sin proceso terapéutico para clínica

Dado que existe un paciente registrado sin procesos terapéuticos,  
cuando un administrador de su clínica consulta pacientes,  
entonces el paciente deberá incluirse en la respuesta.

### CA-08 - Consultar pacientes como terapeuta

Dado que un usuario tiene rol `therapist`,  
cuando solicita sus pacientes,  
entonces el sistema debe obtener únicamente aquellos relacionados con procesos terapéuticos del terapeuta autenticado.

### CA-09 - Excluir pacientes sin relación

Dado que un paciente pertenece a la misma clínica que el terapeuta,  
pero no participa en ninguno de sus procesos terapéuticos,  
cuando el terapeuta consulta pacientes,  
entonces dicho paciente no deberá incluirse.

Esto también aplica a pacientes que el terapeuta haya registrado sin crear posteriormente un proceso terapéutico.

### CA-10 - Impedir exposición entre clínicas

Dado que existen pacientes pertenecientes a otras clínicas,  
cuando un usuario consulta pacientes,  
entonces dichos pacientes no deberán aparecer en la respuesta.

### CA-11 - Evitar duplicados

Dado que un paciente participa en varios procesos del mismo terapeuta,  
cuando se construye la respuesta,  
entonces deberá aparecer una sola vez.

La deduplicación deberá realizarse mediante el identificador del paciente.

### CA-12 - Respetar relaciones terapéuticas

Dado que un paciente participa en distintos procesos terapéuticos,  
cuando se determina su visibilidad,  
entonces deberán considerarse las relaciones definidas en el modelo de procesos terapéuticos.

La consulta no deberá depender exclusivamente de procesos activos, salvo que exista una regla expresa que limite la visibilidad histórica.

### CA-13 - Devolver colección vacía

Dado que el usuario no tiene pacientes accesibles,  
cuando solicita la lista,  
entonces el sistema debe responder con `200 OK` y una colección vacía.

### CA-14 - Devolver información pública

Dado que existen pacientes accesibles,  
cuando se genera la respuesta,  
entonces deberá incluirse la información definida en el contrato OpenAPI.

No deberán exponerse atributos internos de DynamoDB.

### CA-15 - No modificar información

Dado que se consultan pacientes,  
cuando finaliza la operación,  
entonces no deberá modificarse información persistida ni fechas de auditoría.

### CA-16 - Respuesta correcta

Dado que el usuario está autenticado y autorizado,  
cuando la consulta se completa,  
entonces el sistema debe responder con `200 OK`.

## Reglas de negocio

- Los roles `clinic` y `therapist` pueden consultar pacientes.
- El usuario y su clínica deben estar activos.
- `clinic` puede consultar todos los pacientes de su clínica.
- `therapist` solo puede consultar pacientes vinculados a sus propios procesos terapéuticos.
- Registrar un paciente no otorga automáticamente acceso de consulta al terapeuta.
- Compartir clínica no concede acceso terapéutico.
- Un paciente puede participar en varios procesos terapéuticos.
- Cada paciente debe aparecer una sola vez.
- No deben exponerse pacientes de otras clínicas.
- Una colección sin resultados debe devolverse vacía.
- La consulta no modifica información.

## Dependencias

- Auth.
- Users.
- Clinics.
- Patients.
- Therapeutic Processes.

## Consideraciones técnicas

### Endpoint

`GET /v1/patients`

### Autenticación

- Obtener la sesión desde `vera_balance_session`.
- Validar el JWT.
- Validar el usuario y la clínica activos.
- Obtener `user_id`, `role` y clínica desde el contexto autenticado.

### Consulta para clínica

- Utilizar el patrón de acceso por clínica definido en `docs/DB.md`.
- Devolver pacientes pertenecientes a esa clínica.
- Incluir pacientes con y sin procesos terapéuticos.
- No consultar pacientes de otras clínicas.

### Consulta para terapeuta

- Consultar las relaciones entre el terapeuta y sus procesos terapéuticos.
- Obtener los identificadores de pacientes relacionados.
- Validar la pertenencia de los pacientes a la clínica autenticada.
- Eliminar identificadores duplicados.
- Recuperar únicamente pacientes autorizados.
- No utilizar un campo `therapist` directo en Patient.

### Persistencia

- Respetar DynamoDB Single Table.
- Utilizar patrones de acceso adecuados para clínica y relaciones terapéuticas.
- Gestionar la paginación interna necesaria para cumplir el contrato.
- No realizar un escaneo global indiscriminado de pacientes.
- No modificar registros durante la consulta.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Pacientes consultados correctamente, incluida una colección vacía. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin permisos suficientes o inactivo. |

### Arquitectura

- `presentation`: autenticación y respuesta HTTP.
- `application`: caso de uso Get Patients y aplicación de visibilidad por rol.
- `domain`: reglas de acceso a pacientes.
- `infrastructure`: consultas de pacientes y relaciones terapéuticas.

La autorización deberá aplicarse antes de devolver información clínica.

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
- [ ] Se verificó la exclusión de pacientes sin relación terapéutica.
- [ ] Se verificó la eliminación de duplicados.
- [ ] Se verificó la colección vacía.
- [ ] Se verificó que la consulta no modifique registros.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
