## Historia de usuario

Como administrador de Vera Balance,
quiero eliminar un catálogo global,
para retirar del sistema catálogos que ya no deben estar disponibles.

Scope: Backend
Status: Backlog

## Descripción

El sistema debe permitir eliminar catálogos globales creados para el uso del sistema.

Los catálogos iniciales forman parte de la configuración base de Vera Balance y no deben poder eliminarse.

Esta funcionalidad permanecerá pendiente hasta que exista un mecanismo de administración global que permita autorizar la operación.

## Criterios de aceptación

### CA-01 - Eliminar catálogo

Dado que existe un catálogo que puede eliminarse,
cuando un administrador autorizado solicita eliminarlo,
entonces el sistema debe eliminar el catálogo correspondiente.

### CA-02 - Catálogo global

Dado que se elimina un catálogo,
cuando se ejecuta la operación,
entonces la eliminación debe aplicar al catálogo global y no a información de una clínica específica.

### CA-03 - Proteger catálogo MARITAL_STATUS

Dado que `MARITAL_STATUS` es un catálogo inicial del sistema,
cuando se intenta eliminar,
entonces el sistema debe rechazar la operación.

### CA-04 - Proteger catálogo SCHOOL

Dado que `SCHOOL` es un catálogo inicial del sistema,
cuando se intenta eliminar,
entonces el sistema debe rechazar la operación.

### CA-05 - Proteger catálogo GENDER

Dado que `GENDER` es un catálogo inicial del sistema,
cuando se intenta eliminar,
entonces el sistema debe rechazar la operación.

### CA-06 - Catálogo inexistente

Dado que no existe un catálogo con el identificador solicitado,
cuando se intenta eliminar,
entonces el sistema debe devolver la respuesta correspondiente a un recurso no encontrado.

### CA-07 - Autorización administrativa

Dado que los catálogos únicamente pueden ser administrados globalmente,
cuando un usuario sin permisos administrativos intenta eliminar un catálogo,
entonces el sistema debe rechazar la operación.

### CA-08 - Respuesta

Dado que un catálogo fue eliminado correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la respuesta definida para el endpoint.

## Reglas de negocio

* Los catálogos son globales.
* Los catálogos no pertenecen a una clínica.
* `MARITAL_STATUS`, `SCHOOL` y `GENDER` son catálogos iniciales del sistema.
* Los catálogos iniciales no pueden eliminarse.
* Los usuarios con rol `clinic` o `therapist` no pueden eliminar catálogos.
* La eliminación de catálogos requiere permisos administrativos globales.
* No debe implementarse un nuevo rol administrativo como parte de esta historia de usuario.

## Dependencias

* Definición del mecanismo de administración global del sistema.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Esta historia no debe implementarse hasta que exista el mecanismo de autorización administrativa correspondiente.

## Referencias

* `docs/DB.md`
* `docs/baas-vera-balance-dashboard.yaml`
* `docs/DEFINITIONS.md`
* `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] La implementación fue revisada.
