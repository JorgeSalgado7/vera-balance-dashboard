# DEFINICIONES

## 1. Definiciones

### 1.1 Clínica

- Nombre

- Logo

- Dirección

- Teléfono

- Tipos de terapia

- Estatus

Cada clínica tendrá tipos de terapia definidos por default y podrá agregar nuevos tipos posteriormente.

El estatus de una clínica puede ser:

- `active` → Activa

- `inactive` → Inactiva

### 1.2 Usuario

- Nombre

- Email

- Password

- Cédula profesional

- Clínica

- Rol

- Estatus

Un usuario pertenece obligatoriamente a una clínica y puede tener rol de `clinic` o `therapist`.

En el frontend estos roles se mostrarán como:

- `clinic` → Clínica

- `therapist` → Terapeuta

El email de un usuario debe ser único.

La contraseña nunca debe almacenarse en texto plano. El backend debe almacenar únicamente su hash.

Al crear un usuario, la contraseña debe proporcionarse junto con su confirmación. Ambos valores deben coincidir antes de generar el hash y persistir el usuario.

La confirmación de contraseña es únicamente un dato de entrada y nunca debe persistirse.

La contraseña, su hash y la confirmación de contraseña nunca deben exponerse en respuestas del API.

El estatus de un usuario puede ser:

- `active` → Activo

- `inactive` → Inactivo

Únicamente los usuarios con estatus `active` podrán iniciar sesión.

#### Creación y administración de usuarios

La creación de usuarios mediante `POST /v1/users` es una operación protegida. Requiere una sesión autenticada válida y un usuario con rol `clinic`.

- Un usuario anónimo no puede crear cuentas mediante el API.
- El backend obtiene la identidad, el rol y la clínica del administrador desde su sesión autenticada y las comprobaciones de autorización correspondientes.
- El usuario creado debe pertenecer a la misma clínica del administrador autenticado.
- El cliente no puede seleccionar libremente una clínica distinta ni utilizar `clinic_id` para evadir esta restricción.
- Los roles permitidos para los usuarios de la clínica son `clinic` y `therapist`.
- El backend valida el email único, los campos obligatorios y la coincidencia entre contraseña y confirmación antes de persistir la cuenta.
- El cambio de estatus se realiza mediante `PATCH /v1/users/{id}/status`, con valores `active` e `inactive`.
- Las operaciones de consulta, modificación, eliminación y cambio de estatus requieren autenticación y autorización según rol, clínica y propiedad del recurso.
- Un usuario con rol `therapist` no puede crear ni administrar otros usuarios; únicamente puede editar los datos permitidos de su propio perfil.
- No se debe permitir dejar a una clínica sin ningún usuario administrador `clinic` activo por eliminación o desactivación de su último administrador activo.

**Inicialización del primer usuario:** la creación de la primera clínica y su primer administrador `clinic` se realizará mediante un procedimiento de inicialización restringido (*bootstrap*), fuera de los endpoints públicos de la aplicación. Este procedimiento no constituye una excepción de autenticación para `POST /v1/users`. Sus detalles operativos deberán documentarse por separado antes de implementarlo.

### 1.3 Autenticación y sesión

La autenticación permite a un usuario acceder a Vera Balance mediante su email y contraseña.

Vera Balance utiliza un único JWT para representar la sesión autenticada del usuario.

El JWT se entrega mediante una cookie `HttpOnly` y no se almacena en DynamoDB.

Las operaciones públicas no requieren un token previo.

Las operaciones protegidas requieren una sesión autenticada válida.

#### Inicio de sesión

El inicio de sesión es una operación pública.

Para iniciar sesión, el cliente debe proporcionar:

- Email

- Contraseña

Al iniciar sesión:

- El usuario debe existir.

- El usuario debe tener estatus `active`.

- La contraseña proporcionada debe validarse contra el hash almacenado.

- Si las credenciales son válidas, el backend genera un JWT de sesión.

- El JWT tendrá una vigencia de 5 minutos.

- El JWT se entregará mediante una cookie `HttpOnly`.

