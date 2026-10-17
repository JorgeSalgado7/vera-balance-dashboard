# US-RECORD-005 — Delete Record

**Scope:** Backend  
**Status:** Approved  
**Método:** `DELETE /v1/records/{id}`

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero eliminar un registro de sesión sobre el que tengo permisos, para retirar el registro y sus tareas asociadas cuando sea necesario.

## Descripción

El sistema debe permitir eliminar físicamente un Record respetando los permisos sobre su proceso terapéutico.

Cuando se elimina un Record, también deben eliminarse físicamente todas las Home Works asociadas a él.

La eliminación no debe afectar al proceso terapéutico, a los pacientes ni a otros Records.

## Criterios de aceptación

### CA-01 — Eliminar como clinic
Dado que el Record pertenece a un proceso de su clínica, cuando un usuario `clinic` solicita eliminarlo, entonces debe permitirse la operación.

### CA-02 — Eliminar como therapist
Dado que el Record pertenece a un proceso donde el usuario `therapist` es responsable, cuando solicita eliminarlo, entonces debe permitirse la operación.

### CA-03 — Impedir eliminación por therapist no asignado
Dado que el proceso está asignado a otro terapeuta, cuando `therapist` intenta eliminar el Record, entonces debe rechazarse la operación.

### CA-04 — Impedir eliminación entre clínicas
Dado que el Record pertenece a otra clínica, cuando se intenta eliminar, entonces debe rechazarse la operación.

### CA-05 — Eliminar Home Works asociadas
Dado que el Record tiene Home Works relacionadas, cuando se elimina, entonces también deben eliminarse físicamente dichas tareas.

### CA-06 — No eliminar Home Works de otros Records
Dado que existen tareas asociadas a otros Records, cuando se elimina el Record solicitado, entonces esas tareas deben conservarse.

### CA-07 — Eliminar físicamente el Record
Dado que la operación está autorizada, cuando se completa, entonces el Record debe dejar de existir en la persistencia.

### CA-08 — Mantener el proceso terapéutico
Dado que el Record pertenece a un proceso, cuando se elimina, entonces el proceso y su información deben conservarse.

### CA-09 — Mantener otros Records
Dado que el proceso contiene otros Records, cuando se elimina uno de ellos, entonces los demás deben permanecer sin modificaciones.

### CA-10 — Eliminación consistente
Dado que el Record tiene tareas asociadas, cuando se ejecuta la eliminación, entonces no deben quedar Home Works huérfanas ni producirse una eliminación parcial.

### CA-11 — Record inexistente
Dado que el Record no existe, cuando se solicita su eliminación, entonces debe indicarse que el recurso no fue encontrado.

### CA-12 — Identificador inválido
Dado que el identificador tiene un formato inválido, cuando se solicita la eliminación, entonces debe rechazarse la solicitud.

### CA-13 — Responder sin contenido
Dado que el Record y sus tareas se eliminaron correctamente, cuando finaliza la operación, entonces debe responderse sin contenido.

### CA-14 — Requerir autenticación
Dado que no existe una sesión válida, cuando se intenta eliminar el Record, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- `clinic` puede eliminar Records de procesos de su clínica.
- `therapist` únicamente puede eliminar Records de sus procesos.
- La eliminación del Record es física.
- La eliminación del Record incluye sus Home Works asociadas.
- No deben quedar tareas huérfanas.
- No deben eliminarse tareas de otros Records.
- La eliminación no debe afectar al proceso terapéutico ni a los pacientes.

## Dependencias

- Record existente.
- Therapeutic Process asociado.
- Consulta de Home Works pertenecientes al Record.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`, `docs/DB.md`, `docs/DEFINITIONS.md` y `docs/PROJECT_ARCHITECTURE.md`.
- La eliminación del Record y sus tareas debe garantizar consistencia.
- Considerar las restricciones transaccionales de DynamoDB y la estrategia definida para eliminar conjuntos de tareas.
- La autorización debe verificarse antes de cualquier eliminación.

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se agregaron o actualizaron las pruebas necesarias.
- [ ] Las pruebas pasan correctamente.
- [ ] La implementación fue revisada.