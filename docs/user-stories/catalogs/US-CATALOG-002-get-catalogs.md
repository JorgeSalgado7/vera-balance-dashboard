## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar los catálogos disponibles,
para poder utilizar los valores globales definidos por el sistema.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar todos los catálogos globales disponibles.

Inicialmente el sistema cuenta con los catálogos de estado civil, escolaridad y género, pero la consulta no debe limitarse únicamente a estos catálogos y debe devolver cualquier catálogo global disponible posteriormente.

## Criterios de aceptación

### CA-01 - Consultar catálogos

Dado que existen catálogos registrados,
cuando se solicita la lista de catálogos,
entonces el sistema debe devolver los catálogos disponibles.

### CA-02 - Información del catálogo

Dado que se obtiene un catálogo,
entonces la información debe incluir su identificador, tipo, nombre, opciones y la información adicional definida por el contrato del API.

### CA-03 - Catálogos globales

Dado que los catálogos son globales,
cuando un usuario autorizado consulta los catálogos,
entonces debe obtener los mismos catálogos independientemente de la clínica a la que pertenezca.

### CA-04 - Catálogos iniciales

Dado que se encuentran inicializados los catálogos por defecto,
cuando se solicita la lista,
entonces deben estar disponibles los catálogos `MARITAL_STATUS`, `SCHOOL` y `GENDER`.

### CA-05 - Catálogos adicionales

Dado que posteriormente existen nuevos catálogos globales,
cuando se solicita la lista,
entonces también deben formar parte de la respuesta.

### CA-06 - Sin catálogos registrados

Dado que no existen catálogos registrados,
cuando se solicita la lista,
entonces el sistema debe devolver una lista vacía.

### CA-07 - No modificar información

Dado que se consultan los catálogos,
cuando se ejecuta la operación,
entonces no debe modificarse información persistida.

## Reglas de negocio

* Los catálogos son globales.
* Los catálogos no pertenecen a una clínica.
* Los catálogos iniciales son `MARITAL_STATUS`, `SCHOOL` y `GENDER`.
* La consulta debe devolver todos los catálogos disponibles y no únicamente los catálogos iniciales.
* La consulta no debe modificar información de los catálogos.

## Dependencias

Ninguna.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Los catálogos iniciales deben tratarse como datos iniciales del sistema y no deben crearse como consecuencia de esta consulta.

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
