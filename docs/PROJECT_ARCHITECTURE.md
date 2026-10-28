# Arquitectura de Vera Balance

## 1. Objetivo

Este documento define la arquitectura técnica de **Vera Balance Dashboard**, compuesto por dos aplicaciones principales:

- **BAAS (Backend as a Service):** responsable de la lógica de negocio, autenticación, autorización, exposición de API y persistencia.
- **MFE (Microfrontend):** responsable de la interfaz de usuario, gestión de estado y comunicación con el backend.

Ambas aplicaciones implementarán **Clean Architecture**, manteniendo una separación clara de responsabilidades, independencia de infraestructura, modularidad y facilidad de mantenimiento.

El proyecto utilizará **Docker y Docker Compose** para facilitar su instalación, ejecución y despliegue en diferentes entornos.

Este documento se enfoca exclusivamente en las decisiones arquitectónicas y tecnológicas del sistema.

---

## 2. Arquitectura general

Vera Balance estará compuesto por dos aplicaciones independientes que se comunicarán mediante una API REST.

```text
Vera Balance Dashboard
│
├── MFE (React + TypeScript)
│   │
│   ├── Clean Architecture
│   │   ├── UI
│   │   ├── Application
│   │   ├── Domain
│   │   └── Infrastructure
│   │
│   ├── Redux Toolkit
│   ├── Material UI
│   ├── Librería propia de componentes
│   └── Tema global SCSS
│
│              HTTPS / REST API
│                     │
│                     ▼
│
├── BAAS (Node.js + NestJS + TypeScript)
│   │
│   ├── Autenticación y JWT
│   │
│   └── Clean Architecture
│       ├── Presentation
│       ├── Application
│       ├── Domain
│       └── Infrastructure
│
│                     │
│                     ▼
│
└── Amazon DynamoDB
    └── Single Table Design
```

### Principios generales

- El BAAS y el MFE serán aplicaciones independientes.
- El BAAS utilizará separación por módulos.
- El MFE utilizará separación por features.
- Ambas aplicaciones implementarán Clean Architecture.
- El MFE se comunicará exclusivamente con el BAAS mediante API REST.
- El MFE no tendrá acceso directo a DynamoDB.
- El BAAS será responsable de ejecutar las reglas de negocio y validar los permisos.
- Las aplicaciones podrán ejecutarse mediante Docker y Docker Compose.

---

## 3. Stack tecnológico

### 3.1 Backend — BAAS

| Tecnología | Definición | Versión |
|---|---|---|
| Runtime | Node.js | 24 LTS |
| Lenguaje | TypeScript | |
| Framework | NestJS | |
| Arquitectura | Clean Architecture | |
| API | REST | |
| Contrato | OpenAPI | 3.1 |
| Autenticación | `@nestjs/authentication` | Por verificar |
| JWT | `@nestjs/jwt` | |
| Base de datos | Amazon DynamoDB | |
| Persistencia | Single Table Design | |
| Contenedores | Docker | |
| Orquestación | Docker Compose | |

### 3.2 Frontend — MFE

| Tecnología | Definición | Versión |
|---|---|---|
| Framework | React | |
| Lenguaje | TypeScript | |
| Build tool | Vite | |
| Arquitectura | Clean Architecture | |
| Gestor de estado | Redux Toolkit | |
| Librería base de componentes | Material UI | |
| Librería visual | Componentes propios basados en Material UI | |
| Estilos | SCSS | |
| Tema global | SCSS | |
| Comunicación | REST API / HTTPS | |
| Autenticación | JWT | |
| Contenedores | Docker | |
| Orquestación | Docker Compose | |

Las versiones definitivas de las tecnologías del MFE se establecerán durante la configuración inicial del proyecto.

---

## 4. Clean Architecture

Tanto el BAAS como el MFE implementarán Clean Architecture.

La arquitectura deberá separar las responsabilidades de negocio, aplicación, infraestructura y presentación visual o HTTP.

### 4.1 Domain

Contiene los modelos, entidades, reglas de dominio y contratos necesarios para representar el negocio.

No deberá depender de frameworks, componentes visuales, bases de datos ni servicios externos.

