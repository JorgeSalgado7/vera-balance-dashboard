# Lineamientos de Arquitectura

## 1. Objetivo

Todos los proyectos deben seguir principios de **Clean Architecture**, manteniendo una separación clara entre responsabilidades, dependencias y capas.

La arquitectura debe favorecer:

- Separación de responsabilidades.
- Bajo acoplamiento.
- Alta cohesión.
- Código fácilmente testeable.
- Independencia entre dominio, infraestructura y frameworks.
- Escalabilidad por módulos o features.
- Organización consistente entre backend y frontend.

Estos lineamientos son generales y no deben contener decisiones de dominio específicas de un proyecto.

---

# 2. Backend

## 2.1 Regla general

En backend, cada contexto funcional deberá representarse mediante un módulo independiente.

```text
src/modules/[nombre-del-modulo]
```

Ejemplo:

```text
src/modules/clients
```

Cada módulo debe encapsular la lógica correspondiente a su contexto funcional y seguir Clean Architecture.

---

## 2.2 Estructura base de un módulo interno

```text
src/
└── modules/
    └── clients/
        ├── application/
        │   ├── dtos/
        │   ├── ports/
        │   ├── services/
        │   └── use-cases/
        ├── domain/
        │   ├── entities/
        │   ├── errors/
        │   ├── repositories/
        │   ├── services/
        │   ├── value-objects/
        │   └── interfaces/
        ├── infrastructure/
        │   ├── mappers/
        │   ├── persistence/
        │   │   ├── adapters/
        │   │   ├── models/
        │   │   └── schemas/
        │   └── providers/
        ├── presentation/
        │   ├── controllers/
        │   ├── decorators/
        │   ├── errors/
        │   ├── guards/
        │   └── interceptors/
        └── clients.module.ts
```

No todas las carpetas tienen que existir desde el inicio. Deben crearse únicamente cuando el módulo las necesite.

---

## 2.3 `application`

Contiene los casos de uso y la orquestación de la lógica de aplicación.

Responsabilidades:

- Ejecutar casos de uso.
- Coordinar dominio y dependencias externas mediante abstracciones.
- Definir DTOs de entrada y salida.
- Definir puertos necesarios por la aplicación.
- No contener detalles concretos de persistencia o transporte HTTP.

Ejemplo:

```text
application/use-cases/create-client.use-case.ts
application/dtos/create-client.dto.ts
application/dtos/create-client-response.dto.ts
```

---

## 2.4 `domain`

Contiene las reglas centrales del negocio.

Responsabilidades:

- Entidades de dominio.
- Reglas e invariantes.
- Errores propios del dominio.
- Interfaces de repositorios.
- Interfaces de providers cuando representan una necesidad del dominio.
- Servicios de dominio.
- Value Objects cuando sean necesarios.

El dominio no debe depender de frameworks ni detalles de infraestructura.

---

## 2.5 `infrastructure`

Contiene implementaciones concretas para interactuar con bases de datos, APIs, SDKs y otros servicios externos.

Responsabilidades:

- Implementar repositorios.
- Implementar providers.
- Acceso a bases de datos.
- Consumo de APIs externas.
- Transformación entre modelos de persistencia y entidades.
- Uso de SDKs y librerías concretas.

---

## 2.6 `presentation`

Es la capa de entrada del módulo.

Responsabilidades:

- Recibir requests HTTP.
- Ejecutar casos de uso.
- Definir documentación Swagger cuando corresponda.
- Traducir errores de dominio/aplicación a errores HTTP.
- Aplicar validaciones propias del transporte.
- Aplicar autenticación y autorización cuando corresponda.
- No implementar lógica de negocio.

Los controllers deben mantenerse delgados.

---

## 2.7 Módulos internos e integradores

### Módulo interno

Representa una entidad, agregado o contexto funcional propio del sistema.

```text
src/modules/clients/
├── application/
├── domain/
├── infrastructure/
├── presentation/
└── clients.module.ts
```

### Módulo integrador

Representa la integración con otro sistema, servicio o API.

Ejemplos:

```text
oauth
payments
notifications
storage
```

Puede utilizar una estructura como:

