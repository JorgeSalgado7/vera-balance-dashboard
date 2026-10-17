# US-AUTH-005 — Reset Password

## Historia de usuario

Como usuario autenticado de Vera Balance,  
quiero cambiar mi contraseña,  
para mantener seguras mis credenciales de acceso al sistema.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir que un usuario autenticado cambie su propia contraseña mediante:

`POST /v1/auth/reset-password`

Este endpoint requiere una sesión autenticada válida.

El usuario deberá proporcionar una nueva contraseña y su confirmación.

La contraseña deberá procesarse mediante un algoritmo de hashing adecuado antes de almacenarse.

La operación únicamente podrá modificar la contraseña del usuario autenticado.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita cambiar una contraseña,  
cuando no existe una sesión autenticada válida,  
entonces el sistema debe rechazar la operación con `401 Unauthorized`.

### CA-02 - Identificar usuario autenticado

Dado que existe una sesión válida,  
cuando se solicita cambiar la contraseña,  
entonces el sistema debe identificar al usuario mediante el contexto autenticado.

No deberá permitirse seleccionar otro usuario mediante el cuerpo de la solicitud.

### CA-03 - Validar usuario activo

Dado que el usuario solicita cambiar su contraseña,  
cuando su estado es `inactive`,  
entonces el sistema debe rechazar la operación.

### CA-04 - Validar clínica activa

Dado que se solicita cambiar una contraseña,  
cuando la clínica del usuario está inactiva o no existe,  
entonces el sistema debe rechazar la operación.

### CA-05 - Validar información obligatoria

Dado que se solicita cambiar una contraseña,  
cuando `password` o `password_confirmation` están vacíos o no fueron proporcionados,  
entonces el sistema debe rechazar la operación.

### CA-06 - Validar confirmación

Dado que se proporciona una nueva contraseña,  
cuando `password` y `password_confirmation` no coinciden,  
entonces el sistema debe rechazar la operación.

### CA-07 - Validar política de contraseña

Dado que se proporciona una contraseña,  
cuando no cumple la política de seguridad definida para Vera Balance,  
entonces el sistema debe rechazar la operación.

### CA-08 - Generar hash seguro

Dado que se proporciona una contraseña válida,  
cuando se procesa el cambio,  
entonces el sistema debe generar un hash seguro antes de persistirla.

La contraseña original no debe almacenarse.

### CA-09 - Actualizar contraseña

Dado que el usuario está autorizado y la contraseña es válida,  
cuando se solicita el cambio,  
entonces el sistema debe actualizar el hash de contraseña del usuario autenticado.

### CA-10 - Conservar información

Dado que se cambia la contraseña,  
cuando finaliza la operación,  
entonces los demás datos del usuario deben conservarse.

La fecha `updated_at` deberá actualizarse cuando el cambio se persista correctamente.

### CA-11 - No exponer credenciales

Dado que la contraseña fue modificada,  
cuando se genera la respuesta,  
entonces no deben incluirse la contraseña, su confirmación ni el hash.

### CA-12 - Respuesta correcta

Dado que la contraseña se actualizó correctamente,  
cuando finaliza la operación,  
entonces el sistema debe devolver la respuesta de éxito definida en OpenAPI.

### CA-13 - Proteger contra CSRF

Dado que el endpoint utiliza autenticación mediante cookies,  
cuando se solicita cambiar la contraseña,  
entonces deben aplicarse los controles CSRF definidos para Vera Balance.

## Reglas de negocio

- El cambio de contraseña requiere autenticación.
- Únicamente puede modificarse la contraseña del usuario autenticado.
- El usuario y su clínica deben estar activos.
- La contraseña y su confirmación son obligatorias.
- Ambos valores deben coincidir.
- La contraseña debe cumplir la política de seguridad definida.
- La contraseña debe almacenarse exclusivamente mediante un hash seguro.
- La contraseña y su hash nunca deben exponerse mediante el API.
- La operación no debe modificar otros datos del usuario.
- El cambio debe actualizar `updated_at`.
- Deben aplicarse controles CSRF.

## Dependencias

- Auth.
- Users.
- Clinics.
- Servicio de hashing de contraseñas.

## Consideraciones técnicas

- El endpoint debe ser `POST /v1/auth/reset-password`.
- El usuario debe obtenerse desde la sesión autenticada.
- El request debe respetar el contrato OpenAPI.
- Debe validarse `password` y `password_confirmation`.
- Debe utilizarse un algoritmo de hashing adecuado, como bcrypt.
- El hash anterior debe reemplazarse únicamente después de validar la solicitud.
- No deben registrarse contraseñas en logs.
- El cambio no debe modificar otros atributos salvo `updated_at`.
- La operación no debe generar automáticamente un nuevo JWT.
- La invalidación inmediata de otras sesiones no puede garantizarse con JWT stateless sin un mecanismo adicional de revocación o versionado de credenciales.
- El contrato debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La persistencia debe respetar `docs/DB.md`.
- La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó que únicamente pueda cambiarse la contraseña propia.
- [ ] Se verificó la confirmación de contraseña.
- [ ] Se verificó el almacenamiento seguro del hash.
- [ ] Se verificó que no se expongan credenciales.
- [ ] Se verificó la protección CSRF.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
