## Historia de usuario

Como usuario autenticado de Vera Balance,
quiero cambiar mi contraseña,
para actualizar mis credenciales de acceso.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir que un usuario con una sesión autenticada establezca una nueva contraseña.

La identidad del usuario debe obtenerse de la sesión autenticada y no mediante un email o identificador proporcionado en el request.

## Criterios de aceptación

### CA-01 - Requerir sesión

Dado que se solicita cambiar una contraseña,
cuando se recibe la solicitud,
entonces debe existir una sesión autenticada válida.

### CA-02 - Identificar usuario

Dado que existe una sesión autenticada,
cuando se solicita cambiar la contraseña,
entonces la identidad del usuario debe obtenerse de la sesión.

### CA-03 - Información obligatoria

Dado que se solicita cambiar la contraseña,
cuando `password` o `password_confirmation` están vacíos o no fueron proporcionados,
entonces el sistema debe rechazar la operación.

### CA-04 - Confirmar contraseña

Dado que se proporciona una nueva contraseña,
cuando se procesa la solicitud,
entonces `password` y `password_confirmation` deben coincidir.

### CA-05 - Validar antes de persistir

Dado que se solicita cambiar la contraseña,
cuando las contraseñas no coinciden,
entonces el sistema debe rechazar la operación antes de modificar información persistida.

### CA-06 - Protección de contraseña

Dado que la nueva contraseña es válida,
cuando se actualiza el usuario,
entonces debe convertirse en un hash antes de persistirse.

### CA-07 - No persistir confirmación

Dado que se proporciona `password_confirmation`,
cuando se actualiza la contraseña,
entonces este valor no debe almacenarse.

### CA-08 - Actualizar usuario autenticado

Dado que la nueva contraseña es válida,
cuando se ejecuta la operación,
entonces debe modificarse la contraseña del usuario identificado mediante la sesión.

### CA-09 - Respuesta

Dado que la contraseña fue actualizada correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la respuesta definida para el endpoint.

La contraseña, su confirmación y su hash no deben formar parte de la respuesta.

## Reglas de negocio

* La operación requiere una sesión autenticada.
* La identidad del usuario se obtiene de la sesión.
* `password` y `password_confirmation` deben coincidir.
* La validación debe realizarse antes de generar el hash.
* `password_confirmation` nunca debe persistirse.
* Las contraseñas nunca deben almacenarse en texto plano.
* La contraseña y su hash nunca deben exponerse mediante el API.
* Esta operación es independiente de la recuperación de una contraseña olvidada.

## Dependencias

* Users.
* Sesión autenticada.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Auth no debe acceder directamente a la persistencia interna de Users.

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
