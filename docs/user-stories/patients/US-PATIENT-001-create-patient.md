# US-PATIENT-001 — Create Patient

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero registrar un paciente en mi clínica,  
para incorporarlo a la atención y posteriormente asociarlo a procesos terapéuticos.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir registrar pacientes mediante:

`POST /v1/patients`

Los usuarios con rol `clinic` y `therapist` podrán crear pacientes cuando su cuenta y su clínica estén activas.

Cada paciente pertenece obligatoriamente a una clínica, obtenida del contexto autenticado. El cliente no podrá elegir ni modificar esta asociación.

La información requerida dependerá de la edad y de las condiciones aplicables al paciente. Los valores asociados a catálogos globales deberán validarse antes de persistirlos.

El paciente es independiente de los procesos terapéuticos. No tendrá un estado propio ni una asignación directa a un terapeuta.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita registrar un paciente,  
cuando no existe una sesión válida mediante `vera_balance_session`,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar roles autorizados

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá registrar pacientes.

Si no cuenta con un rol autorizado, deberá responderse con `403 Forbidden`.

### CA-03 - Validar usuario activo

Dado que un usuario solicita crear un paciente,  
cuando su estado actual es `inactive`,  
entonces el sistema debe rechazar la operación.

### CA-04 - Validar clínica activa

Dado que el usuario está autenticado,  
cuando su clínica no existe o tiene estado `inactive`,  
entonces el sistema debe rechazar la creación.

### CA-05 - Crear paciente como clínica

Dado que existe un administrador con rol `clinic`,  
cuando proporciona información válida,  
entonces el sistema debe registrar al paciente dentro de su clínica.

### CA-06 - Crear paciente como terapeuta

Dado que existe un usuario con rol `therapist`,  
cuando proporciona información válida,  
entonces el sistema debe registrar al paciente dentro de su clínica.

La creación no deberá generar automáticamente una relación terapéutica entre ambos.

### CA-07 - Asignar automáticamente la clínica

Dado que un usuario autorizado registra un paciente,  
cuando se persiste la información,  
entonces la clínica deberá obtenerse del contexto autenticado.

Si el request contiene `clinic` o `clinic_id`, deberá rechazarse para impedir asignaciones arbitrarias.

### CA-08 - Validar información obligatoria

Dado que se solicita crear un paciente,  
cuando faltan campos obligatorios definidos en OpenAPI o no cumplen su formato,  
entonces el sistema debe responder con `400 Bad Request`.

Las validaciones deberán considerar las condiciones aplicables según la edad.

### CA-09 - Determinar mayoría de edad

Dado que se proporciona la información necesaria para determinar la edad,  
cuando el sistema valida al paciente,  
entonces deberá considerar adulto a quien tenga 18 años o más.

La edad deberá calcularse o interpretarse conforme al modelo de datos definido.

### CA-10 - Registrar paciente adulto

Dado que el paciente tiene 18 años o más,  
cuando se solicita registrarlo,  
entonces deberá proporcionarse su número telefónico.

No deberán exigirse datos de tutor exclusivamente por motivos de edad.

### CA-11 - Registrar paciente menor de edad

Dado que el paciente tiene menos de 18 años,  
cuando se solicita registrarlo,  
entonces su teléfono personal podrá omitirse.

La información del tutor se validará únicamente cuando corresponda conforme a las reglas funcionales definidas.

No deberá suponerse que todo menor necesita los mismos campos de tutor.

### CA-12 - Validar catálogos globales

Dado que la solicitud contiene campos asociados a catálogos,  
cuando se validan los datos,  
entonces cada valor deberá existir en el catálogo global correspondiente.

Los valores deberán almacenarse como `string`, conforme al modelo definido.

### CA-13 - Rechazar valores de catálogo inexistentes

Dado que un valor no existe en el catálogo correspondiente,  
cuando se intenta registrar al paciente,  
entonces el sistema debe responder con `400 Bad Request`.

No deberá persistirse el paciente.

### CA-14 - Registrar información de pareja

Dado que un paciente adulto tiene una situación sentimental para la que corresponden datos de pareja,  
cuando proporciona dicha información,  
entonces el sistema deberá permitir almacenarla como información complementaria.

### CA-15 - No crear otro paciente mediante datos de pareja

Dado que se proporcionan datos de pareja,  
cuando se registra al paciente,  
entonces el sistema no deberá crear automáticamente un segundo paciente.

Tampoco deberá crear un proceso terapéutico de pareja.

### CA-16 - Validar duplicidad

Dado que existe un paciente con la misma combinación normalizada de nombre y teléfono utilizada para identificar duplicados,  
cuando se intenta crear otro registro equivalente dentro de la misma clínica,  
entonces el sistema debe responder con `409 Conflict`.

La validación deberá ser consistente ante solicitudes concurrentes.

### CA-17 - Permitir teléfonos compartidos

Dado que dos pacientes tienen nombres diferentes,  
cuando utilizan el mismo teléfono,  
entonces el sistema debe permitir ambos registros, siempre que no exista una combinación duplicada.

### CA-18 - Crear paciente sin proceso terapéutico

Dado que la información del paciente es válida,  
cuando se registra,  
entonces podrá existir sin procesos terapéuticos asociados.

