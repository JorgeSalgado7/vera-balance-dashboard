# DEFINICIONES

## 1. Definiciones

### 1.1 Clínica

* Nombre
* Logo
* Dirección
* Teléfono
* Tipos de terapia
* Estatus

Cada clínica tendrá tipos de terapia definidos por default y podrá agregar nuevos tipos posteriormente.

### 1.2 Usuario

* Nombre
* Email
* Password
* Cédula profesional
* Clínica
* Rol
* Estatus

Un usuario pertenece obligatoriamente a una clínica y puede tener rol de `clinic` o `therapist`.

En el frontend estos roles se mostrarán como:

* `clinic` → Clínica
* `therapist` → Terapeuta

El email de un usuario debe ser único.

La contraseña nunca debe almacenarse en texto plano. El backend debe almacenar únicamente su hash.

Al crear un usuario, la contraseña debe proporcionarse junto con su confirmación. Ambos valores deben coincidir antes de generar el hash y persistir el usuario.

La confirmación de contraseña es únicamente un dato de entrada y nunca debe persistirse.

La contraseña, su hash y la confirmación de contraseña nunca deben exponerse en respuestas del API.

### 1.3 Autenticación y sesión

La autenticación permite a un usuario acceder a Vera Balance mediante su email y contraseña.

Vera Balance utiliza dos mecanismos diferentes para proteger las operaciones del API:

* Public Operation Token para operaciones que no requieren una sesión autenticada.
* JWT de sesión para operaciones realizadas por usuarios autenticados.

Ambos mecanismos tienen propósitos diferentes y no deben utilizarse indistintamente.

#### Public Operation Token

El Public Operation Token permite ejecutar operaciones específicas que deben estar disponibles antes de que exista una sesión autenticada.

Actualmente se utiliza únicamente para:

* Crear un usuario.
* Iniciar sesión.
* Solicitar la recuperación de contraseña.

Antes de ejecutar cualquiera de estas operaciones, el cliente debe solicitar un Public Operation Token.

Cada Public Operation Token:

* Debe tener un scope específico.
* Debe tener una vigencia limitada.
* Debe ser de un solo uso.
* Solo puede utilizarse para la operación correspondiente a su scope.
* No representa una sesión de usuario.
* No puede utilizarse para acceder a endpoints protegidos mediante sesión.
* Debe consumirse cuando el endpoint correspondiente acepta la solicitud.
* Una vez consumido no puede volver a utilizarse.

Los scopes disponibles inicialmente son:

* `users:create`
* `auth:sign-in`
* `auth:forgot-password`

Un token generado para un scope no puede utilizarse para ejecutar una operación correspondiente a otro scope.

Por ejemplo, un token con scope `auth:sign-in` únicamente puede utilizarse para iniciar sesión y no puede utilizarse para crear un usuario o solicitar la recuperación de una contraseña.

El endpoint encargado de generar un Public Operation Token es el único endpoint que no requiere previamente una sesión autenticada ni otro Public Operation Token.

El mecanismo de persistencia, expiración y consumo del Public Operation Token debe seguir las reglas definidas en la documentación técnica correspondiente.

#### Inicio de sesión

Para iniciar sesión, el cliente debe obtener previamente un Public Operation Token con scope `auth:sign-in`.

Al iniciar sesión:

* Se debe validar el Public Operation Token.
* El token debe corresponder al scope `auth:sign-in`.
* El token debe encontrarse vigente.
* El token no debe haber sido utilizado previamente.
* El Public Operation Token debe consumirse al aceptarse la solicitud de inicio de sesión.
* El usuario debe existir.
* El usuario debe tener estatus `active`.
* La contraseña proporcionada debe coincidir con la contraseña almacenada mediante la validación de su hash.
* Si las credenciales son válidas, el backend genera un JWT de sesión.
* El JWT se entrega mediante una cookie `HttpOnly`.
* El JWT no debe exponerse en el cuerpo de la respuesta.
* El frontend no debe almacenar el JWT en `localStorage` o `sessionStorage` ni acceder directamente a su contenido.

El Public Operation Token utilizado para iniciar sesión no se convierte en un JWT de sesión. Son credenciales independientes con propósitos diferentes.

#### Sesión autenticada

La cookie de sesión se envía automáticamente por el navegador en las solicitudes que requieren autenticación.

El JWT contenido en la cookie representa la sesión autenticada del usuario.

Los endpoints que no utilizan explícitamente un Public Operation Token deben requerir una sesión autenticada de acuerdo con el contrato definido en `docs/baas-vera-balance-dashboard.yaml`.

Al verificar una sesión, el backend obtiene y valida el JWT desde la cookie de sesión.

Una sesión inválida, ausente o expirada no debe permitir acceder a recursos protegidos.

La autenticación de una sesión no implica automáticamente autorización para acceder a cualquier recurso. El backend debe aplicar adicionalmente las reglas de permisos correspondientes al rol, clínica y propiedad de los recursos.