### 4.2 Application

Contiene los casos de uso que coordinan las operaciones del sistema.

Depende de Domain y utiliza abstracciones para comunicarse con servicios externos.

### 4.3 Infrastructure

Contiene las implementaciones concretas de los contratos utilizados por Application.

En el BAAS incluye:

- Repositorios DynamoDB.
- Adaptadores de persistencia.
- Servicios de autenticación.
- Integraciones con servicios externos.

En el MFE incluye:

- Clientes HTTP.
- Repositorios de comunicación con el BAAS.
- Adaptadores de respuestas.
- Implementaciones de servicios externos.

### 4.4 Presentation — BAAS

Representa los puntos de entrada HTTP del backend.

Incluye controllers, DTOs, validaciones de entrada y mecanismos de integración con NestJS.

### 4.5 UI — MFE

Representa la interfaz visual y los mecanismos de interacción con el usuario.

Incluye páginas, componentes React, formularios y elementos visuales.

La capa UI no deberá implementar directamente reglas de negocio ni lógica de persistencia.

### 4.6 Regla de dependencias

```text
BAAS

Presentation ──► Application ──► Domain
                       ▲
                       │
                  Infrastructure


MFE

UI ────────────► Application ──► Domain
                       ▲
                       │
                  Infrastructure
```

Las implementaciones concretas deberán depender de las abstracciones internas, manteniendo independientes los casos de uso.

---

## 5. Arquitectura del BAAS

El backend se desarrollará con NestJS y estará organizado mediante **separación por módulos funcionales**.

Cada módulo implementará Clean Architecture y encapsulará sus responsabilidades.

### 5.1 Estructura principal

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── clinics/
│   ├── patients/
│   ├── therapy-types/
│   ├── therapeutic-processes/
│   ├── records/
│   └── homeworks/
│
├── shared/
│   ├── config/
│   ├── dynamodb/
│   ├── http-problem/
│   └── logger/
│
└── main.ts
```

### 5.2 Estructura interna de un módulo

```text
modules/patients/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── patients.module.ts
```

### 5.3 Responsabilidades

**Domain:** contiene las entidades, modelos y reglas del dominio.

**Application:** contiene los casos de uso y la coordinación de operaciones.

**Infrastructure:** implementa repositorios, adaptadores y servicios externos.

**Presentation:** contiene controllers, DTOs y puntos de entrada HTTP.

### 5.4 Reglas de modularidad

- Cada módulo será responsable de su propia lógica funcional.
- Los módulos deberán mantener límites claros de responsabilidad.
- La comunicación entre módulos utilizará interfaces o capacidades explícitas.
- Un módulo no deberá acceder directamente a los repositorios internos de otro módulo.
- La infraestructura compartida contendrá únicamente capacidades técnicas reutilizables.
- No deberá crearse un repositorio genérico que concentre la persistencia de todas las entidades.
- Las dependencias externas deberán implementarse mediante adaptadores.

---

## 6. Arquitectura del MFE

El frontend utilizará React y TypeScript, organizado mediante **separación por features**.

Cada feature implementará Clean Architecture utilizando las capas:

- Domain.
- Application.
- Infrastructure.
- UI.

### 6.1 Estructura principal

```text
src/
├── features/
├── ui/
│   ├── scss/
│   ├── layouts/
│   └── components/
├── common/
├── utils/
├── routes/
├── store/
└── main.tsx
```

### 6.2 Responsabilidades

**features:** contiene las funcionalidades del sistema. Cada feature implementa sus propias capas de Clean Architecture.

**ui:** contiene la librería de componentes reutilizables, layouts y estilos globales de la aplicación.

**common:** contiene interfaces, tipos, constantes y definiciones compartidas.

**utils:** contiene funciones auxiliares reutilizables que no pertenecen a un feature específico.

**routes:** contiene la configuración y organización de rutas del MFE.

**store:** contiene la configuración central de Redux y la integración de los estados de los diferentes features.

### 6.3 Estructura interna de un feature

```text
features/patients/
├── domain/
├── application/
│   └── store/
├── infrastructure/
├── ui/
└── scss/
```

### 6.4 Responsabilidades por capa

**Domain:** contiene modelos, contratos y reglas de dominio del feature.

**Application:** contiene casos de uso, coordinación de operaciones y gestión del estado mediante Redux.

**Infrastructure:** implementa repositorios y clientes HTTP para consumir los endpoints del BAAS.

**UI:** contiene componentes, páginas, formularios y elementos visuales propios del feature.

**SCSS:** contiene estilos y ajustes visuales específicos del feature.

### 6.5 Reglas de organización

- Cada feature deberá mantener sus propias responsabilidades.
- Cada feature tendrá su propia carpeta `scss`.
- Los estilos específicos de un feature deberán mantenerse dentro de su carpeta correspondiente.
- La lógica de negocio no deberá implementarse directamente dentro de componentes React.
- Los componentes React no deberán realizar solicitudes HTTP directamente.
- Toda comunicación con el BAAS deberá realizarse mediante Infrastructure.
- Los elementos visuales reutilizables deberán obtenerse preferentemente de la librería propia de componentes.
- Los features no deberán redefinir valores visuales que pertenezcan al tema global.

---

## 7. Sistema de diseño y librería de componentes

El MFE contará con una **librería propia de componentes y estilos basada en Material UI**.

Esta librería estará ubicada dentro de `src/ui`.

Su objetivo será centralizar los componentes reutilizables, la identidad visual y las convenciones de diseño de Vera Balance.

### 7.1 Estructura

```text
src/ui/
├── components/
│   ├── buttons/
│   ├── inputs/
│   ├── dialogs/
│   ├── tables/
│   └── ...
│
├── layouts/
│
└── scss/
    ├── theme/
    │   └── _theme.scss
    ├── _globals.scss
    └── main.scss
