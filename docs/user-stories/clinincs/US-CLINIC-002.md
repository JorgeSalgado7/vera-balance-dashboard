## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar las clínicas registradas,
para poder conocer las clínicas disponibles dentro del sistema.

Scope: Backend
Status: Done

## Descripción

El sistema debe permitir obtener la lista de clínicas registradas y devolver su información pública.

## Criterios de aceptación

### CA-01 - Consultar clínicas

Dado que existen clínicas registradas,
cuando se solicita la lista de clínicas,
entonces el sistema debe devolver las clínicas disponibles.

### CA-02 - Información de las clínicas

Dado que existen clínicas registradas,
cuando se obtiene la lista,
entonces cada clínica debe incluir su identificador, nombre, logo, dirección, teléfono y tipos de terapia.

### CA-03 - Sin clínicas registradas

Dado que no existen clínicas registradas,
cuando se solicita la lista de clínicas,
entonces el sistema debe devolver una lista vacía.

## Reglas de negocio

* La consulta no debe modificar la información de ninguna clínica.

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
