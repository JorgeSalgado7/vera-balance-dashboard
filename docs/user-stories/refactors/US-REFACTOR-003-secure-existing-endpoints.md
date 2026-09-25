## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero que los endpoints existentes validen autenticación y autorización,
para proteger la información del sistema y evitar accesos a recursos que no me corresponden.

Scope: Backend
Status: Approved

## Descripción

El sistema debe proteger los endpoints existentes utilizando los mecanismos de autenticación definidos para cada operación.

Además de validar la identidad del usuario, el backend debe aplicar las reglas de autorización correspondientes al rol, clínica y propiedad de los recursos.

## Criterios de aceptación

### CA-01 - Proteger endpoints autenticados

Dado que un endpoint requiere una sesión autenticada,
cuando se recibe una solicitud,
entonces el sistema debe validar la sesión antes de permitir la operación.

### CA-02 - Sesión ausente

Dado que un endpoint requiere autenticación,
cuando la solicitud no contiene una sesión,
entonces el sistema debe rechazar la operación.

### CA-03 - Sesión inválida

Dado que un endpoint requiere autenticación,
cuando la sesión proporcionada no es válida,
entonces el sistema debe rechazar la operación.

### CA-04 - Sesión expirada

Dado que un endpoint requiere autenticación,
cuando la sesión se encuentra expirada,
entonces el sistema debe rechazar la operación.

### CA-05 - Identificar usuario

Dado que existe una sesión válida,
cuando se procesa una operación protegida,
entonces el sistema debe obtener la identidad del usuario desde la sesión.

### CA-06 - Validar autorización

Dado que un usuario se encuentra autenticado,
cuando intenta ejecutar una operación sobre un recurso,
entonces el sistema debe validar que tenga autorización para realizarla.

### CA-07 - Validar clínica

Dado que un usuario intenta acceder a un recurso asociado a una clínica,
cuando se procesa la operación,
entonces el sistema debe validar las reglas de acceso a la clínica definidas para su rol.

### CA-08 - Rol clinic

Dado que un usuario tiene rol `clinic`,
cuando accede a recursos protegidos,
entonces únicamente debe poder operar sobre los recursos permitidos de su clínica.

### CA-09 - Rol therapist

Dado que un usuario tiene rol `therapist`,
cuando accede a recursos protegidos,
entonces únicamente debe poder operar sobre los recursos permitidos de acuerdo con su relación con ellos.

### CA-10 - Eliminar pacientes

Dado que un usuario tiene rol `therapist`,
cuando intenta eliminar directamente un paciente,
entonces el sistema debe rechazar la operación.

### CA-11 - Crear usuario

Dado que se solicita crear un usuario,
cuando se procesa `POST /v1/users`,
entonces la operación debe requerir un Public Operation Token con scope `users:create`.

### CA-12 - Iniciar sesión

Dado que se solicita iniciar sesión,
cuando se procesa `POST /v1/auth/sign-in`,
entonces la operación debe requerir un Public Operation Token con scope `auth:sign-in`.

### CA-13 - Recuperar contraseña

Dado que se solicita iniciar una recuperación de contraseña,
cuando se procesa `POST /v1/auth/forgot-password`,
entonces la operación debe requerir un Public Operation Token con scope `auth:forgot-password`.

### CA-14 - Crear Public Operation Token

Dado que se solicita crear un Public Operation Token,
cuando se procesa `POST /v1/auth/public-token`,
entonces la operación no debe requerir una sesión autenticada ni otro Public Operation Token.

### CA-15 - Restablecer contraseña olvidada

Dado que se solicita establecer una nueva contraseña mediante recuperación,
cuando se procesa `POST /v1/auth/forgot-password/reset`,
entonces la operación debe utilizar un Password Recovery Token y no debe requerir una Session Cookie o Public Operation Token.

### CA-16 - Scope incorrecto

Dado que una operación requiere un Public Operation Token,
cuando el token corresponde a otro scope,
entonces el sistema debe rechazar la operación.

### CA-17 - Token expirado o consumido

Dado que una operación requiere un Public Operation Token,
cuando el token está expirado o ya fue consumido,
entonces el sistema debe rechazar la operación.

### CA-18 - Diferenciar autenticación y autorización

Dado que un usuario se encuentra autenticado pero no tiene autorización para ejecutar una operación,
cuando se procesa la solicitud,
entonces el sistema debe rechazarla como una operación no autorizada sin tratarla como ausencia de autenticación.

### CA-19 - Seguridad independiente del frontend

Dado que el frontend puede ocultar o restringir determinadas acciones,
cuando una solicitud llega al backend,
entonces las reglas de autenticación y autorización deben validarse nuevamente en el backend.

## Reglas de negocio

* Los endpoints protegidos deben validar la sesión en el backend.
* La autenticación determina la identidad del usuario.
* La autorización determina si el usuario puede ejecutar una operación sobre un recurso.
* Un usuario `clinic` únicamente puede operar sobre los recursos permitidos de su clínica.
* Un usuario `therapist` únicamente puede operar sobre los recursos permitidos de acuerdo con su relación con ellos.
* Un usuario `therapist` no puede eliminar directamente pacientes.
* `POST /v1/users` utiliza Public Operation Token con scope `users:create`.
* `POST /v1/auth/sign-in` utiliza Public Operation Token con scope `auth:sign-in`.
* `POST /v1/auth/forgot-password` utiliza Public Operation Token con scope `auth:forgot-password`.
* `POST /v1/auth/public-token` no requiere autenticación previa.
* `POST /v1/auth/forgot-password/reset` utiliza Password Recovery Token.
* Las restricciones del frontend no sustituyen las validaciones del backend.

## Dependencias

* Auth.
* Users.
* Clinics.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La autenticación transversal debe implementarse mediante los mecanismos definidos por la arquitectura.
* Los módulos no deben acceder directamente a la persistencia interna de otros módulos.
* Los detalles de JWT, cookies y tokens no deben exponerse en el dominio.

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
