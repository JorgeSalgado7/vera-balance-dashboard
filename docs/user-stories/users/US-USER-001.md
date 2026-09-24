## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero registrar un usuario,
para permitirle formar parte de una clínica y utilizar las funcionalidades correspondientes a su rol.

Scope: Backend
Status: In Progress

## Descripción

El sistema debe permitir registrar usuarios de Vera Balance con su información personal, profesional y de acceso.

Un usuario puede tener el rol `clinic` o `therapist` y siempre debe estar asociado a una clínica.

## Criterios de aceptación

### CA-01 - Validar datos antes de la creación

Dado que se solicita crear un usuario,
cuando el sistema recibe la información del usuario,
entonces debe validar los datos proporcionados antes de realizar cualquier operación de persistencia relacionada con su creación.

Si alguno de los datos no cumple con las reglas definidas para el usuario,
entonces el sistema debe rechazar la operación y no debe persistir información del nuevo usuario.

### CA-02 - Validar que un usuario no existe

Dado que se proporciona información válida,
cuando se solicita crear un usuario,
entonces el sistema debe validar en la base de datos que el email proporcionado no exista.

En caso de existir un usuario con el mismo email,
el sistema debe rechazar la creación.

### CA-03 - Crear usuario correctamente

Dado que se proporciona información válida y el email no se encuentra registrado,
cuando se solicita crear un usuario,
entonces el sistema debe registrar el usuario correctamente.

### CA-04 - Generar identificador

Dado que se crea un usuario,
cuando se procesa la solicitud,
entonces el sistema debe generar un identificador único.

### CA-05 - Información obligatoria

Dado que se intenta crear un usuario,
cuando `name`, `email`, `password`, `professional_license` o `clinic` están vacíos o no fueron proporcionados,
entonces el sistema debe rechazar la operación.

### CA-06 - Email único

Dado que existe un usuario registrado con un email,
cuando se intenta registrar otro usuario con el mismo email,
entonces el sistema debe rechazar la operación.

### CA-07 - Protección de contraseña

Dado que se proporciona una contraseña válida,
cuando se crea el usuario,
entonces la contraseña debe convertirse en un hash antes de ser persistida.

La contraseña original no debe almacenarse en la base de datos.

### CA-08 - Rol válido

Dado que se crea un usuario,
cuando se proporciona su rol,
entonces únicamente debe permitirse `clinic` o `therapist`.

### CA-09 - Asociación obligatoria con clínica

Dado que se crea un usuario,
cuando se validan los datos proporcionados,
entonces debe existir una asociación con una clínica.

La asociación con una clínica es obligatoria y no puede ser `null`.

La referencia de la clínica debe almacenarse de acuerdo con el modelo definido en `docs/database.md`.

### CA-10 - Estado inicial

Dado que se crea un nuevo usuario,
cuando el usuario es registrado,
entonces debe iniciar con estado `active`.

### CA-11 - Fechas de auditoría

Dado que se registra un usuario,
cuando finaliza su creación,
entonces el sistema debe generar las fechas de creación y última actualización.

### CA-12 - Respuesta

Dado que el usuario fue creado correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver su información pública.

La contraseña y su hash no deben formar parte de la respuesta.

## Reglas de negocio

* Los datos del usuario deben validarse antes de realizar su creación.
* Si los datos proporcionados no son válidos, no debe realizarse ninguna operación de persistencia para crear el usuario.
* El email de un usuario debe ser único.
* Los roles permitidos son `clinic` y `therapist`.
* Todo usuario debe estar asociado a una clínica.
* La asociación con una clínica es obligatoria y no puede ser `null`.
* Un usuario nuevo inicia con estado `active`.
* Las contraseñas nunca deben almacenarse en texto plano.
* La contraseña y su hash nunca deben exponerse mediante el API.

## Dependencias

* Clinics.

## Consideraciones técnicas

* La validación de los datos del usuario debe realizarse antes de ejecutar operaciones de persistencia relacionadas con su creación.
* El password debe procesarse mediante un algoritmo de hashing adecuado para contraseñas, como bcrypt.
* La verificación de unicidad del email debe realizarse antes de persistir un nuevo usuario.
* La asociación con una clínica es obligatoria.
* El contrato HTTP debe respetar `docs/openapi.yaml`.
* La persistencia debe respetar `docs/database.md`.
* La implementación debe respetar `docs/architecture-guidelines.md`.
* Los detalles específicos de DynamoDB no deben exponerse en el dominio.

## Referencias

* `docs/database.md`
* `docs/openapi.yaml`
* `docs/definitions.md`
* `docs/architecture-guidelines.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [x] Se agregaron o actualizaron las pruebas necesarias.
* [x] Las pruebas pasan correctamente.
* [x] La implementación fue revisada.
