# US-AUTH-001 — Sign In

## Historia de usuario

Como usuario registrado de Vera Balance,  
quiero iniciar sesión con mis credenciales,  
para acceder a las funcionalidades del sistema correspondientes a mi rol.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir autenticar usuarios mediante su email y contraseña.

La operación se realizará mediante:

`POST /v1/auth/sign-in`

Este endpoint es público y no requiere una sesión previa.

Cuando las credenciales sean válidas, el sistema deberá generar un JWT con vigencia de cinco minutos y enviarlo exclusivamente mediante una cookie HTTP segura llamada `vera_balance_session`.

Únicamente podrán iniciar sesión los usuarios con estado `active` que pertenezcan a una clínica con estado `active`.

El JWT no deberá devolverse en el cuerpo de la respuesta.

## Criterios de aceptación

### CA-01 - Validar información obligatoria

Dado que se solicita iniciar sesión,  
cuando `email` o `password` no se proporcionan o están vacíos,  
entonces el sistema debe rechazar la operación con `400 Bad Request`.

### CA-02 - Validar formato del email

Dado que se proporciona un email,  
cuando su formato no es válido,  
entonces el sistema debe rechazar la solicitud.

### CA-03 - Verificar usuario registrado

Dado que se proporcionan credenciales,  
cuando el sistema procesa la autenticación,  
entonces debe buscar al usuario mediante su email normalizado.

Si el usuario no existe, debe rechazar la autenticación con `401 Unauthorized`.

### CA-04 - Validar contraseña

Dado que el usuario existe,  
cuando se proporciona una contraseña,  
entonces el sistema debe compararla de manera segura contra el hash almacenado.

Si la contraseña no coincide, debe rechazar la autenticación con `401 Unauthorized`.

### CA-05 - Validar usuario activo

Dado que las credenciales son correctas,  
cuando el usuario tiene estado `inactive`,  
entonces el sistema debe rechazar el inicio de sesión.

### CA-06 - Validar clínica activa

Dado que las credenciales son correctas,  
cuando la clínica asociada no existe o tiene estado `inactive`,  
entonces el sistema debe rechazar el inicio de sesión.

### CA-07 - Generar JWT

Dado que las credenciales son válidas,  
y el usuario y su clínica están activos,  
cuando se autentica correctamente,  
entonces el sistema debe generar un JWT firmado con vigencia de cinco minutos.

El token deberá identificar al usuario y contener únicamente las declaraciones necesarias para la autenticación.

### CA-08 - Establecer cookie de sesión

Dado que el JWT fue generado correctamente,  
cuando finaliza la autenticación,  
entonces debe enviarse mediante la cookie `vera_balance_session`.

La cookie deberá configurarse con:

- `HttpOnly: true`
- `Secure: true`
- `SameSite: Lax`
- `Path: /`
- `Max-Age: 300`

### CA-09 - No exponer credenciales

Dado que el inicio de sesión fue exitoso,  
cuando se genera la respuesta,  
entonces no deberán incluirse el JWT, la contraseña ni su hash en el cuerpo.

### CA-10 - Respuesta correcta

Dado que el usuario se autenticó correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `200 OK` y la información autorizada definida en OpenAPI.

### CA-11 - Evitar enumeración de usuarios

Dado que se proporciona un email inexistente o una contraseña incorrecta,  
cuando falla la autenticación,  
entonces el sistema debe devolver un mensaje genérico que no permita identificar si el email está registrado.

### CA-12 - Limitar intentos

Dado que se realizan múltiples intentos de autenticación,  
cuando se supera el límite configurado,  
entonces el sistema debe aplicar controles de rate limiting y responder con `429 Too Many Requests` cuando corresponda.

## Reglas de negocio

- El email debe estar registrado.
- La contraseña debe coincidir con su hash almacenado.
- El usuario debe tener estado `active`.
- La clínica debe existir y tener estado `active`.
- El JWT tiene una vigencia de cinco minutos.
- El JWT se entrega exclusivamente mediante cookie HTTP.
- No se utiliza refresh token.
- No se almacenan sesiones JWT en DynamoDB.
- La contraseña, su hash y el JWT no se exponen en el cuerpo de la respuesta.
- La autenticación fallida no debe revelar la existencia de un email.
- Deben aplicarse controles contra intentos abusivos.

## Dependencias

- Users.
- Clinics.
- Infraestructura de firma y verificación JWT.
- Servicio de hashing de contraseñas.

## Consideraciones técnicas

- El endpoint debe ser `POST /v1/auth/sign-in`.
- La validación de entrada debe realizarse antes de consultar las credenciales.
- El email debe normalizarse conforme a las reglas de Users.
- La contraseña debe verificarse mediante el algoritmo de hashing configurado.
- La firma del JWT debe utilizar secretos o claves administrados mediante configuración segura.
- El token no debe registrarse en logs.
- El JWT no debe enviarse mediante JSON.
- La cookie debe respetar la configuración de seguridad definida.
- El caso de uso debe permanecer separado del controlador HTTP.
- Los detalles de JWT, cookies y DynamoDB no deben exponerse en el dominio.
- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
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
- [ ] Se verificó la autenticación con credenciales válidas e inválidas.
- [ ] Se verificó el rechazo de usuarios y clínicas inactivas.
- [ ] Se verificó la configuración de la cookie.
- [ ] Se verificó que no se expongan credenciales ni tokens.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
