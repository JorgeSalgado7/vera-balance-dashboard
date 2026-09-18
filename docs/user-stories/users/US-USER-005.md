## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero eliminar un usuario,
para retirar del sistema un usuario que ya no debe permanecer registrado.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir eliminar un usuario existente utilizando su identificador único.

## Criterios de aceptación

### CA-01 - Eliminar usuario existente

Dado que existe un usuario con el identificador proporcionado,
cuando se solicita eliminarlo,
entonces el sistema debe eliminar el usuario.

### CA-02 - Verificar existencia

Dado que se solicita eliminar un usuario,
cuando se procesa la operación,
entonces el sistema debe verificar previamente que el usuario existe.

### CA-03 - Usuario inexistente

Dado que no existe un usuario con el identificador proporcionado,
cuando se solicita eliminarlo,
entonces el sistema debe indicar que el usuario no fue encontrado.

### CA-04 - Operación completada

Dado que el usuario existe,
cuando se elimina correctamente,
entonces la operación debe finalizar sin devolver información del usuario eliminado.

## Reglas de negocio

* Un usuario inexistente no puede ser eliminado.
* La eliminación debe realizarse utilizando el identificador único del usuario.

## Dependencias

* US-USER-003 - Consultar usuario por ID.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/openapi.yaml`.
* La persistencia debe respetar `docs/database.md`.
* La implementación debe respetar `docs/architecture-guidelines.md`.

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