```text
src/modules/inboxes/
├── application/
├── domain/
│   └── providers/
├── infrastructure/
│   └── providers/
├── presentation/
└── inboxes.module.ts
```

Los casos de uso deben depender de abstracciones y no directamente de Axios, Fetch, SDKs o clientes concretos.

---

## 2.8 Dependencias entre módulos

Los módulos pueden colaborar entre sí, pero las dependencias deben ser explícitas.

Un módulo deberá importar otro únicamente cuando realmente necesite una capacidad expuesta por él.

Los módulos deberán exportar sólo los providers, casos de uso, servicios o abstracciones que necesiten ser consumidos externamente.

Un módulo no deberá consumir directamente adapters, repositories concretos, schemas o modelos de infraestructura pertenecientes a otro módulo.

---

## 2.9 Manejo de errores HTTP

Los errores de dominio no deben conocer códigos HTTP.

```ts
export class ClientNotFoundError extends Error {
  constructor() {
    super('Client not found.');
  }
}
```

La traducción hacia HTTP pertenece a `presentation`.

```text
presentation/errors/client-error.translator.ts
```

Puede existir una implementación compartida para normalizar la estructura común de errores HTTP, manteniendo los traductores específicos dentro de cada módulo.

---

## 2.10 Código compartido

El código verdaderamente transversal del backend deberá quedar en:

```text
src/shared
```

Ejemplos:

```text
src/shared/http-problem
src/shared/logger
src/shared/config
src/shared/utils
```

`shared` no debe convertirse en un lugar para colocar lógica que pertenece a un módulo.

---

## 2.11 Persistencia y Clean Architecture

La tecnología o estrategia de persistencia no modifica los límites de los módulos.

Aunque diferentes módulos compartan una misma base de datos, tabla, conexión o cliente técnico, cada módulo deberá conservar la responsabilidad sobre:

- Sus queries.
- Sus comandos de persistencia.
- Sus mappers.
- Sus modelos.
- Sus reglas de persistencia.

La configuración técnica común de la base de datos puede ubicarse en `shared`, siempre que no contenga lógica funcional de los módulos.

---

## 2.12 Separación de modelos

Deben mantenerse separados conceptualmente:

```text
Persistence Model
       ↓
     Mapper
       ↓
Domain Entity
       ↓
Application DTO
       ↓
HTTP Response
```

Un modelo de persistencia no deberá utilizarse automáticamente como entidad de dominio o DTO HTTP.

Las transformaciones entre representaciones deberán ser explícitas.

---

## 2.13 Autorización

Los permisos reales deberán aplicarse siempre en backend.

El frontend puede ocultar o deshabilitar acciones para mejorar la experiencia de usuario, pero esas restricciones visuales no sustituyen la autorización del backend.

No se deberá confiar en filtros o valores enviados por el frontend para determinar el alcance de acceso de un usuario.

---

## 2.14 Eliminaciones y relaciones

La existencia de un endpoint `DELETE` no implica que el controller sea responsable de manejar relaciones o eliminaciones en cascada.

Si una eliminación requiere modificar relaciones o entidades dependientes, dicha operación deberá coordinarse mediante un caso de uso.

El controller únicamente deberá recibir la petición y ejecutar el caso de uso correspondiente.

---

# 3. Frontend

## 3.1 Regla general

Cada contexto funcional del backend deberá representarse en frontend como un **feature** cuando exista funcionalidad frontend asociada.

```text
src/features/[nombre-del-feature]
```

El frontend tendrá además elementos globales:

```text
src/
├── common/
├── features/
├── routes/
├── store/
├── ui/
└── main.tsx
```

No existe una carpeta global `shared` en frontend.

---

## 3.2 Estructura global

```text
src/
├── common/
│   ├── constants/
│   ├── interfaces/
│   ├── types/
│   └── utils/
├── features/
├── routes/
│   └── PageRouter.tsx
├── store/
│   ├── hooks.ts
│   └── store.ts
├── ui/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── scss/
└── main.tsx
```

Las carpetas globales únicamente contendrán elementos realmente transversales.

---

## 3.3 Estructura de un feature

