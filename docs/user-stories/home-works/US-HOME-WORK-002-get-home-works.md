# US-HOME-WORK-002 — Get Home Works

**Scope:** Backend  
**Status:** Approved

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero consultar las tareas asociadas a los registros de sesión a los que tengo acceso, para revisar las actividades asignadas durante los procesos terapéuticos.

## Descripción

El sistema debe permitir consultar Home Works respetando los permisos sobre los Records a los que pertenecen.

Cada Home Work está asociada a un Record, y este pertenece a un Therapeutic Process.

Un usuario con rol `clinic` puede consultar las Home Works de todos los Records pertenecientes a procesos de su clínica.

Un usuario con rol `therapist` únicamente puede consultar Home Works de Records pertenecientes a procesos donde sea responsable.

La consulta debe incluir tareas de Records históricos, independientemente del estado actual del proceso terapéutico.

## Criterios de aceptación

### CA-01 — Consultar como clinic
Dado que existe una sesión autenticada con rol `clinic`, cuando consulta las Home Works, entonces deben devolverse las tareas pertenecientes a Records de su clínica.

### CA-02 — Consultar tareas de diferentes terapeutas
Dado que existen Home Works de procesos asignados a distintos terapeutas de la clínica, cuando `clinic` realiza la consulta, entonces deben incluirse las tareas accesibles.

### CA-03 — Consultar como therapist
Dado que existe una sesión autenticada con rol `therapist`, cuando consulta las Home Works, entonces únicamente deben devolverse las tareas pertenecientes a sus procesos.

### CA-04 — Excluir tareas de otros terapeutas
Dado que existen tareas pertenecientes a procesos de otros terapeutas, cuando `therapist` consulta la colección, entonces dichas tareas no deben incluirse.

### CA-05 — Excluir tareas de otras clínicas
Dado que existen Home Works pertenecientes a Records de otras clínicas, cuando se realiza la consulta, entonces dichas tareas no deben exponerse.

### CA-06 — Determinar acceso mediante Record
Dado que una Home Work pertenece a un Record, cuando se evalúa la autorización, entonces debe verificarse el acceso al proceso terapéutico relacionado.

### CA-07 — Consultar tareas históricas
Dado que el proceso asociado ya no está `active`, cuando un usuario autorizado consulta las Home Works, entonces sus tareas existentes deben continuar disponibles.

### CA-08 — Evitar resultados duplicados
Dado que existen múltiples tareas accesibles, cuando se devuelve la colección, entonces cada Home Work debe aparecer una sola vez.

### CA-09 — Devolver colección vacía
Dado que no existen Home Works accesibles, cuando se realiza la consulta, entonces debe devolverse una colección vacía.

### CA-10 — Requerir autenticación
Dado que no existe una sesión válida, cuando se consultan las Home Works, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- La visibilidad de las Home Works depende de sus Records.
- `clinic` puede consultar tareas de todos los procesos de su clínica.
- `therapist` únicamente puede consultar tareas de sus procesos.
- No deben exponerse tareas de otras clínicas.
- Los cambios de estado del proceso no eliminan ni ocultan automáticamente las tareas históricas.
- Si no existen tareas accesibles, se devuelve una colección vacía.

## Dependencias

- Autenticación.
- Home Works existentes.
- Records asociados.
- Therapeutic Processes relacionados.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`.
- Respetar `docs/DB.md`.
- Respetar `docs/DEFINITIONS.md`.
- Respetar `docs/PROJECT_ARCHITECTURE.md`.
- Resolver la autorización mediante la relación Home Work → Record → Therapeutic Process.
- Aplicar filtros de acceso antes de devolver resultados.

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