- El JWT no deberá exponerse en el cuerpo de la respuesta.

- El frontend no deberá almacenar el JWT en `localStorage`, `sessionStorage` ni Redux.

- El frontend no deberá intentar acceder directamente al contenido del JWT.

La cookie de sesión tendrá la siguiente configuración:

```text

Name: vera_balance_session

HttpOnly: true

Secure: true

SameSite: Lax

Path: /

Max-Age: 300 segundos

```

El backend deberá utilizar una clave de firma segura para generar los JWT.

La validación del JWT deberá comprobar su firma, expiración y demás propiedades de seguridad definidas para la sesión.

#### Sesión autenticada

La cookie de sesión se envía automáticamente por el navegador en las solicitudes que requieren autenticación, de acuerdo con la configuración del cliente HTTP y las políticas del navegador.

El JWT contenido en la cookie representa la identidad autenticada del usuario.

Una sesión válida permite identificar al usuario, pero no implica automáticamente autorización para acceder a todos los recursos.

El backend deberá aplicar las reglas de autorización correspondientes al rol, clínica y propiedad de los recursos.

Una sesión será inválida cuando:

- No exista una cookie de sesión.

- El JWT no exista o tenga un formato inválido.

- La firma del JWT no sea válida.

- El JWT haya expirado.

- El JWT no cumpla las validaciones de seguridad requeridas.

Los endpoints protegidos deberán rechazar las solicitudes que no tengan una sesión válida.

El JWT no se almacenará en DynamoDB.

No existirán registros de sesión ni refresh tokens persistidos.

La validación del JWT no requerirá buscar el valor del token en la base de datos.

Cuando una operación necesite validar el estatus actual del usuario o sus permisos, podrá consultar la información correspondiente mediante las capacidades del módulo propietario.

#### Verificación de sesión

El endpoint de verificación permitirá determinar si la sesión autenticada sigue siendo válida.

```text

POST /v1/auth/verify

```

Al verificar una sesión:

- El backend obtiene el JWT desde la cookie.

- Valida la firma del JWT.

- Valida su fecha de expiración.

- Comprueba que la identidad autenticada sea válida.

- Devuelve el resultado de la verificación.

- Si la sesión es inválida o expiró, deberá rechazar la solicitud.

El frontend podrá realizar verificaciones periódicas para confirmar el estado de autenticación.

La verificación de sesión no deberá utilizarse para prolongar indefinidamente una sesión cuando el usuario no tenga actividad.

#### Renovación de sesión

El JWT de sesión tendrá una vigencia de 5 minutos.

Para permitir que un usuario continúe trabajando sin iniciar sesión repetidamente, Vera Balance permitirá renovar la sesión mientras exista actividad.

```text

POST /v1/auth/refresh

```

La renovación seguirá las siguientes reglas:

- Se requiere una sesión autenticada válida.

- El JWT actual no debe haber expirado.

- El backend valida el JWT recibido mediante la cookie.

- Si es válido, genera un nuevo JWT de sesión.

- El nuevo JWT tendrá una vigencia de 5 minutos.

- El nuevo JWT reemplaza al anterior mediante la cookie de sesión.

- El JWT renovado no se almacenará en DynamoDB.

- No se utilizará un refresh token independiente.

- No se permitirá renovar una sesión utilizando únicamente un JWT expirado.

El frontend será responsable de detectar la actividad del usuario y solicitar la renovación antes de que expire el JWT.

La renovación deberá realizarse con anticipación suficiente para evitar que el JWT expire durante la solicitud.

No deberá renovarse la sesión automáticamente cuando el usuario se encuentre inactivo.

El backend no podrá comprobar por sí solo la actividad real del usuario únicamente mediante un JWT stateless. La decisión de solicitar la renovación dependerá del control de actividad implementado en el frontend.

#### Inactividad

Vera Balance tendrá un tiempo máximo de inactividad de 5 minutos.

El frontend deberá detectar la actividad del usuario mediante eventos relevantes de interacción.

Ejemplos:

- Clics.

- Escritura.

- Interacciones con formularios.

- Navegación dentro de la aplicación.

