# US-PATIENT-003 — Get Patient By ID

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero consultar un paciente mediante su identificador,  
para conocer su información cuando tenga permisos para acceder a ella.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir consultar un paciente mediante:

`GET /v1/patients/{id}`

Los usuarios con rol `clinic` podrán consultar pacientes pertenecientes a su clínica.

Los usuarios con rol `therapist` únicamente podrán consultar pacientes que participen en alguno de sus procesos terapéuticos.

La existencia de un paciente no deberá permitir omitir las restricciones de acceso por clínica y relación terapéutica.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita consultar un paciente,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar autorización por rol

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá consultar pacientes conforme a sus permisos.

Los roles no autorizados deberán recibir `403 Forbidden`.

### CA-03 - Validar usuario activo

Dado que un usuario solicita consultar un paciente,  
cuando su estado actual es `inactive`,  
entonces el sistema debe rechazar la operación.

### CA-04 - Validar clínica activa

Dado que existe una sesión autenticada,  
cuando la clínica del usuario no existe o está inactiva,  
entonces el sistema debe rechazar la operación.

### CA-05 - Validar identificador

Dado que se proporciona el parámetro `id`,  
cuando no cumple el formato definido para Patient,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-06 - Consultar paciente como clínica

Dado que un usuario tiene rol `clinic` y el paciente pertenece a su clínica,  
cuando solicita consultarlo,  
entonces el sistema debe devolver su información.

### CA-07 - Consultar paciente como terapeuta

Dado que un usuario tiene rol `therapist` y el paciente participa en uno de sus procesos terapéuticos,  
cuando solicita consultarlo,  
entonces el sistema debe devolver su información.

### CA-08 - Impedir acceso de terapeuta sin relación

Dado que un paciente pertenece a la misma clínica del terapeuta,  
pero no participa en ninguno de sus procesos terapéuticos,  
cuando el terapeuta intenta consultarlo,  
entonces el sistema debe responder con `404 Not Found`.

Esta respuesta evitará revelar la existencia de pacientes fuera del alcance autorizado.

### CA-09 - Impedir acceso entre clínicas

Dado que el paciente pertenece a otra clínica,  
cuando un usuario intenta consultarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-10 - Paciente inexistente

Dado que no existe un paciente con el identificador proporcionado,  
cuando se realiza la consulta,  
entonces el sistema debe responder con `404 Not Found`.

### CA-11 - Validar relación terapéutica

Dado que el usuario tiene rol `therapist`,  
cuando se evalúa su acceso,  
entonces deberá comprobarse su participación en al menos un proceso terapéutico del paciente.

No deberá utilizarse una asignación directa en Patient.

### CA-12 - Devolver información del paciente

Dado que el paciente existe y el usuario tiene acceso,  
cuando se construye la respuesta,  
entonces deberán incluirse los campos definidos en OpenAPI.

No deberán exponerse detalles internos de persistencia.

### CA-13 - No modificar información

Dado que se consulta un paciente,  
cuando finaliza la operación,  
entonces no deberá modificarse información persistida ni actualizarse `updated_at`.

### CA-14 - Respuesta correcta

Dado que el paciente existe y el usuario tiene autorización,  
cuando la consulta se completa,  
entonces el sistema debe responder con `200 OK`.

## Reglas de negocio

- La consulta requiere autenticación.
- Los roles `clinic` y `therapist` pueden consultar conforme a sus permisos.
- El usuario y su clínica deben estar activos.
- `clinic` puede consultar pacientes de su clínica.
- `therapist` solo puede consultar pacientes vinculados a sus procesos terapéuticos.
- Compartir clínica no concede acceso automático al terapeuta.
- Los pacientes de otras clínicas no pueden consultarse.
- Un recurso inexistente o fuera del alcance autorizado debe responder con `404 Not Found`.
- La consulta no modifica información.

## Dependencias

- Auth.
- Users.
- Clinics.
- Patients.
- Therapeutic Processes.

## Consideraciones técnicas

### Endpoint

`GET /v1/patients/{id}`

### Parámetros

`id`: identificador del paciente, conforme al formato definido en OpenAPI y `docs/DB.md`.

### Autorización

- Validar sesión, rol, usuario activo y clínica activa.
- Obtener la identidad y clínica desde el contexto autenticado.
- Comprobar que el paciente pertenece a la clínica.
- Para `therapist`, comprobar la existencia de una relación mediante procesos terapéuticos.
- No revelar información del paciente antes de autorizar el acceso.

### Persistencia

- Consultar el paciente mediante su identificador.
- Utilizar las abstracciones de Patients y Therapeutic Processes.
- No consultar ni modificar procesos salvo lo necesario para verificar autorización.
- No modificar información persistida.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Paciente consultado correctamente. |
| `400 Bad Request` | Identificador inválido. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin permisos de operación. |
| `404 Not Found` | Paciente inexistente o fuera del alcance autorizado. |

### Arquitectura

- `presentation`: recepción del identificador, autenticación y respuesta HTTP.
- `application`: caso de uso Get Patient By ID y autorización.
- `domain`: reglas de acceso.
- `infrastructure`: consulta de paciente y relaciones terapéuticas.

El caso de uso no deberá depender directamente de Dynamoose ni de controladores HTTP.

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
- [ ] Se verificó el acceso mediante procesos terapéuticos.
- [ ] Se verificó el rechazo de pacientes de otras clínicas.
- [ ] Se verificó el rechazo de pacientes sin relación con el terapeuta.
- [ ] Se verificaron identificadores inválidos e inexistentes.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
