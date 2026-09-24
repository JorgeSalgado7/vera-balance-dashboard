## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar los usuarios registrados,
para poder conocer las personas que tienen acceso al sistema.

Scope: Backend
Status: Under Review

## Descripción

El sistema debe permitir obtener los usuarios registrados y devolver únicamente la información que puede ser expuesta públicamente por el API.

## Criterios de aceptación

### CA-01 - Consultar usuarios

Dado que existen usuarios registrados,
cuando se solicita la lista de usuarios,
entonces el sistema debe devolver los usuarios disponibles.

### CA-02 - Información del usuario

Dado que se obtiene un usuario,
entonces la información debe incluir su identificador, nombre, email, cédula profesional, clínica asociada, rol y estado.

### CA-03 - Proteger contraseña

Dado que se obtiene la información de los usuarios,
entonces la contraseña no debe formar parte de la respuesta.

### CA-04 - Sin usuarios registrados

Dado que no existen usuarios registrados,
cuando se solicita la lista,
entonces el sistema debe devolver una lista vacía.

## Reglas de negocio

* La contraseña nunca debe exponerse en las respuestas del API.
* La consulta no debe modificar información de los usuarios.

## Dependencias

Ninguna.

## Consideraciones técnicas

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
