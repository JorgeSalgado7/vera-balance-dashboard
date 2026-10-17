# US-PROCESS-001 — Create Therapeutic Process

## Historia de usuario

Como terapeuta de Vera Balance,  
quiero crear un proceso terapéutico para uno o más pacientes,  
para registrar y dar seguimiento a su atención terapéutica.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir crear procesos terapéuticos mediante `POST /v1/therapeutic-processes`.

Los usuarios con rol `clinic` y `therapist` pueden crear procesos, ya que ambos pueden brindar atención terapéutica.

El terapeuta responsable será siempre el usuario autenticado que crea el proceso. La clínica también se obtendrá del contexto autenticado.

Todos los pacientes deberán existir y pertenecer a esa clínica. El tipo de terapia deberá encontrarse entre los `therapy_types` configurados para la clínica, sin utilizar los catálogos globales.

Un proceso deberá contener al menos un paciente. La terapia de pareja requerirá exactamente dos pacientes y la terapia familiar admitirá múltiples pacientes sin un límite de negocio predefinido.

## Criterios de aceptación

### CA-01 - Requerir autenticación

Dado que se solicita crear un proceso terapéutico,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar roles autorizados

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá crear un proceso terapéutico.

Los usuarios sin un rol autorizado deberán recibir `403 Forbidden`.

### CA-03 - Validar usuario y clínica activos

Dado que un usuario intenta crear un proceso,  
cuando el usuario o su clínica están inactivos,  
entonces el sistema debe rechazar la operación.

### CA-04 - Crear proceso como clinic

Dado que existe un usuario autenticado con rol `clinic`,  
cuando proporciona información válida,  
entonces el sistema debe crear el proceso y asignarle como terapeuta responsable.

### CA-05 - Crear proceso como therapist

Dado que existe un usuario autenticado con rol `therapist`,  
cuando proporciona información válida,  
entonces el sistema debe crear el proceso y asignarle como terapeuta responsable.

### CA-06 - Asignar terapeuta desde la sesión

Dado que se crea un proceso,  
cuando se registra,  
entonces `therapist_id` debe corresponder al identificador del usuario autenticado.

El cliente no podrá seleccionar otro terapeuta durante la creación.

### CA-07 - Asignar clínica desde la sesión

Dado que se crea un proceso,  
cuando se persiste,  
entonces deberá pertenecer a la clínica del usuario autenticado.

No deberá permitirse seleccionar otra clínica mediante el request.

### CA-08 - Validar existencia de pacientes

Dado que se proporciona una colección de pacientes,  
cuando se solicita crear el proceso,  
entonces todos los identificadores deberán corresponder a pacientes existentes.

### CA-09 - Validar pertenencia a clínica

Dado que se proporcionan pacientes,  
cuando se valida la solicitud,  
entonces todos deberán pertenecer a la clínica del usuario autenticado.

### CA-10 - Rechazar pacientes de otra clínica

Dado que al menos un paciente pertenece a otra clínica,  
cuando se intenta crear el proceso,  
entonces la operación deberá rechazarse sin revelar información de ese paciente ni persistir el proceso.

### CA-11 - Requerir al menos un paciente

Dado que no se proporcionan pacientes o la colección está vacía,  
cuando se solicita crear el proceso,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-12 - Rechazar pacientes repetidos

Dado que un mismo identificador aparece varias veces en la colección,  
cuando se valida la solicitud,  
entonces deberá rechazarse para evitar contabilizar a una persona más de una vez.

### CA-13 - Validar terapia de pareja

Dado que `therapy_type` corresponde a terapia de pareja,  
cuando se crea el proceso,  
entonces deberán proporcionarse exactamente dos pacientes diferentes.

### CA-14 - Validar terapia familiar

Dado que `therapy_type` corresponde a terapia familiar,  
cuando se crea el proceso,  
entonces deberá admitirse uno o más pacientes sin imponer un límite máximo de negocio.

### CA-15 - Validar tipo de terapia

Dado que se proporciona `therapy_type`,  
cuando se valida la solicitud,  
entonces el valor deberá existir en `therapy_types` de la clínica.

### CA-16 - Rechazar terapia no configurada

Dado que `therapy_type` no está configurado para la clínica,  
cuando se solicita crear el proceso,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-17 - No utilizar catálogos globales

Dado que se valida `therapy_type`,  
cuando se consulta su configuración,  
entonces deberán utilizarse los tipos de terapia de la clínica y no los catálogos globales.

### CA-18 - Registrar primera vez en terapia

Dado que se proporciona `is_first_time`,  
cuando se registra el proceso,  
entonces deberá almacenarse conforme a su definición funcional: si es la primera vez que el paciente acude a terapia, independientemente de sus atenciones anteriores en Vera Balance.

### CA-19 - Registrar información terapéutica

Dado que se proporciona información válida,  
cuando se crea el proceso,  
entonces deberán almacenarse el motivo de consulta, los objetivos y los demás campos definidos en el contrato.