```text
src/features/clients/
├── application/
│   ├── dto/
│   ├── use-cases/
│   └── store/
│       └── [caso-de-store]/
│           ├── interface/
│           ├── initial-state/
│           ├── slice/
│           └── selector/
├── domain/
│   ├── constants/
│   ├── interfaces/
│   ├── services/
│   └── errors/
├── hooks/
├── infrastructure/
│   ├── errors/
│   └── http/
└── ui/
    ├── components/
    ├── pages/
    └── scss/
        ├── pages/
        ├── components/
        └── _main-clients.scss
```

---

## 3.4 Estado Redux

El estado Redux funcional vive dentro de su feature.

Cuando existan contextos independientes deberán separarse por flujo o caso de uso.

```text
application/store/
├── client-list/
├── create-client/
├── edit-client/
└── client-detail/
```

Cada store puede contener:

```text
interface/
initial-state/
slice/
selector/
```

Crear y editar deberán considerarse casos de uso independientes cuando representen flujos diferentes.

El store global no contiene lógica funcional.

---

## 3.5 Hooks

Los hooks de un feature sirven como capa de composición entre React y la aplicación.

Pueden:

- Leer selectors.
- Ejecutar dispatch.
- Invocar casos de uso.
- Preparar información para componentes.

No deberán concentrar toda la lógica del feature.

Los hooks tipados globales de Redux pertenecen a:

```text
src/store/hooks.ts
```

---

## 3.6 Infrastructure frontend

Los detalles de comunicación HTTP pertenecen a:

```text
features/[feature]/infrastructure/http
```

Aquí deberán permanecer detalles como:

- Axios o Fetch.
- Headers.
- Tokens.
- Serialización.
- Interpretación técnica de respuestas.

---

## 3.7 UI específica y UI global

La UI específica pertenece a:

```text
features/[feature]/ui
```

La UI transversal pertenece a:

```text
src/ui
```

Un componente global no deberá depender de un feature concreto.

Ejemplos globales:

```text
VBCard
VBLoadingModal
VBButton
ConfirmationModal
EmptyState
```

Ejemplo específico:

```text
features/patients/ui/components/PatientForm.tsx
```

---

## 3.8 `common`

`src/common` contiene elementos técnicos o declarativos realmente reutilizables:

- Constantes globales.
- Tipos globales.
- Interfaces compartidas.
- Helpers puros.
- Utilidades sin estado.

No deberá contener lógica funcional de un feature.

---

## 3.9 `routes`

`src/routes` es responsable exclusivamente de la composición del enrutamiento.

```text
src/routes/PageRouter.tsx
```

Las rutas podrán apoyarse en constantes globales:

```text
src/common/constants/routes.constant.ts
```

No deberá contener lógica funcional.

---

## 3.10 Layouts

Los layouts compartidos pertenecen a:

```text
src/ui/layouts
```

Una página deberá consumir la estructura compartida mediante un layout y `children`, en lugar de reconstruir manualmente elementos como Header, Sidebar y Main.

No deberá crearse un layout nuevo para una única pantalla si no existe una estructura realmente compartida.

---

## 3.11 Store global

```text
src/store/
├── hooks.ts
└── store.ts
```

Su responsabilidad es:

- Configurar Redux.
- Registrar reducers.
- Exponer `RootState`.
- Exponer `AppDispatch`.
- Exponer hooks Redux tipados.

Los reducers siguen perteneciendo a sus features.

Ejemplo:

```ts
import { configureStore } from '@reduxjs/toolkit';

import { clientsReducer } from '../features/clients/application/store/client-list/slice/client-list.slice';
import { createClientReducer } from '../features/clients/application/store/create-client/slice/create-client.slice';

export const store = configureStore({
    reducer: {
        clients: clientsReducer,
        createClient: createClientReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 3.12 `main.tsx`

`main.tsx` es el composition root del frontend.

Puede:

- Crear el root de React.
- Registrar providers globales.
- Registrar Redux.
- Inicializar el router.
- Importar estilos globales.

No deberá contener lógica funcional de features.

---

# 4. Correspondencia Backend / Frontend

La correspondencia entre módulos y features es conceptual y organizacional.

```text
BACKEND                    FRONTEND

