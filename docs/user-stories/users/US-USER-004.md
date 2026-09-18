## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero actualizar la información de un usuario,
para mantener sus datos y configuración actualizados.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir modificar la información de un usuario existente sin alterar los campos que no formen parte de la actualización.

## Criterios de aceptación

### CA-01 - Actualizar usuario existente

Dado que existe el usuario,
cuando se proporciona información válida,
entonces el sistema debe guardar los cambios.

### CA-02 - Actualización parcial

Dado que únicamente se proporcionan algunos campos,
cuando se actualiza el usuario,
entonces los campos no proporcionados deben conservar su valor actual.

### CA-03 - Información obligatoria

Dado que se proporciona un nuevo nombre, email, contraseña o cédula profesional,
cuando se actualiza el usuario,
entonces el valor proporcionado no puede estar vacío.

### CA-04 - Email único

Dado que se proporciona un nuevo email,
cuando ya pertenece a otro usuario,
entonces el sistema debe rechazar la actualización.

Dado que el email pertenece al mismo usuario que se está actualizando,
entonces el sistema debe permitir conservarlo.

### CA-05 - Actualizar contraseña

Dado que se proporciona una nueva contraseña,
cuando se actualiza el usuario,
entonces la nueva contraseña debe convertirse en un hash antes de ser persistida.

La contraseña original no debe almacenarse en la base de datos.

### CA-06 - Actualizar rol

Dado que se proporciona un nuevo rol,
cuando se actualiza el usuario,
entonces únicamente debe permitirse `clinic` o `therapist`.

### CA-07 - Actualizar clínica

Dado que se modifica la asociación con una clínica,
cuando se actualiza el usuario,
entonces debe almacenarse la nueva referencia.

La asociación puede establecerse como `null`.

### CA-08 - Actualizar estado

Dado que se modifica el estado,
cuando se actualiza el usuario,
entonces únicamente debe permitirse `active` o `inactive`.

### CA-09 - Fecha de actualización

Dado que el usuario fue modificado,
cuando finaliza la operación,
entonces debe actualizarse su fecha de última modificación.

### CA-10 - Usuario inexistente

Dado que no existe el usuario solicitado,
cuando se intenta actualizar,
entonces el sistema debe indicar que el usuario no fue encontrado.

### CA-11 - Proteger contraseña

Dado que el usuario fue actualizado,
cuando se devuelve su información,
entonces la contraseña y su hash no deben formar parte de la respuesta.

## Reglas de negocio

* El email debe ser único entre usuarios.
* Los roles permitidos son `clinic` y `therapist`.
* Los estados permitidos son `active` e `inactive`.
* Los campos no proporcionados deben conservar su valor actual.
* La fecha de creación debe conservarse.
* Las contraseñas nunca deben almacenarse en texto plano.
* La contraseña y su hash nunca deben exponerse mediante el API.

## Dependencias

* US-USER-003 - Consultar usuario por ID.
* Clinics, cuando se modifica la asociación de clínica.

## Consideraciones técnicas

* El password debe procesarse mediante un algoritmo de hashing adecuado para contraseñas, como bcrypt.
* Al modificar el email debe verificarse que no pertenezca a otro usuario.
* El contrato HTTP debe respetar `docs/openapi.yaml`.
* La persistencia debe respetar `docs/database.md`.
* La implementación debe respetar `docs/architecture-guidelines.md`.

## Referencias

* `docs/database.md`
* `docs/openapi.yaml`
* `docs/definitions.md`
* `docs/architecture-guidelines.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] El proyecto compila correctamente.
* [ ] La documentación técnica fue actualizada cuando corresponde.
* [ ] La implementación fue revisada.
