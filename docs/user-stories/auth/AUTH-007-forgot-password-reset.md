# US-AUTH-007 — Forgot Password Reset

## Historia de usuario

Como usuario registrado de Vera Balance,  
quiero restablecer mi contraseña utilizando el código recibido por correo,  
para recuperar el acceso a mi cuenta de forma segura.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir restablecer una contraseña olvidada mediante:

`POST /v1/auth/forgot-password/reset`

Este endpoint es público y no requiere una sesión autenticada.

El usuario deberá proporcionar su email, el código de recuperación recibido, la nueva contraseña y su confirmación.

El sistema deberá validar que el código exista, no haya expirado, no haya superado el número máximo de intentos y no haya sido utilizado previamente.

Cuando la verificación sea correcta, deberá actualizar la contraseña de forma segura e invalidar el código.

El restablecimiento no deberá iniciar sesión automáticamente.

## Criterios de aceptación

### CA-01 - Validar información obligatoria

Dado que se solicita restablecer una contraseña,  
cuando falta alguno de los siguientes campos:

- `email`
- `code`
- `password`
- `password_confirmation`

Entonces el sistema debe rechazar la operación con `400 Bad Request`.

### CA-02 - Validar formato del email

Dado que se proporciona un email,  
cuando su formato es inválido,  
entonces el sistema debe rechazar la operación.

### CA-03 - Validar formato del código

Dado que se proporciona un código,  
cuando no contiene exactamente seis dígitos numéricos,  
entonces el sistema debe rechazar la operación.

### CA-04 - Validar confirmación de contraseña

Dado que se proporciona una nueva contraseña,  
cuando `password` y `password_confirmation` no coinciden,  
entonces el sistema debe rechazar la operación.

### CA-05 - Validar política de contraseña

Dado que se proporciona una contraseña,  
cuando no cumple la política de seguridad definida para Vera Balance,  
entonces el sistema debe rechazar la operación.

### CA-06 - Verificar solicitud de recuperación

Dado que se proporciona un email y un código,  
cuando se procesa la solicitud,  
entonces el sistema debe verificar que exista una recuperación vigente asociada al usuario.

Si no existe, debe rechazar la operación sin revelar información innecesaria sobre la cuenta.

### CA-07 - Validar expiración

Dado que existe una solicitud de recuperación,  
cuando han transcurrido más de cinco minutos desde la emisión del código,  
entonces el sistema debe rechazar el restablecimiento.

### CA-08 - Validar código

Dado que existe una solicitud vigente,  
cuando se proporciona el código,  
entonces el sistema debe comparar su representación protegida contra la almacenada.

Si no coincide, debe rechazar la operación.

### CA-09 - Registrar intentos fallidos

Dado que se proporciona un código incorrecto,  
cuando se procesa su verificación,  
entonces el sistema debe incrementar el contador de intentos de manera consistente.

### CA-10 - Limitar intentos

Dado que una recuperación ha acumulado cinco intentos fallidos,  
cuando se intenta utilizar nuevamente,  
entonces el sistema debe rechazar la operación.

El usuario deberá solicitar un nuevo código de recuperación.

### CA-11 - Validar usuario y clínica

Dado que el código es correcto y vigente,  
cuando se procesa el restablecimiento,  
entonces el sistema debe verificar que el usuario y su clínica existan y estén activos.

Si no cumplen las condiciones, debe rechazar la operación.

### CA-12 - Generar hash seguro

Dado que la nueva contraseña es válida,  
cuando se procesa el restablecimiento,  
entonces el sistema debe generar un hash seguro antes de persistirla.

La contraseña original no debe almacenarse.

### CA-13 - Actualizar contraseña

Dado que el código es correcto, vigente y no utilizado,  
y la nueva contraseña es válida,  
cuando se solicita restablecerla,  
entonces el sistema debe actualizar el hash de contraseña del usuario.

También deberá actualizar `updated_at`.

### CA-14 - Invalidar código utilizado

Dado que la contraseña fue restablecida correctamente,  
cuando finaliza la operación,  
entonces el código de recuperación debe quedar invalidado.

No podrá utilizarse nuevamente.

### CA-15 - Evitar reutilización concurrente

Dado que dos solicitudes intentan utilizar el mismo código,  
cuando se procesan simultáneamente,  
entonces el sistema debe garantizar que únicamente una pueda consumirlo correctamente.

No deberá ser posible utilizar un mismo código más de una vez.

### CA-16 - Mantener información del usuario

Dado que se restablece una contraseña,  
cuando finaliza la operación,  
entonces deben conservarse sin modificaciones los demás campos del usuario.

Únicamente deberán actualizarse el hash de contraseña y `updated_at`, además del estado del registro de recuperación correspondiente.

### CA-17 - No iniciar sesión automáticamente

Dado que la contraseña fue restablecida,  
cuando se genera la respuesta,  
entonces el sistema no debe emitir un JWT ni establecer una nueva cookie de sesión.

El usuario deberá iniciar sesión utilizando su nueva contraseña.

### CA-18 - No exponer información sensible

Dado que se procesa el restablecimiento,  
cuando se genera la respuesta,  
entonces no deben incluirse:

