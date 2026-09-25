## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar un catálogo específico,
para poder conocer los valores disponibles para utilizarlo dentro del sistema.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir consultar un catálogo global mediante su identificador y devolver la información correspondiente junto con sus opciones disponibles.

## Criterios de aceptación

### CA-01 - Consultar catálogo

Dado que existe un catálogo,
cuando se solicita mediante su identificador,
entonces el sistema debe devolver el catálogo correspondiente.

### CA-02 - Información del catálogo

Dado que se obtiene un catálogo,
entonces la información debe incluir su identificador, tipo, nombre, opciones y la información adicional definida por el contrato del API.

### CA-03 - Opciones

Dado que se consulta un catálogo,
cuando se devuelve su información,
entonces deben incluirse las opciones disponibles correspondientes al catálogo.

### CA-04 - Catálogo global

Dado que el catálogo es global,
cuando un usuario autorizado lo consulta,
entonces el resultado no debe depender de la clínica a la que pertenece el usuario.

### CA-05 - Catálogo inexistente

Dado que no existe un catálogo con el identificador solicitado,
cuando se realiza la consulta,
entonces el sistema debe devolver la respuesta correspondiente a un recurso no encontrado.

### CA-06 - No modificar información

Dado que se consulta un catálogo,
cuando se ejecuta la operación,
entonces no debe modificarse información persistida.

## Reglas de negocio

* Los catálogos son globales.
* Los catálogos no pertenecen a una clínica.
* La consulta debe realizarse utilizando el identificador definido para el recurso.
* La consulta no debe modificar información del catálogo.

## Dependencias

Ninguna.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

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
