# US-RECORD-006 — Get Records By Therapeutic Process

**Scope:** Backend  
**Status:** Approved  
**Operación:** Consultar Records de un proceso terapéutico.

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero consultar los registros de un proceso terapéutico específico, para revisar el historial de sesiones correspondiente a dicho proceso.

## Descripción

El sistema debe permitir consultar los Records asociados a un Therapeutic Process específico.

Un usuario `clinic` puede consultar los Records de cualquier proceso de su clínica.

Un usuario `therapist` únicamente puede consultar los Records de procesos donde sea responsable.

El historial debe permanecer disponible aunque el proceso ya no esté activo.

## Criterios de aceptación

### CA-01 — Consultar como clinic
Dado que el proceso pertenece a su clínica, cuando un usuario `clinic` consulta sus Records, entonces deben devolverse los registros asociados.

### CA-02 — Consultar como therapist
Dado que el usuario `therapist` es responsable del proceso, cuando consulta sus Records, entonces deben devolverse los registros asociados.

### CA-03 — Impedir consulta por therapist no asignado
Dado que otro terapeuta es responsable del proceso, cuando `therapist` intenta consultar sus Records, entonces debe rechazarse la operación.

### CA-04 — Impedir consulta entre clínicas
Dado que el proceso pertenece a otra clínica, cuando se intenta consultar sus Records, entonces debe rechazarse la operación.

### CA-05 — Consultar historial no activo
Dado que el proceso tiene `status` distinto de `active`, cuando un usuario autorizado consulta sus Records, entonces debe devolverse el historial existente.

### CA-06 — Proceso sin Records
Dado que el proceso existe y no tiene Records, cuando se realiza una consulta autorizada, entonces debe devolverse una colección vacía.

### CA-07 — Mantener unicidad de resultados
Dado que existen varios Records asociados al proceso, cuando se consulta su historial, entonces cada Record debe aparecer una sola vez.

### CA-08 — Proceso inexistente
Dado que el proceso no existe, cuando se consultan sus Records, entonces debe indicarse que el recurso no fue encontrado.

### CA-09 — Identificador inválido
Dado que el identificador del proceso no cumple con el formato esperado, cuando se realiza la consulta, entonces debe rechazarse la solicitud.

### CA-10 — Requerir autenticación
Dado que no existe una sesión válida, cuando se consultan los Records, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- `clinic` puede consultar Records de cualquier proceso de su clínica.
- `therapist` únicamente puede consultar Records de procesos donde sea responsable.
- Los Records históricos siguen disponibles independientemente del estado del proceso.
- Un proceso puede tener múltiples Records correspondientes a diferentes fechas.
- Si no existen Records, se devuelve una colección vacía.

## Dependencias

- Autenticación.
- Therapeutic Process existente.
- Relación entre Records y proceso.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`, `docs/DB.md`, `docs/DEFINITIONS.md` y `docs/PROJECT_ARCHITECTURE.md`.
- Consultar únicamente los Records asociados al proceso solicitado.
- Aplicar autorización sobre el proceso antes de devolver resultados.

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se agregaron o actualizaron las pruebas necesarias.
- [ ] Las pruebas pasan correctamente.
- [ ] La implementación fue revisada.