## Historia de usuario

Como usuario autenticado de Vera Balance,
quiero verificar mi sesión,
para confirmar que continúa siendo válida y conocer la información correspondiente a mi sesión.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir verificar la sesión actual utilizando el JWT almacenado en la cookie de sesión.

El JWT debe validarse antes de devolver la información correspondiente al usuario autenticado.

## Criterios de aceptación

### CA-01 - Obtener sesión

Dado que se solicita verificar una sesión,
cuando se recibe la solicitud,
entonces el sistema debe obtener el JWT desde la cookie de sesión.

### CA-02 - Cookie obligatoria

Dado que se solicita verificar una sesión,
cuando la cookie de sesión no está presente,
entonces el sistema debe rechazar la operación.

### CA-03 - Validar JWT

Dado que existe una cookie de sesión,
cuando se procesa la solicitud,
entonces el sistema debe validar el JWT contenido en ella.

### CA-04 - JWT inválido

Dado que se proporciona una sesión,
cuando el JWT no es válido,
entonces el sistema debe rechazar la operación.

### CA-05 - JWT expirado

Dado que se proporciona una sesión,
cuando el JWT se encuentra expirado,
entonces el sistema debe rechazar la operación.

### CA-06 - Sesión válida

Dado que el JWT es válido y se encuentra vigente,
cuando finaliza su validación,
entonces el sistema debe considerar válida la sesión.

### CA-07 - Proteger JWT

Dado que la sesión es válida,
cuando se genera la respuesta,
entonces el JWT no debe formar parte del body.

### CA-08 - Proteger contraseña

Dado que se devuelve información relacionada con el usuario autenticado,
cuando se genera la respuesta,
entonces la contraseña y su hash no deben formar parte de ella.

### CA-09 - Respuesta

Dado que la sesión fue validada correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la información definida para el endpoint.

## Reglas de negocio

* La sesión se transporta mediante una cookie.
* El JWT no debe recibirse mediante el body.
* El JWT debe ser válido y encontrarse vigente.
* El JWT no debe devolverse en la respuesta.
* La contraseña y su hash nunca deben exponerse.
* Verificar una sesión no debe crear una nueva sesión.

## Dependencias

* Sesión autenticada.
* Users.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Los detalles de JWT y cookies no deben exponerse en el dominio.

## Referencias

* `docs/baas-vera-balance-dashboard.yaml`
* `docs/DEFINITIONS.md`
* `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] La implementación fue revisada.
