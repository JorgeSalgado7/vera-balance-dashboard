## Historia de usuario

Como usuario de Vera Balance,
quiero iniciar sesión con mi email y contraseña,
para acceder a las funcionalidades permitidas mediante una sesión autenticada.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir iniciar sesión utilizando el email y contraseña de un usuario.

La operación requiere un Public Operation Token con scope `auth:sign-in`.

Si las credenciales son válidas, el sistema debe generar una sesión y entregar el JWT mediante una cookie `HttpOnly`.

## Criterios de aceptación

### CA-01 - Validar Public Operation Token

Dado que se solicita iniciar sesión,
cuando se recibe la solicitud,
entonces el sistema debe validar el Public Operation Token antes de procesar las credenciales.

### CA-02 - Validar scope

Dado que se proporciona un Public Operation Token,
cuando se solicita iniciar sesión,
entonces el token debe corresponder al scope `auth:sign-in`.

### CA-03 - Validar vigencia

Dado que se proporciona un Public Operation Token,
cuando se valida,
entonces debe encontrarse vigente.

Un token expirado debe ser rechazado.

### CA-04 - Validar consumo

Dado que se proporciona un Public Operation Token,
cuando se valida,
entonces no debe haber sido consumido previamente.

### CA-05 - Consumir Public Operation Token

Dado que el Public Operation Token es válido,
cuando la solicitud es aceptada,
entonces el token debe quedar consumido.

### CA-06 - Información obligatoria

Dado que se intenta iniciar sesión,
cuando `email` o `password` están vacíos o no fueron proporcionados,
entonces el sistema debe rechazar la operación.

### CA-07 - Validar credenciales

Dado que se proporcionan email y contraseña,
cuando se solicita iniciar sesión,
entonces el sistema debe validar las credenciales del usuario.

### CA-08 - Usuario activo

Dado que las credenciales pertenecen a un usuario,
cuando se solicita iniciar sesión,
entonces el usuario debe tener estado `active`.

### CA-09 - Validar contraseña

Dado que existe un usuario activo,
cuando se proporciona la contraseña,
entonces debe compararse de forma segura contra el hash almacenado.

### CA-10 - Credenciales incorrectas

Dado que las credenciales no son válidas,
cuando se intenta iniciar sesión,
entonces el sistema debe rechazar la operación y no debe crear una sesión.

### CA-11 - Crear sesión

Dado que el Public Operation Token y las credenciales son válidos,
cuando el usuario inicia sesión,
entonces el sistema debe generar un JWT de sesión.

### CA-12 - Cookie de sesión

Dado que se genera un JWT de sesión,
cuando finaliza la operación,
entonces debe entregarse mediante la cookie `HttpOnly` definida para la sesión.

### CA-13 - Proteger JWT

Dado que se inicia sesión correctamente,
cuando se genera la respuesta,
entonces el JWT no debe formar parte del body.

### CA-14 - Respuesta

Dado que el usuario inició sesión correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la información definida para el endpoint.

## Reglas de negocio

* El inicio de sesión requiere un Public Operation Token con scope `auth:sign-in`.
* El Public Operation Token debe encontrarse vigente y no consumido.
* El Public Operation Token debe consumirse cuando la solicitud es aceptada.
* Solo usuarios con estado `active` pueden iniciar sesión.
* La contraseña debe validarse contra el hash almacenado.
* Las credenciales incorrectas no deben crear una sesión.
* El JWT debe entregarse mediante una cookie `HttpOnly`.
* El JWT no debe exponerse en el body.
* El Public Operation Token no representa una sesión.

## Dependencias

* Users.
* Public Operation Token.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Auth no debe acceder directamente a la persistencia interna de Users.
* Los detalles de JWT y cookies no deben exponerse en el dominio.

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
