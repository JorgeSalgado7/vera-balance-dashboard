# US-PATIENT-005 — Delete Patient

## Historia de usuario

Como administrador de clínica de Vera Balance,  
quiero eliminar pacientes que nunca hayan tenido procesos terapéuticos,  
para retirar registros que no deban conservarse sin afectar el historial clínico.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir eliminar físicamente un paciente mediante:

`DELETE /v1/patients/{id}`

Únicamente los usuarios con rol `clinic` podrán ejecutar la operación, y solo sobre pacientes pertenecientes a su propia clínica.

Los usuarios con rol `therapist` no podrán eliminar pacientes.

La eliminación física únicamente estará permitida cuando el paciente nunca haya tenido procesos terapéuticos asociados.

La existencia de cualquier proceso terapéutico, independientemente de su estado, deberá impedir la eliminación.

El paciente no tiene un estado propio. Por lo tanto, cuando no pueda eliminarse, no deberá marcarse como `inactive` ni modificarse ningún proceso terapéutico.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita eliminar un paciente,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar rol de clínica

Dado que existe una sesión válida con rol `clinic`,  
cuando se solicita eliminar un paciente,  
entonces el sistema debe permitir continuar con las validaciones correspondientes.

### CA-03 - Impedir eliminación por terapeuta

Dado que un usuario tiene rol `therapist`,  
cuando intenta eliminar un paciente,  
entonces el sistema debe responder con `403 Forbidden`.

Esto aplica incluso cuando el paciente participa en uno de sus procesos terapéuticos.

### CA-04 - Validar usuario activo

Dado que un administrador solicita eliminar un paciente,  
cuando su estado actual es `inactive`,  
entonces el sistema debe rechazar la operación.

### CA-05 - Validar clínica activa

Dado que un administrador solicita eliminar un paciente,  
cuando su clínica no existe o está inactiva,  
entonces el sistema debe rechazar la operación.

### CA-06 - Validar identificador

Dado que se proporciona el parámetro `id`,  
cuando no cumple el formato definido para Patient,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-07 - Validar pertenencia a clínica

Dado que un administrador solicita eliminar un paciente,  
cuando el sistema obtiene el registro,  
entonces debe comprobar que pertenezca a su clínica.

Si pertenece a otra clínica, deberá responder con `404 Not Found`.

### CA-08 - Paciente inexistente

Dado que no existe un paciente con el identificador proporcionado,  
cuando se solicita eliminarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-09 - Eliminar paciente sin historial

Dado que el paciente pertenece a la clínica del administrador y nunca ha tenido procesos terapéuticos asociados,  
cuando se solicita eliminarlo,  
entonces el sistema debe eliminar físicamente su registro.

### CA-10 - Impedir eliminación con proceso activo

Dado que el paciente tiene un proceso con estado `active`,  
cuando se solicita eliminarlo,  
entonces el sistema debe responder con `409 Conflict`.

### CA-11 - Impedir eliminación con proceso inactivo

Dado que el paciente tiene un proceso con estado `inactive`,  
cuando se solicita eliminarlo,  
entonces el sistema debe responder con `409 Conflict`.

### CA-12 - Impedir eliminación con proceso dado de alta

Dado que el paciente tiene un proceso con estado `discharged`,  
cuando se solicita eliminarlo,  
entonces el sistema debe responder con `409 Conflict`.

### CA-13 - Impedir eliminación con proceso no finalizado

Dado que el paciente tiene un proceso con estado `unfinished`,  
cuando se solicita eliminarlo,  
entonces el sistema debe responder con `409 Conflict`.

### CA-14 - Considerar todo el historial terapéutico

Dado que el paciente tiene o ha tenido procesos terapéuticos,  
cuando se evalúa su eliminación,  
entonces deberá considerarse cualquier proceso asociado, independientemente de su estado.

La restricción no deberá limitarse a procesos activos.

### CA-15 - Conservar información ante conflicto

Dado que el paciente tiene historial terapéutico,  
cuando se rechaza la eliminación,  
entonces deberán conservarse el paciente, sus procesos y sus registros clínicos.

### CA-16 - No modificar procesos

Dado que se solicita eliminar un paciente,  
cuando la operación es rechazada por historial terapéutico,  
entonces no deberá modificarse el estado ni la información de sus procesos.

### CA-17 - No crear estado de paciente

Dado que la eliminación no está permitida,  
cuando se rechaza,  
entonces el sistema no deberá intentar cambiar un estado propio del paciente.

El paciente no dispone de `status`.

### CA-18 - No eliminar registros relacionados

Dado que se solicita eliminar un paciente,  
cuando se procesa la operación,  
entonces no deberán eliminarse automáticamente procesos terapéuticos, sesiones ni registros clínicos.

### CA-19 - Mantener consistencia ante concurrencia

