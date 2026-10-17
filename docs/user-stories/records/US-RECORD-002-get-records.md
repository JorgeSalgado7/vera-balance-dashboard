# US-RECORD-002 — Get Records

**Scope:** Backend  
**Status:** Approved  
**Método:** `GET /v1/records`

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero consultar los registros de sesiones a los que tengo acceso, para revisar el seguimiento de los procesos terapéuticos correspondientes.

## Descripción

El sistema debe permitir consultar Records respetando la clínica, el rol y la asignación del terapeuta responsable.

Un usuario `clinic` puede consultar los Records de todos los procesos de su clínica.

Un usuario `therapist` únicamente puede consultar los Records de procesos donde sea el terapeuta asignado.

Los Records históricos deben permanecer disponibles aunque el proceso ya no esté activo.

## Criterios de aceptación

### CA-01 — Consultar como clinic
Dado que existe una sesión `clinic`, cuando se consultan los Records, entonces se deben devolver los registros de procesos pertenecientes a su clínica.

### CA-02 — Incluir Records de otros terapeutas
Dado que existen procesos asignados a diferentes terapeutas de la misma clínica, cuando `clinic` consulta los Records, entonces debe poder recuperar sus registros.

### CA-03 — Consultar como therapist
Dado que existe una sesión `therapist`, cuando consulta los Records, entonces únicamente deben devolverse los de procesos donde sea responsable.

### CA-04 — Excluir Records de otros terapeutas
Dado que existen Records de procesos asignados a otros terapeutas, cuando `therapist` consulta la colección, entonces dichos registros no deben incluirse.

### CA-05 — Aislamiento entre clínicas
Dado que existen Records de otras clínicas, cuando se realiza la consulta, entonces no deben exponerse.

### CA-06 — Consultar Records históricos
Dado que un proceso cambió a `inactive`, `discharged` o `unfinished`, cuando un usuario autorizado consulta sus Records, entonces estos deben continuar disponibles.

### CA-07 — Devolver colección vacía
Dado que no existen Records accesibles, cuando se consulta la colección, entonces el sistema debe devolver una colección vacía.

### CA-08 — Respetar contrato de respuesta
Dado que existen Records accesibles, cuando se realiza la consulta, entonces los campos devueltos deben corresponder al contrato del API.

### CA-09 — Requerir autenticación
Dado que no existe una sesión válida, cuando se consultan los Records, entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

- `clinic` puede consultar Records de todos los procesos de su clínica.
- `therapist` únicamente puede consultar Records de sus procesos.
- No deben exponerse Records de otras clínicas.
- El estado del proceso no impide consultar sus Records históricos.
- Si no existen resultados accesibles, se devuelve una colección vacía.

## Dependencias

- Autenticación.
- Therapeutic Process.
- Relación entre Record y proceso terapéutico.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`, `docs/DB.md`, `docs/DEFINITIONS.md` y `docs/PROJECT_ARCHITECTURE.md`.
- Aplicar los filtros de acceso desde la consulta o el caso de uso, evitando devolver datos no autorizados.
- Mantener la estrategia de consulta y paginación definida por el contrato.

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se agregaron o actualizaron las pruebas necesarias.
- [ ] Las pruebas pasan correctamente.
- [ ] La implementación fue revisada.