#### Cierre de sesión

Al cerrar sesión, el backend elimina la cookie de sesión.

El cliente no debe enviar el JWT en el cuerpo de la solicitud.

#### Cambio de contraseña

Un usuario autenticado puede cambiar su propia contraseña.

Para cambiar la contraseña:

* Se requiere una sesión autenticada válida.
* La identidad del usuario se obtiene de la sesión.
* No se debe recibir el email o identificador del usuario como mecanismo para determinar qué contraseña modificar.
* Se debe proporcionar la nueva contraseña.
* Se debe proporcionar la confirmación de la nueva contraseña.
* Ambos valores deben coincidir antes de generar el hash.
* La nueva contraseña debe almacenarse únicamente como hash.
* La contraseña y su confirmación nunca deben exponerse en respuestas del API.
* La confirmación de contraseña nunca debe persistirse.

El cambio de contraseña realizado por un usuario autenticado es independiente del flujo de recuperación de una contraseña olvidada.

#### Recuperación de contraseña

La recuperación de contraseña permite recuperar el acceso cuando el usuario no dispone de una sesión autenticada.

El flujo utiliza dos credenciales diferentes:

* Public Operation Token para autorizar únicamente la solicitud inicial de recuperación.
* Password Recovery Token para autorizar el establecimiento de una nueva contraseña después de demostrar acceso al correo asociado al usuario.

Para solicitar la recuperación de contraseña, el cliente debe obtener previamente un Public Operation Token con scope `auth:forgot-password`.

Al solicitar la recuperación:

* Se debe validar el Public Operation Token.
* El token debe corresponder al scope `auth:forgot-password`.
* El token debe encontrarse vigente.
* El token no debe haber sido utilizado previamente.
* El Public Operation Token debe consumirse al aceptarse la solicitud.
* La solicitud debe recibir el email del usuario.
* La respuesta del API no debe revelar si el email proporcionado corresponde o no a un usuario existente.
* Si existe un usuario asociado al email, el backend debe generar un Password Recovery Token.
* El Password Recovery Token debe asociarse al usuario correspondiente.
* El Password Recovery Token debe tener una vigencia limitada.
* El Password Recovery Token debe ser de un solo uso.
* El Password Recovery Token debe enviarse al correo asociado al usuario mediante el mecanismo de recuperación.
* El Password Recovery Token no debe devolverse en la respuesta del endpoint de solicitud de recuperación.
* La contraseña actual no debe modificarse durante la solicitud inicial.

El Public Operation Token utilizado para solicitar la recuperación de contraseña únicamente autoriza la solicitud inicial y no debe utilizarse posteriormente como credencial para cambiar la contraseña.

El Password Recovery Token:

* Es una credencial específica para recuperación de contraseña.
* No representa una sesión autenticada.
* No puede utilizarse para acceder a endpoints protegidos mediante sesión.
* No puede utilizarse como Public Operation Token.
* Debe permitir identificar de forma segura al usuario asociado.
* Debe encontrarse vigente y no consumido para poder establecer una nueva contraseña.
* Debe quedar consumido después de cambiar correctamente la contraseña.
* No debe almacenarse en texto plano cuando su validación requiera persistencia.

Para completar la recuperación, el cliente debe proporcionar el Password Recovery Token, la nueva contraseña y su confirmación al endpoint definido en `docs/baas-vera-balance-dashboard.yaml`.

Antes de modificar la contraseña:

* El Password Recovery Token debe ser válido.
* El Password Recovery Token no debe estar expirado.
* El Password Recovery Token no debe haber sido consumido.
* La identidad del usuario debe obtenerse a partir del Password Recovery Token validado.
* La nueva contraseña y su confirmación deben coincidir.
* Las validaciones deben completarse antes de generar el hash y antes de modificar la contraseña persistida.

Al completar correctamente la recuperación:

* La nueva contraseña debe almacenarse únicamente como hash.
* La confirmación de contraseña nunca debe persistirse.
* El Password Recovery Token debe quedar consumido.
* El Password Recovery Token no debe poder reutilizarse.
* No debe crearse automáticamente una sesión autenticada.
* El usuario debe iniciar sesión posteriormente mediante el flujo normal de autenticación.

La persistencia, expiración y consumo del Password Recovery Token deben respetar `docs/DB.md`.

El envío del correo debe realizarse mediante una abstracción de aplicación para evitar acoplar el dominio o los casos de uso a un proveedor específico de correo.

### 1.4 Proceso terapéutico

* Tipo de terapia
* Terapeuta
* Pacientes
* ¿Primera vez?
* Motivo de la consulta
* Objetivos
* Registros de sesión
* Estatus

El proceso terapéutico representa el tratamiento que uno o más pacientes llevan con un terapeuta.

