# US-RECORD-003 — Get Record By ID

**Scope:** Backend  
**Status:** Approved  
**Método:** `GET /v1/records/{id}`

## Historia de usuario

Como usuario autorizado de Vera Balance, quiero consultar un registro de sesión específico, para revisar la información documentada durante una sesión terapéutica.

## Descripción

El sistema debe recuperar un Record por su identificador, comprobando la autorización mediante el proceso terapéutico al que pertenece.

La consulta debe estar disponible para usuarios `clinic` de la misma clínica y usuarios `therapist` asignados al proceso.

## Criterios de aceptación

### CA-01 — Consultar como clinic
Dado que el Record pertenece a un proceso de la clínica autenticada, cuando un usuario `clinic` lo consulta, entonces debe devolverse su información.

### CA-02 — Consultar como therapist
Dado que el Record pertenece a un proceso asignado al terapeuta autenticado, cuando lo consulta, entonces debe devolverse su información.

### CA-03 — Impedir acceso de therapist no asignado
Dado que el Record pertenece a un proceso de otro terapeuta, cuando un usuario `therapist` intenta consultarlo, entonces debe rechazarse la operación.

### CA-04 — Impedir acceso entre clínicas
Dado que el Record pertenece a otra clínica, cuando se intenta consultarlo, entonces debe rechazarse la operación.

### CA-05 — Consultar Record histórico
Dado que el proceso ya no tiene `status = active`, cuando un usuario autorizado consulta un Record existente, entonces debe poder recuperarlo.

### CA-06 — Devolver información del Record
Dado que el usuario tiene acceso, cuando consulta el Record, entonces deben devolverse los campos definidos en el contrato, incluyendo las referencias a Home Works cuando corresponda.

### CA-07 — Record inexistente
Dado que el identificador no corresponde a un Record existente, cuando se consulta, entonces debe devolverse un error de recurso no encontrado.

### CA-08 — Identificador inválido
Dado que el identificador tiene un formato inválido, cuando se consulta, entonces debe rechazarse la solicitud.

### CA-09 — Requerir autenticación
Dado que no existe una sesión válida, cuando se intenta consultar el Record, entonces debe rechazarse la operación como no autenticada.

## Reglas de negocio

- La autorización del Record depende de su proceso terapéutico.
- `clinic` puede consultar Records de su clínica.
- `therapist` únicamente puede consultar Records de sus procesos.
- Los Records históricos siguen siendo consultables.
- La consulta no debe modificar el Record ni sus Home Works.

## Dependencias

- Autenticación.
- Record existente.
- Therapeutic Process asociado.

## Consideraciones técnicas

- Respetar `docs/baas-vera-balance-dashboard.yaml`, `docs/DB.md`, `docs/DEFINITIONS.md` y `docs/PROJECT_ARCHITECTURE.md`.
- Validar el identificador.
- Verificar la autorización antes de devolver información clínica.

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se agregaron o actualizaron las pruebas necesarias.
- [ ] Las pruebas pasan correctamente.
- [ ] La implementación fue revisada.