```

La estructura podrá ampliarse cuando exista una necesidad real, manteniendo las tres carpetas principales de `ui`.

### 7.2 Tema global

El MFE tendrá un **único tema global definido en SCSS**.

La fuente de verdad será:

```text
src/ui/scss/theme/_theme.scss
```

Este archivo centralizará los valores de diseño utilizados por toda la aplicación.

Deberá definir:

- Colores principales.
- Colores secundarios.
- Colores semánticos.
- Tipografías.
- Tamaños de texto.
- Espaciados.
- Bordes.
- Radios.
- Sombras.
- Breakpoints.
- Otras propiedades visuales compartidas.

Los componentes y estilos de los features deberán consumir los valores definidos en este tema.

### 7.3 Integración con Material UI

Material UI será la base técnica de los componentes visuales.

La librería propia encapsulará sus componentes y aplicará los estilos definidos por el tema global.

La configuración de Material UI deberá obtener sus valores visuales desde los tokens definidos en SCSS.

**No deberán mantenerse dos definiciones independientes del tema, una en SCSS y otra en TypeScript.**

Para integrar ambas tecnologías podrán utilizarse variables CSS generadas desde SCSS y consumidas por la configuración de Material UI.

Ejemplo conceptual:

```scss
// src/ui/scss/theme/_theme.scss

$primary-color: #7557a8;
$secondary-color: #d8b8e8;
$font-family: 'Poppins', sans-serif;
$border-radius: 8px;

:root {
  --vb-primary: #{$primary-color};
  --vb-secondary: #{$secondary-color};
  --vb-font-family: #{$font-family};
  --vb-border-radius: #{$border-radius};
}
```

Los valores anteriores son ilustrativos y no representan una definición definitiva de identidad visual.

La configuración de Material UI deberá consumir estas variables sin duplicar los valores.

### 7.4 Flujo del tema

```text
src/ui/scss/theme/_theme.scss
              │
              ▼
         Tokens globales
              │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    Material UI     Estilos SCSS
        │             │
        ▼             │
  Librería propia     │
        │             │
        └──────┬──────┘
               │
               ▼
        Features del MFE