- Otras interacciones que representen actividad real del usuario.

Reglas:

- La actividad válida reinicia el contador de inactividad.

- Si el usuario permanece 5 minutos sin actividad, el frontend deberá finalizar la sesión.

- Al finalizar la sesión, deberá solicitarse el cierre de sesión y eliminarse el estado de autenticación del frontend.

- El usuario deberá regresar a la pantalla de inicio de sesión.

- Las solicitudes automáticas, polling y procesos ejecutados en segundo plano no deberán considerarse actividad del usuario.

- La renovación de sesión no deberá reiniciar por sí misma el contador de inactividad.

- Si el JWT expira antes de renovarse, el usuario deberá iniciar sesión nuevamente.

El frontend deberá mantener una sola fuente de verdad para el control de actividad y evitar temporizadores independientes que generen comportamientos inconsistentes.

#### Cierre de sesión

El cierre de sesión permite finalizar la sesión autenticada del navegador.

```text

POST /v1/auth/sign-out

```

Al cerrar sesión:

- El backend elimina la cookie `vera_balance_session`.

- El frontend elimina su estado local de autenticación.

- El usuario deja de tener acceso a las pantallas protegidas.

- El cliente no deberá enviar el JWT en el cuerpo de la solicitud.

- El frontend deberá redirigir al usuario a la pantalla de inicio de sesión.

Como los JWT no se almacenan en DynamoDB, el cierre de sesión no requiere eliminar registros de sesión.

La eliminación de la cookie no revoca criptográficamente un JWT emitido previamente.

Una copia del JWT podría continuar siendo válida hasta su expiración. Para revocarla inmediatamente sería necesario incorporar un mecanismo adicional de revocación, que no forma parte del diseño actual.

#### Cambio de contraseña

Un usuario autenticado puede cambiar su propia contraseña.

```text

POST /v1/auth/reset-password

```

Para cambiar la contraseña:

- Se requiere una sesión autenticada válida.

- La identidad del usuario se obtiene de la sesión.

- No se debe recibir el email o identificador del usuario como mecanismo para determinar qué contraseña modificar.

- Se debe proporcionar la nueva contraseña.

- Se debe proporcionar la confirmación de la nueva contraseña.

- Ambos valores deben coincidir antes de generar el hash.

- La nueva contraseña debe almacenarse únicamente como hash.

- La contraseña y su confirmación nunca deben exponerse en respuestas del API.

- La confirmación de contraseña nunca debe persistirse.

El cambio de contraseña realizado por un usuario autenticado es independiente del flujo de recuperación de una contraseña olvidada.

#### Recuperación de contraseña

La recuperación de contraseña permite recuperar el acceso cuando el usuario no dispone de una sesión autenticada.

Este proceso utiliza un código numérico de verificación enviado al correo electrónico asociado al usuario.

El código de recuperación no es un JWT y no representa una sesión autenticada.

El proceso tendrá dos operaciones:

```text

POST /v1/auth/forgot-password

POST /v1/auth/forgot-password/reset

```

Ambas operaciones serán públicas y no requerirán una sesión autenticada.

#### Solicitud de recuperación

```text

POST /v1/auth/forgot-password

```

Para solicitar la recuperación, el cliente deberá proporcionar:

- Email

Ejemplo:

```json

{

  "email": "usuario@verabalance.com"

}

```

Al solicitar la recuperación:

- El backend recibe el email.

- La respuesta no debe revelar si el email corresponde a un usuario existente.

- Si el usuario existe y puede utilizar el flujo de recuperación, se genera un código de verificación.

- El código será numérico y tendrá 6 dígitos.

- El código tendrá una vigencia de 5 minutos.

- El código se asociará al usuario correspondiente.

- El código se enviará al email registrado.

- El código nunca se devolverá en la respuesta del API.

- La contraseña actual no deberá modificarse durante esta operación.

- La solicitud deberá estar protegida mediante controles de frecuencia para evitar abusos.

El envío de correos se realizará mediante Resend.

El backend tendrá una plantilla independiente para el correo de recuperación de contraseña.