### CA-20 - Permitir múltiples procesos por paciente

Dado que un paciente tiene o tuvo otros procesos terapéuticos,  
cuando se crea uno nuevo,  
entonces esa circunstancia no deberá impedir la creación.

### CA-21 - Inicializar estado

Dado que se crea un proceso,  
cuando se persiste,  
entonces deberá establecerse el estado inicial definido en `docs/DB.md` y OpenAPI.

Si el contrato establece `active` como estado inicial, deberá utilizarse ese valor y no aceptar una selección arbitraria desde el cliente.

### CA-22 - Generar identificador y fechas

Dado que el proceso se crea correctamente,  
cuando se persiste,  
entonces deberán registrarse su identificador, `created_at` y `updated_at` conforme al modelo.

### CA-23 - Evitar persistencia parcial

Dado que falla alguna validación o restricción de integridad,  
cuando se rechaza la creación,  
entonces no deberá persistirse un proceso incompleto.

### CA-24 - Mantener integridad con pacientes

Dado que se crea un proceso terapéutico,  
cuando se persiste la relación con sus pacientes,  
entonces deberá garantizarse que los pacientes no sean eliminados concurrentemente dejando referencias inválidas.

### CA-25 - Respuesta correcta

Dado que el proceso fue creado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `201 Created` y la información definida en OpenAPI.

### CA-26 - Proteger contra CSRF

Dado que la operación utiliza autenticación mediante cookies,  
cuando se recibe la solicitud,  
entonces deberán aplicarse los controles CSRF definidos para Vera Balance.

## Reglas de negocio

- Los roles `clinic` y `therapist` pueden crear procesos terapéuticos.
- El usuario y su clínica deben estar activos.
- El terapeuta responsable es el usuario autenticado.
- La clínica se obtiene del contexto autenticado.
- Todos los pacientes deben existir y pertenecer a la misma clínica.
- No pueden repetirse pacientes dentro del mismo proceso.
- Todo proceso requiere al menos un paciente.
- La terapia de pareja requiere exactamente dos pacientes.
- La terapia familiar permite múltiples pacientes sin límite máximo de negocio.
- `therapy_type` debe estar configurado en la clínica.
- Los tipos de terapia no se validan mediante catálogos globales.
- `is_first_time` representa la primera experiencia de terapia, no la primera atención en Vera Balance.
- Un paciente puede participar en múltiples procesos.
- La relación paciente-terapeuta se establece mediante el proceso terapéutico.
- La creación no debe generar información parcial.

## Dependencias

- Auth.
- Users.
- Clinics.
- Patients.
- Therapeutic Processes.
- Configuración de `therapy_types` de la clínica.

## Consideraciones técnicas

### Endpoint

`POST /v1/therapeutic-processes`

### Autenticación y autorización

- Validar la cookie `vera_balance_session`.
- Validar JWT, usuario y clínica activos.
- Permitir roles `clinic` y `therapist`.
- Obtener `therapist_id` y clínica desde el contexto autenticado.
- Rechazar asignaciones arbitrarias de terapeuta o clínica.
- Aplicar protección CSRF.

### Validaciones

- Validar DTO conforme a OpenAPI.
- Validar identificadores y existencia de pacientes.
- Validar que todos pertenezcan a la clínica.
- Rechazar identificadores duplicados.
- Aplicar cardinalidad según `therapy_type`.
- Validar `therapy_type` contra la configuración de la clínica.
- Validar motivo de consulta, objetivos y demás campos conforme al contrato.

### Persistencia

- Respetar DynamoDB Single Table.
- Registrar identificador y fechas.
- Persistir la relación con pacientes.
- Persistir el terapeuta responsable.
- Garantizar integridad frente a eliminación concurrente de pacientes.
- No modificar automáticamente información de Patient.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `201 Created` | Proceso creado correctamente. |
| `400 Bad Request` | Información, cardinalidad o tipo de terapia inválidos. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin autorización. |
| `404 Not Found` | Paciente inexistente o fuera del alcance de la clínica. |
| `409 Conflict` | Conflicto de integridad o concurrencia. |

### Arquitectura

- `presentation`: DTO, autenticación y respuesta HTTP.
- `application`: caso de uso Create Therapeutic Process.
- `domain`: reglas de cardinalidad, terapia y relaciones.
- `infrastructure`: persistencia y consultas de pacientes y clínica.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la creación mediante ambos roles.
- [ ] Se verificó la asignación automática del terapeuta.
- [ ] Se verificó el aislamiento por clínica.
- [ ] Se verificó la cardinalidad de pacientes.
- [ ] Se verificó la configuración de tipos de terapia.
- [ ] Se verificó la creación de múltiples procesos por paciente.
- [ ] Se verificó la integridad de referencias ante concurrencia.
- [ ] Se confirmó la consistencia con OpenAPI y el modelo de datos.
- [ ] La implementación fue revisada.
