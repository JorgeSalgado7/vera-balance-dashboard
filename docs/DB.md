# DEFINICIÓN DE LA DB

Base de datos: DynamoDB con Single Table Design.

Todas las entidades del sistema se almacenarán en una única tabla de DynamoDB.

Las claves `pk` y `sk` permitirán identificar cada entidad y diferenciar los tipos de registros almacenados.

## 1. Users

```text
pk: string -> uuid
sk: string -> 'USER'
name: string
email: string
password: string
professional_license: string
role: string -> 'admin' | 'clinic' | 'therapist'
status: string -> 'Activo' | 'Inactivo'
clinic: string | null
gsi1pk: string -> 'CLINIC#' + clinic UUID
gsi1sk: string -> 'USER#' + user UUID
gsi2pk: string -> 'EMAIL#' + normalized email
gsi2sk: string -> 'USER#' + user UUID
created_at: datetime
updated_at: datetime
```

## 2. Therapy types
```text
pk: string -> uuid
sk: string -> 'THERAPY_TYPE'
name: string
icon: string | null
created_at: datetime
updated_at: datetime
```


## 3. Clinics

```text
pk: string -> uuid
sk: string -> 'CLINIC'
name: string
logo: string | null
address: string
phone_number: string
therapy_types: TherapyTypes[String] -> solo uuid
status: string -> 'Activo' | 'Inactivo'
created_at: datetime
updated_at: datetime
```

## 4. Patients

```text
pk: string -> uuid
sk: string -> 'PATIENT'
clinic: string
gsi1pk: string -> 'CLINIC#' + clinic UUID
gsi1sk: string -> 'PATIENT#' + patient UUID
name: string
birthday: date
guardian: {
    name: string
    phone_number: string
    relationship: string
} | null
phone_number: string | null
gender: string -> 'Masculino' | 'Femenino'
educational_level: string
occupation: string
marital_status: string
partner_data: {
    name: string
    relationship_time: string
    occupation: string
} | null
religion: string
address: string
created_at: datetime
updated_at: datetime
```


## 5. Therapeutic Processes

```text
pk: string -> uuid
sk: string -> 'THERAPEUTIC_PROCESS'
clinic: string -> CLINIC UUID
gsi1pk: string -> 'CLINIC#' + clinic UUID
gsi1sk: string -> 'THERAPEUTIC_PROCESS#' + process UUID
gsi2pk: string -> 'THERAPIST#' + therapist UUID
gsi2sk: string -> 'THERAPEUTIC_PROCESS#' + process UUID
therapy_type: string -> THERAPY TYPE UUID
therapist: string -> USER UUID
patients: PATIENTS[string] -> solo uuid
is_first_time: boolean
consultation_reason: string
goals: string
status: string -> 'Activo' | 'Dado de alta' | 'Proceso interrupido' | 'Cancelado'
created_at: datetime
updated_at: datetime
```

## 6. Patient Therapeutic Procesess
```text
pk: string -> 'PATIENT#' + patient UUID
sk: string -> 'THERAPEUTIC_PROCESS#' + process UUID
created_at: datetime
updated_at: datetime
```

## 7. Records

```text
pk: string -> uuid
sk: string -> 'RECORD'
gsi1pk: string -> 'THERAPEUTIC_PROCESS#' + therapeutic_process UUID
gsi1sk: string -> 'RECORD#' + record UUID
session_date: datetime
attendance: string -> 'Asistida' | 'Cancelada' | 'Con retraso' | 'Falta'
resume: string | null
tools: string | null
therapeutic_process: string -> THERAPEUTIC PROCESS UUID
created_at: datetime
updated_at: datetime
```


## 8. HomeWorks

```text
pk: string -> uuid
sk: string -> 'HOME_WORK'
gsi1pk: string -> 'RECORD#' + record UUID
gsi1sk: string -> 'HOME_WORK#' + homework UUID
description: string
record: string -> RECORD UUID
created_at: datetime
updated_at: datetime
```

## 9. Catalogs

LOs catálogos no pertenecen a la DB, pero si son constantes fijas e inmutables que se encuentran dentro del frontend, se debe respetar estrictamente su valor


**Estado civil**
const MARITAL_STATUS = [
	'Soltero',
	'Casado',
	'En una relación',
	'Viudo'
]



**Escolaridad**
const EDUCATIONAL_LEVEL = [
	'Kinder',
  'Primaria',
  'Secundaria',
  'Preparatoria',
  'Universidad',
	'Maestría',
  'Sin estudios'
]

**Género**
const GENDER = [
	'Masculino',
	'Femenino'
]

**Estatus**
const STATUS = [
	'Activo',
	'Inactivo',
]

**ESTATUS DE PROCESO TERAPEUTICO**
const THERAPEUTIC_PROCESS_STATUS = [
	'Activo',
	'Dado de alta',
	'Proceso interrupido',
	'Cancelado',
]

**ESTATUS DE LA SESIÓN**
const RECORD_STATUS = [
	'Asistida',
	'Cancelada',
	'Con retraso',
	'Falta',
]
