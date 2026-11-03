# DEFINICIÓN DE LA DB

Base de datos: DynamoDB con Single Table Design.

Todas las entidades del sistema se almacenarán en una única tabla de DynamoDB.

Las claves `pk` y `sk` permitirán identificar cada entidad y diferenciar los tipos de registros almacenados.

Los índices secundarios globales seguirán esta convención:

- `GSI1`: obtener todos los registros de un tipo de entidad.
- `GSI2`: consultas por relaciones entre entidades.
- `GSI3`: consultas adicionales por correo electrónico o terapeuta.

No se utilizarán operaciones `Scan`.

Los índices físicos serán compartidos por todas las entidades:

```text
GSI1: gsi1pk (partition key), gsi1sk (sort key)
GSI2: gsi2pk (partition key), gsi2sk (sort key)
GSI3: gsi3pk (partition key), gsi3sk (sort key)
```

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
gsi1pk: string -> 'USER'
gsi1sk: string -> 'USER#' + user UUID
gsi2pk: string -> 'CLINIC#' + clinic UUID
gsi2sk: string -> 'USER#' + user UUID
gsi3pk: string -> 'EMAIL#' + normalized email
gsi3sk: string -> 'USER#' + user UUID
created_at: datetime
updated_at: datetime
```

Los atributos `gsi2pk` y `gsi2sk` se omiten cuando `clinic` es `null`.

## 2. Therapy types

```text
pk: string -> uuid
sk: string -> 'THERAPY_TYPE'
name: string
icon: string | null
gsi1pk: string -> 'THERAPY_TYPE'
gsi1sk: string -> 'THERAPY_TYPE#' + therapy type UUID
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
gsi1pk: string -> 'CLINIC'
gsi1sk: string -> 'CLINIC#' + clinic UUID
created_at: datetime
updated_at: datetime
```

## 4. Patients

```text
pk: string -> uuid
sk: string -> 'PATIENT'
clinic: string
gsi1pk: string -> 'PATIENT'
gsi1sk: string -> 'PATIENT#' + patient UUID
gsi2pk: string -> 'CLINIC#' + clinic UUID
gsi2sk: string -> 'PATIENT#' + patient UUID
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
gsi1pk: string -> 'THERAPEUTIC_PROCESS'
gsi1sk: string -> 'THERAPEUTIC_PROCESS#' + process UUID
gsi2pk: string -> 'CLINIC#' + clinic UUID
gsi2sk: string -> 'THERAPEUTIC_PROCESS#' + process UUID
gsi3pk: string -> 'THERAPIST#' + therapist UUID
gsi3sk: string -> 'THERAPEUTIC_PROCESS#' + process UUID
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

## 6. Patient Therapeutic Processes

```text
pk: string -> 'PATIENT#' + patient UUID
sk: string -> 'THERAPEUTIC_PROCESS#' + process UUID
created_at: datetime
updated_at: datetime
```

Las consultas de procesos por paciente se realizarán mediante `Query` sobre la tabla principal, utilizando `pk = 'PATIENT#' + patient UUID`. Los procesos relacionados se recuperarán mediante `BatchGetItem`.

## 7. Records

```text
pk: string -> uuid
sk: string -> 'RECORD'
gsi1pk: string -> 'RECORD'
gsi1sk: string -> 'RECORD#' + record UUID
gsi2pk: string -> 'THERAPEUTIC_PROCESS#' + therapeutic_process UUID
gsi2sk: string -> 'RECORD#' + record UUID
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
gsi1pk: string -> 'HOME_WORK'
gsi1sk: string -> 'HOME_WORK#' + homework UUID
gsi2pk: string -> 'RECORD#' + record UUID
gsi2sk: string -> 'HOME_WORK#' + homework UUID
description: string
record: string -> RECORD UUID
created_at: datetime
updated_at: datetime
```

## 9. Catalogs

Los catálogos no pertenecen a la DB, pero son constantes fijas e inmutables que se encuentran dentro del frontend. Se debe respetar estrictamente su valor.

**Estado civil**

```javascript
const MARITAL_STATUS = [
  'Soltero',
  'Casado',
  'En una relación',
  'Viudo'
]
```

**Escolaridad**

```javascript
const EDUCATIONAL_LEVEL = [
  'Kinder',
  'Primaria',
  'Secundaria',
  'Preparatoria',
  'Universidad',
  'Maestría',
  'Sin estudios'
]
```

**Género**

```javascript
const GENDER = [
  'Masculino',
  'Femenino'
]
```

**Estatus**

```javascript
const STATUS = [
  'Activo',
  'Inactivo'
]
```

**ESTATUS DE PROCESO TERAPÉUTICO**

```javascript
const THERAPEUTIC_PROCESS_STATUS = [
  'Activo',
  'Dado de alta',
  'Proceso interrupido',
  'Cancelado'
]
```

**ESTATUS DE LA SESIÓN**

```javascript
const RECORD_STATUS = [
  'Asistida',
  'Cancelada',
  'Con retraso',
  'Falta'
]
```

## 10. Patrones de acceso

Las consultas deberán respetar los endpoints definidos en `/docs/baas-vera-balance-dashboard.yml`.

| Consulta | Operación |
|---|---|
| Obtener entidad por ID | GetItem `pk + sk` |
| Obtener todos los usuarios | Query GSI1 |
| Obtener todas las clínicas | Query GSI1 |
| Obtener todos los tipos de terapia | Query GSI1 |
| Obtener usuarios por clínica | Query GSI2 |
| Obtener usuario por correo | Query GSI3 |
| Obtener pacientes por clínica | Query GSI2 |
| Obtener pacientes de un terapeuta | Query GSI3 de Therapeutic Processes + BatchGetItem |
| Obtener procesos terapéuticos por clínica | Query GSI2 |
| Obtener procesos terapéuticos por terapeuta | Query GSI3 |
| Obtener procesos terapéuticos por paciente | Query tabla principal + BatchGetItem |
| Obtener registros por proceso terapéutico | Query GSI2 |
| Obtener tareas por registro | Query GSI2 |
| Obtener entidades relacionadas por UUID | BatchGetItem |

Las consultas de listado deberán procesar `LastEvaluatedKey` cuando DynamoDB devuelva resultados paginados.

Para consultar un usuario específico de una clínica se utilizará `GetItem` y se verificará su asociación con la clínica solicitada.

Las consultas de pacientes de un terapeuta deberán eliminar los pacientes duplicados cuando aparezcan en varios procesos terapéuticos.

La búsqueda por correo no garantiza por sí sola la unicidad. La creación y actualización de usuarios deberán aplicar controles que impidan correos duplicados, incluso ante solicitudes concurrentes.

Las consultas mediante GSI tendrán consistencia eventual.

Los atributos utilizados para los índices deberán actualizarse cuando cambien las relaciones correspondientes.

No se deberán utilizar operaciones `Scan` bajo ninguna circunstancia.