El módulo Auth utilizará una capacidad expuesta por el módulo Email, sin depender directamente del SDK de Resend.

#### Código de verificación

El código de recuperación tendrá las siguientes características:

- Longitud de 6 dígitos.

- Únicamente caracteres numéricos.

- Vigencia de 5 minutos.

- Máximo 5 intentos fallidos.

- Un solo uso.

- Asociación obligatoria con un usuario.

- No representa una sesión autenticada.

- No permite acceder a endpoints protegidos.

- No puede utilizarse para ejecutar operaciones distintas de la recuperación de contraseña.

El código se generará mediante un mecanismo criptográficamente seguro.

No se almacenará en texto plano.

Dado que un código de 6 dígitos tiene un espacio de búsqueda reducido, su representación persistida deberá protegerse mediante un mecanismo adecuado, como un HMAC con una clave secreta del servidor.

#### Persistencia del código

Los códigos de recuperación se administrarán mediante una entidad independiente en DynamoDB.

```text

PASSWORD_RECOVERY

```

La estructura estará definida en `docs/DB.md`.

Cada registro almacenará:

- UUID del usuario.

- Hash protegido del código.

- Fecha de expiración.

- Número de intentos fallidos.

- Fecha de creación.

- Timestamp TTL para eliminación automática.

Reglas:

- Solo podrá existir un código vigente por usuario.

- Solicitar un nuevo código invalidará el anterior.

- El código expirará después de 5 minutos.

- Un código expirado no podrá utilizarse.

- El backend deberá comprobar explícitamente su fecha de expiración.

- No se dependerá exclusivamente del mecanismo TTL de DynamoDB.

- El código quedará invalidado al superar los intentos permitidos.

- El código deberá consumirse después de actualizar correctamente la contraseña.

- El código consumido no podrá reutilizarse.

La eliminación mediante DynamoDB TTL es eventual y no garantiza que el registro desaparezca inmediatamente al expirar.

Por lo tanto, el backend siempre deberá comprobar la vigencia del código antes de aceptarlo.

#### Restablecimiento de contraseña olvidada

```text

POST /v1/auth/forgot-password/reset

```

Para completar la recuperación, el cliente deberá proporcionar:

- Email.

- Código de verificación.

- Nueva contraseña.

- Confirmación de la nueva contraseña.

Ejemplo:

```json

{

  "email": "usuario@verabalance.com",

  "verification_code": "123456",

  "password": "NewPassword123!",

  "password_confirmation": "NewPassword123!"

}

```

Antes de modificar la contraseña:

- El email deberá corresponder a un usuario válido.

- Deberá existir un código de recuperación asociado al usuario.

- El código proporcionado deberá coincidir con el código generado.

- El código no deberá haber expirado.

- El código no deberá haber sido consumido.

- El número de intentos fallidos no deberá superar el límite permitido.

- La nueva contraseña y su confirmación deberán coincidir.

- Todas las validaciones deberán completarse antes de modificar la contraseña.

Cuando el código sea incorrecto:

- Se incrementará el número de intentos fallidos.

- Se rechazará la operación.

- No se modificará la contraseña.

Después de 5 intentos fallidos, el código quedará invalidado y el usuario deberá solicitar uno nuevo.

Al completar correctamente la recuperación:

- La nueva contraseña se almacenará únicamente como hash.

- La confirmación de contraseña nunca se persistirá.

- El código quedará consumido.

- El registro de recuperación deberá eliminarse.

- El código no podrá reutilizarse.

- No se creará automáticamente una sesión autenticada.

- El usuario deberá iniciar sesión posteriormente mediante el flujo normal de autenticación.

El consumo del código y la actualización de la contraseña deberán coordinarse de manera segura para evitar que solicitudes concurrentes utilicen el mismo código.

#### Seguridad del flujo de recuperación

El flujo de recuperación deberá cumplir las siguientes reglas:

- No revelar si un email existe en el sistema durante la solicitud inicial.

- No exponer códigos de verificación en respuestas del API.

- No registrar códigos ni contraseñas en logs.

