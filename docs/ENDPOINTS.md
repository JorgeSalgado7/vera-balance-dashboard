# DEFINICIÓN DE LOS ENDPOINTS

Todos los endpoints utilizan el prefijo:

```text
/v1
```

Los endpoints utilizan uno de los siguientes mecanismos de seguridad:

```text
Public Operation Token
Session Cookie
Password Recovery Token
```

El endpoint encargado de generar un Public Operation Token no requiere autenticación previa.

Los endpoints protegidos mediante Public Operation Token son únicamente:

```text
POST /v1/users
POST /v1/auth/sign-in
POST /v1/auth/forgot-password
```

El endpoint:

```text
POST /v1/auth/forgot-password/reset
```

no requiere una sesión autenticada ni un Public Operation Token. Esta operación requiere un Password Recovery Token válido, recibido mediante el correo de recuperación.

El resto de los endpoints requieren una sesión autenticada mediante la cookie definida en `docs/openapi.yaml`.

## 1. Clinics

Todos los endpoints de Clinics requieren una sesión autenticada.

```text
POST    /v1/clinics
GET     /v1/clinics
GET     /v1/clinics/{id}
GET     /v1/clinics/user/{userId}
PUT     /v1/clinics/{id}
DELETE  /v1/clinics/{id}
```

## 2. Users

```text
POST    /v1/users
GET     /v1/users
GET     /v1/users/{id}
PUT     /v1/users/{id}
DELETE  /v1/users/{id}
PATCH   /v1/users/{id}/status
```

El endpoint:

```text
POST /v1/users
```

requiere un Public Operation Token con scope:

```text
users:create
```

El resto de los endpoints de Users requieren una sesión autenticada.

El cambio de estatus del usuario se realiza exclusivamente mediante:

```text
PATCH /v1/users/{id}/status
```

Estados disponibles:

```text
active
inactive
```

## 3. Auth

```text
POST /v1/auth/public-token
POST /v1/auth/sign-in
POST /v1/auth/sign-out
POST /v1/auth/verify
POST /v1/auth/reset-password
POST /v1/auth/forgot-password
POST /v1/auth/forgot-password/reset
```

### 3.1 Public Operation Token

```text
POST /v1/auth/public-token
```

Este endpoint no requiere autenticación previa.

Permite generar un token temporal de un solo uso para ejecutar una operación que no requiere una sesión autenticada.

Scopes disponibles:

```text
users:create
auth:sign-in
auth:forgot-password
```

Cada token únicamente puede utilizarse para la operación correspondiente a su scope.

El token tiene una vigencia limitada y debe consumirse cuando el endpoint correspondiente acepta la solicitud.

Una vez consumido no puede volver a utilizarse.

El Public Operation Token no representa una sesión autenticada y no puede utilizarse para acceder a otros endpoints del API.

### 3.2 Sign In

```text
POST /v1/auth/sign-in
```

Requiere un Public Operation Token con scope:

```text
auth:sign-in
```

Si las credenciales del usuario son válidas, el backend genera un JWT de sesión y lo entrega mediante la cookie `HttpOnly` definida en `docs/openapi.yaml`.

El JWT no se devuelve en el cuerpo de la respuesta.

### 3.3 Sign Out

```text
POST /v1/auth/sign-out
```

Requiere una sesión autenticada.

El backend elimina la cookie de sesión.

### 3.4 Verify

```text
POST /v1/auth/verify
```

Requiere una sesión autenticada.

El backend obtiene y valida el JWT desde la cookie de sesión.

El JWT no se recibe ni se devuelve en el body.

### 3.5 Reset Password

```text
POST /v1/auth/reset-password
```

Requiere una sesión autenticada.

La identidad del usuario se obtiene de la sesión.

El request debe proporcionar:

```json
{
  "password": "NewPassword123",
  "password_confirmation": "NewPassword123"
}
```

La contraseña y su confirmación deben coincidir antes de generar el nuevo hash.

El email o identificador del usuario no se utiliza para determinar qué usuario debe ser modificado.

Este endpoint corresponde al cambio de contraseña de un usuario que ya dispone de una sesión autenticada y es independiente del flujo de recuperación de contraseña olvidada.

