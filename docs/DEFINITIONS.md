# DEFINICIONES FUNCIONALES — VERA BALANCE

## 1. Objetivo

Definir las reglas funcionales y los flujos principales de Vera Balance Dashboard para su primera versión operativa (MVP).

El sistema permitirá administrar clínicas, terapeutas, pacientes, procesos terapéuticos, registros de sesiones y tareas.

El **proceso terapéutico será el núcleo central de la aplicación**, relacionando pacientes, terapeutas y sesiones.

---

## 2. Roles y permisos

### 2.1 Administrador (`admin`)

- Tiene acceso a toda la información del sistema.
- Tiene acceso a todos los endpoints.
- Puede consultar, crear, editar y eliminar información, de acuerdo con las operaciones disponibles.
- La información deberá organizarse y agruparse por clínicas.
- Puede administrar información de todas las clínicas.

### 2.2 Clínica (`clinic`)

- Tiene acceso a la información relacionada exclusivamente con su clínica.
- Puede consultar, crear, editar y eliminar información relacionada con su clínica, de acuerdo con las operaciones disponibles.
- Puede administrar pacientes y procesos terapéuticos de su clínica.
- Puede realizar las mismas acciones administrativas sobre los terapeutas asociados a su clínica.
- No puede acceder a información de otras clínicas.

### 2.3 Terapeuta (`therapist`)

- Puede consultar, crear y editar pacientes y procesos terapéuticos relacionados con él.
- Puede consultar y registrar información de las sesiones de sus procesos terapéuticos.
- Puede asignar tareas relacionadas con dichas sesiones.
- No puede acceder a pacientes, procesos o registros que no estén relacionados con él.
- No cuenta con permisos de eliminación de pacientes o procesos terapéuticos.

### 2.4 Regla general de autorización

Los permisos deberán validarse en el backend según el rol y la relación del usuario con la clínica o el proceso terapéutico.

El hecho de que una opción esté oculta en la interfaz no sustituye la validación de permisos.

---

## 3. Flujo principal de trabajo

El flujo parte de que ya existe un terapeuta registrado.

### Paso 1. Crear paciente

Se registra un paciente con su información personal y los datos adicionales que correspondan.

La información del tutor o de la pareja se solicitará según las reglas definidas para el tipo de terapia.

### Paso 2. Crear proceso terapéutico

Se crea un proceso terapéutico en el que se relacionan:

- Un tipo de terapia.
- Un terapeuta.
- Uno o más pacientes, según el tipo de terapia.

### Paso 3. Registrar sesiones

Una vez creado el proceso terapéutico, se podrán generar registros de sesión (`records`).

Estos registros podrán elaborarse durante la sesión o al finalizarla.

Cada registro pertenecerá a un proceso terapéutico.

### Paso 4. Registrar tareas

A cada registro de sesión se le podrán asignar tareas (`homeworks`).

Las tareas serán opcionales.

Una sesión podrá registrarse sin tareas asignadas.

### Flujo resumido

```text
Paciente
   │
   ▼
Proceso terapéutico
   ├── Tipo de terapia
   ├── Terapeuta
   └── Paciente(s)
          │
          ▼
    Registro de sesión
          │
          ▼
    Tareas (opcionales)
```

---

## 4. Tipos de terapia

### 4.1 Terapia individual

La terapia individual contempla **un solo paciente por proceso terapéutico**.

Reglas:

- Se registra un único paciente.
- Si el paciente es menor de 18 años, se habilita la información de su tutor.
- Si el paciente tiene pareja, se podrá registrar su información mediante `partner_data`.
- La información de pareja es opcional.
- Registrar `partner_data` no implica crear otro paciente.
- El proceso terapéutico tendrá un solo terapeuta.

### 4.2 Terapia de pareja

La terapia de pareja contempla **exactamente dos pacientes independientes por proceso terapéutico**.

Reglas:

