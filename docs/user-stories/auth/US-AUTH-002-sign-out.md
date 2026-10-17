# US-AUTH-002 — Sign Out

## Historia de usuario

Como usuario autenticado de Vera Balance,  
quiero cerrar mi sesión,  
para finalizar mi acceso al sistema desde el navegador actual.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir cerrar la sesión del usuario autenticado mediante:

`POST /v1/auth/sign-out`

El endpoint requiere una sesión autenticada válida.

El cierre de sesión deberá eliminar la cookie `vera_balance_session` del navegador.

Debido a que Vera Balance utiliza JWT stateless, el cierre de sesión no implica la revocación criptográfica de un JWT previamente emitido.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita cerrar sesión,  
cuando el sistema recibe la solicitud,  
entonces debe validar la sesión autenticada.

Si no existe una sesión válida, debe aplicar la respuesta definida en OpenAPI para solicitudes no autenticadas.

### CA-02 - Cerrar sesión correctamente

Dado que existe una sesión válida,  
cuando se solicita cerrar sesión,  
entonces el sistema debe enviar una instrucción HTTP para eliminar la cookie `vera_balance_session`.

### CA-03 - Eliminar cookie

Dado que se cierra la sesión,  
cuando se genera la respuesta,  
entonces la cookie debe invalidarse en el navegador utilizando el mismo nombre y atributos de alcance correspondientes.

La expiración deberá establecerse de forma que el navegador deje de enviarla.

### CA-04 - No exponer token

Dado que se cierra la sesión,  
cuando finaliza la operación,  
entonces el JWT no debe devolverse en la respuesta ni registrarse en logs.

### CA-05 - No modificar usuario

Dado que se cierra una sesión,  
cuando finaliza la operación,  
entonces no deberán modificarse el usuario, su rol, su estado ni su clínica.

### CA-06 - Respuesta correcta

Dado que el cierre de sesión se procesó correctamente,  
cuando finaliza la operación,  
entonces el sistema debe devolver la respuesta de éxito definida en OpenAPI, sin información sensible.

### CA-07 - Proteger contra CSRF

Dado que el endpoint utiliza autenticación mediante cookies,  
cuando se solicita cerrar sesión,  
entonces debe aplicar los controles CSRF establecidos para Vera Balance.

## Reglas de negocio

- El cierre de sesión elimina la cookie del navegador.
- No se almacena ni elimina una sesión en DynamoDB.
- No existe refresh token.
- El cierre de sesión no modifica información del usuario.
- El cierre de sesión no garantiza la revocación inmediata de un JWT copiado antes de eliminar la cookie.
- Un JWT emitido previamente conserva su validez criptográfica hasta su expiración, salvo que se incorpore un mecanismo de revocación adicional.
- La operación debe protegerse contra CSRF.

## Dependencias

- Auth.
- Infraestructura HTTP y cookies.

## Consideraciones técnicas

- El endpoint debe ser `POST /v1/auth/sign-out`.
- La cookie debe eliminarse mediante `Set-Cookie`.
- Deben respetarse el nombre `vera_balance_session` y los atributos necesarios para eliminarla correctamente.
- No debe eliminarse el registro del usuario.
- No debe implementarse persistencia de sesiones únicamente para este caso de uso.
- La lógica de cierre de sesión debe permanecer separada de la autenticación inicial.
- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la eliminación de la cookie.
- [ ] Se verificó que no se modifiquen datos del usuario.
- [ ] Se verificó la protección CSRF.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
