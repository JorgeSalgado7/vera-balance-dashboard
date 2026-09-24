## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar una clínica específica,
para poder conocer su información.

Scope: Backend
Status: Done

## Descripción

El sistema debe permitir consultar una clínica mediante su identificador único.

## Criterios de aceptación

### CA-01 - Consultar clínica existente

Dado que existe una clínica con el identificador proporcionado,
cuando se solicita la clínica,
entonces el sistema debe devolver su información.

### CA-02 - Información de la clínica

Dado que la clínica existe,
cuando se obtiene su información,
entonces la respuesta debe incluir su identificador, nombre, logo, dirección, teléfono y tipos de terapia.

### CA-03 - Clínica inexistente

Dado que no existe una clínica con el identificador proporcionado,
cuando se intenta consultarla,
entonces el sistema debe indicar que la clínica no fue encontrada.

## Reglas de negocio

* La consulta debe realizarse utilizando el identificador único de la clínica.
* La consulta no debe modificar la información de la clínica.

## Dependencias

Ninguna.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/openapi.yaml`.
* La persistencia debe respetar `docs/database.md`.
* La implementación debe respetar `docs/architecture-guidelines.md`.
* Los detalles específicos de DynamoDB no deben exponerse en la respuesta HTTP.

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
