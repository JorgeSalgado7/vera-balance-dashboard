## Historia de usuario

Como usuario de Vera Balance que olvidó su contraseña,
quiero solicitar la recuperación de mi cuenta,
para recibir en mi correo un mecanismo seguro que me permita establecer una nueva contraseña.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir iniciar el proceso de recuperación de contraseña utilizando el email asociado a una cuenta.

La operación requiere un Public Operation Token con scope `auth:forgot-password`.

Si existe un usuario asociado al email, el sistema debe generar un Password Recovery Token y enviarlo al correo registrado.

La respuesta no debe revelar si el email proporcionado corresponde o no a un usuario existente.

## Criterios de aceptación

### CA-01 - Validar Public Operation Token

Dado que se solicita recuperar una contraseña,
cuando se recibe la solicitud,
entonces el sistema debe validar el Public Operation Token.

### CA-02 - Validar scope

Dado que se proporciona un Public Operation Token,
cuando se solicita recuperar una contraseña,
entonces debe corresponder al scope `auth:forgot-password`.

### CA-03 - Validar vigencia

Dado que se proporciona un Public Operation Token,
cuando se valida,
entonces debe encontrarse vigente.

### CA-04 - Validar consumo

Dado que se proporciona un Public Operation Token,
cuando se valida,
entonces no debe haber sido consumido previamente.

### CA-05 - Consumir Public Operation Token

Dado que el Public Operation Token es válido,
cuando la solicitud es aceptada,
entonces el token debe quedar consumido.

### CA-06 - Información obligatoria

Dado que se solicita recuperar una contraseña,
cuando `email` está vacío o no fue proporcionado,
entonces el sistema debe rechazar la operación.

### CA-07 - Consultar usuario

Dado que se proporciona un email,
cuando se procesa la solicitud,
entonces el sistema debe consultar si existe un usuario asociado.

### CA-08 - Proteger existencia del usuario

Dado que se proporciona un email,
cuando existe o no existe un usuario asociado,
entonces la respuesta no debe permitir determinar si la cuenta existe.

### CA-09 - Generar Password Recovery Token

Dado que existe un usuario asociado al email,
cuando se procesa la solicitud,
entonces el sistema debe generar un Password Recovery Token asociado al usuario.

### CA-10 - Vigencia del Password Recovery Token

Dado que se genera un Password Recovery Token,
cuando se registra,
entonces debe tener una vigencia limitada.

### CA-11 - Token de un solo uso

Dado que se genera un Password Recovery Token,
cuando posteriormente es utilizado correctamente para cambiar la contraseña,
entonces debe poder quedar consumido.

### CA-12 - Protección del Password Recovery Token

Dado que se genera un Password Recovery Token,
cuando se persiste,
entonces no debe almacenarse en texto plano.

### CA-13 - Enviar correo

Dado que existe un usuario asociado al email y se genera un Password Recovery Token,
cuando se procesa la recuperación,
entonces el sistema debe enviar al correo registrado el mecanismo necesario para continuar con la recuperación.

### CA-14 - No exponer Password Recovery Token

Dado que se genera un Password Recovery Token,
cuando se devuelve la respuesta del API,
entonces el token no debe formar parte de ella.

### CA-15 - No modificar contraseña

Dado que se inicia el proceso de recuperación,
cuando finaliza esta operación,
entonces la contraseña actual del usuario no debe modificarse.

### CA-16 - Respuesta

Dado que la solicitud fue procesada,
cuando finaliza la operación,
entonces el sistema debe devolver la respuesta definida para el endpoint sin revelar si el email existe.

## Reglas de negocio

* La operación requiere un Public Operation Token con scope `auth:forgot-password`.
* El Public Operation Token debe encontrarse vigente y no consumido.
* El Public Operation Token únicamente autoriza la solicitud inicial.
* La respuesta no debe revelar si el email pertenece a un usuario registrado.
* El Password Recovery Token se genera únicamente cuando existe el usuario.
* El Password Recovery Token debe estar asociado al usuario.
* El Password Recovery Token tiene una vigencia limitada.
* El Password Recovery Token es de un solo uso.
* El Password Recovery Token no debe almacenarse en texto plano.
* El Password Recovery Token no representa una sesión autenticada.
* El Password Recovery Token no debe devolverse mediante el API.
* La contraseña actual no debe modificarse durante esta operación.

## Dependencias

* Users.
* Public Operation Token.
* Servicio de envío de correo.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Auth no debe acceder directamente a la persistencia interna de Users.
* El envío de correo debe realizarse mediante la abstracción definida por la arquitectura.
* Los detalles específicos del proveedor de correo no deben formar parte del dominio.

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