No deberá asignarse automáticamente al terapeuta creador.

### CA-19 - Generar identificador y fechas

Dado que el paciente se crea correctamente,  
cuando se persiste,  
entonces deberán generarse su identificador y los campos `created_at` y `updated_at` conforme al modelo de datos.

### CA-20 - No crear estado de paciente

Dado que se registra un paciente,  
cuando se construye su entidad,  
entonces no deberá asignarse un campo `status`.

Los estados corresponden a los procesos terapéuticos.

### CA-21 - Evitar persistencia parcial

Dado que la solicitud contiene información inválida o falla una restricción de integridad,  
cuando se rechaza la operación,  
entonces no deberá quedar un paciente parcialmente registrado.

### CA-22 - Respuesta correcta

Dado que el paciente fue registrado correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `201 Created` y la información pública definida en OpenAPI.

### CA-23 - Proteger contra CSRF

Dado que la operación utiliza autenticación mediante cookies,  
cuando se recibe la solicitud,  
entonces deberán aplicarse los controles CSRF definidos para Vera Balance.

## Reglas de negocio

- Los roles `clinic` y `therapist` pueden crear pacientes.
- El usuario y su clínica deben estar activos.
- Todo paciente pertenece a una clínica.
- La clínica se obtiene del contexto autenticado.
- No se permite asignar otra clínica desde el request.
- Un paciente es adulto a partir de los 18 años.
- Los adultos deben proporcionar teléfono.
- Los menores pueden no proporcionar teléfono personal.
- Los datos de tutor dependen de las condiciones funcionales aplicables.
- Los valores de catálogos deben existir y almacenarse como `string`.
- Los datos de pareja son complementarios.
- La terapia de pareja requiere pacientes independientes relacionados mediante un proceso terapéutico.
- La duplicidad se determina mediante nombre y teléfono.
- La unicidad debe aplicarse dentro de la clínica, sin comparar información de otras clínicas.
- Los teléfonos pueden compartirse entre pacientes con nombres diferentes.
- Un paciente puede existir sin procesos terapéuticos.
- Crear un paciente no otorga acceso terapéutico automáticamente.
- El paciente no tiene `status`.
- La creación no debe persistir información parcial.

## Dependencias

- Auth.
- Users.
- Clinics.
- Catalogs.
- Patients.
- Disponibilidad de los catálogos globales requeridos.

## Consideraciones técnicas

### Endpoint

`POST /v1/patients`

### Autenticación y autorización

- Obtener el JWT desde `vera_balance_session`.
- Validar firma, expiración y sesión.
- Validar rol `clinic` o `therapist`.
- Comprobar estado actual del usuario y su clínica.
- Obtener la clínica desde el contexto autenticado.
- Aplicar protección CSRF.

### Validación

- Utilizar los DTO y esquemas definidos en OpenAPI.
- Validar los campos obligatorios.
- Evaluar las reglas según la edad.
- Validar los valores contra catálogos globales.
- Validar las condiciones aplicables a pareja y tutor.
- Rechazar campos de asignación de clínica.
- No aceptar una asignación directa a terapeuta.
- No aceptar un estado propio del paciente.

### Duplicidad

- Definir una normalización determinista del nombre y teléfono.
- Aplicar la comparación dentro de la clínica.
- No considerar el teléfono individualmente como identificador único.
- Garantizar la unicidad mediante un mecanismo seguro ante concurrencia.
- Resolver la situación de pacientes sin teléfono conforme a `DEFINITIONS.md`, sin inventar un teléfono para construir la clave de duplicidad.

### Persistencia

- Respetar el modelo Single Table de DynamoDB.
- Generar el identificador y las fechas de auditoría.
- Persistir la pertenencia a clínica.
- No persistir una relación directa con terapeuta.
- No crear procesos terapéuticos automáticamente.
- No crear un campo `status` de paciente.
- No exponer detalles de DynamoDB en el dominio.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `201 Created` | Paciente creado correctamente. |
| `400 Bad Request` | Información inválida o valores de catálogo inexistentes. |
| `401 Unauthorized` | Sesión inválida o inexistente. |
| `403 Forbidden` | Usuario sin autorización o inactivo. |
| `409 Conflict` | Paciente duplicado. |

Los esquemas definitivos deberán respetar OpenAPI.

### Arquitectura

- `presentation`: autenticación, DTO, validación y respuesta HTTP.
- `application`: caso de uso Create Patient.
- `domain`: reglas de edad, duplicidad y consistencia.
- `infrastructure`: persistencia, consultas de catálogos y restricciones de unicidad.

El caso de uso deberá permanecer separado de Update Patient.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la creación para `clinic` y `therapist`.
- [ ] Se verificó el aislamiento por clínica.
- [ ] Se verificaron las reglas de adultos y menores.
- [ ] Se verificaron los valores de catálogos.
- [ ] Se verificó la detección de duplicados.
- [ ] Se verificó que no se creen procesos terapéuticos automáticamente.
- [ ] Se verificó la consistencia ante solicitudes concurrentes.
- [ ] Se confirmó la consistencia con OpenAPI y el modelo de datos.
- [ ] La implementación fue revisada.
