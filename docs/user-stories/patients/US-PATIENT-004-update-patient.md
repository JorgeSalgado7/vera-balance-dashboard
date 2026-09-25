## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero actualizar la información de un paciente,
para mantener sus datos personales correctamente registrados.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir actualizar la información de un paciente respetando las reglas de acceso del usuario autenticado.

Un usuario con rol `clinic` puede actualizar pacientes pertenecientes a su clínica.

Un usuario con rol `therapist` únicamente puede actualizar pacientes relacionados con sus propios procesos terapéuticos.

La clínica a la que pertenece el paciente no puede modificarse.

La actualización debe mantener las reglas relacionadas con edad, teléfono, tutor, datos de pareja, catálogos y duplicidad aplicables al registro de pacientes.

## Criterios de aceptación

### CA-01 - Actualizar paciente como clínica

Dado que existe una sesión autenticada con rol `clinic`
y el paciente pertenece a su clínica,
cuando se envía una solicitud válida de actualización,
entonces el sistema debe actualizar la información del paciente.

### CA-02 - Actualizar paciente como terapeuta

Dado que existe una sesión autenticada con rol `therapist`
y el paciente participa en al menos uno de sus procesos terapéuticos,
cuando se envía una solicitud válida de actualización,
entonces el sistema debe actualizar la información del paciente.

### CA-03 - Impedir actualización por terapeuta sin relación

Dado que existe una sesión autenticada con rol `therapist`
y el paciente no participa en ninguno de sus procesos terapéuticos,
cuando se intenta actualizar al paciente,
entonces el sistema debe rechazar la operación como no autorizada para ese recurso.

### CA-04 - Impedir actualización de paciente de otra clínica

Dado que el paciente pertenece a una clínica diferente de la del usuario autenticado,
cuando se intenta actualizar al paciente,
entonces el sistema debe rechazar la operación como no autorizada para ese recurso.

### CA-05 - Mantener la clínica del paciente

Dado que un paciente ya pertenece a una clínica,
cuando se actualiza su información,
entonces su clínica debe permanecer sin cambios.

### CA-06 - Actualizar paciente adulto

Dado que después de la actualización el paciente tiene 18 años o más,
cuando se actualiza su información,
entonces debe contar con un número telefónico propio
y los datos de tutor no deben mantenerse como información requerida por su edad.

### CA-07 - Actualizar paciente menor de edad

Dado que después de la actualización el paciente tiene menos de 18 años,
cuando se actualiza su información,
entonces su teléfono personal puede no proporcionarse
y la información de tutor debe mantenerse únicamente cuando corresponda según las reglas del proceso terapéutico.

### CA-08 - Cambiar de menor a adulto

Dado que un paciente previamente menor de edad pasa a tener 18 años o más,
cuando se actualiza su edad,
entonces debe proporcionarse la información requerida para un paciente adulto
y los datos que correspondían exclusivamente a su condición de menor deben dejar de aplicar.

### CA-09 - Cambiar de adulto a menor

Dado que la edad de un paciente se modifica a un valor menor de 18 años,
cuando se actualiza su información,
entonces deben aplicarse las reglas correspondientes a un paciente menor de edad
y los datos que correspondan exclusivamente a un adulto deben dejar de aplicar.

### CA-10 - Validar valores provenientes de catálogos

Dado que se modifica un campo asociado a un catálogo,
cuando se actualiza al paciente,
entonces el nuevo valor debe existir dentro del catálogo global correspondiente.

### CA-11 - Rechazar valores inexistentes en catálogos

Dado que la actualización contiene un valor que no existe en el catálogo correspondiente,
cuando se intenta actualizar al paciente,
entonces el sistema debe rechazar la solicitud
y conservar la información existente.

### CA-12 - Actualizar datos de pareja

Dado que a un paciente adulto le corresponden datos de pareja según su situación sentimental,
cuando se actualiza su información,
entonces el sistema debe permitir registrar o modificar esos datos como información complementaria.

### CA-13 - Retirar datos de pareja cuando dejan de aplicar

Dado que la situación sentimental del paciente cambia y los datos de pareja dejan de corresponder,
cuando se actualiza al paciente,
entonces dichos datos no deben mantenerse como información aplicable del paciente.

### CA-14 - No utilizar datos de pareja como segundo paciente

Dado que se actualizan los datos de pareja de un paciente,
cuando se procesa la actualización,
entonces el sistema no debe crear, modificar o relacionar automáticamente otro paciente.

### CA-15 - Detectar duplicidad

Dado que la actualización provoca que el paciente tenga la misma combinación de nombre y número telefónico utilizada para identificar a otro paciente,
cuando se intenta guardar la actualización,
entonces el sistema debe rechazarla por conflicto.

### CA-16 - Permitir conservar la identidad del mismo paciente

Dado que el nombre y número telefónico del paciente no cambian
o continúan correspondiendo al mismo registro que se está actualizando,
cuando se procesa la actualización,
entonces el propio paciente no debe considerarse un duplicado de sí mismo.

### CA-17 - Permitir números telefónicos compartidos

Dado que otro paciente utiliza el mismo número telefónico pero tiene un nombre diferente,
cuando se actualiza al paciente,
entonces el sistema debe permitir la actualización siempre que no exista la combinación utilizada para determinar duplicidad.

### CA-18 - Paciente inexistente

Dado que no existe un paciente con el identificador proporcionado,
cuando se intenta actualizarlo,
entonces el sistema debe indicar que el recurso no fue encontrado.

### CA-19 - Identificador inválido

Dado que el identificador proporcionado no cumple con el formato esperado,
cuando se intenta actualizar al paciente,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-20 - No modificar parcialmente ante un error

Dado que alguno de los datos proporcionados no cumple las reglas de actualización,
cuando la solicitud es rechazada,
entonces el sistema debe conservar la información anterior del paciente sin aplicar cambios parciales.

### CA-21 - Requerir sesión autenticada

Dado que no existe una sesión autenticada válida,
cuando se intenta actualizar un paciente,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Los roles `clinic` y `therapist` pueden actualizar pacientes de acuerdo con sus permisos.
* Un usuario `clinic` puede actualizar pacientes pertenecientes a su clínica.
* Un usuario `therapist` únicamente puede actualizar pacientes relacionados con sus propios procesos terapéuticos.
* La clínica de un paciente no puede modificarse.
* Una persona se considera adulta a partir de los 18 años.
* Un paciente adulto debe contar con su número telefónico.
* La necesidad de información de tutor para un menor depende de las reglas del proceso terapéutico.
* Al modificar la edad deben aplicarse las reglas correspondientes a la nueva edad del paciente.
* Los valores provenientes de catálogos se almacenan como `string` y deben existir en el catálogo correspondiente.
* Los datos de pareja son información complementaria y no representan otro paciente.
* En terapia de pareja, cada integrante se mantiene como un paciente independiente relacionado mediante el proceso terapéutico.
* La actualización no debe provocar que existan dos pacientes con la misma combinación de nombre y número telefónico utilizada para determinar duplicidad.
* Un paciente no debe considerarse duplicado de sí mismo durante una actualización.
* Diferentes pacientes pueden compartir un mismo número telefónico.
* El paciente no tiene un estatus propio.

## Dependencias

* Deben existir los catálogos globales requeridos para validar los campos modificables del paciente.
* Para validar el acceso de un terapeuta deben poder consultarse sus procesos terapéuticos.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La autorización debe evaluarse utilizando la sesión autenticada, la clínica del paciente y, cuando corresponda, su relación mediante procesos terapéuticos.
* La actualización debe validar el estado final del paciente antes de persistir los cambios.

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
