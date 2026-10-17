# US-AUTH-003 — Verify Session

## Historia de usuario

Como usuario autenticado de Vera Balance,  
quiero verificar que mi sesión continúa siendo válida,  
para acceder a las funcionalidades autorizadas de manera segura.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir verificar una sesión mediante:

`POST /v1/auth/verify`

El JWT deberá obtenerse exclusivamente desde la cookie `vera_balance_session`.

La verificación deberá comprobar la firma y vigencia del token, la existencia y estado actual del usuario, así como el estado de su clínica.

La operación no deberá renovar automáticamente la sesión.

## Criterios de aceptación

### CA-01 - Validar existencia de cookie

Dado que se solicita verificar una sesión,  
cuando no existe la cookie `vera_balance_session`,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar firma del JWT

Dado que se recibe un JWT,  
cuando su firma es inválida o ha sido alterado,  
entonces el sistema debe rechazar la verificación.

### CA-03 - Validar expiración

Dado que se recibe un JWT,  
cuando su tiempo de expiración ha transcurrido,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-04 - Validar usuario existente

Dado que el JWT es criptográficamente válido,  
cuando el sistema identifica al usuario,  
entonces debe comprobar que el usuario exista.

Si no existe, debe rechazar la sesión.

### CA-05 - Validar usuario activo

Dado que el usuario existe,  
cuando su estado actual es `inactive`,  
entonces el sistema debe rechazar la sesión.

### CA-06 - Validar clínica activa

Dado que el usuario está activo,  
cuando su clínica no existe o está inactiva,  
entonces el sistema debe rechazar la sesión.

### CA-07 - Verificar sesión correctamente

Dado que el JWT es válido y no ha expirado,  
y el usuario y su clínica están activos,  
cuando se verifica la sesión,  
entonces el sistema debe confirmar que la autenticación es válida.

### CA-08 - Devolver información autorizada

Dado que la verificación es exitosa,  
cuando se genera la respuesta,  
entonces debe devolverse únicamente la información autorizada del usuario conforme a OpenAPI.

### CA-09 - No renovar automáticamente

Dado que se verifica una sesión válida,  
cuando finaliza la operación,  
entonces el sistema no debe emitir un nuevo JWT ni extender la vigencia de la cookie.

### CA-10 - No exponer información sensible

Dado que se verifica una sesión,  
cuando se devuelve la respuesta,  
entonces no deben incluirse contraseñas, hashes ni el JWT.

## Reglas de negocio

- La sesión debe obtenerse desde `vera_balance_session`.
- El JWT debe tener firma válida y no estar expirado.
- El usuario debe existir y estar activo.
- La clínica debe existir y estar activa.
- La verificación no renueva la sesión.
- La verificación no modifica información del usuario.
- Un usuario desactivado debe perder acceso a las operaciones protegidas, aunque su JWT todavía no haya expirado.
- La respuesta no debe exponer información sensible.

## Dependencias

- Auth.
- Users.
- Clinics.
- Infraestructura JWT.

## Consideraciones técnicas

- El endpoint debe ser `POST /v1/auth/verify`.
- Debe validarse el JWT desde la cookie HTTP.
- Debe consultarse el estado actual del usuario y su clínica.
- No debe confiarse exclusivamente en los valores de rol o estado incluidos en un JWT emitido anteriormente.
- La operación debe reutilizar los mecanismos centrales de validación de sesión.
- No debe generar un nuevo token.
- No debe modificar `updated_at`.
- Debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- Debe respetar `docs/DB.md`.
- Debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificaron firmas válidas e inválidas.
- [ ] Se verificó el rechazo de JWT expirados.
- [ ] Se verificó el rechazo de usuarios y clínicas inactivas.
- [ ] Se verificó que no se renueve la sesión.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
