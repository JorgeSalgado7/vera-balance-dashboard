## Historia de usuario

Como cliente de Vera Balance,
quiero obtener un Public Operation Token,
para poder ejecutar una operación permitida que no requiere una sesión autenticada.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir generar un Public Operation Token temporal para autorizar una operación específica que no requiere una sesión autenticada.

El token debe estar asociado a un scope, tener una vigencia limitada y ser de un solo uso.

## Criterios de aceptación

### CA-01 - Crear Public Operation Token

Dado que se solicita un Public Operation Token,
cuando se proporciona un scope válido,
entonces el sistema debe generar el token correctamente.

### CA-02 - Scope obligatorio

Dado que se solicita generar un Public Operation Token,
cuando el scope está vacío o no fue proporcionado,
entonces el sistema debe rechazar la operación.

### CA-03 - Scope válido

Dado que se solicita generar un Public Operation Token,
cuando se proporciona un scope,
entonces únicamente deben permitirse `users:create`, `auth:sign-in` o `auth:forgot-password`.

### CA-04 - Asociación con scope

Dado que se genera un Public Operation Token,
cuando finaliza su creación,
entonces el token debe quedar asociado exclusivamente al scope solicitado.

Un token generado para un scope no debe permitir ejecutar una operación correspondiente a otro scope.

### CA-05 - Vigencia limitada

Dado que se genera un Public Operation Token,
cuando se registra el token,
entonces debe establecerse su expiración de acuerdo con las reglas definidas para el token.

### CA-06 - Token de un solo uso

Dado que se genera un Public Operation Token,
cuando el token es utilizado correctamente por la operación correspondiente,
entonces debe quedar consumido.

Un token consumido no puede volver a utilizarse.

### CA-07 - Persistencia

Dado que se genera un Public Operation Token,
cuando se persiste la información necesaria para validarlo posteriormente,
entonces debe utilizarse la estructura definida en `docs/DB.md`.

### CA-08 - Protección del token

Dado que el Public Operation Token permite ejecutar una operación protegida,
cuando se persiste,
entonces no debe almacenarse el token en texto plano.

### CA-09 - Sin autenticación previa

Dado que se solicita un Public Operation Token,
cuando se ejecuta la operación,
entonces no debe requerirse una sesión autenticada ni otro Public Operation Token.

### CA-10 - No crear sesión

Dado que se genera un Public Operation Token,
cuando finaliza la operación,
entonces el token no debe representar una sesión autenticada.

### CA-11 - Respuesta

Dado que el Public Operation Token fue generado correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la información definida para el endpoint.

## Reglas de negocio

* Los scopes permitidos son `users:create`, `auth:sign-in` y `auth:forgot-password`.
* Cada Public Operation Token pertenece a un único scope.
* El token tiene una vigencia limitada.
* El token es de un solo uso.
* Un token consumido no puede reutilizarse.
* El token no debe almacenarse en texto plano.
* El Public Operation Token no representa una sesión autenticada.
* El Public Operation Token no puede utilizarse como JWT de sesión.

## Dependencias

Ninguna.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
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