- Contraseña.
- Confirmación de contraseña.
- Hash.
- Código de recuperación.
- JWT.

### CA-19 - Respuesta correcta

Dado que el código es válido y la contraseña se actualizó correctamente,  
cuando finaliza la operación,  
entonces el sistema debe devolver la respuesta de éxito definida en OpenAPI.

### CA-20 - Mantener consistencia ante errores

Dado que ocurre un error durante el restablecimiento,  
cuando la operación no finaliza correctamente,  
entonces el sistema no debe dejar una contraseña actualizada con un código todavía reutilizable.

La actualización de la contraseña y el consumo del código deberán mantenerse consistentes.

### CA-21 - Limitar solicitudes abusivas

Dado que se realizan múltiples intentos de restablecimiento,  
cuando se supera el límite de solicitudes configurado,  
entonces el sistema debe aplicar rate limiting y responder con `429 Too Many Requests` cuando corresponda.

## Reglas de negocio

- El endpoint es público.
- El email, código, contraseña y confirmación son obligatorios.
- El código debe contener exactamente seis dígitos numéricos.
- El código debe pertenecer a una recuperación vigente.
- El código expira después de cinco minutos.
- Se permiten como máximo cinco intentos fallidos.
- Un código utilizado no puede volver a utilizarse.
- Un código invalidado por una nueva solicitud no puede utilizarse.
- La contraseña y su confirmación deben coincidir.
- La contraseña debe cumplir la política de seguridad definida.
- La contraseña debe almacenarse mediante un hash seguro.
- El usuario y su clínica deben estar activos.
- El restablecimiento debe actualizar `updated_at`.
- La operación no debe modificar otros datos del usuario.
- La operación no debe iniciar sesión automáticamente.
- La contraseña, su hash y el código no deben exponerse mediante el API.
- Deben aplicarse controles de rate limiting.
- El consumo del código debe ser seguro ante solicitudes concurrentes.

## Dependencias

- US-AUTH-006 — Forgot Password.
- Users.
- Clinics.
- DynamoDB.
- Servicio de hashing de contraseñas.
- Servicio de verificación criptográfica de códigos.

## Consideraciones técnicas

### Endpoint

`POST /v1/auth/forgot-password/reset`

### Request

```json
{
  "email": "usuario@example.com",
  "code": "123456",
  "password": "NuevaPassword123!",
  "password_confirmation": "NuevaPassword123!"
}
```

### Validación

- El email debe normalizarse.
- El código debe contener exactamente seis dígitos.
- La contraseña debe cumplir la política definida.
- La confirmación debe coincidir.
- La recuperación debe existir y estar vigente.
- El contador de intentos debe ser menor al máximo permitido.
- El código no debe haber sido utilizado o invalidado.

### Persistencia

- La persistencia debe respetar el modelo Single Table de DynamoDB.
- El registro `PASSWORD_RECOVERY` deberá utilizar los atributos definidos en `docs/DB.md`.
- La verificación del código deberá realizarse mediante su representación protegida.
- Los intentos fallidos deberán actualizarse mediante operaciones consistentes.
- La actualización del hash y el consumo del código deberán ejecutarse de forma atómica o mediante un mecanismo equivalente que impida su reutilización.
- La expiración deberá verificarse mediante `expires_at`.
- No deberá dependerse exclusivamente del TTL de DynamoDB.
- Los detalles de DynamoDB no deberán exponerse en el dominio.

### Contraseña y sesiones

- El hash deberá generarse mediante un algoritmo adecuado, como bcrypt.
- La contraseña no deberá almacenarse en texto plano.
- El restablecimiento no deberá emitir un JWT.
- El restablecimiento no deberá crear una sesión.
- El usuario deberá autenticarse nuevamente.
- Los JWT emitidos previamente no se revocarán automáticamente en un esquema puramente stateless; cualquier requisito de invalidación inmediata de sesiones anteriores deberá definirse mediante un mecanismo adicional.

### Arquitectura

Las responsabilidades deberán mantenerse separadas entre:

- `presentation`: recepción del request, validación de entrada y construcción de la respuesta HTTP.
- `application`: ejecución del caso de uso Forgot Password Reset.
- `domain`: reglas de vigencia, intentos, consumo único y actualización de credenciales.
- `infrastructure`: persistencia DynamoDB, verificación criptográfica y hashing.

El caso de uso deberá permanecer separado de Forgot Password y del cambio de contraseña autenticado.

No deberá depender directamente de controladores HTTP, Dynamoose ni implementaciones concretas de infraestructura.

### Contratos y documentación

- El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
- La persistencia debe respetar `docs/DB.md`.
- Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
- Los endpoints y sus permisos deben respetar `docs/ENDPOINTS.md`.
- La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la validación de códigos correctos e incorrectos.
- [ ] Se verificó la expiración de cinco minutos.
- [ ] Se verificó el límite de cinco intentos.
- [ ] Se verificó el consumo único del código.
- [ ] Se verificó la actualización segura de la contraseña.
- [ ] Se verificó que no se inicie sesión automáticamente.
- [ ] Se verificó que no se exponga información sensible.
- [ ] Se confirmó la consistencia con OpenAPI y DynamoDB.
- [ ] La implementación fue revisada.