```

### 7.5 Personalización global

El objetivo principal del tema es permitir modificar la identidad visual completa desde un único lugar.

Por ejemplo, si en el futuro cambia el color principal de Vera Balance, la modificación deberá realizarse en:

```text
src/ui/scss/theme/_theme.scss
```

El cambio deberá reflejarse automáticamente en todos los componentes y estilos que consuman el token correspondiente.

El mismo principio aplicará para:

- Tipografías.
- Tamaños.
- Espaciados.
- Bordes.
- Radios.
- Sombras.
- Colores semánticos.

No deberá ser necesario modificar individualmente cada feature para aplicar cambios globales de identidad visual.

### 7.6 Reglas obligatorias

1. El MFE tendrá un único tema global definido en SCSS.
2. El tema será la fuente de verdad de la identidad visual.
3. Material UI deberá consumir los tokens definidos por el tema.
4. No deberán duplicarse los valores del tema en archivos TypeScript.
5. La librería propia utilizará Material UI como base.
6. Los componentes reutilizables vivirán en `src/ui/components`.
7. Los layouts compartidos vivirán en `src/ui/layouts`.
8. Los estilos y tokens globales vivirán en `src/ui/scss`.
9. Cada feature tendrá su propia carpeta `scss`.
10. Los features deberán consumir los valores globales del tema.
11. Los componentes deberán utilizar tokens semánticos en lugar de valores visuales fijos.
12. Los cambios globales de identidad visual no deberán requerir modificaciones individuales en cada feature.

---

## 8. Gestión de estado — Redux

El MFE utilizará **Redux Toolkit** como gestor de estado.

La organización del estado deberá respetar la separación por features.

### 8.1 Organización

Cada feature podrá contener sus propios stores dentro de Application.

Ejemplo:

```text
features/patients/application/store/
├── patient-list/
├── create-patient/
├── edit-patient/
└── patient-detail/
```

El store global será responsable de integrar los reducers necesarios.

```text
src/store/
├── store.ts
└── hooks.ts
```

### 8.2 Reglas

- Redux será el mecanismo principal para gestionar el estado compartido.
- Los estados deberán separarse por flujo cuando tengan responsabilidades independientes.
- Los componentes UI consumirán el estado mediante hooks y selectores.
- Las operaciones asíncronas deberán coordinarse desde Application.
- La comunicación HTTP deberá delegarse a Infrastructure.
- La lógica de dominio deberá permanecer independiente de Redux.
- No deberá concentrarse todo el estado de la aplicación en un único slice.

---

## 9. Persistencia — DynamoDB

El BAAS utilizará **Amazon DynamoDB mediante Single Table Design**.

Todas las entidades del sistema compartirán una única tabla física.

```text
Amazon DynamoDB
└── VeraBalanceTable
    ├── USER
    ├── CLINIC
    ├── THERAPY_TYPE
    ├── PATIENT
    ├── THERAPEUTIC_PROCESS
    ├── PATIENT_THERAPEUTIC_PROCESS
    ├── RECORD
    └── HOME_WORK
```

### 9.1 Principios

- Utilizar claves `pk` y `sk` según el diseño de persistencia.
- Utilizar índices secundarios de acuerdo con los patrones de acceso.
- Priorizar `GetItem`, `Query` y `BatchGetItem`.
- No utilizar operaciones `Scan`.
- Mantener la lógica de DynamoDB dentro de Infrastructure.
- Evitar dependencias directas del SDK de AWS dentro de Domain y Application.
- Mantener separados los modelos de persistencia y los contratos HTTP.

Cada módulo será responsable de implementar sus propios repositorios y adaptadores.

---

## 10. Comunicación entre MFE y BAAS

La comunicación se realizará exclusivamente mediante **API REST sobre HTTPS**.

El contrato HTTP estará definido mediante OpenAPI 3.1.

```text
MFE
│
├── UI
│    │
│    ▼
├── Application
│    │
│    ▼
├── Infrastructure
│    │
│    ▼
│   REST API / HTTPS
│    │
│    ▼
BAAS
│
├── Presentation
│    │
│    ▼
├── Application
│    │
│    ▼
├── Domain
│    ▲
│    │
├── Infrastructure
│    │
│    ▼
└── DynamoDB
```

### 10.1 Reglas

- El MFE no podrá acceder directamente a DynamoDB.
- Las solicitudes HTTP deberán implementarse en Infrastructure.
- Los endpoints deberán respetar el contrato OpenAPI.
- Los DTOs HTTP no deberán exponer directamente las estructuras internas de DynamoDB.
- Los errores HTTP deberán seguir el formato `application/problem+json`.
- El BAAS será responsable de validar las solicitudes y aplicar las reglas de negocio.

---

## 11. Seguridad y autenticación

La autenticación del BAAS utilizará **JSON Web Tokens (JWT)**.

Se establecen las siguientes dependencias para el proyecto:

- `@nestjs/authentication`: paquete solicitado para implementar las capacidades de autenticación, sujeto a verificación de disponibilidad y compatibilidad.
- `@nestjs/jwt`: paquete oficial de NestJS para la generación y verificación de JWT.

El BAAS será responsable de validar credenciales, gestionar la autenticación, generar y verificar tokens y aplicar los permisos correspondientes.

### 11.1 Flujo de autenticación

```text
MFE
 │
 ├── Envía credenciales
 │
 ▼
