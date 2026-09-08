# DEFINICIÓN DE LA DB

Base de datos: DynamoDB con Single Table Design.

## 1. Clinics

```text
pk: string -> uuid
sk: string -> 'CLINIC'
name: string
logo: string | null
address: string
phone_number: string
therapy_types: TherapyType[]
status: string -> 'active' | 'inactive'
created_at: datetime
updated_at: datetime
```

Cada clínica tendrá tipos de terapia por default, pero podrá agregar nuevos tipos.

```text
TherapyType: {
	name: string
	icon: string
}
```

Tipos iniciales:

```text
[
	{name: 'Terapia individual', icon: ''},
	{name: 'Terapia de pareja', icon: ''},
	{name: 'Terapia infantil', icon: ''},
	{name: 'Terapia familiar', icon: ''}
]
```

## 2. Users

```text
pk: string -> uuid
sk: string -> 'USER'
name: string
email: string
password: string
professional_license: string
clinic: Clinic | null -> {pk: uuid, sk: 'CLINIC'}
role: string -> 'admin' | 'therapist'
status: string -> 'active' | 'inactive'
created_at: datetime
updated_at: datetime
```


## 3. Therapeutic Processes

```text
pk: string -> uuid
sk: string -> 'THERAPEUTIC_PROCESS'
therapy_type: string -> clinic.therapyType
therapist: User -> {pk: uuid, sk: 'USER'}
patients: Patient[] -> [{pk: uuid, sk: 'PATIENT'}...]
is_first_time: boolean
consultation_reason: string
goals: string
records: Record[] -> [{pk: uuid, sk: 'RECORD'}...]
status: string -> 'active' | 'inactive' | 'discharged' | 'unfinished'
created_at: datetime
updated_at: datetime
```

El estado pertenece al proceso terapéutico y no al paciente.

## 4. Patients

```text
pk: string -> uuid
sk: string -> 'PATIENT'
name: string
age: number
guardian: {
	name: string
	phone_number: string
	relationship: string
} | null
phone_number: string | null -> si age es mayor de 18 no es nullo
sex: string
education: string
occupation: string
marital_status: string
partner_data: {
	name: string
	age: number
	relationship_time: string
	occupation: string
} | null
religion: string
address: string
created_at: datetime
updated_at: datetime
```

El paciente no tiene un status propio.

## 5. Records

```text
pk: string -> uuid
sk: string -> 'RECORD'
session_date: datetime
is_attendance: boolean
resume: string | null
tools: string | null
home_works: HomeWork[] -> [{pk: uuid, sk: 'HOME_WORK'}...]
created_at: datetime
updated_at: datetime
```

Cada Record pertenece a un proceso terapéutico.

Las tareas se seleccionan desde las tareas existentes y se almacenan como referencias.

## 6. HomeWorks

```text
pk: string -> uuid
sk: string -> 'HOME_WORK'
description: string
is_completed: boolean
created_at: datetime
updated_at: datetime
```

HomeWork es una entidad independiente para permitir reutilizar y seleccionar tareas al crear o editar un Record.

## 7. Catalogs

Los catálogos permitirán administrar valores reutilizables como estado civil, escolaridad, sexo u otros que se requieran posteriormente.

```text
pk: string -> uuid
sk: string -> 'CATALOG#type'
name: string
options: string[]
created_at: datetime
updated_at: datetime
```

Ejemplos:

```text
sk: 'CATALOG#MARITAL_STATUS'
name: 'Estado civil'
options: [
	'Soltero',
	'En una relación',
	'Casado',
	'Divorciado',
	'Viudo'
]
```

```text
sk: 'CATALOG#SCHOOL'
name: 'Escolaridad'
options: [
	'Kinder',
	'Primaria',
	'Secundaria',
	'Preparatoria',
	'Universidad',
	'Sin estudios'
]
```

```text
sk: 'CATALOG#GENDER'
name: 'Género'
options: [
	'Masculino',
	'Femenino'
]
```
