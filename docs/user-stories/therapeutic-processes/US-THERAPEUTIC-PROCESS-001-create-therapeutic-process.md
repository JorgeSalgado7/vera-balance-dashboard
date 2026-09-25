## Historia de usuario

Como terapeuta de Vera Balance,
quiero crear un proceso terapéutico para uno o más pacientes,
para registrar y dar seguimiento a su atención terapéutica.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir crear procesos terapéuticos asociados a los pacientes de la clínica.

Los usuarios con rol `clinic` y `therapist` pueden crear procesos terapéuticos. Ambos roles pueden brindar atención terapéutica; la diferencia entre ellos corresponde a sus permisos dentro de la clínica.

Al crear un proceso, el terapeuta responsable debe obtenerse automáticamente de la sesión autenticada.

Todos los pacientes incluidos en el proceso deben pertenecer a la misma clínica del usuario autenticado.

El tipo de terapia debe encontrarse entre los tipos de terapia configurados para la clínica.

Todo proceso debe contener al menos un paciente. Para terapia de pareja deben existir exactamente dos pacientes. Para terapia familiar se permite incluir múltiples pacientes sin un límite máximo definido.

## Criterios de aceptación

### CA-01 - Crear proceso como clinic

Dado que existe una sesión autenticada con rol `clinic`,
cuando se envía una solicitud válida para crear un proceso terapéutico,
entonces el sistema debe crear el proceso
y asignar como terapeuta responsable al usuario autenticado.

### CA-02 - Crear proceso como therapist

Dado que existe una sesión autenticada con rol `therapist`,
cuando se envía una solicitud válida para crear un proceso terapéutico,
entonces el sistema debe crear el proceso
y asignar como terapeuta responsable al usuario autenticado.

### CA-03 - Asignar terapeuta desde la sesión

Dado que un usuario autorizado crea un proceso terapéutico,
cuando el proceso es registrado,
entonces `therapist_id` debe corresponder al usuario de la sesión activa.

### CA-04 - Validar pacientes

Dado que se proporcionan pacientes para el proceso,
cuando se intenta crear,
entonces todos los pacientes deben existir.

### CA-05 - Validar clínica de los pacientes

Dado que se proporcionan uno o más pacientes,
cuando se intenta crear el proceso,
entonces todos deben pertenecer a la misma clínica del usuario autenticado.

### CA-06 - Rechazar pacientes de otra clínica

Dado que al menos uno de los pacientes pertenece a otra clínica,
cuando se intenta crear el proceso,
entonces el sistema debe rechazar la operación
y no debe crear el proceso.

### CA-07 - Requerir pacientes

Dado que no se proporciona ningún paciente,
cuando se intenta crear el proceso,
entonces el sistema debe rechazar la solicitud como inválida.

### CA-08 - Validar terapia de pareja

Dado que `therapy_type` corresponde a terapia de pareja,
cuando se crea el proceso,
entonces deben proporcionarse exactamente dos pacientes.

### CA-09 - Validar terapia familiar

Dado que `therapy_type` corresponde a terapia familiar,
cuando se crea el proceso,
entonces debe existir al menos un paciente
y se debe permitir incluir múltiples pacientes sin un límite máximo definido.

### CA-10 - Validar tipo de terapia

Dado que se proporciona `therapy_type`,
cuando se intenta crear el proceso,
entonces el tipo debe existir entre los `therapy_types` configurados para la clínica.

### CA-11 - Rechazar tipo de terapia no configurado

Dado que `therapy_type` no se encuentra configurado para la clínica,
cuando se intenta crear el proceso,
entonces el sistema debe rechazar la solicitud.

### CA-12 - Registrar primera vez en terapia

Dado que se crea el proceso,
cuando se proporciona `is_first_time`,
entonces el valor debe representar si es la primera vez que el paciente acude a una terapia,
independientemente de si anteriormente ha sido atendido en Vera Balance.

### CA-13 - Registrar información terapéutica

Dado que la solicitud es válida,
cuando se crea el proceso,
entonces deben registrarse los datos correspondientes al proceso,
incluyendo el motivo de consulta y los objetivos.

### CA-14 - Permitir múltiples procesos

Dado que un paciente ya participa o participó en otro proceso terapéutico,
cuando se crea un nuevo proceso válido,
entonces la existencia del proceso anterior no debe impedir por sí misma la creación.

### CA-15 - Requerir autenticación

Dado que no existe una sesión autenticada válida,
cuando se intenta crear un proceso,
entonces el sistema debe rechazar la operación como no autenticada.

## Reglas de negocio

* Los roles `clinic` y `therapist` pueden crear procesos terapéuticos.
* El terapeuta responsable durante la creación corresponde al usuario de la sesión activa.
* Todos los pacientes deben existir y pertenecer a la clínica del usuario autenticado.
* Todo proceso debe contener al menos un paciente.
* La terapia de pareja requiere exactamente dos pacientes.
* La terapia familiar permite múltiples pacientes sin un límite máximo definido.
* `therapy_type` debe existir entre los tipos de terapia configurados para la clínica.
* Los tipos de terapia no se validan mediante los catálogos globales.
* `is_first_time` indica si es la primera vez que el paciente acude a terapia, no si es su primera atención en Vera Balance.
* Un paciente puede tener múltiples procesos terapéuticos.
* La relación entre paciente y terapeuta se establece mediante el proceso terapéutico.

## Dependencias

* Debe existir la clínica asociada al usuario autenticado.
* Los pacientes incluidos deben existir.
* Los pacientes deben pertenecer a la clínica del usuario autenticado.
* La clínica debe tener configurado el tipo de terapia seleccionado.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La persistencia debe respetar `docs/DB.md`.
* Las reglas funcionales deben respetar `docs/DEFINITIONS.md`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La identidad del terapeuta responsable debe obtenerse de la sesión autenticada.

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
