## Historia de usuario

Como usuario autorizado de Vera Balance,
quiero registrar un paciente,
para poder incorporarlo a la atención de la clínica y posteriormente asociarlo a sus procesos terapéuticos.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir crear pacientes pertenecientes a la clínica del usuario autenticado.

Los usuarios con rol `clinic` y `therapist` pueden registrar pacientes.

La clínica a la que pertenece el paciente debe obtenerse a partir de la sesión autenticada y no puede ser seleccionada libremente por el cliente.

La información solicitada al registrar un paciente depende de su edad y de los datos aplicables a su situación.

Los valores que correspondan a catálogos deben validarse contra los catálogos globales existentes antes de registrar al paciente.

El paciente es una entidad independiente de sus procesos terapéuticos. La relación con un terapeuta se establece mediante un proceso terapéutico y no directamente en el paciente.

## Criterios de aceptación

### CA-01 - Crear paciente como clínica

Dado que existe una sesión autenticada con rol `clinic`,
cuando se envía una solicitud válida para crear un paciente,
entonces el sistema debe registrar al paciente asociado a la clínica del usuario autenticado.

### CA-02 - Crear paciente como terapeuta

Dado que existe una sesión autenticada con rol `therapist`,
cuando se envía una solicitud válida para crear un paciente,
entonces el sistema debe registrar al paciente asociado a la clínica del terapeuta autenticado.

### CA-03 - Asignar automáticamente la clínica

Dado que un usuario autorizado crea un paciente,
cuando el sistema registra al paciente,
entonces debe asociarlo a la clínica obtenida de la sesión autenticada
y no debe permitir que el cliente asigne al paciente a otra clínica.

### CA-04 - Registrar paciente adulto

Dado que el paciente tiene 18 años o más,
cuando se registra al paciente,
entonces debe proporcionarse su número telefónico
y no deben requerirse datos de tutor por su edad.

### CA-05 - Registrar paciente menor de edad

Dado que el paciente tiene menos de 18 años,
cuando se registra al paciente,
entonces su teléfono personal puede no proporcionarse
y la información de tutor debe capturarse únicamente cuando corresponda según las reglas del proceso terapéutico.

### CA-06 - Validar valores provenientes de catálogos

Dado que la solicitud contiene información asociada a un catálogo,
cuando se intenta crear al paciente,
entonces cada valor debe existir dentro del catálogo global correspondiente.

### CA-07 - Rechazar valores inexistentes en catálogos

Dado que la solicitud contiene un valor que no existe en el catálogo correspondiente,
cuando se intenta crear al paciente,
entonces el sistema debe rechazar la solicitud como inválida
y no debe registrar al paciente.

### CA-08 - Registrar datos de pareja

Dado que un paciente adulto tiene una situación sentimental para la que corresponden datos de pareja,
cuando se registra al paciente con dicha información,
entonces el sistema debe permitir almacenar los datos de la pareja como información complementaria del paciente.

### CA-09 - No utilizar datos de pareja como segundo paciente

Dado que se proporcionan datos de pareja,
cuando se registra al paciente,
entonces dichos datos no deben crear automáticamente otro paciente ni establecer una relación de terapia de pareja.

### CA-10 - Detectar paciente duplicado

Dado que ya existe un paciente con la misma combinación de nombre y número telefónico utilizada para identificarlo,
cuando se intenta registrar nuevamente al paciente,
entonces el sistema debe rechazar la creación por conflicto.

### CA-11 - Permitir números telefónicos compartidos

Dado que existe otro paciente con el mismo número telefónico pero con un nombre diferente,
cuando se intenta registrar al paciente,
entonces el sistema debe permitir su creación siempre que no exista la combinación utilizada para determinar duplicidad.

### CA-12 - Crear paciente sin proceso terapéutico

Dado que la información del paciente es válida,
cuando se registra al paciente,
entonces el paciente puede existir independientemente de que todavía no tenga un proceso terapéutico asociado.

### CA-13 - Rechazar solicitud inválida

Dado que la solicitud no cumple con la información o reglas requeridas,
cuando se intenta crear al paciente,
entonces el sistema debe rechazar la solicitud
y no debe persistir información parcial.

### CA-14 - Requerir sesión autenticada

Dado que no existe una sesión autenticada válida,
cuando se intenta crear un paciente,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Los roles `clinic` y `therapist` pueden crear pacientes.
* Todo paciente pertenece obligatoriamente a una clínica.
* La clínica del paciente se obtiene de la sesión autenticada.
* El cliente no puede seleccionar arbitrariamente la clínica del paciente.
* Una persona se considera adulta a partir de los 18 años.
* Un paciente adulto debe proporcionar su número telefónico.
* La necesidad de información de tutor para un menor depende de las reglas del proceso terapéutico.
* Los valores provenientes de catálogos se almacenan como `string` y deben existir en el catálogo correspondiente.
* Los datos de pareja son información complementaria y no representan otro paciente.
* En terapia de pareja, cada integrante debe registrarse como un paciente independiente y la relación entre ambos se establece mediante el proceso terapéutico.
* Un paciente se considera duplicado cuando coincide la combinación de nombre y número telefónico utilizada para identificarlo.
* Diferentes pacientes pueden compartir un mismo número telefónico.
* El paciente no necesita tener un proceso terapéutico al momento de su creación.
* El paciente no tiene un estatus propio.

## Dependencias

* Deben existir los catálogos globales requeridos para validar los campos del paciente.
* Debe existir la clínica asociada al usuario autenticado.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La pertenencia del paciente a una clínica debe persistirse de acuerdo con el modelo definido en `docs/DB.md`.
* La relación entre paciente y terapeuta no debe persistirse directamente en el paciente; se establece mediante los procesos terapéuticos.

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
