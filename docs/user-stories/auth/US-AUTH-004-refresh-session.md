# US-AUTH-004 — Refresh Session

## Historia de usuario

Como usuario autenticado de Vera Balance,  
quiero renovar mi sesión mientras continúo utilizando el sistema,  
para mantener mi acceso sin tener que iniciar sesión nuevamente durante mi actividad.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir renovar una sesión autenticada mediante:

`POST /v1/auth/refresh`

La renovación utilizará el JWT vigente recibido mediante la cookie `vera_balance_session`.

No se utilizará refresh token.

El endpoint únicamente podrá renovar sesiones que todavía sean válidas y no hayan expirado.

La aplicación frontend deberá solicitar la renovación cuando exista actividad real del usuario, conforme a la política de inactividad de cinco minutos.

## Criterios de aceptación

### CA-01 - Validar sesión existente

Dado que se solicita renovar una sesión,  
cuando no existe una cookie de sesión válida,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

### CA-02 - Validar JWT vigente

Dado que se proporciona una sesión,  
cuando el JWT está expirado o tiene una firma inválida,  
entonces el sistema debe rechazar la renovación.

No debe emitirse un nuevo JWT.

### CA-03 - Validar usuario activo

Dado que el JWT es válido,  
cuando el usuario no existe o está inactivo,  
entonces el sistema debe rechazar la renovación.

### CA-04 - Validar clínica activa

Dado que el usuario está activo,  
cuando su clínica no existe o está inactiva,  
entonces el sistema debe rechazar la renovación.

### CA-05 - Renovar sesión correctamente

Dado que el JWT es válido y vigente,  
y el usuario y su clínica están activos,  
cuando se solicita renovar la sesión,  
entonces el sistema debe emitir un nuevo JWT firmado con vigencia de cinco minutos.

### CA-06 - Actualizar cookie

Dado que se genera un nuevo JWT,  
cuando finaliza la renovación,  
entonces el sistema debe reemplazar la cookie `vera_balance_session` con los siguientes atributos:

- `HttpOnly: true`
- `Secure: true`
- `SameSite: Lax`
- `Path: /`
- `Max-Age: 300`

### CA-07 - No utilizar refresh token

Dado que se solicita renovar la sesión,  
cuando el sistema procesa la operación,  
entonces debe utilizar la sesión JWT vigente.

No deberá requerir ni generar un refresh token.

### CA-08 - No renovar sesiones expiradas

Dado que han transcurrido los cinco minutos de vigencia del JWT,  
cuando se solicita la renovación,  
entonces el sistema debe rechazarla.

El usuario deberá autenticarse nuevamente.

### CA-09 - No exponer JWT

Dado que se renueva correctamente la sesión,  
cuando se genera la respuesta,  
entonces el JWT deberá enviarse exclusivamente mediante cookie.

No deberá incluirse en el cuerpo de la respuesta.

### CA-10 - No modificar información del usuario

Dado que se renueva una sesión,  
cuando finaliza la operación,  
entonces no deberán modificarse los datos personales, rol, estado, clínica ni fechas de auditoría del usuario.

### CA-11 - Proteger contra CSRF

Dado que la renovación utiliza autenticación mediante cookies,  
cuando se solicita renovar la sesión,  
entonces deben aplicarse los controles CSRF establecidos para Vera Balance.

## Reglas de negocio

- La renovación requiere un JWT válido y no expirado.
- La renovación no utiliza refresh token.
- El usuario y su clínica deben estar activos.
- Cada JWT renovado tiene vigencia de cinco minutos.
- El JWT renovado se entrega exclusivamente mediante cookie.
- Una sesión expirada no puede renovarse.
- La renovación no modifica información del usuario.
- El frontend debe solicitar la renovación cuando exista actividad real.
- La política de inactividad del frontend no constituye, por sí sola, una garantía de inactividad comprobada por el servidor.
- Deben aplicarse controles CSRF.

## Dependencias

- Auth.
- Users.
- Clinics.
- Infraestructura JWT.

## Consideraciones técnicas

- El endpoint debe ser `POST /v1/auth/refresh`.
- Debe obtener el JWT desde `vera_balance_session`.
- Debe verificar firma, expiración e identidad.
- Debe validar el estado actual del usuario y su clínica.
- Debe generar un JWT nuevo con vigencia de cinco minutos.
- Debe reemplazar la cookie existente.
- No debe implementar refresh tokens ni almacenar sesiones en DynamoDB.
- La decisión de renovar por actividad corresponde al frontend.
- Si se requiere garantizar cinco minutos de inactividad desde el servidor, será necesario definir un mecanismo adicional de seguimiento de actividad.
- El contrato debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la renovación de sesiones vigentes.
- [ ] Se verificó el rechazo de sesiones expiradas.
- [ ] Se verificó el rechazo de usuarios y clínicas inactivas.
- [ ] Se verificó la actualización de la cookie.
- [ ] Se verificó que no se utilicen refresh tokens.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