- Se crean dos pacientes independientes.
- Ambos pacientes se asignan al mismo proceso terapéutico.
- Cada paciente conserva su propio registro e información personal.
- No se habilita `partner_data` para representar a la otra persona.
- La pareja se representa mediante la relación de ambos pacientes con el proceso terapéutico.
- El proceso terapéutico tendrá un solo terapeuta.

### 4.3 Terapia familiar

La terapia familiar contempla **dos o más pacientes independientes por proceso terapéutico**.

Reglas:

- Se crean al menos dos pacientes.
- Todos los participantes se relacionan con el mismo proceso terapéutico.
- Cada paciente conserva su propio registro e información personal.
- Si un paciente tiene pareja, se podrá registrar opcionalmente su información en `partner_data`.
- Si no corresponde registrar información de pareja, `partner_data` permanecerá vacío.
- Si alguno de los pacientes es menor de 18 años, se habilita la información de su tutor.
- El proceso terapéutico tendrá un solo terapeuta.

### 4.4 Terapia infantil

La terapia infantil contempla **un solo paciente menor de 18 años por proceso terapéutico**.

Reglas:

- Solo podrá seleccionarse para pacientes menores de 18 años.
- Se registra un único paciente.
- La información del tutor será obligatoria.
- No se habilitará `partner_data`.
- El teléfono de contacto corresponderá al tutor.
- El menor no registrará un número telefónico propio.
- El proceso terapéutico tendrá un solo terapeuta.

---

## 5. Información de pareja (`partner_data`)

`partner_data` representa información complementaria de la pareja de un paciente.

No representa una relación automática con otro paciente registrado en el sistema.

### 5.1 Estructura

La información estará compuesta por:

- `name`: nombre de la pareja.
- `relationship_time`: tiempo de relación.
- `occupation`: ocupación.

### 5.2 Reglas por tipo de terapia

| Tipo de terapia | `partner_data` |
|---|---|
| Individual | Opcional |
| Pareja | No aplica |
| Familiar | Opcional para cada paciente |
| Infantil | No aplica |

### 5.3 Reglas generales

- `partner_data` podrá ser `null` cuando no corresponda.
- Registrar esta información no creará otro paciente.
- En terapia de pareja se crearán dos pacientes independientes.
- El formulario deberá habilitar u ocultar estos campos según el tipo de terapia.
- Los datos de pareja no deberán confundirse con los pacientes vinculados al proceso terapéutico.

---

## 6. Información del tutor

La información del tutor se utilizará cuando corresponda registrar a un paciente menor de edad.

### 6.1 Estructura

- `name`: nombre del tutor.
- `phone_number`: teléfono del tutor.
- `relationship`: parentesco o relación con el paciente.

### 6.2 Reglas

- En terapia individual, se habilitará cuando el paciente sea menor de 18 años.
- En terapia familiar, se habilitará para cada participante menor de 18 años.
- En terapia infantil, será obligatoria.
- En terapia infantil, el teléfono de contacto del paciente será el del tutor.
- La información del tutor pertenece al registro del paciente, no al proceso terapéutico.

---

## 7. Pacientes

Un paciente representa a una persona registrada en Vera Balance.

### Reglas

- Cada paciente tendrá su propio registro.
- Un paciente podrá participar en múltiples procesos terapéuticos.
- Un paciente podrá estar relacionado con distintos tipos de terapia.
- La información de pareja y tutor se registrará cuando corresponda.
- En terapia de pareja y familiar, cada participante será un paciente independiente.
- La creación de un paciente no generará automáticamente un proceso terapéutico.

---

## 8. Proceso terapéutico

El **proceso terapéutico es el núcleo central de Vera Balance Dashboard**.

Representa la relación terapéutica entre un terapeuta y uno o más pacientes.

### 8.1 Relaciones

Cada proceso terapéutico:

