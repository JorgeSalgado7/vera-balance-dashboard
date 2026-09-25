## Historia de usuario

Como consumidor del API de Vera Balance,
quiero recibir respuestas de error con una estructura consistente,
para poder identificar y manejar correctamente los errores producidos por el sistema.

Scope: Backend
Status: Approved

## Descripción

El sistema debe estandarizar la traducción de errores de dominio a respuestas HTTP utilizando el mecanismo global de manejo de errores.

Los errores específicos del dominio deben conservarse y transformarse en las respuestas HTTP correspondientes sin exponer información interna del sistema.

## Criterios de aceptación

### CA-01 - Manejar errores globalmente

Dado que ocurre un error conocido durante una operación,
cuando el error llega a la capa HTTP,
entonces debe ser procesado mediante el mecanismo global definido por el proyecto.

### CA-02 - Mantener errores específicos

Dado que una regla de dominio produce un error específico,
cuando el error es procesado,
entonces debe conservarse su significado y no debe sustituirse por un error genérico.

### CA-03 - Traducir status HTTP

Dado que ocurre un error conocido,
cuando se genera la respuesta HTTP,
entonces debe utilizarse el status correspondiente definido por el contrato del API.

### CA-04 - Estructura de respuesta

Dado que se genera una respuesta de error,
cuando se devuelve al cliente,
entonces debe respetar la estructura definida en el contrato HTTP.

### CA-05 - Autenticación

Dado que una solicitud no cuenta con una credencial válida,
cuando se rechaza por falta de autenticación,
entonces debe utilizarse la respuesta correspondiente a una solicitud no autenticada.

### CA-06 - Autorización

Dado que un usuario está autenticado pero no cuenta con permisos suficientes,
cuando se rechaza la operación,
entonces debe utilizarse la respuesta correspondiente a una operación no autorizada.

### CA-07 - Errores inesperados

Dado que ocurre un error inesperado,
cuando se genera la respuesta,
entonces el sistema no debe exponer información interna sensible.

### CA-08 - Proteger información sensible

Dado que se genera una respuesta de error,
cuando se devuelve al cliente,
entonces no debe exponer contraseñas, hashes, tokens, stack traces u otra información sensible.

## Reglas de negocio

* Los errores de dominio deben permanecer independientes de HTTP.
* Los errores específicos no deben reemplazarse por errores genéricos.
* La traducción de errores a HTTP debe realizarse en la capa correspondiente.
* Una solicitud sin autenticación válida debe diferenciarse de un usuario autenticado sin autorización.
* Las respuestas de error no deben exponer información sensible.

## Dependencias

Ninguna.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Debe utilizarse el mecanismo global de manejo de errores definido por el proyecto.
* Los errores de dominio no deben depender de conceptos HTTP.

## Referencias

* `docs/baas-vera-balance-dashboard.yaml`
* `docs/DEFINITIONS.md`
* `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] La implementación fue revisada.
