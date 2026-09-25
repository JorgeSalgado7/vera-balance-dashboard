## Historia de usuario

Como administrador de Vera Balance,
quiero crear catálogos globales,
para poder incorporar nuevos valores reutilizables requeridos por el sistema.

Scope: Backend
Status: Backlog

## Descripción

El sistema debe permitir crear nuevos catálogos globales que puedan ser utilizados por los diferentes módulos de Vera Balance.

Los catálogos son información global del sistema y no pertenecen a una clínica específica.

Esta funcionalidad permanecerá pendiente hasta que el sistema cuente con un mecanismo de administración global que permita autorizar esta operación.

## Criterios de aceptación

### CA-01 - Crear catálogo

Dado que un administrador autorizado solicita crear un catálogo,
cuando proporciona información válida,
entonces el sistema debe registrar el nuevo catálogo.

### CA-02 - Información obligatoria

Dado que se solicita crear un catálogo,
cuando `type`, `name` u `options` están vacíos o no fueron proporcionados,
entonces el sistema debe rechazar la operación.

### CA-03 - Tipo de catálogo

Dado que se proporciona un `type`,
cuando se crea el catálogo,
entonces el tipo debe utilizarse para identificar el catálogo de acuerdo con la estructura definida para Catalogs.

### CA-04 - Tipo único

Dado que existe un catálogo con el mismo `type`,
cuando se intenta crear otro catálogo con ese tipo,
entonces el sistema debe rechazar la operación.

### CA-05 - Opciones

Dado que se crea un catálogo,
cuando se proporcionan sus opciones,
entonces el sistema debe almacenarlas como los valores disponibles para dicho catálogo.

### CA-06 - Catálogo global

Dado que se crea un catálogo,
cuando se persiste,
entonces no debe asociarse a una clínica específica.

### CA-07 - Registrar fechas

Dado que se crea un catálogo,
cuando se persiste,
entonces el sistema debe registrar `created_at` y `updated_at`.

### CA-08 - Autorización administrativa

Dado que los catálogos únicamente pueden ser administrados globalmente,
cuando un usuario sin permisos administrativos intenta crear un catálogo,
entonces el sistema debe rechazar la operación.

### CA-09 - Respuesta

Dado que el catálogo fue creado correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la información definida para el endpoint.

## Reglas de negocio

* Los catálogos son globales.
* Los catálogos no pertenecen a una clínica.
* El `type` identifica el tipo de catálogo.
* No pueden existir dos catálogos con el mismo `type`.
* Los usuarios con rol `clinic` o `therapist` no pueden crear catálogos.
* La creación de catálogos requiere permisos administrativos globales.
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
