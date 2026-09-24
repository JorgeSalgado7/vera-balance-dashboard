## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero consultar un usuario específico,
para poder conocer su información dentro del sistema.

Scope: Backend
Status: Under Review

## Descripción

El sistema debe permitir obtener un usuario mediante su identificador único.

## Criterios de aceptación

### CA-01 - Consultar usuario existente

Dado que existe un usuario con el identificador proporcionado,
cuando se solicita su información,
entonces el sistema debe devolver el usuario correspondiente.

### CA-02 - Información pública

Dado que el usuario existe,
cuando se devuelve su información,
entonces debe incluir su identificador, nombre, email, cédula profesional, clínica asociada, rol y estado.

### CA-03 - Proteger contraseña

Dado que el usuario existe,
cuando se devuelve su información,
entonces la contraseña no debe formar parte de la respuesta.

### CA-04 - Usuario inexistente

Dado que no existe un usuario con el identificador proporcionado,
cuando se intenta consultarlo,
entonces el sistema debe indicar que el usuario no fue encontrado.

## Reglas de negocio

* La contraseña nunca debe exponerse en la respuesta.
* La consulta no debe modificar información del usuario.

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
