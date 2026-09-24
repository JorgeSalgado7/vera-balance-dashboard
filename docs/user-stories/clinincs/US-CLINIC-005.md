## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero eliminar una clínica,
para poder retirar del sistema una clínica que ya no debe permanecer registrada.

Scope: Backend
Status: Done

## Descripción

El sistema debe permitir eliminar una clínica existente utilizando su identificador único.

## Criterios de aceptación

### CA-01 - Eliminar clínica existente

Dado que existe una clínica con el identificador proporcionado,
cuando se solicita eliminarla,
entonces el sistema debe eliminar la clínica.

### CA-02 - Verificar existencia

Dado que se solicita eliminar una clínica,
cuando se procesa la operación,
entonces el sistema debe verificar previamente que la clínica existe.

### CA-03 - Clínica inexistente

Dado que no existe una clínica con el identificador proporcionado,
cuando se solicita eliminarla,
entonces el sistema debe indicar que la clínica no fue encontrada.

### CA-04 - Operación completada

Dado que la clínica existe,
cuando se elimina correctamente,
entonces la operación debe finalizar sin devolver información de la clínica eliminada.

## Reglas de negocio

* Una clínica inexistente no puede ser eliminada.
* La eliminación debe realizarse utilizando el identificador único de la clínica.

## Dependencias

US-CLINIC-003 - Consultar clínica por ID.

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

* [x] Todos los criterios de aceptación fueron implementados.
* [x] Se agregaron o actualizaron las pruebas necesarias.
* [x] Las pruebas pasan correctamente.
* [x] La implementación fue revisada.
