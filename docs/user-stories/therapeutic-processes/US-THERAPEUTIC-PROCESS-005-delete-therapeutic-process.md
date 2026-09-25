## Historia de usuario

Como administrador de una clínica de Vera Balance,
quiero eliminar un proceso terapéutico cuando corresponda,
para permitir la eliminación excepcional de información que la clínica determine que ya no debe conservarse.

Scope: Backend
Status: Approved

## Descripción

El sistema debe disponer de una operación para eliminar físicamente un proceso terapéutico.

La eliminación no representa el mecanismo habitual para finalizar la atención de un paciente. En condiciones normales, el ciclo de vida del proceso debe administrarse mediante su `status`.

La eliminación física se considera una operación excepcional y queda bajo consideración de la clínica.

## Criterios de aceptación

### CA-01 - Eliminar proceso como clinic

Dado que existe una sesión autenticada con rol `clinic`
y el proceso pertenece a su clínica,
cuando solicita su eliminación,
entonces el sistema debe permitir eliminar físicamente el proceso.

### CA-02 - Impedir eliminación como therapist

Dado que existe una sesión autenticada con rol `therapist`,
cuando intenta eliminar un proceso terapéutico,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-03 - Impedir eliminación entre clínicas

Dado que existe una sesión autenticada con rol `clinic`
y el proceso pertenece a otra clínica,
cuando intenta eliminarlo,
entonces el sistema debe rechazar la operación como no autorizada.

### CA-04 - Proceso inexistente

Dado que no existe un proceso con el identificador proporcionado,
cuando se solicita su eliminación,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-05 - Identificador inválido

Dado que el identificador proporcionado no cumple con el formato esperado,
cuando se intenta eliminar el proceso,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-06 - Eliminar físicamente

Dado que la eliminación fue autorizada,
cuando finaliza correctamente,
entonces el proceso terapéutico debe dejar de existir en la persistencia.

### CA-07 - Responder sin contenido

Dado que el proceso fue eliminado correctamente,
cuando finaliza la operación,
entonces el sistema debe responder sin contenido.

### CA-08 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta eliminar el proceso,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Solo `clinic` puede eliminar físicamente un proceso terapéutico.
* `therapist` no puede eliminar procesos terapéuticos.
* `clinic` únicamente puede eliminar procesos pertenecientes a su propia clínica.
* La eliminación física es una operación excepcional.
* La operación habitual para administrar la finalización o interrupción de un proceso es modificar su `status`.
* Los criterios temporales o administrativos adicionales para determinar cuándo debe realizarse una eliminación física podrán incorporarse posteriormente conforme a las políticas de la clínica.

## Dependencias

* El proceso debe existir.
* El proceso debe pertenecer a la clínica del usuario autenticado.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La eliminación corresponde a una eliminación física del recurso.

## Referencias

* `docs/DB.md`
* `docs/baas-vera-balance-dashboard.yaml`
* `docs/DEFINITIONS.md`
* `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] La implementación fue revisada.