src/modules/clients   ->   src/features/clients
src/modules/users     ->   src/features/users
src/modules/patients  ->   src/features/patients
```

Sólo deberá existir un feature cuando exista funcionalidad frontend asociada.

---

# 5. Reglas de dependencia

Conceptualmente:

```text
UI / Presentation
       ↓
Application
       ↓
Domain
       ↑
Infrastructure
```

Reglas:

- `domain` no depende de infraestructura.
- `domain` no depende de UI/presentation.
- `application` puede depender de `domain`.
- `infrastructure` implementa contratos definidos por capas internas.
- `presentation` o `ui` consume la aplicación.
- Los modelos de persistencia no deberán filtrarse hacia dominio o presentación.
- Los DTOs HTTP no deberán utilizarse como modelos de persistencia.
- Un módulo backend no deberá acceder directamente a la infraestructura interna de otro módulo.
- `src/store` puede importar reducers desde features.
- `routes` puede importar páginas de features.
- `common` no depende de features.
- `src/ui` global no depende de features concretos.

---

# 6. Reglas generales de implementación

1. Cada endpoint debe pertenecer a un módulo backend claramente definido.
2. Cada contexto funcional del backend debe tener un feature correspondiente cuando exista funcionalidad frontend asociada.
3. No crear carpetas globales para lógica que pertenece a un módulo o feature.
4. Los controllers backend no contienen lógica de negocio.
5. Los componentes React no contienen lógica de negocio compleja.
6. Los casos de uso coordinan la lógica de aplicación.
7. Las entidades y reglas del dominio no conocen detalles HTTP ni persistencia.
8. Las llamadas HTTP externas pertenecen a infraestructura.
9. La persistencia pertenece a infraestructura.
10. Los errores del dominio se traducen en las capas externas.
11. Redux deberá dividirse cuando existan flujos o contextos de estado independientes.
12. No existe una carpeta global `shared` en frontend.
13. `src/common` contiene elementos técnicos y declarativos transversales.
14. `src/ui` contiene UI realmente global.
15. `features/[feature]/ui` contiene UI específica.
16. Los layouts compartidos pertenecen a `src/ui/layouts`.
17. `src/routes` es responsable exclusivamente del enrutamiento.
18. `src/store` configura Redux y registra reducers.
19. Los reducers funcionales pertenecen a sus features.
20. `main.tsx` es el composition root.
21. Los nombres de módulos y features representan conceptos funcionales.
22. Deben evitarse dependencias circulares.
23. Las dependencias externas deberán consumirse detrás de abstracciones cuando sea razonable.
24. No mover código a una carpeta global sólo porque se utiliza más de una vez.
25. Los permisos reales siempre se aplican en backend.
26. La estrategia de persistencia no rompe los límites de los módulos.
27. Los modelos de persistencia, dominio y transporte deberán mantenerse separados.
28. Las transformaciones entre modelos deberán ser explícitas.
29. Las eliminaciones complejas deberán coordinarse mediante casos de uso.
30. Los módulos sólo exportarán capacidades explícitamente necesarias.
31. Un módulo no importará infraestructura concreta de otro módulo.
32. Crear y editar deberán separarse cuando representen flujos independientes.
33. Antes de crear una abstracción, carpeta, módulo, provider o servicio deberá existir una necesidad real.

---

# 7. Criterio principal

La arquitectura no debe utilizarse únicamente como una estructura de carpetas.

Cada capa debe tener una responsabilidad real y sus dependencias deben respetar los principios de Clean Architecture.

La estructura deberá permitir que un módulo o feature pueda entenderse, modificarse y evolucionar con el menor conocimiento posible del resto del proyecto.

En frontend:

```text
features   -> funcionalidad de negocio
common     -> elementos técnicos/declarativos transversales
ui         -> componentes y estructuras visuales globales
routes     -> composición de navegación
store      -> configuración global de Redux
main.tsx   -> composición e inicialización
```

En backend:

```text
modules        -> contextos funcionales
application    -> casos de uso y orquestación
domain         -> reglas y modelos centrales
infrastructure -> persistencia e integraciones
presentation   -> entrada HTTP
shared         -> infraestructura verdaderamente transversal
```