Un paciente puede participar en diferentes procesos terapéuticos a lo largo del tiempo.

Los estados disponibles son:

* `active` → Activo
* `inactive` → Inactivo
* `discharged` → Dado de alta
* `unfinished` → Proceso no finalizado

Los valores internos se almacenan en inglés. El frontend es responsable de mostrar su equivalente en español.

### 1.5 Paciente

* Clínica
* Nombre
* Edad
* Tutor

  * Nombre
  * Teléfono
  * Parentesco
* Teléfono
* Sexo
* Escolaridad
* Ocupación
* Estado civil
* Datos de la pareja

  * Nombre
  * Edad
  * Tiempo de la relación
  * Ocupación
* Religión
* Dirección

El paciente representa a una persona registrada dentro de una clínica y pertenece obligatoriamente a una clínica.

Una persona se considera adulta cuando tiene 18 años o más. Una persona menor de 18 años se considera menor de edad.

El teléfono de un menor puede corresponder al teléfono de su tutor. Por este motivo, diferentes pacientes pueden compartir el mismo número telefónico.

Para determinar si un paciente ya se encuentra registrado se debe considerar la combinación de su nombre y número telefónico. La coincidencia únicamente del número telefónico no implica que se trate del mismo paciente.

Los campos cuyos valores provengan de un catálogo se almacenan como `string`. Antes de crear o modificar un paciente, el backend debe validar que el valor proporcionado exista dentro del catálogo correspondiente.

Los datos de la pareja se capturan cuando la situación sentimental del paciente indica que tiene pareja o se encuentra casado y el proceso terapéutico no corresponde a terapia de pareja.

Los datos de la pareja son únicamente información complementaria del paciente y no representan otro paciente dentro del sistema.

En terapia de pareja, cada integrante debe existir como un paciente independiente y ambos pacientes se relacionan con el mismo proceso terapéutico.

El paciente no tiene un estado activo o inactivo propio. El estado pertenece a cada proceso terapéutico en el que participa.

Un paciente únicamente puede eliminarse cuando no tiene ni ha tenido procesos terapéuticos asociados.

Si el paciente tiene o ha tenido al menos un proceso terapéutico, su información debe conservarse y no puede eliminarse físicamente. El estado correspondiente debe gestionarse mediante el proceso terapéutico.

La necesidad de capturar información del tutor depende del tipo de terapia y de las reglas definidas para cada tipo de proceso terapéutico.

### 1.6 Registro de sesión

Representa el registro de una sesión perteneciente a un proceso terapéutico.

* Fecha de la sesión
* ¿Asistió?
* Resumen de la sesión
* Herramientas brindadas al paciente
* Tareas

Las tareas se seleccionan a partir de las tareas existentes.

### 1.7 Tareas

* Descripción
* ¿Completada?

Las tareas son entidades independientes.

Esto permite crear una tarea una sola vez y posteriormente seleccionarla dentro de los registros de sesión.

## 2. Tipos de terapia

### 2.1 Individual

* Un único paciente pertenece al proceso terapéutico.
* Si la situación sentimental del paciente indica que tiene pareja o se encuentra casado, se solicitan los datos de la pareja.
* Los datos de la pareja son información complementaria y no representan un segundo paciente dentro del proceso terapéutico.
* Si la edad del paciente es menor a 18 años, por default el tipo de terapia cambia a Terapia infantil.

### 2.2 Pareja

* Dos pacientes pertenecen al mismo proceso terapéutico.
* Cada integrante de la pareja se registra como un paciente independiente.
* Se pueden crear dos pacientes nuevos, seleccionar dos pacientes existentes o combinar un paciente nuevo con uno existente.
* Ambos pacientes se relacionan con el mismo proceso terapéutico.
* No se utilizan los datos de la pareja del paciente para representar al segundo integrante del proceso.
* El estado civil no influye en mostrar información adicional de pareja en el frontend.

### 2.3 Infantil

* Un único paciente pertenece al proceso terapéutico.
* El paciente debe ser menor de 18 años.
* Se solicitan los datos de un tutor.
* Los datos del tutor se muestran por default al seleccionar Terapia infantil.

### 2.4 Familiar

* Dos o más pacientes pertenecen al mismo proceso terapéutico.
* Cada integrante se registra como un paciente independiente.
* Si alguno de los pacientes es menor de 18 años, no es necesario agregar datos de tutor por participar en este tipo de terapia.

## 3. Roles

### 3.1 Clínica

El usuario con rol de clínica tiene acceso a los terapeutas y recursos pertenecientes a su misma clínica.

Además de las funciones administrativas, también puede actuar como terapeuta y administrar sus propios pacientes, procesos terapéuticos y registros de sesión.

Puede realizar las siguientes acciones:

1. Editar la información de su clínica.
2. Editar su perfil.
3. Cambiar su contraseña.
4. Crear, editar y eliminar usuarios de su clínica.
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