BAAS / Auth
 │
 ├── Valida credenciales
 ├── Verifica contraseña
 ├── Genera JWT
 │
 ▼
MFE
 │
 ├── Envía JWT en solicitudes protegidas
 │
 ▼
BAAS
 │
 ├── Valida firma y expiración
 ├── Identifica usuario
 ├── Verifica permisos
 │
 ▼
Caso de uso autorizado
```

### 11.2 Reglas de seguridad

- Utilizar JWT firmados y con tiempo de expiración.
- Utilizar `@nestjs/jwt` para generar y verificar JWT.
- Utilizar `@nestjs/authentication` para las capacidades de autenticación que proporcione, una vez verificada su disponibilidad.
- Transmitir credenciales y tokens únicamente mediante HTTPS.
- Validar firma, expiración y claims requeridos.
- Implementar autenticación mediante Guards de NestJS.
- Implementar autorización en el backend.
- Almacenar contraseñas utilizando hashes seguros.
- No exponer contraseñas ni hashes en respuestas.
- No incluir secretos dentro del código fuente.
- Gestionar secretos mediante variables de entorno o servicios especializados.
- Mantener desacoplada la implementación concreta de autenticación y JWT mediante interfaces.

### 11.3 Autorización

El sistema contempla tres roles:

- `admin`
- `clinic`
- `therapist`

Los permisos deberán validarse en el BAAS según el rol, la clínica y los recursos relacionados con el usuario.

El MFE podrá adaptar su interfaz según los permisos, pero nunca sustituirá la autorización del backend.

### 11.4 Dependencias de autenticación

El BAAS deberá integrar `@nestjs/authentication` y `@nestjs/jwt` respetando las siguientes reglas:

1. Verificar la disponibilidad, compatibilidad y API de `@nestjs/authentication` antes de su instalación.
2. Utilizar `@nestjs/jwt` para la generación, firma y verificación de tokens JWT.
3. Implementar los mecanismos de autenticación mediante las capacidades disponibles de NestJS y sus dependencias establecidas.
4. Utilizar un algoritmo de hashing seguro para el almacenamiento de contraseñas. La generación de JWT no sustituye el hashing de contraseñas.
5. Implementar la protección de endpoints mediante Guards de NestJS.
6. Mantener la lógica de autenticación dentro del módulo `auth`.
7. Mantener las implementaciones concretas dentro de Infrastructure y los mecanismos de entrada HTTP dentro de Presentation.
8. Evitar que Domain y Application dependan directamente de las librerías de NestJS.
9. No implementar mecanismos propios cuando las dependencias establecidas proporcionen capacidades equivalentes.
10. No incorporar dependencias adicionales sin una necesidad técnica justificada.

Si `@nestjs/authentication` no está disponible o no es compatible, deberá resolverse esa decisión técnica antes de implementarlo, sin sustituir silenciosamente el paquete.

---

## 12. Docker y Docker Compose

Todo el proyecto deberá estar preparado para ejecutarse mediante **Docker y Docker Compose**.

El objetivo es facilitar la instalación, configuración y despliegue de Vera Balance en diferentes equipos y entornos.

### 12.1 Contenedores

El proyecto contará con contenedores independientes para sus aplicaciones.

```text
Docker Compose
│
├── mfe
│   └── React
│
├── baas
│   └── NestJS
│
└── dynamodb-local
    └── DynamoDB para desarrollo
