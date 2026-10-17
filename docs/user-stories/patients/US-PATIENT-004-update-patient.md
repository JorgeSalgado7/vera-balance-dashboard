# US-PATIENT-004 — Update Patient

## Historia de usuario

Como usuario autorizado de Vera Balance,  
quiero actualizar la información de un paciente al que tengo acceso,  
para mantener correctamente registrados sus datos personales.

**Scope:** Backend  
**Status:** Approved

## Descripción

El sistema debe permitir actualizar pacientes mediante:

`PUT /v1/patients/{id}`

Los usuarios con rol `clinic` podrán actualizar pacientes de su clínica.

Los usuarios con rol `therapist` únicamente podrán actualizar pacientes vinculados a sus propios procesos terapéuticos.

La operación permitirá modificar los campos autorizados conforme al contrato del API, conservando los campos omitidos.

La clínica del paciente y su identificador no podrán modificarse.

El sistema deberá validar el estado final de la información antes de persistir los cambios, considerando edad, teléfono, tutor, pareja, catálogos y duplicidad.

## Criterios de aceptación

### CA-01 - Validar autenticación

Dado que se solicita actualizar un paciente,  
cuando no existe una sesión válida,  
entonces el sistema debe responder con `401 Unauthorized`.

### CA-02 - Validar roles

Dado que existe una sesión válida,  
cuando el usuario tiene rol `clinic` o `therapist`,  
entonces podrá actualizar pacientes conforme a sus permisos.

### CA-03 - Validar usuario activo

Dado que el usuario se encuentra inactivo,  
cuando intenta actualizar un paciente,  
entonces el sistema debe rechazar la operación.

### CA-04 - Validar clínica activa

Dado que la clínica del usuario no existe o está inactiva,  
cuando se solicita actualizar un paciente,  
entonces el sistema debe rechazar la operación.

### CA-05 - Validar identificador

Dado que se recibe el parámetro `id`,  
cuando no cumple el formato esperado,  
entonces el sistema debe responder con `400 Bad Request`.

### CA-06 - Actualizar como clínica

Dado que un usuario tiene rol `clinic` y el paciente pertenece a su clínica,  
cuando proporciona una actualización válida,  
entonces el sistema debe guardar los cambios.

### CA-07 - Actualizar como terapeuta

Dado que un usuario tiene rol `therapist` y el paciente participa en uno de sus procesos terapéuticos,  
cuando proporciona una actualización válida,  
entonces el sistema debe guardar los cambios.

### CA-08 - Impedir actualización sin relación

Dado que un terapeuta no tiene procesos terapéuticos asociados al paciente,  
cuando intenta actualizarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-09 - Impedir actualización entre clínicas

Dado que un paciente pertenece a otra clínica,  
cuando se intenta actualizarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-10 - Paciente inexistente

Dado que no existe el paciente solicitado,  
cuando se intenta actualizarlo,  
entonces el sistema debe responder con `404 Not Found`.

### CA-11 - Mantener identificador y clínica

Dado que se actualiza un paciente,  
cuando se procesa la operación,  
entonces su identificador y clínica deberán permanecer sin cambios.

Si el request intenta modificarlos, deberá rechazarse.

### CA-12 - Actualización parcial

Dado que se proporcionan únicamente algunos campos modificables,  
cuando se solicita la actualización,  
entonces los campos omitidos deberán conservar sus valores actuales.

La validación deberá realizarse sobre el resultado completo de combinar los datos existentes y los cambios solicitados.

### CA-13 - Validar paciente adulto

Dado que el estado final del paciente corresponde a una persona de 18 años o más,  
cuando se actualiza,  
entonces deberá contar con un teléfono válido.

### CA-14 - Validar paciente menor

Dado que el estado final corresponde a una persona menor de 18 años,  
cuando se actualiza,  
entonces su teléfono personal podrá omitirse.

Los datos de tutor se validarán conforme a las reglas funcionales aplicables.

### CA-15 - Transición de menor a adulto

Dado que una actualización modifica la información de edad de un paciente hasta convertirlo en adulto,  
cuando se valida el resultado,  
entonces deberán exigirse los datos obligatorios para adultos.

