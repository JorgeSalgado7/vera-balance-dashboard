# US-AUTH-006 — Forgot Password

## Historia de usuario

Como usuario registrado de Vera Balance,  
quiero solicitar un código de recuperación de contraseña,  
para recuperar el acceso a mi cuenta cuando no recuerdo mis credenciales.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir solicitar la recuperación de contraseña mediante:

`POST /v1/auth/forgot-password`

Este endpoint es público y no requiere autenticación.

El usuario deberá proporcionar su email.

Si el email corresponde a una cuenta elegible para recuperación, el sistema generará un código numérico de seis dígitos y lo enviará al correo registrado mediante Resend.

El código tendrá una vigencia de cinco minutos.

La respuesta no deberá revelar si el email proporcionado pertenece a un usuario registrado.

## Criterios de aceptación

### CA-01 - Validar email obligatorio

Dado que se solicita recuperar una contraseña,  
cuando no se proporciona el email o está vacío,  
entonces el sistema debe rechazar la solicitud con `400 Bad Request`.

### CA-02 - Validar formato del email

Dado que se proporciona un email,  
cuando su formato no es válido,  
entonces el sistema debe rechazar la operación.

### CA-03 - Buscar usuario

Dado que se proporciona un email válido,  
cuando el sistema procesa la solicitud,  
entonces debe buscar al usuario mediante el email normalizado.

### CA-04 - Evitar enumeración de usuarios

Dado que se proporciona un email válido,  
cuando el usuario existe o no existe,  
entonces el sistema debe devolver una respuesta genérica equivalente.

La respuesta no debe confirmar si el email está registrado.

### CA-05 - Validar elegibilidad

Dado que el email pertenece a un usuario registrado,  
cuando se procesa la solicitud,  
entonces el sistema debe comprobar que el usuario y su clínica estén activos antes de generar un código utilizable.

Si no cumplen las condiciones, no deberá emitirse un código válido de recuperación.

### CA-06 - Generar código

Dado que el usuario es elegible,  
cuando solicita recuperar su contraseña,  
entonces el sistema debe generar un código numérico de seis dígitos utilizando un generador criptográficamente seguro.

### CA-07 - Establecer vigencia

Dado que se genera un código de recuperación,  
cuando se almacena su información,  
entonces debe establecerse una vigencia de cinco minutos.

### CA-08 - Proteger código

Dado que se genera un código,  
cuando se persiste la solicitud de recuperación,  
entonces no debe almacenarse el código en texto plano.

Debe almacenarse una representación protegida mediante hash o HMAC.

### CA-09 - Registrar intentos

Dado que se genera una solicitud de recuperación,  
cuando se persiste,  
entonces debe inicializarse su contador de intentos en cero.

El código permitirá como máximo cinco intentos de verificación.

### CA-10 - Enviar correo

Dado que el usuario es elegible y el código fue generado,  
cuando se procesa la recuperación,  
entonces el sistema debe enviar el código al email registrado mediante Resend.

El correo deberá indicar que el código expira en cinco minutos.

### CA-11 - No exponer código

Dado que se solicita recuperar una contraseña,  
cuando se genera la respuesta HTTP,  
entonces el código no debe incluirse en el cuerpo de la respuesta.

### CA-12 - Nueva solicitud de recuperación

Dado que existe un código anterior para el usuario,  
cuando se genera una nueva solicitud válida,  
entonces el código anterior deberá quedar invalidado y únicamente el nuevo código podrá utilizarse.

### CA-13 - Limitar solicitudes

Dado que se realizan solicitudes repetidas de recuperación,  
cuando se supera el límite configurado,  
entonces el sistema debe aplicar rate limiting para evitar abuso del servicio de correo.

### CA-14 - No modificar contraseña

Dado que se solicita recuperar una contraseña,  
cuando se genera y envía el código,  
entonces no debe modificarse la contraseña actual del usuario.

### CA-15 - Respuesta correcta

Dado que se proporciona un email con formato válido,  
cuando la solicitud se procesa,  
entonces el sistema debe devolver la respuesta genérica de éxito definida en OpenAPI.

## Reglas de negocio

- El endpoint es público.
- El email es obligatorio.
- No debe revelarse si el email está registrado.
- El código contiene seis dígitos numéricos.
- El código debe generarse criptográficamente.
- El código expira después de cinco minutos.
- Se permiten como máximo cinco intentos de verificación.
- El código no se almacena en texto plano.
- El código se envía mediante Resend.
- El código no se devuelve mediante el API.
- Una nueva solicitud válida invalida el código anterior.
- Solicitar recuperación no modifica la contraseña.
- Deben aplicarse controles de rate limiting.

## Dependencias

- Users.
- Clinics.
- DynamoDB.
- Resend.
- Servicio criptográfico de generación y protección de códigos.

## Consideraciones técnicas

### Endpoint

`POST /v1/auth/forgot-password`

### Request

```json
{
  "email": "usuario@example.com"
}
```

### Persistencia

La información de recuperación deberá almacenarse utilizando el modelo Single Table de DynamoDB.

El registro lógico de recuperación será `PASSWORD_RECOVERY` y deberá contemplar:

- `pk`
- `sk`
- `code_hash`
- `expires_at`
- `attempts`
- `created_at`
- `ttl`

El código deberá protegerse mediante HMAC o un mecanismo de hashing adecuado para códigos de baja entropía.

La vigencia lógica deberá comprobarse mediante `expires_at`, sin depender exclusivamente de la eliminación automática mediante TTL de DynamoDB.

### Correo electrónico

- El envío deberá realizarse mediante un adaptador de Resend.
- Las credenciales de Resend deberán obtenerse desde configuración segura.
- El código no deberá aparecer en logs.
- El envío deberá utilizar el email registrado del usuario.
- Los errores internos del proveedor no deberán revelar información sobre la existencia del usuario.

### Arquitectura

- `presentation`: validación del email y construcción de la respuesta HTTP.
- `application`: ejecución del caso de uso Forgot Password.
- `domain`: reglas de vigencia, intentos y recuperación.
- `infrastructure`: DynamoDB, generación criptográfica y Resend.

El dominio no deberá depender directamente de Resend ni Dynamoose.

La implementación debe respetar `docs/baas-vera-balance-dashboard.yaml`, `docs/DB.md` y `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la generación de códigos de seis dígitos.
- [ ] Se verificó la vigencia de cinco minutos.
- [ ] Se verificó la protección del código almacenado.
- [ ] Se verificó el envío mediante Resend.
- [ ] Se verificó que no se revele la existencia del usuario.
- [ ] Se verificaron los controles de rate limiting.
- [ ] Se confirmó la consistencia con OpenAPI y DynamoDB.
- [ ] La implementación fue revisada.