- No almacenar códigos en texto plano.

- Limitar la cantidad de solicitudes de recuperación.

- Limitar los intentos de validación.

- Invalidar los códigos anteriores cuando se genere uno nuevo.

- Impedir la reutilización de códigos consumidos.

- No iniciar sesión automáticamente después de recuperar una contraseña.

- Mantener separados los códigos de recuperación y los JWT de sesión.

La implementación deberá respetar las definiciones de `docs/DB.md` y el contrato de `docs/baas-vera-balance-dashboard.yaml`.

### 1.4 Proceso terapéutico

- Tipo de terapia

- Terapeuta

- Pacientes

- ¿Primera vez?

- Motivo de la consulta

- Objetivos

- Registros de sesión

- Estatus

El proceso terapéutico representa el tratamiento que uno o más pacientes llevan con un terapeuta.

Un paciente puede participar en diferentes procesos terapéuticos a lo largo del tiempo.

Los estados disponibles son:

- `active` → Activo

- `inactive` → Inactivo

- `discharged` → Dado de alta

- `unfinished` → Proceso no finalizado

Los valores internos se almacenan en inglés. El frontend es responsable de mostrar su equivalente en español.

El estado pertenece al proceso terapéutico y no al paciente.

### 1.5 Paciente

- Clínica

- Nombre

- Edad

- Tutor

  - Nombre

  - Teléfono

  - Parentesco

- Teléfono

- Sexo

- Escolaridad

- Ocupación

- Estado civil

- Datos de la pareja

  - Nombre

  - Edad

  - Tiempo de la relación

  - Ocupación

- Religión

- Dirección

El paciente representa a una persona registrada dentro de una clínica y pertenece obligatoriamente a una clínica.

Una persona se considera adulta cuando tiene 18 años o más. Una persona menor de 18 años se considera menor de edad.

El teléfono de un menor puede corresponder al teléfono de su tutor. Por este motivo, diferentes pacientes pueden compartir el mismo número telefónico.

Para determinar si un paciente ya se encuentra registrado se debe considerar la combinación de su nombre y número telefónico.

La coincidencia únicamente del número telefónico no implica que se trate del mismo paciente.

Los campos cuyos valores provengan de un catálogo se almacenan como `string`.

Antes de crear o modificar un paciente, el backend debe validar que el valor proporcionado exista dentro del catálogo correspondiente.

Los datos de la pareja se capturan cuando la situación sentimental del paciente indica que tiene pareja o se encuentra casado y el proceso terapéutico no corresponde a terapia de pareja.

Los datos de la pareja son únicamente información complementaria del paciente y no representan otro paciente dentro del sistema.

En terapia de pareja, cada integrante debe existir como un paciente independiente y ambos pacientes se relacionan con el mismo proceso terapéutico.

El paciente no tiene un estado activo o inactivo propio.

El estado pertenece a cada proceso terapéutico en el que participa.

Un paciente únicamente puede eliminarse cuando no tiene ni ha tenido procesos terapéuticos asociados.

Si el paciente tiene o ha tenido al menos un proceso terapéutico, su información debe conservarse y no puede eliminarse físicamente.

El estado correspondiente debe gestionarse mediante el proceso terapéutico.

La necesidad de capturar información del tutor depende del tipo de terapia y de las reglas definidas para cada tipo de proceso terapéutico.

### 1.6 Registro de sesión

Representa el registro de una sesión perteneciente a un proceso terapéutico.

- Fecha de la sesión

- ¿Asistió?

- Resumen de la sesión

- Herramientas brindadas al paciente

- Tareas

Las tareas se seleccionan a partir de las tareas existentes.

Cada registro debe estar asociado a un proceso terapéutico.

El registro de sesión no representa un proceso terapéutico independiente.

Cuando el paciente no asiste, el registro permite conservar la información correspondiente a la inasistencia.

### 1.7 Tareas

- Descripción

- ¿Completada?

Las tareas son entidades independientes.

Esto permite crear una tarea una sola vez y posteriormente seleccionarla dentro de los registros de sesión.

Las tareas se relacionan con los registros mediante referencias.

