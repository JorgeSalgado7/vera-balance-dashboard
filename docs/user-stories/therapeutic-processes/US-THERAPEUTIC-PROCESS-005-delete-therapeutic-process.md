# US-PROCESS-005 — Delete Therapeutic Process

## Historia de usuario

Como administrador de una clínica de Vera Balance,  
quiero eliminar excepcionalmente un proceso terapéutico,  
para retirar información que la clínica determine que ya no debe conservarse.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe disponer de `DELETE /v1/therapeutic-processes/{id}` para eliminar físicamente procesos terapéuticos.

Solo un usuario con rol `clinic` podrá realizar esta operación sobre procesos pertenecientes a su clínica.

La eliminación física será excepcional. El mecanismo habitual para finalizar, interrumpir o dar de alta un proceso será modificar su `status`.

La eliminación deberá proteger la integridad de sesiones, registros clínicos y demás información relacionada. No deberá ejecutarse una eliminación en cascada que destruya información clínica sin una regla de conservación expresamente definida.

## Criterios de aceptación

### CA-01 - Requerir autenticación

Dado que se solicita eliminar un proceso,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar rol clinic

Dado que existe una sesión válida con rol `clinic`,  
cuando se solicita eliminar un proceso,  
entonces el sistema debe permitir continuar con las validaciones.

### CA-03 - Impedir eliminación por therapist

Dado que el usuario tiene rol `therapist`,  
cuando intenta eliminar un proceso,  
entonces el sistema debe responder con `403 Forbidden`.

### CA-04 - Validar usuario y clínica activos

Dado que se solicita eliminar un proceso,  
cuando el usuario o su clínica están inactivos,  
entonces deberá rechazarse la operación.

### CA-05 - Validar identificador

Dado que se proporciona el parámetro `id`,  
cuando no cumple el formato definido,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-06 - Validar pertenencia a clínica

Dado que un administrador solicita eliminar un proceso,  
cuando se recupera el recurso,  
entonces deberá comprobarse que pertenezca a su clínica.

### CA-07 - Impedir eliminación entre clínicas

Dado que el proceso pertenece a otra clínica,  
cuando se intenta eliminarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-08 - Proceso inexistente

Dado que no existe el proceso solicitado,  
cuando se intenta eliminarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-09 - Permitir eliminación excepcional

Dado que el proceso pertenece a la clínica y cumple las restricciones de integridad y conservación aplicables,  
cuando el administrador solicita eliminarlo,  
entonces el sistema debe eliminarlo físicamente.

### CA-10 - No utilizar eliminación como cambio de estado

Dado que se solicita eliminar un proceso,  
cuando se ejecuta la operación,  
entonces no deberá sustituirse la eliminación por un cambio automático a `inactive`, `discharged` o `unfinished`.

### CA-11 - Proteger registros clínicos relacionados

Dado que el proceso tiene sesiones, notas, registros clínicos u otras referencias cuya conservación es obligatoria,  
cuando se solicita eliminarlo,  
entonces el sistema debe rechazar la operación con `409 Conflict` hasta que exista una política de eliminación y conservación que autorice expresamente su tratamiento.

### CA-12 - No eliminar pacientes

Dado que se elimina un proceso,  
cuando se ejecuta la operación,  
entonces los pacientes asociados deberán conservarse.

### CA-13 - No eliminar usuarios

Dado que se elimina un proceso,  
cuando se ejecuta la operación,  
entonces el terapeuta responsable y los demás usuarios deberán conservarse.

### CA-14 - Mantener integridad de relaciones

Dado que se elimina físicamente un proceso,  
cuando se persiste la eliminación,  
entonces deberán retirarse las referencias técnicas correspondientes sin dejar relaciones huérfanas.

### CA-15 - Evitar eliminación parcial

Dado que falla alguna restricción de integridad,  
cuando se intenta eliminar el proceso,  
entonces deberán conservarse tanto el proceso como sus relaciones.

### CA-16 - Mantener consistencia ante concurrencia

Dado que se solicita eliminar un proceso,  
cuando otra operación intenta crear simultáneamente registros asociados,  
entonces el sistema debe impedir que se generen referencias a un proceso eliminado.

### CA-17 - Responder sin contenido

Dado que el proceso fue eliminado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `204 No Content`.

### CA-18 - Proteger contra CSRF

Dado que la operación utiliza autenticación mediante cookies,  
cuando se recibe la solicitud,  
entonces deberán aplicarse los controles CSRF correspondientes.

## Reglas de negocio

- Solo `clinic` puede eliminar procesos terapéuticos.
- `therapist` no puede eliminarlos.
- El administrador solo puede eliminar procesos de su clínica.
- El usuario y su clínica deben estar activos.
- La eliminación es física y excepcional.
- El mecanismo habitual para gestionar el ciclo de vida es modificar `status`.
- La eliminación no debe destruir pacientes ni usuarios.
- No deben eliminarse automáticamente registros clínicos relacionados.
- La integridad referencial debe mantenerse.
- Las políticas de conservación clínica prevalecen sobre la solicitud de eliminación.
- No se establecen nuevos criterios temporales o administrativos de eliminación en esta historia.

## Dependencias

- Auth.
- Users.
- Clinics.
- Therapeutic Processes.
- Session Records y demás recursos relacionados, cuando existan.
- Reglas de conservación de información clínica.

## Consideraciones técnicas

### Endpoint

`DELETE /v1/therapeutic-processes/{id}`

### Autenticación y autorización

- Validar sesión, usuario y clínica activos.
- Permitir exclusivamente rol `clinic`.
- Comprobar pertenencia del proceso a la clínica.
- Aplicar protección CSRF.

### Integridad clínica

- Identificar referencias relacionadas antes de eliminar.
- Rechazar la eliminación cuando existan registros cuya conservación sea obligatoria.
- No ejecutar eliminaciones en cascada de información clínica.
- No eliminar pacientes ni terapeutas.
- Proteger las referencias ante operaciones concurrentes.

### Persistencia

- Respetar DynamoDB Single Table.
- Eliminar físicamente el proceso cuando esté permitido.
- Retirar sus referencias técnicas de consulta.
- Garantizar consistencia transaccional o equivalente.
- No dejar relaciones huérfanas.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `204 No Content` | Proceso eliminado correctamente. |
| `400 Bad Request` | Identificador inválido. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin permiso de eliminación. |
| `404 Not Found` | Proceso inexistente o de otra clínica. |
| `409 Conflict` | Restricción de conservación o integridad. |

### Arquitectura

- `presentation`: autenticación, identificador y respuesta.
- `application`: caso de uso Delete Therapeutic Process.
- `domain`: reglas de eliminación y conservación.
- `infrastructure`: comprobación de referencias y eliminación.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la eliminación exclusiva de `clinic`.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó la eliminación física permitida.
- [ ] Se verificó la conservación de pacientes y usuarios.
- [ ] Se verificó la protección de registros clínicos relacionados.
- [ ] Se verificó la integridad de referencias ante concurrencia.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
