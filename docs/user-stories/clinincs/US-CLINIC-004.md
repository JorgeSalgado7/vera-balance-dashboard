## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero actualizar la información de una clínica,
para mantener sus datos actualizados dentro del sistema.

Scope: Backend
Status: Done

## Descripción

El sistema debe permitir modificar la información de una clínica existente sin afectar los datos que no formen parte de la actualización.

## Criterios de aceptación

### CA-01 - Actualizar clínica existente

Dado que existe una clínica,
cuando se proporciona información válida para actualizarla,
entonces el sistema debe guardar los cambios correctamente.

### CA-02 - Actualización parcial

Dado que se proporciona únicamente una parte de la información editable,
cuando se actualiza la clínica,
entonces los campos no proporcionados deben conservar su valor actual.

### CA-03 - Actualizar nombre

Dado que se proporciona un nuevo nombre,
cuando se actualiza la clínica,
entonces el nuevo nombre no puede estar vacío.

### CA-04 - Actualizar dirección

Dado que se proporciona una nueva dirección,
cuando se actualiza la clínica,
entonces la nueva dirección no puede estar vacía.

### CA-05 - Actualizar teléfono

Dado que se proporciona un nuevo teléfono,
cuando se actualiza la clínica,
entonces el nuevo teléfono no puede estar vacío.

### CA-06 - Actualizar tipos de terapia

Dado que se proporcionan nuevos tipos de terapia,
cuando se actualiza la clínica,
entonces debe existir al menos uno y cada elemento debe cumplir las reglas establecidas para los tipos de terapia.

### CA-07 - Actualizar logo

Dado que se proporciona un nuevo logo,
cuando se actualiza la clínica,
entonces el sistema debe permitir establecer un valor de texto o `null`.

### CA-08 - Fecha de actualización

Dado que una clínica es modificada,
cuando la actualización finaliza,
entonces debe actualizarse su fecha de última modificación.

### CA-09 - Clínica inexistente

Dado que no existe una clínica con el identificador proporcionado,
cuando se intenta actualizarla,
entonces el sistema debe indicar que la clínica no fue encontrada.

## Reglas de negocio

* Los campos no incluidos en la actualización deben conservar sus valores actuales.
* Si se actualizan los tipos de terapia, debe existir al menos uno.
* El nombre de cada tipo de terapia es obligatorio.
* El icono de un tipo de terapia puede ser una cadena vacía.
* La fecha de creación original de la clínica debe conservarse.

## Dependencias

US-CLINIC-003 - Consultar clínica por ID.

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