Los campos que únicamente correspondían a la condición de menor deberán gestionarse conforme a las reglas de conservación y eliminación definidas.

### CA-16 - Transición de adulto a menor

Dado que una corrección modifica la edad del paciente a menos de 18 años,  
cuando se valida el resultado,  
entonces deberán aplicarse las reglas correspondientes a menores.

Los campos exclusivos de adultos deberán dejar de considerarse aplicables.

### CA-17 - Validar catálogos

Dado que se modifica un campo asociado a un catálogo global,  
cuando se procesa la actualización,  
entonces su valor deberá existir en el catálogo correspondiente.

### CA-18 - Rechazar catálogos inválidos

Dado que un valor proporcionado no existe en el catálogo correspondiente,  
cuando se intenta actualizar,  
entonces el sistema debe responder con `400 Bad Request`.

La información anterior deberá conservarse.

### CA-19 - Actualizar datos de pareja

Dado que los datos de pareja corresponden a la situación sentimental del paciente adulto,  
cuando se proporcionan cambios válidos,  
entonces deberán actualizarse como información complementaria.

### CA-20 - Retirar datos de pareja no aplicables

Dado que cambia la situación sentimental y los datos de pareja dejan de aplicar,  
cuando se actualiza al paciente,  
entonces el estado final persistido deberá reflejar esa condición.

No deberán mantenerse como datos vigentes de pareja los campos que ya no correspondan.

### CA-21 - No modificar otro paciente

Dado que se actualizan datos de pareja,  
cuando se procesa la operación,  
entonces no deberá crearse, modificarse ni relacionarse automáticamente otro paciente.

### CA-22 - Validar duplicidad

Dado que la actualización produce una combinación normalizada de nombre y teléfono que corresponde a otro paciente de la misma clínica,  
cuando se intenta guardar,  
entonces el sistema debe responder con `409 Conflict`.

### CA-23 - Excluir el propio registro

Dado que el paciente conserva su combinación de nombre y teléfono,  
cuando se verifica la duplicidad,  
entonces no deberá considerarse duplicado de sí mismo.

### CA-24 - Permitir teléfonos compartidos

Dado que otro paciente tiene el mismo teléfono pero un nombre diferente,  
cuando se actualiza el registro,  
entonces deberá permitirse la operación si no existe una combinación duplicada.

### CA-25 - Mantener independencia terapéutica

Dado que se actualiza un paciente,  
cuando finaliza la operación,  
entonces no deberán modificarse automáticamente sus procesos terapéuticos ni sus relaciones con terapeutas.

### CA-26 - No modificar estado de paciente

Dado que se actualiza un paciente,  
cuando se procesa la solicitud,  
entonces no deberá aceptarse ni generarse un campo `status` propio.

### CA-27 - Actualizar fecha

Dado que la información del paciente cambia correctamente,  
cuando se persisten los cambios,  
entonces deberá actualizarse `updated_at`.

`created_at` deberá conservarse.

### CA-28 - No aplicar cambios parciales ante errores

Dado que la actualización contiene datos inválidos o incumple una restricción,  
cuando se rechaza,  
entonces el paciente deberá conservar su información anterior.

### CA-29 - Mantener consistencia ante concurrencia

Dado que existen actualizaciones simultáneas,  
cuando afectan la combinación utilizada para determinar duplicidad,  
entonces el sistema deberá garantizar que no se creen registros equivalentes.

### CA-30 - Respuesta correcta

Dado que la actualización se completó correctamente,  
cuando finaliza la operación,  
entonces el sistema debe responder con `200 OK` y la información actualizada conforme a OpenAPI.

### CA-31 - Proteger contra CSRF

Dado que la operación utiliza autenticación mediante cookies,  
cuando se recibe la solicitud,  
entonces deberán aplicarse los controles CSRF correspondientes.

## Reglas de negocio