### 3.6 Forgot Password

```text
POST /v1/auth/forgot-password
```

Requiere un Public Operation Token con scope:

```text
auth:forgot-password
```

Permite iniciar el proceso de recuperación de contraseña para un usuario que no dispone de una sesión autenticada.

El request recibe:

```json
{
  "email": "user@example.com"
}
```

La respuesta no debe revelar si el email proporcionado corresponde o no a un usuario existente.

El Public Operation Token únicamente autoriza esta solicitud inicial y no puede utilizarse posteriormente para establecer una nueva contraseña.

Si existe un usuario asociado al email:

1. El backend genera un Password Recovery Token.
2. El token queda asociado al usuario correspondiente.
3. El token tiene una vigencia limitada.
4. El token es de un solo uso.
5. El token se envía al correo asociado al usuario mediante el mecanismo de recuperación.
6. El Password Recovery Token no se devuelve mediante el API.

La contraseña actual del usuario no se modifica durante esta operación.

El envío del correo debe realizarse mediante una abstracción de aplicación para evitar acoplar el dominio o los casos de uso a un proveedor específico de correo.

### 3.7 Reset Forgotten Password

```text
POST /v1/auth/forgot-password/reset
```

No requiere una sesión autenticada ni un Public Operation Token.

La autorización para establecer la nueva contraseña proviene exclusivamente del Password Recovery Token enviado al correo del usuario.

El request debe proporcionar:

```json
{
  "recovery_token": "password-recovery-token",
  "password": "NewPassword123",
  "password_confirmation": "NewPassword123"
}
```

El backend debe validar que el Password Recovery Token:

* sea válido;
* se encuentre vigente;
* no haya sido consumido previamente;
* se encuentre asociado a un usuario.

La identidad del usuario se obtiene a partir del Password Recovery Token validado.

El cliente no debe proporcionar libremente un email o identificador de usuario para determinar qué cuenta debe modificarse.

La contraseña y su confirmación deben coincidir antes de generar el nuevo hash y antes de modificar la contraseña persistida.

Cuando la contraseña se actualiza correctamente:

* la nueva contraseña se almacena únicamente como hash;
* `password_confirmation` no se persiste;
* el Password Recovery Token queda consumido;
* el Password Recovery Token no puede reutilizarse;
* no se crea automáticamente una sesión autenticada.

El usuario debe iniciar sesión posteriormente mediante el flujo normal de autenticación.

## 4. Catalogs

Todos los endpoints de Catalogs requieren una sesión autenticada.

```text
POST    /v1/catalogs
GET     /v1/catalogs
GET     /v1/catalogs/{id}
PATCH   /v1/catalogs/{id}
DELETE  /v1/catalogs/{id}
```

## 5. Patients

Todos los endpoints de Patients requieren una sesión autenticada.

```text
POST    /v1/patients
GET     /v1/patients
GET     /v1/patients/{id}
PUT     /v1/patients/{id}
DELETE  /v1/patients/{id}
```

## 6. Therapeutic Processes

Todos los endpoints de Therapeutic Processes requieren una sesión autenticada.

```text
POST    /v1/therapeutic-processes
GET     /v1/therapeutic-processes
GET     /v1/therapeutic-processes/{id}
GET     /v1/therapeutic-processes/patient/{patientId}
PUT     /v1/therapeutic-processes/{id}
DELETE  /v1/therapeutic-processes/{id}
PATCH   /v1/therapeutic-processes/{id}/status
```

Cambio de status:

```json
{
  "status": "inactive"
}
```

Estados disponibles:

```text
active
inactive
discharged
unfinished
```

## 7. Records

Todos los endpoints de Records requieren una sesión autenticada.

```text
POST    /v1/records
GET     /v1/records
GET     /v1/records/{id}
GET     /v1/records/therapeutic-process/{therapeuticProcessId}
PUT     /v1/records/{id}
DELETE  /v1/records/{id}
```

## 8. Home Works

Todos los endpoints de Home Works requieren una sesión autenticada.

```text
POST    /v1/home-works
GET     /v1/home-works
GET     /v1/home-works/{id}
PUT     /v1/home-works/{id}
DELETE  /v1/home-works/{id}
```