El estado de cumplimiento se administra mediante el campo `is_completed`.

## 2. Tipos de terapia

### 2.1 Individual

- Un único paciente pertenece al proceso terapéutico.

- Si la situación sentimental del paciente indica que tiene pareja o se encuentra casado, se solicitan los datos de la pareja.

- Los datos de la pareja son información complementaria y no representan un segundo paciente dentro del proceso terapéutico.

- Si la edad del paciente es menor a 18 años, por default el tipo de terapia cambia a Terapia infantil.

### 2.2 Pareja

- Dos pacientes pertenecen al mismo proceso terapéutico.

- Cada integrante de la pareja se registra como un paciente independiente.

- Se pueden crear dos pacientes nuevos, seleccionar dos pacientes existentes o combinar un paciente nuevo con uno existente.

- Ambos pacientes se relacionan con el mismo proceso terapéutico.

- No se utilizan los datos de la pareja del paciente para representar al segundo integrante del proceso.

- El estado civil no influye en mostrar información adicional de pareja en el frontend.

### 2.3 Infantil

- Un único paciente pertenece al proceso terapéutico.

- El paciente debe ser menor de 18 años.

- Se solicitan los datos de un tutor.

- Los datos del tutor se muestran por default al seleccionar Terapia infantil.

### 2.4 Familiar

- Dos o más pacientes pertenecen al mismo proceso terapéutico.

- Cada integrante se registra como un paciente independiente.

- Si alguno de los pacientes es menor de 18 años, no es necesario agregar datos de tutor por participar en este tipo de terapia.

## 3. Roles

### 3.1 Clínica

El usuario con rol de clínica tiene acceso a los terapeutas y recursos pertenecientes a su misma clínica.

Además de las funciones administrativas, también puede actuar como terapeuta y administrar sus propios pacientes, procesos terapéuticos y registros de sesión.

Puede realizar las siguientes acciones:

1. Editar la información de su clínica.

2. Editar su perfil.

3. Cambiar su contraseña.

4. Crear, editar y eliminar usuarios de su clínica mediante endpoints autenticados, sin poder eliminar ni desactivar al último administrador `clinic` activo.

5. Crear, editar y eliminar pacientes de su clínica de acuerdo con las reglas de eliminación definidas para pacientes.

6. Crear, editar y eliminar procesos terapéuticos.

7. Crear, editar y eliminar registros de sesión.

8. Crear, editar y eliminar tareas.

9. Consultar la información de los terapeutas pertenecientes a su clínica.

10. Consultar la información de los pacientes y procesos terapéuticos de los terapeutas pertenecientes a su clínica.

Un usuario con rol `clinic` únicamente puede eliminar físicamente un paciente cuando este no tiene ni ha tenido procesos terapéuticos asociados.

Si el paciente tiene o ha tenido al menos un proceso terapéutico, el paciente debe conservarse y el estado debe administrarse mediante el proceso terapéutico correspondiente.

### 3.2 Terapeuta

El usuario con rol de terapeuta tiene acceso únicamente a sus propios recursos y a la información relacionada con sus procesos terapéuticos.

Puede realizar las siguientes acciones:

1. Editar su perfil.

2. Cambiar su contraseña.

3. Crear y editar sus pacientes.

4. Crear y editar sus procesos terapéuticos.

5. Crear y editar sus registros de sesión.

6. Crear y editar tareas relacionadas con sus pacientes y procesos terapéuticos.

El terapeuta no puede eliminar directamente un paciente.

El terapeuta no puede crear ni administrar usuarios de la clínica ni modificar información administrativa de otros terapeutas.

Las operaciones realizadas por un terapeuta deben respetar las relaciones de propiedad y asignación de los procesos terapéuticos.

Un terapeuta no podrá consultar ni modificar recursos pertenecientes a otra clínica.

Tampoco podrá acceder a procesos terapéuticos asignados a otros terapeutas, salvo que exista una autorización explícita definida posteriormente.

Las validaciones de permisos deberán realizarse en el backend y no depender únicamente de las restricciones visuales del frontend.