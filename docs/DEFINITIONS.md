# DEFINICIONES

## 1. Definiciones

### 1.1 Clínica

* Nombre
* Logo
* Dirección
* Teléfono
* Tipos de terapia
* Estatus

Cada clínica tendrá tipos de terapia definidos por default y podrá agregar nuevos tipos posteriormente.

### 1.2 Usuario

* Nombre
* Email
* Password
* Cédula profesional
* Clínica
* Rol
* Estatus

Un usuario pertenece a una clínica y puede tener rol de `clinic` o `therapist`.

En el frontend estos roles se mostrarán como:

* `clinic` → Clínica
* `therapist` → Terapeuta

### 1.3 Proceso terapéutico

* Tipo de terapia
* Terapeuta
* Pacientes
* ¿Primera vez?
* Motivo de la consulta
* Objetivos
* Registros de sesión
* Estatus

El proceso terapéutico representa el tratamiento que uno o más pacientes llevan con un terapeuta.

Un paciente puede participar en diferentes procesos terapéuticos a lo largo del tiempo.

Los estados disponibles son:

* `active` → Activo
* `inactive` → Inactivo
* `discharged` → Dado de alta
* `unfinished` → Proceso no finalizado

Los valores internos se almacenan en inglés. El frontend es responsable de mostrar su equivalente en español.

### 1.4 Paciente

* Nombre
* Edad
* Tutor
  * Nombre
  * Teléfono
  * Parentesco
* Teléfono
* Sexo
* Escolaridad
* Ocupación
* Estado civil
* Datos de la pareja
  * Nombre
  * Edad
  * Tiempo de la relación
  * Ocupación
* Religión
* Dirección

El paciente representa a una persona registrada dentro de la clínica.

El paciente no tiene un estado activo o inactivo propio. El estado pertenece a cada proceso terapéutico en el que participa.

La necesidad de capturar información del tutor depende del tipo de terapia.

### 1.5 Registro de sesión

Representa el registro de una sesión perteneciente a un proceso terapéutico.

* Fecha de la sesión
* ¿Asistió?
* Resumen de la sesión
* Herramientas brindadas al paciente
* Tareas

Las tareas se seleccionan a partir de las tareas existentes.

### 1.6 Tareas

* Descripción
* ¿Completada?

Las tareas son entidades independientes.

Esto permite crear una tarea una sola vez y posteriormente seleccionarla dentro de los registros de sesión.

## 2. Tipos de terapia

### 2.1 Individual

* Un único paciente pertenece al proceso terapéutico.
* Si el estado civil del paciente es `En una relación` o `Casado`, se muestran los datos de la pareja en el frontend.
* Si la edad del paciente es menor a 18 años, por default el tipo de terapia cambia a Terapia infantil.

### 2.2 Pareja

* Dos pacientes pertenecen al mismo proceso terapéutico.
* Se pueden crear dos pacientes nuevos o seleccionar pacientes existentes.
* El estado civil no influye en mostrar información adicional de pareja en el frontend.

### 2.3 Infantil

* Un único paciente pertenece al proceso terapéutico.
* Se solicitan los datos de un tutor.
* Los datos del tutor se muestran por default al seleccionar Terapia infantil.

### 2.4 Familiar

* Dos o más pacientes pertenecen al mismo proceso terapéutico.
* Si alguno de los pacientes es menor de 18 años, no es necesario agregar datos de tutor por participar en este tipo de terapia.

## 3. Roles

### 3.1 Clínica

El usuario con rol de clínica tiene acceso a los terapeutas y recursos pertenecientes a su misma clínica.

Además de las funciones administrativas, también puede actuar como terapeuta y administrar sus propios pacientes, procesos terapéuticos y registros de sesión.

Puede realizar las siguientes acciones:

1. Editar la información de su clínica.
2. Editar su perfil.
3. Cambiar su contraseña.
4. Crear, editar y eliminar usuarios de su clínica.
5. Crear, editar y eliminar pacientes.
6. Crear, editar y eliminar procesos terapéuticos.
7. Crear, editar y eliminar registros de sesión.
8. Crear, editar y eliminar tareas.
9. Consultar la información de los terapeutas pertenecientes a su clínica.
10. Consultar la información de los pacientes y procesos terapéuticos de los terapeutas pertenecientes a su clínica.

Si una clínica elimina un paciente, se elimina también la información relacionada con ese paciente de acuerdo con las reglas definidas por el backend.

### 3.2 Terapeuta

El usuario con rol de terapeuta tiene acceso únicamente a sus propios recursos y a la información relacionada con sus procesos terapéuticos.

Puede realizar las siguientes acciones:

1. Editar su perfil.
2. Cambiar su contraseña.
3. Crear y editar sus pacientes.
4. Crear y editar sus procesos terapéuticos.
5. Crear y editar sus registros de sesión.
6. Crear y editar tareas relacionadas con sus pacientes y procesos terapéuticos.

El terapeuta no puede eliminar directamente un paciente.
