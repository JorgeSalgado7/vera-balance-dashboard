## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero registrar una clínica,
para poder administrar su información y utilizarla dentro del sistema.

Scope: Backend
Status: Done

## Descripción

El sistema debe permitir registrar una nueva clínica con su información general y los tipos de terapia que ofrece.

La clínica debe quedar disponible para ser utilizada posteriormente por los demás módulos de Vera Balance.

## Criterios de aceptación

### CA-01 - Crear clínica correctamente

Dado que se proporciona información válida,
cuando se solicita crear una clínica,
entonces el sistema debe registrar la clínica correctamente.

### CA-02 - Generar identificador

Dado que se crea una nueva clínica,
cuando se procesa la solicitud,
entonces el sistema debe generar un identificador único para la clínica.

### CA-03 - Estado inicial

Dado que se crea una nueva clínica,
cuando la clínica es registrada,
entonces debe iniciar con estado `active`.

### CA-04 - Información obligatoria

Dado que se intenta registrar una clínica,
cuando el nombre, dirección o teléfono están vacíos,
entonces el sistema debe rechazar la operación.

### CA-05 - Tipos de terapia

Dado que se registra una clínica,
cuando se proporcionan los tipos de terapia,
entonces debe existir al menos uno.

Cada tipo de terapia debe contener un nombre y un icono.

El icono puede ser una cadena vacía.

### CA-06 - Fechas de auditoría

Dado que se registra una clínica,
cuando finaliza su creación,
entonces el sistema debe generar las fechas de creación y última actualización.

### CA-07 - Respuesta

Dado que la clínica fue creada correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la información pública de la clínica creada.

## Reglas de negocio

* Una clínica nueva debe iniciar con estado `active`.
* El estado no puede ser proporcionado durante la creación.
* Una clínica debe contener al menos un tipo de terapia.
* El nombre de cada tipo de terapia es obligatorio.
* El icono de un tipo de terapia puede ser una cadena vacía.

## Dependencias

Ninguna.

## Consideraciones técnicas

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

* [x] Todos los criterios de aceptación fueron implementados.
* [x] Se agregaron o actualizaron las pruebas necesarias.
* [x] Las pruebas pasan correctamente.
* [x] La implementación fue revisada.