- Pertenece a una clínica.
- Tiene exactamente un tipo de terapia.
- Tiene exactamente un terapeuta.
- Tiene uno o más pacientes, dependiendo del tipo de terapia.
- Puede contener múltiples registros de sesión.
- Permite asociar tareas a sus registros de sesión.

### 8.2 Reglas

- Un paciente puede tener múltiples procesos terapéuticos.
- Un terapeuta puede tener múltiples procesos terapéuticos.
- Cada proceso terapéutico tendrá un único terapeuta asignado.
- La cantidad de pacientes dependerá del tipo de terapia.
- Un proceso terapéutico deberá existir antes de registrar sesiones.
- Los registros de sesión deberán estar relacionados con un proceso terapéutico existente.

### 8.3 Cantidad de pacientes por tipo de terapia

| Tipo de terapia | Cantidad |
|---|---|
| Individual | Exactamente 1 |
| Pareja | Exactamente 2 |
| Familiar | Mínimo 2 |
| Infantil | Exactamente 1, menor de 18 años |

---

## 9. Registros de sesión (`records`)

Los registros de sesión documentan la atención realizada dentro de un proceso terapéutico.

### Reglas

- Cada registro pertenece a un único proceso terapéutico.
- Un proceso terapéutico puede tener múltiples registros.
- Los registros pueden crearse durante o al finalizar la sesión.
- Cada registro podrá contener información de la sesión.
- Un registro puede tener cero o más tareas asociadas.
- Los permisos de acceso estarán determinados por el proceso terapéutico al que pertenece.

---

## 10. Tareas (`homeworks`)

Las tareas representan actividades indicadas durante una sesión terapéutica.

### Reglas

- Cada tarea estará relacionada con un registro de sesión.
- Un registro podrá tener múltiples tareas.
- La asignación de tareas será opcional.
- Una sesión podrá finalizar sin tareas registradas.
- Las tareas deberán mantenerse asociadas a la sesión en la que fueron indicadas.
- El acceso a las tareas estará determinado por los permisos sobre el proceso terapéutico correspondiente.

---

## 11. Reglas generales del MVP

1. El proceso terapéutico será el núcleo central de la aplicación.
2. Todo proceso terapéutico tendrá exactamente un terapeuta.
3. Un terapeuta podrá tener múltiples procesos terapéuticos.
4. Un paciente podrá participar en múltiples procesos terapéuticos.
5. La cantidad de pacientes dependerá del tipo de terapia.
6. En terapia de pareja y familiar, los participantes se registrarán como pacientes independientes.
7. `partner_data` será opcional en terapia individual y familiar cuando corresponda.
8. `partner_data` no se utilizará en terapia de pareja ni infantil.
9. Los menores de edad deberán contar con la información de tutor cuando corresponda según las reglas del tipo de terapia.
10. La terapia infantil solo permitirá pacientes menores de 18 años.
11. Los registros de sesión siempre pertenecerán a un proceso terapéutico.
12. Las tareas siempre pertenecerán a un registro de sesión.
13. Las tareas serán opcionales.
14. El administrador tendrá acceso global a la información del sistema.
15. La clínica administrará exclusivamente la información relacionada con su clínica.
16. El terapeuta accederá exclusivamente a sus pacientes, procesos y registros relacionados.
17. La autorización deberá aplicarse desde el backend.
18. Las funcionalidades del MVP deberán priorizar el flujo completo de atención terapéutica.

---

## 12. Alcance funcional inicial

La primera versión operativa de Vera Balance deberá permitir:

- Autenticar usuarios y aplicar permisos según su rol.
- Administrar clínicas y terapeutas.
- Registrar y consultar pacientes.
- Crear y administrar procesos terapéuticos.
- Relacionar pacientes y terapeutas con procesos terapéuticos.
- Registrar sesiones de los procesos.
- Registrar tareas opcionales por sesión.
- Consultar la información correspondiente según los permisos de cada usuario.

El objetivo del MVP será permitir la operación real de la clínica y validar los flujos principales antes de incorporar funcionalidades adicionales.