```

En producción, el BAAS podrá conectarse a Amazon DynamoDB como servicio administrado, sin requerir un contenedor de base de datos.

### 12.2 Estructura general

```text
vera-balance/
├── baas/
│   ├── Dockerfile
│   └── ...
│
├── mfe/
│   ├── Dockerfile
│   └── ...
│
├── docker-compose.yml
├── .env.example
└── README.md
```

### 12.3 Reglas

- Cada aplicación deberá contar con su propio Dockerfile.
- Docker Compose coordinará los servicios necesarios.
- La configuración deberá gestionarse mediante variables de entorno.
- No deberán incluirse credenciales reales en imágenes Docker.
- Se utilizarán volúmenes cuando sea necesario conservar datos locales.
- Los servicios deberán comunicarse mediante redes Docker.
- La instalación deberá poder realizarse sin configurar manualmente cada dependencia en el sistema anfitrión.
- Los ambientes de desarrollo y producción podrán utilizar configuraciones Compose específicas.
- Las imágenes deberán construirse de forma reproducible.

### 12.4 Ejecución

La ejecución local deberá poder iniciarse mediante:

```bash
docker compose up -d --build
```

La documentación de instalación deberá especificar únicamente los requisitos mínimos necesarios para ejecutar Docker y Docker Compose.

---

## 13. Configuración y ambientes

Las aplicaciones deberán mantener configuraciones independientes por ambiente.

Se contemplan inicialmente:

- Desarrollo local.
- Producción.

El BAAS utilizará variables de entorno para configurar conexiones, credenciales, JWT y servicios externos.

El MFE utilizará configuración específica para identificar la URL pública del BAAS y otras opciones no sensibles.

No deberán incluirse secretos del backend en el bundle del frontend.

Docker Compose deberá facilitar la configuración de los servicios para cada ambiente.

---

## 14. Principios arquitectónicos obligatorios

1. BAAS y MFE implementarán Clean Architecture.
2. El BAAS utilizará separación por **modules**.
3. El MFE utilizará separación por **features**.
4. El BAAS utilizará `presentation` como capa de entrada HTTP.
5. El MFE utilizará `ui` como capa visual.
6. Cada feature del MFE tendrá su propia carpeta `scss`.
7. El MFE utilizará Redux Toolkit como gestor de estado.
8. El MFE contará con una librería propia de componentes y estilos basada en Material UI.
9. El tema global del MFE se definirá exclusivamente en SCSS.
10. Material UI deberá consumir los tokens definidos en el tema global.
11. Los cambios globales de identidad visual deberán realizarse desde un único lugar.
12. DynamoDB utilizará Single Table Design.
13. No se permitirán operaciones `Scan`.
14. El MFE se comunicará con el BAAS exclusivamente mediante API REST.
15. OpenAPI definirá el contrato HTTP.
16. JWT será el mecanismo de autenticación.
17. El BAAS será responsable de aplicar los permisos.
18. Los componentes React no accederán directamente a la base de datos.
19. Los casos de uso no dependerán directamente de NestJS, React, Redux o DynamoDB.
20. Las dependencias externas deberán implementarse mediante adaptadores.
21. La infraestructura compartida no deberá concentrar lógica funcional de todos los módulos.
22. Todo el proyecto deberá ejecutarse mediante Docker y Docker Compose.
23. La configuración deberá permitir una instalación reproducible en diferentes entornos.
24. El BAAS deberá integrar `@nestjs/authentication`, previa verificación de disponibilidad y compatibilidad.
25. El BAAS utilizará `@nestjs/jwt` para la generación y verificación de JWT.
26. Las contraseñas deberán almacenarse mediante hashes seguros y nunca exponerse en las respuestas de la API.