- Los roles `clinic` y `therapist` pueden actualizar conforme a sus permisos.
- El usuario y su clínica deben estar activos.
- `clinic` puede actualizar pacientes de su clínica.
- `therapist` solo puede actualizar pacientes vinculados a sus procesos.
- La clínica del paciente es inmutable.
- El identificador del paciente es inmutable.
- Los campos omitidos conservan su valor.
- Debe validarse el estado final completo.
- La mayoría de edad comienza a los 18 años.
- Los adultos deben contar con teléfono.
- Los menores pueden omitir teléfono personal.
- Los datos de tutor dependen de las reglas aplicables.
- Los valores de catálogos deben existir.
- Los datos de pareja no representan otro paciente.
- Debe impedirse la duplicidad por nombre y teléfono dentro de la clínica.
- Un paciente no puede considerarse duplicado de sí mismo.
- Los teléfonos pueden compartirse.
- La actualización no modifica procesos terapéuticos.
- El paciente no tiene `status`.
- Debe actualizarse `updated_at` cuando existan cambios efectivos.

## Dependencias

- Auth.
- Users.
- Clinics.
- Patients.
- Catalogs.
- Therapeutic Processes.

## Consideraciones técnicas

### Endpoint

`PUT /v1/patients/{id}`

Aunque utiliza `PUT`, la historia define actualización parcial. Esta semántica deberá reflejarse expresamente en OpenAPI para evitar interpretaciones diferentes entre frontend y backend.

### Autorización

- Validar sesión y usuario activo.
- Validar clínica activa.
- Obtener identidad y clínica desde la sesión.
- Comprobar pertenencia del paciente a la clínica.
- Para `therapist`, comprobar relación mediante procesos terapéuticos.
- No aceptar cambios de clínica ni identificador.

### Validación del estado final

- Consultar el paciente actual.
- Combinar los campos proporcionados con los existentes.
- Evaluar edad y campos obligatorios.
- Evaluar condiciones de tutor.
- Evaluar datos de pareja.
- Validar valores de catálogos.
- Validar duplicidad.
- Persistir únicamente después de superar todas las validaciones.

### Normalización y duplicidad

- Utilizar la misma normalización de Create Patient.
- Excluir el propio identificador al comprobar duplicidad.
- Aplicar la unicidad dentro de la clínica.
- Mantener la consistencia cuando cambien nombre o teléfono.
- No depender exclusivamente de una consulta previa sin garantías ante concurrencia.

### Persistencia

- Respetar DynamoDB Single Table.
- Actualizar únicamente los campos permitidos.
- Conservar `created_at`, `id` y clínica.
- Actualizar `updated_at` cuando corresponda.
- No modificar procesos terapéuticos.
- Utilizar operaciones consistentes para actualizar las referencias de unicidad cuando cambie la identidad utilizada para detectar duplicados.

### Respuestas HTTP

| Código | Descripción |
|---|---|
| `200 OK` | Paciente actualizado correctamente. |
| `400 Bad Request` | Identificador o información inválida. |
| `401 Unauthorized` | Sesión inexistente o inválida. |
| `403 Forbidden` | Usuario sin permisos de operación. |
| `404 Not Found` | Paciente inexistente o fuera del alcance autorizado. |
| `409 Conflict` | Duplicidad o conflicto de integridad. |

### Arquitectura

- `presentation`: DTO, autenticación y respuesta HTTP.
- `application`: caso de uso Update Patient y coordinación de autorización.
- `domain`: reglas de edad, catálogos, pareja, tutor y duplicidad.
- `infrastructure`: consultas y actualización mediante adaptadores.

El caso de uso deberá permanecer separado de Create Patient, aunque ambos puedan reutilizar validaciones de dominio.

## Referencias

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yaml`
- `docs/DEFINITIONS.md`
- `docs/ENDPOINTS.md`
- `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

- [ ] Todos los criterios de aceptación fueron implementados.
- [ ] Se verificó la autorización para `clinic` y `therapist`.
- [ ] Se verificó el aislamiento entre clínicas.
- [ ] Se verificó la actualización parcial.
- [ ] Se verificó la inmutabilidad de clínica e identificador.
- [ ] Se verificaron las transiciones de edad.
- [ ] Se verificaron los valores de catálogos.
- [ ] Se verificó la actualización de datos de pareja.
- [ ] Se verificó la duplicidad y la exclusión del propio registro.
- [ ] Se verificó que no se modifiquen procesos terapéuticos.
- [ ] Se verificó la consistencia ante concurrencia.
- [ ] Se confirmó la consistencia con OpenAPI.
- [ ] La implementación fue revisada.
