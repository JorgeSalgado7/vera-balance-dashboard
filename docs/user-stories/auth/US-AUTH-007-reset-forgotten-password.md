## Historia de usuario

Como usuario de Vera Balance que solicitó recuperar su contraseña,
quiero establecer una nueva contraseña utilizando el token recibido en mi correo,
para recuperar de forma segura el acceso a mi cuenta.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir establecer una nueva contraseña utilizando un Password Recovery Token válido.

Esta operación no requiere una sesión autenticada ni un Public Operation Token.

La autorización para modificar la contraseña proviene del Password Recovery Token recibido mediante el proceso de recuperación.

## Criterios de aceptación

### CA-01 - Información obligatoria

Dado que se solicita establecer una nueva contraseña,
cuando `recovery_token`, `password` o `password_confirmation` están vacíos o no fueron proporcionados,
entonces el sistema debe rechazar la operación.

### CA-02 - Validar Password Recovery Token

Dado que se proporciona un Password Recovery Token,
cuando se procesa la solicitud,
entonces el sistema debe validar el token.

### CA-03 - Validar vigencia

Dado que se proporciona un Password Recovery Token,
cuando el token se encuentra expirado,
entonces el sistema debe rechazar la operación.

### CA-04 - Validar consumo

Dado que se proporciona un Password Recovery Token,
cuando el token fue consumido previamente,
entonces el sistema debe rechazar la operación.

### CA-05 - Identificar usuario

Dado que el Password Recovery Token es válido,
cuando se procesa la solicitud,
entonces el sistema debe identificar al usuario asociado al token.

### CA-06 - No utilizar identidad proporcionada por el cliente

Dado que se solicita restablecer una contraseña,
cuando se determina el usuario que será modificado,
entonces la identidad debe obtenerse del Password Recovery Token y no de un email o identificador proporcionado libremente por el cliente.

### CA-07 - Confirmar contraseña

Dado que se proporciona una nueva contraseña,
cuando se procesa la solicitud,
entonces `password` y `password_confirmation` deben coincidir.

### CA-08 - Validar antes de persistir

Dado que el Password Recovery Token o las contraseñas no son válidos,
cuando se procesa la solicitud,
entonces la contraseña persistida no debe modificarse.

### CA-09 - Protección de contraseña

Dado que el Password Recovery Token y la nueva contraseña son válidos,
cuando se actualiza el usuario,
entonces la nueva contraseña debe convertirse en un hash antes de persistirse.

### CA-10 - No persistir confirmación

Dado que se proporciona `password_confirmation`,
cuando se actualiza la contraseña,
entonces este valor no debe almacenarse.

### CA-11 - Cambiar contraseña

Dado que el Password Recovery Token es válido y la nueva contraseña cumple las reglas definidas,
cuando se ejecuta la operación,
entonces el sistema debe actualizar la contraseña del usuario asociado al token.

### CA-12 - Consumir Password Recovery Token

Dado que la contraseña fue actualizada correctamente,
cuando finaliza la operación,
entonces el Password Recovery Token debe quedar consumido.

### CA-13 - Evitar reutilización

Dado que un Password Recovery Token fue utilizado correctamente,
cuando se intenta utilizar nuevamente,
entonces el sistema debe rechazar la operación.

### CA-14 - No crear sesión

Dado que la contraseña fue actualizada correctamente,
cuando finaliza la operación,
entonces el sistema no debe crear automáticamente una sesión autenticada.

### CA-15 - Respuesta

Dado que la contraseña fue actualizada correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la respuesta definida para el endpoint.

La contraseña, su confirmación, su hash y el Password Recovery Token no deben formar parte de la respuesta.

## Reglas de negocio

* La operación requiere un Password Recovery Token válido.
* No requiere una sesión autenticada.
* No requiere un Public Operation Token.
* El Password Recovery Token debe encontrarse vigente.
* El Password Recovery Token no debe haber sido consumido.
* La identidad del usuario se obtiene a partir del Password Recovery Token.
* `password` y `password_confirmation` deben coincidir.
* Las validaciones deben realizarse antes de modificar la contraseña.
* La contraseña debe almacenarse únicamente como hash.
* `password_confirmation` nunca debe persistirse.
* El Password Recovery Token debe consumirse después de cambiar correctamente la contraseña.
* Un Password Recovery Token consumido no puede reutilizarse.
* La operación no debe crear automáticamente una sesión.

## Dependencias

* Users.
* Password Recovery Token.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Auth no debe acceder directamente a la persistencia interna de Users.
* Los detalles específicos de DynamoDB no deben exponerse en el dominio.

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
