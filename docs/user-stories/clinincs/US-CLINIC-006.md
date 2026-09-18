## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar la clínica asociada a un usuario,
para poder obtener la información de la clínica a la que pertenece.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir obtener una clínica a partir del identificador de un usuario.

Para realizar esta operación debe obtenerse primero la relación entre el usuario y su clínica y posteriormente consultar la información de la clínica correspondiente.

## Criterios de aceptación

### CA-01 - Consultar clínica asociada

Dado que existe un usuario asociado a una clínica,
cuando se consulta la clínica mediante el identificador del usuario,
entonces el sistema debe devolver la información de la clínica asociada.

### CA-02 - Resolver asociación del usuario

Dado que se proporciona el identificador de un usuario,
cuando se procesa la consulta,
entonces el sistema debe determinar el identificador de la clínica asociada al usuario.

### CA-03 - Usuario sin clínica asociada

Dado que el usuario no tiene una clínica asociada,
cuando se solicita su clínica,
entonces el sistema debe indicar que no fue posible encontrar una clínica asociada.

### CA-04 - Clínica inexistente

Dado que el usuario contiene una asociación con una clínica que no existe,
cuando se intenta obtener la clínica,
entonces el sistema debe indicar que la clínica no fue encontrada.

### CA-05 - Información de la clínica

Dado que el usuario tiene una clínica válida asociada,
cuando finaliza la consulta,
entonces la respuesta debe incluir el identificador, nombre, logo, dirección, teléfono y tipos de terapia de la clínica.

## Reglas de negocio

* La asociación entre usuario y clínica debe obtenerse desde el módulo responsable de usuarios.
* Clinics no debe acceder directamente a la persistencia interna de Users.
* La consulta no debe modificar información del usuario ni de la clínica.

## Dependencias

* Implementación de `UsersModule`.
* Capacidad para obtener el identificador de clínica asociado a un usuario.

## Consideraciones técnicas

* La comunicación entre Clinics y Users debe realizarse mediante una abstracción explícita entre módulos.
* Clinics no debe depender directamente de los repositorios internos de Users.
* El contrato HTTP debe respetar `docs/openapi.yaml`.
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
