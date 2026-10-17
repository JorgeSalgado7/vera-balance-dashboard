# US-HOME-WORK-003 — Get Home Work By ID

**Scope:** Backend  
**Status:** Approved

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero consultar una tarea específica asociada a un registro de sesión, para revisar su descripción y estado de cumplimiento.

## Descripción

El sistema debe permitir consultar una Home Work mediante su identificador.

El acceso debe determinarse mediante el Record al que pertenece y su proceso terapéutico.

Los usuarios `clinic` pueden consultar tareas de Records de su clínica.

Los usuarios `therapist` únicamente pueden consultar tareas de Records correspondientes a sus procesos.

## Criterios de aceptación

### CA-01 — Consultar como clinic
Dado que la Home Work pertenece a un Record de su clínica, cuando un usuario `clinic` la consulta mediante su identificador, entonces debe devolverse su información.

### CA-02 — Consultar como therapist
Dado que la Home Work pertenece a un Record de un proceso donde `therapist` es responsable, cuando la consulta, entonces debe devolverse su información.

### CA-03 — Impedir acceso por therapist no asignado
Dado que la tarea pertenece a un proceso de otro terapeuta, cuando `therapist` intenta consultarla, entonces debe rechazarse la operación.

### CA-04 — Impedir acceso entre clínicas
Dado que la tarea pertenece a otra clínica, cuando se intenta consultarla, entonces debe rechazarse la operación.

### CA-05 — Validar relación con Record
Dado que existe una Home Work, cuando se evalúa el acceso, entonces debe identificarse su Record y comprobarse la autorización sobre el proceso relacionado.

### CA-06 — Devolver información
Dado que el usuario tiene acceso, cuando consulta la Home Work, entonces deben devolverse `description`, `is_completed` y los demás campos definidos en el contrato.

### CA-07 — Consultar tarea histórica
Dado que el proceso relacionado ya no está activo, cuando un usuario autorizado consulta la Home Work, entonces debe permitirse la operación.

### CA-08 — Home Work inexistente
Dado que no existe una Home Work con el identificador proporcionado, cuando se consulta, entonces debe indicarse que el recurso no fue encontrado.

### CA-09 — Identificador inválido
Dado que el identificador no cumple con el formato esperado, cuando se realiza la consulta, entonces debe rechazarse la solicitud como inválida.

### CA-10 — Requerir autenticación
Dado que no existe una sesión válida, cuando se consulta la Home Work, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- Cada Home Work pertenece a un Record.
- La autorización se determina mediante el proceso terapéutico del Record.
- `clinic` puede consultar tareas de su clínica.
- `therapist` únicamente puede consultar tareas de sus procesos.
- Las tareas históricas permanecen disponibles conforme a los permisos.
- No deben exponerse tareas de otros terapeutas o clínicas.

## Dependencias

- Home Work existente.
- Record asociado.
- Therapeutic Process relacionado.
- Sesión autenticada.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`.
- Respetar `docs/DB.md`.
- Respetar `docs/DEFINITIONS.md`.
- Respetar `docs/PROJECT_ARCHITECTURE.md`.
- Verificar permisos antes de devolver información de la tarea.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se agregaron o actualizaron las pruebas necesarias.
- [ ] Las pruebas pasan correctamente.
- [ ] La implementación fue revisada.