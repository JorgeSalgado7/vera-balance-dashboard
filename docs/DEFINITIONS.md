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
* Cédula
* Clínica
* Rol
* Estatus

Un usuario pertenece a una clínica y puede tener rol de administrador o terapeuta.



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

El paciente no tiene un estado activo/inactivo propio. El estado pertenece a cada proceso terapéutico en el que participa.

La necesidad de capturar información del tutor depende del tipo de terapia.

### 1.5 Registro de sesión

Representa el resumen de una sesión perteneciente a un proceso terapéutico.

* Fecha de la sesión
* ¿Asistió?
* Resumen de la sesión
* Herramientas brindadas al paciente
* Tareas

Las tareas se seleccionan desde las tareas existentes.

### 1.6 Tareas

* Descripción
* Completada?

Las tareas son entidades independientes.

Esto permite crear una tarea una sola vez y posteriormente seleccionarla dentro de los registros de sesión.

## 2. Tipos de terapia

### 2.1 Individual

* Un único paciente en un proceso.
* Si el estado civil es `En una relación` o `Casado`, se muestran los datos de pareja en el frontend.
* Si la edad es menor a 18 años, por default el tipo de terapia cambia a Infantil.

### 2.2 Pareja

* Dos pacientes pertenecen al mismo proceso terapéutico.
* Se pueden crear dos pacientes o seleccionar pacientes existentes.
* El estado civil no influye en mostrar datos adicionales de pareja en el frontend.

### 2.3 Infantil

* Un único paciente.
* Se solicitan los datos de un tutor.
* Los datos del tutor se muestran por default al seleccionar Terapia infantil.

### 2.4 Familiar

* Dos o más pacientes pertenecen al mismo proceso terapéutico.
* Si alguno de los pacientes es menor de 18 años, no es necesario agregar datos de tutor por participar en este tipo de terapia.

## 3. Roles

### 3.1 Admin

Tiene acceso a los terapeutas y recursos pertenecientes a su misma clínica.

Puede realizar las siguientes acciones:

1. Crear, editar y eliminar usuarios.
2. Crear, editar y eliminar procesos terapéuticos.
3. Crear, editar y eliminar pacientes.
4. Crear, editar y eliminar registros de sesión.
5. Crear, editar y eliminar tareas.
6. Cambiar contraseña.
7. Editar su perfil.

Si un administrador elimina un paciente, se elimina también la información relacionada con ese paciente.

### 3.2 Terapeuta

Tiene acceso únicamente a sus propios recursos.

Puede realizar las siguientes acciones:

1. Crear, editar y eliminar procesos terapéuticos.
2. Crear y editar pacientes.
3. Crear, editar y eliminar registros de sesión de sus procesos terapéuticos.
4. Utilizar las tareas disponibles en sus registros de sesión.
5. Cambiar contraseña.
6. Editar su perfil.

El terapeuta no puede eliminar directamente un paciente.
