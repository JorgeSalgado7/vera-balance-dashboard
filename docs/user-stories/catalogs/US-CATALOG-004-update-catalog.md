## Historia de usuario

Como administrador de Vera Balance,
quiero actualizar un catálogo global,
para mantener actualizados los valores reutilizables disponibles en el sistema.

Scope: Backend
Status: Backlog

## Descripción

El sistema debe permitir modificar la información administrable de un catálogo global existente.

Los catálogos no pertenecen a una clínica y cualquier modificación realizada sobre ellos afecta su uso en todo el sistema.

Esta funcionalidad permanecerá pendiente hasta que exista un mecanismo de administración global que permita autorizar la operación.

## Criterios de aceptación

### CA-01 - Actualizar catálogo

Dado que existe un catálogo,
cuando un administrador autorizado proporciona información válida para actualizarlo,
entonces el sistema debe modificar el catálogo correspondiente.

### CA-02 - Actualización parcial

Dado que se solicita actualizar un catálogo,
cuando se proporciona únicamente parte de la información modificable,
entonces el sistema debe actualizar únicamente los campos proporcionados.

### CA-03 - Actualizar nombre

Dado que se proporciona un nuevo `name`,
cuando se actualiza el catálogo,
entonces el sistema debe almacenar el nuevo nombre.

### CA-04 - Actualizar opciones

Dado que se proporcionan nuevas `options`,
cuando se actualiza el catálogo,
entonces el sistema debe almacenar las nuevas opciones como valores disponibles del catálogo.

### CA-05 - Mantener tipo

Dado que existe un catálogo,
cuando se actualiza,
entonces su `type` no debe modificarse.

### CA-06 - Catálogo global

Dado que se modifica un catálogo,
cuando se persisten los cambios,
entonces la modificación debe aplicar al catálogo global y no a una clínica específica.

### CA-07 - Actualizar fecha

Dado que un catálogo fue modificado,
cuando se persisten los cambios,
entonces debe actualizarse `updated_at`.

### CA-08 - Catálogo inexistente

Dado que no existe un catálogo con el identificador solicitado,
cuando se intenta actualizar,
entonces el sistema debe devolver la respuesta correspondiente a un recurso no encontrado.

### CA-09 - Autorización administrativa

Dado que los catálogos únicamente pueden ser administrados globalmente,
cuando un usuario sin permisos administrativos intenta modificar un catálogo,
entonces el sistema debe rechazar la operación.

### CA-10 - Respuesta

Dado que el catálogo fue actualizado correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la información definida para el endpoint.

## Reglas de negocio

* Los catálogos son globales.
* Los catálogos no pertenecen a una clínica.
* Una modificación afecta el catálogo utilizado por todo el sistema.
* El `type` de un catálogo no puede modificarse.
* El nombre y las opciones pueden modificarse mediante administración global.
* Los usuarios con rol `clinic` o `therapist` no pueden modificar catálogos.
* La modificación de catálogos requiere permisos administrativos globales.
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
