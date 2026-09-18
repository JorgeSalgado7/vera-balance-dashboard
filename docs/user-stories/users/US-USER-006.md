## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero cambiar el estado de un usuario,
para poder activar o desactivar su acceso dentro del sistema sin eliminar su información.

Scope: Backend
Status: Backlog

## Descripción

El sistema debe permitir modificar únicamente el estado de un usuario existente.

Los estados disponibles para un usuario son `active` e `inactive`.

El cambio de estado debe realizarse de forma independiente a la actualización general de la información del usuario.

## Criterios de aceptación

### CA-01 - Cambiar estado correctamente

Dado que existe un usuario,
cuando se solicita cambiar su estado con un valor válido,
entonces el sistema debe actualizar el estado correctamente.

### CA-02 - Activar usuario

Dado que existe un usuario con estado `inactive`,
cuando se solicita cambiar su estado a `active`,
entonces el usuario debe quedar con estado `active`.

### CA-03 - Desactivar usuario

Dado que existe un usuario con estado `active`,
cuando se solicita cambiar su estado a `inactive`,
entonces el usuario debe quedar con estado `inactive`.

### CA-04 - Validar estado

Dado que se solicita cambiar el estado de un usuario,
cuando el estado proporcionado es diferente de `active` o `inactive`,
entonces el sistema debe rechazar la operación.

### CA-05 - Usuario inexistente

Dado que no existe un usuario con el identificador proporcionado,
cuando se solicita cambiar su estado,
entonces el sistema debe indicar que el usuario no fue encontrado.

### CA-06 - Actualizar fecha de modificación

Dado que el estado de un usuario fue modificado,
cuando finaliza la operación,
entonces debe actualizarse su fecha de última modificación.

### CA-07 - Mantener información del usuario

Dado que se modifica el estado de un usuario,
cuando finaliza la operación,
entonces el resto de su información debe conservarse sin modificaciones.

## Reglas de negocio

* Los únicos estados permitidos para un usuario son `active` e `inactive`.
* El cambio de estado no debe modificar el resto de la información del usuario.
* Un usuario debe existir antes de poder modificar su estado.
* El cambio de estado debe actualizar `updated_at`.

## Dependencias

* US-USER-003 - Consultar usuario por ID.

## Consideraciones técnicas

* El endpoint debe ser `PATCH /v1/users/{id}/status`.
* El contrato HTTP debe respetar `docs/openapi.yaml`.
* La persistencia debe respetar `docs/database.md`.
* La implementación debe respetar `docs/architecture-guidelines.md`.
* Los detalles específicos de DynamoDB no deben exponerse en el dominio.
* La lógica de cambio de estado debe permanecer separada de la actualización general del usuario.

## Referencias

* `docs/database.md`
* `docs/openapi.yaml`
* `docs/definitions.md`
* `docs/architecture-guidelines.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] El proyecto compila correctamente.
* [ ] La documentación técnica fue actualizada cuando corresponde.
* [ ] La implementación fue revisada.
