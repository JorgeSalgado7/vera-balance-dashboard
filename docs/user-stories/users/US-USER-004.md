## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero actualizar la información de un usuario,
para mantener sus datos y configuración actualizados.

Scope: Backend
Status: Under Review

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

Dado que se proporciona un nuevo nombre, email o cédula profesional,
cuando se actualiza el usuario,
entonces el valor proporcionado no puede estar vacío.

### CA-04 - Email único

Dado que se proporciona un nuevo email,
cuando ya pertenece a otro usuario,
entonces el sistema debe rechazar la actualización.

Dado que el email pertenece al mismo usuario que se está actualizando,
entonces el sistema debe permitir conservarlo.

La validación se realiza antes de guardar. La garantía de unicidad ante solicitudes simultáneas queda fuera del alcance de esta User Story.


### CA-06 - Actualizar rol

Dado que se proporciona un nuevo rol,
cuando se actualiza el usuario,
entonces únicamente debe permitirse `clinic` o `therapist`.

### CA-07 - Actualizar clínica

Dado que se modifica la asociación con una clínica,
cuando se actualiza el usuario,
entonces debe almacenarse la nueva referencia.

Todo usuario debe tener una clínica asociada. La asociación no puede establecerse como `null`.

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

* La contraseña no se actualiza en esta User Story; su hash debe conservarse sin modificaciones.
* Al modificar el email debe verificarse que no pertenezca a otro usuario.
* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.

## Referencias

* `docs/DB.md`
* `docs/baas-vera-balance-dashboard.yaml`
* `docs/DEFINITIONS.md`
* `docs/PROJECT_ARCHITECTURE.md`


## Definition of Done

* [x] Todos los criterios de aceptación fueron implementados.
* [x] Se agregaron o actualizaron las pruebas necesarias.
* [x] Las pruebas pasan correctamente.
* [x] La implementación fue revisada.