Dado que se solicita eliminar un paciente sin historial,  
cuando otra operación intenta asociarlo simultáneamente a un proceso terapéutico,  
entonces el sistema debe garantizar que no se elimine un paciente que termine referenciado por un proceso.

Una consulta previa de procesos no será suficiente sin un mecanismo que proteja esta condición.

### CA-20 - Eliminar referencias técnicas de unicidad

Dado que el paciente puede eliminarse,  
cuando se ejecuta la eliminación,  
entonces deberán retirarse las referencias técnicas de unicidad asociadas a su registro, si existen.

La operación no deberá dejar bloqueada la combinación de nombre y teléfono correspondiente a un paciente eliminado.

### CA-21 - Confirmar eliminación

Dado que el paciente fue eliminado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `204 No Content`.

No deberá devolver información del paciente eliminado.

### CA-22 - Proteger contra CSRF

Dado que la operación utiliza autenticación mediante cookies,  
cuando se recibe la solicitud,  
entonces deberán aplicarse los controles CSRF definidos para Vera Balance.

## Reglas de negocio

- Únicamente el rol `clinic` puede eliminar pacientes.
- El administrador solo puede eliminar pacientes de su propia clínica.
- El usuario y su clínica deben estar activos.
- El rol `therapist` no puede eliminar pacientes.
- La eliminación es física.
- Un paciente únicamente puede eliminarse si nunca ha tenido procesos terapéuticos.
- Cualquier proceso asociado impide la eliminación.
- La restricción aplica a `active`, `inactive`, `discharged` y `unfinished`.
- El paciente no tiene estado propio.
- No se permite desactivar un paciente como alternativa a su eliminación.
- La eliminación no modifica procesos terapéuticos.
- La eliminación no elimina registros clínicos.
- La integridad debe mantenerse ante solicitudes concurrentes.
- Deben eliminarse las referencias técnicas asociadas al paciente cuando corresponda.

## Dependencias

- Auth.
- Users.
- Clinics.
- Patients.
- Therapeutic Processes.

## Consideraciones técnicas

### Endpoint

`DELETE /v1/patients/{id}`

### Autenticación y autorización

- Obtener el JWT desde `vera_balance_session`.
- Validar la sesión.
- Validar que el usuario tenga rol `clinic`.
- Validar que el usuario y su clínica estén activos.
- Obtener la clínica desde el contexto autenticado.
- Comprobar que el paciente pertenece a esa clínica.
- Aplicar protección CSRF.

### Validación de historial

Antes de eliminar, el sistema deberá comprobar la existencia de cualquier proceso terapéutico asociado al paciente.

La comprobación deberá considerar todos los estados:

- `active`
- `inactive`
- `discharged`
- `unfinished`

No deberá filtrarse únicamente por procesos activos.

### Integridad y concurrencia

- La eliminación deberá protegerse contra la creación concurrente de procesos terapéuticos.
- Las operaciones que crean relaciones paciente-proceso deberán respetar la misma restricción de integridad.
- Deberá utilizarse un mecanismo transaccional, condicional o equivalente que evite referencias huérfanas.
- No deberá dependerse únicamente de una consulta previa sin garantías de consistencia.
- Si se detecta historial, deberá rechazarse con `409 Conflict`.

### Persistencia

- Respetar DynamoDB Single Table.
- Eliminar únicamente el registro del paciente y las referencias técnicas que le pertenezcan y puedan eliminarse de forma segura.
- No eliminar procesos terapéuticos.
- No eliminar sesiones.
- No eliminar registros clínicos.
- No modificar otros pacientes.
- Mantener la consistencia de las claves utilizadas para detectar duplicidad.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `204 No Content` | Paciente eliminado correctamente. |
| `400 Bad Request` | Identificador inválido. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin permisos de eliminación. |
| `404 Not Found` | Paciente inexistente o de otra clínica. |
| `409 Conflict` | Paciente con historial terapéutico o conflicto de integridad. |

### Arquitectura

- `presentation`: autenticación, validación del identificador y respuesta HTTP.
- `application`: caso de uso Delete Patient y coordinación de las restricciones.
- `domain`: reglas de eliminación y conservación del historial.
- `infrastructure`: consultas de procesos y eliminación mediante adaptadores.

La lógica de eliminación deberá permanecer separada de Create Patient y Update Patient.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la eliminación mediante rol `clinic`.
- [ ] Se verificó el rechazo para `therapist`.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó la eliminación de pacientes sin historial.
- [ ] Se verificó el rechazo para los cuatro estados de procesos terapéuticos.
- [ ] Se verificó que no se modifiquen procesos ni registros clínicos.
- [ ] Se verificó la consistencia ante solicitudes concurrentes.
- [ ] Se verificó la limpieza de referencias técnicas de unicidad.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
