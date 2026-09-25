# Lineamientos de Arquitectura

## 1. Objetivo

Todos los proyectos deben seguir principios de **Clean Architecture**, manteniendo una separación clara entre responsabilidades, dependencias y capas.

La arquitectura debe favorecer:

* Separación de responsabilidades.
* Bajo acoplamiento.
* Alta cohesión.
* Código fácilmente testeable.
* Independencia entre dominio, infraestructura y frameworks.
* Escalabilidad por módulos o features.
* Organización consistente entre backend y frontend.

Estos lineamientos son generales y no deben contener decisiones de dominio específicas de un proyecto.

---

# 2. Backend

## 2.1 Regla general

En backend, cada contexto funcional deberá representarse mediante un módulo independiente.

```text id="x7kvfw"
src/modules/[nombre-del-modulo]
```

Ejemplo:

```text id="iw6fkd"
src/modules/clients
```

Cada módulo debe encapsular la lógica correspondiente a su contexto funcional y seguir Clean Architecture.

---

## 2.2 Estructura base de un módulo interno

```text id="eah0hr"
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

* Ejecutar casos de uso.
* Coordinar dominio y dependencias externas mediante abstracciones.
* Definir DTOs de entrada y salida.
* Definir puertos necesarios por la aplicación.
* No contener detalles concretos de persistencia o transporte HTTP.

Ejemplo:

```text id="ob7p31"
application/use-cases/create-client.use-case.ts
application/dtos/create-client.dto.ts
application/dtos/create-client-response.dto.ts
```

---

## 2.4 `domain`

Contiene las reglas centrales del negocio.

Responsabilidades:

* Entidades de dominio.
* Reglas e invariantes.
* Errores propios del dominio.
* Interfaces de repositorios.
* Interfaces de providers cuando representan una necesidad del dominio.
* Servicios de dominio.
* Value Objects cuando sean necesarios.

El dominio no debe depender de frameworks ni detalles de infraestructura.

---

## 2.5 `infrastructure`

Contiene implementaciones concretas para interactuar con bases de datos, APIs, SDKs y otros servicios externos.

Responsabilidades:

* Implementar repositorios.
* Implementar providers.
* Acceso a bases de datos.
* Consumo de APIs externas.
* Transformación entre modelos de persistencia y entidades.
* Uso de SDKs y librerías concretas.
* Implementación concreta de mecanismos de autenticación, hashing, tokens y sesiones cuando corresponda.

Los casos de uso y el dominio no deberán depender directamente de estas implementaciones concretas.

---

## 2.6 `presentation`

Es la capa de entrada del módulo.

Responsabilidades:

* Recibir requests HTTP.
* Ejecutar casos de uso.
* Definir documentación Swagger cuando corresponda.
* Traducir errores de dominio/aplicación a errores HTTP.
* Aplicar validaciones propias del transporte.
* Aplicar autenticación y autorización cuando corresponda.
* Extraer credenciales, cookies, headers u otra información propia del transporte.
* No implementar lógica de negocio.

Los controllers deben mantenerse delgados.

La validación técnica de una credencial puede ejecutarse mediante guards, decorators, interceptors u otros mecanismos de `presentation`, pero las reglas funcionales asociadas a una operación deberán permanecer en las capas correspondientes.

---

## 2.7 Módulos internos e integradores

### Módulo interno

Representa una entidad, agregado o contexto funcional propio del sistema.

```text id="e4yz9s"
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

```text id="eou7mq"
oauth
payments
notifications
storage
```

Puede utilizar una estructura como:

```text id="bzf42e"
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

Cuando un módulo necesite información o comportamiento perteneciente a otro contexto, deberá consumir una capacidad explícitamente expuesta por el módulo propietario.

---

## 2.9 Manejo de errores HTTP

Los errores de dominio no deben conocer códigos HTTP.

```ts id="o0qrjz"
export class ClientNotFoundError extends Error {
  constructor() {
    super('Client not found.');
  }
}
```

La traducción hacia HTTP pertenece a `presentation`.

```text id="8g8e8n"
presentation/errors/client-error.translator.ts
```

Puede existir una implementación compartida para normalizar la estructura común de errores HTTP, manteniendo los traductores específicos dentro de cada módulo.

Los errores relacionados con autenticación o autorización deberán seguir la misma separación: las capas internas expresan errores funcionales o técnicos propios de su responsabilidad y la capa externa determina su representación HTTP.

---

## 2.10 Código compartido

El código verdaderamente transversal del backend deberá quedar en:

```text id="hnogpd"
src/shared
```

Ejemplos:

```text id="g8zjck"
src/shared/http-problem
src/shared/logger
src/shared/config
src/shared/utils
```

`shared` no debe convertirse en un lugar para colocar lógica que pertenece a un módulo.

Una utilidad de seguridad no deberá moverse automáticamente a `shared` sólo porque pueda reutilizarse. Si pertenece conceptualmente a un contexto funcional, deberá permanecer dentro de su módulo.

---

## 2.11 Persistencia y Clean Architecture

La tecnología o estrategia de persistencia no modifica los límites de los módulos.

Aunque diferentes módulos compartan una misma base de datos, tabla, conexión o cliente técnico, cada módulo deberá conservar la responsabilidad sobre:

* Sus queries.
* Sus comandos de persistencia.
* Sus mappers.
* Sus modelos.
* Sus reglas de persistencia.

La configuración técnica común de la base de datos puede ubicarse en `shared`, siempre que no contenga lógica funcional de los módulos.

Las necesidades de persistencia relacionadas con sesiones, credenciales temporales, tokens u otros mecanismos de seguridad deberán seguir las mismas reglas.

No deberán introducirse tablas, índices, modelos o estructuras de persistencia no definidos por las fuentes de verdad del proyecto únicamente para resolver una necesidad de implementación.

---

## 2.12 Separación de modelos

Deben mantenerse separados conceptualmente:

```text id="bpyq8o"
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

Esta separación también aplica a información de autenticación y seguridad.

Una representación persistida de una sesión, token o credencial no deberá utilizarse automáticamente como contrato HTTP ni filtrarse hacia otras capas.

---

## 2.13 Autenticación

La autenticación deberá mantenerse separada de la lógica funcional de los módulos.

Las capas internas deberán depender de capacidades o abstracciones cuando necesiten:

* Validar credenciales.
* Verificar hashes.
* Generar o validar sesiones.
* Generar, validar o consumir credenciales temporales.
* Interactuar con proveedores externos de identidad.

No deberán depender directamente de:

* Librerías concretas de JWT.
* Librerías concretas de hashing.
* SDKs de proveedores de identidad.
* Cookies.
* Headers HTTP.
* APIs concretas de frameworks.

Conceptualmente:

```text id="gqg4ft"
Application / Domain
        ↓
Ports / Capabilities
        ↓
Infrastructure
        ↓
JWT / Hashing / Identity Provider / Storage
```

La decisión de utilizar JWT, cookies, tokens opacos u otro mecanismo concreto pertenece a las fuentes de verdad específicas del proyecto.

Los mecanismos de autenticación deberán diseñarse de forma que una implementación concreta pueda sustituirse sin obligar a modificar la lógica central del sistema.

---

## 2.14 Sesiones y credenciales temporales

Una sesión autenticada y una credencial temporal para ejecutar una operación no deberán considerarse equivalentes.

Conceptualmente:

```text id="of5yvk"
Credencial temporal
        ↓
autoriza una operación limitada

Sesión autenticada
        ↓
representa una identidad autenticada durante un periodo
```

Cuando un proyecto utilice credenciales temporales:

* Deberá definirse explícitamente su propósito.
* Deberá definirse su alcance.
* Deberá definirse su expiración.
* Deberá definirse si son reutilizables o de un solo uso.
* No deberán convertirse implícitamente en sesiones.
* No deberán conceder permisos distintos de aquellos para los que fueron creadas.

Cuando una credencial sea de un solo uso, su consumo deberá poder determinarse de manera confiable.

La persistencia o estrategia necesaria para garantizar dicha propiedad deberá estar definida en las fuentes de verdad del proyecto antes de implementarse.

No deberá asumirse que un token firmado y autocontenido garantiza por sí mismo que una credencial de un solo uso no pueda reutilizarse.

---

## 2.15 Manejo seguro de credenciales

Las credenciales deberán tratarse como información sensible.

Como regla general:

* Las contraseñas no deberán almacenarse en texto plano.
* Los hashes de contraseña no deberán exponerse mediante contratos HTTP.
* Las confirmaciones de contraseña son datos transitorios y no deberán persistirse.
* Los tokens de sesión no deberán exponerse innecesariamente.
* Las credenciales temporales deberán limitarse al propósito para el cual fueron creadas.
* Las credenciales no deberán registrarse en logs.
* Los datos sensibles no deberán formar parte de mensajes de error innecesariamente.

Cuando una sesión utilice una cookie `HttpOnly`, el frontend no deberá depender de leer directamente su contenido.

Cuando el contrato utilice cookies para autenticación, el cliente HTTP deberá configurarse para enviarlas según las reglas del proyecto.

Los detalles concretos de seguridad, expiración, cookies, scopes y mecanismos de transporte deberán definirse en la documentación específica de cada proyecto.

---

## 2.16 Autorización

Los permisos reales deberán aplicarse siempre en backend.

El frontend puede ocultar o deshabilitar acciones para mejorar la experiencia de usuario, pero esas restricciones visuales no sustituyen la autorización del backend.

No se deberá confiar en filtros o valores enviados por el frontend para determinar el alcance de acceso de un usuario.

Autenticación y autorización son responsabilidades distintas.

Conceptualmente:

```text id="wxn2tt"
Request
↓
Autenticación
↓
Identidad
↓
Autorización
↓
Caso de uso
```

Una identidad autenticada no implica automáticamente acceso a cualquier recurso.

El backend deberá determinar los permisos utilizando información confiable obtenida de la sesión y de sus propias fuentes de datos.

---

## 2.17 Eliminaciones y relaciones

La existencia de un endpoint `DELETE` no implica que el controller sea responsable de manejar relaciones o eliminaciones en cascada.

Si una eliminación requiere modificar relaciones o entidades dependientes, dicha operación deberá coordinarse mediante un caso de uso.

El controller únicamente deberá recibir la petición y ejecutar el caso de uso correspondiente.

---

# 3. Frontend

## 3.1 Regla general

Cada contexto funcional del backend deberá representarse en frontend como un **feature** cuando exista funcionalidad frontend asociada.

```text id="m2grwk"
src/features/[nombre-del-feature]
```

El frontend tendrá además elementos globales:

```text id="80o1ao"
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

```text id="h9e7h2"
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

```text id="1iz0hh"
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

```text id="8kzud7"
application/store/
├── client-list/
├── create-client/
├── edit-client/
└── client-detail/
```

Cada store puede contener:

```text id="76i8aa"
interface/
initial-state/
slice/
selector/
```

Crear y editar deberán considerarse casos de uso independientes cuando representen flujos diferentes.

El store global no contiene lógica funcional.

Las credenciales sensibles no deberán almacenarse automáticamente en Redux.

Si la sesión utiliza una cookie `HttpOnly`, Redux deberá representar únicamente el estado funcional necesario para la UI y no una copia del token de sesión.

---

## 3.5 Hooks

Los hooks de un feature sirven como capa de composición entre React y la aplicación.

Pueden:

* Leer selectors.
* Ejecutar dispatch.
* Invocar casos de uso.
* Preparar información para componentes.

No deberán concentrar toda la lógica del feature.

Los hooks tipados globales de Redux pertenecen a:

```text id="mnhmtg"
src/store/hooks.ts
```

---

## 3.6 Infrastructure frontend

Los detalles de comunicación HTTP pertenecen a:

```text id="lny90q"
features/[feature]/infrastructure/http
```

Aquí deberán permanecer detalles como:

* Axios o Fetch.
* Headers.
* Cookies y configuración de credenciales HTTP cuando corresponda.
* Credenciales temporales requeridas por una operación.
* Serialización.
* Interpretación técnica de respuestas.

El frontend no deberá asumir que todos los mecanismos de autenticación se administran de la misma manera.

Cuando el backend utilice una cookie `HttpOnly` para representar la sesión, el frontend no deberá intentar leer, almacenar o decodificar directamente el token contenido en ella.

Las credenciales temporales utilizadas para una operación deberán conservarse únicamente durante el tiempo necesario para completar dicha operación y no deberán tratarse como una sesión.

---

## 3.7 UI específica y UI global

La UI específica pertenece a:

```text id="yvhz4w"
features/[feature]/ui
```

La UI transversal pertenece a:

```text id="q6zggb"
src/ui
```

Un componente global no deberá depender de un feature concreto.

Ejemplos globales:

```text id="oqnvcn"
VBCard
VBLoadingModal
VBButton
ConfirmationModal
EmptyState
```

Ejemplo específico:

```text id="pznjtr"
features/patients/ui/components/PatientForm.tsx
```

---

## 3.8 `common`

`src/common` contiene elementos técnicos o declarativos realmente reutilizables:

* Constantes globales.
* Tipos globales.
* Interfaces compartidas.
* Helpers puros.
* Utilidades sin estado.

No deberá contener lógica funcional de un feature.

---

## 3.9 `routes`

`src/routes` es responsable exclusivamente de la composición del enrutamiento.

```text id="qx19ao"
src/routes/PageRouter.tsx
```

Las rutas podrán apoyarse en constantes globales:

```text id="cy8t1i"
src/common/constants/routes.constant.ts
```

No deberá contener lógica funcional.

La protección visual o navegación condicionada por autenticación no sustituye las validaciones de autenticación y autorización realizadas por el backend.

---

## 3.10 Layouts

Los layouts compartidos pertenecen a:

```text id="b36hdx"
src/ui/layouts
```

Una página deberá consumir la estructura compartida mediante un layout y `children`, en lugar de reconstruir manualmente elementos como Header, Sidebar y Main.

No deberá crearse un layout nuevo para una única pantalla si no existe una estructura realmente compartida.

---

## 3.11 Store global

```text id="abkx9p"
src/store/
├── hooks.ts
└── store.ts
```

Su responsabilidad es:

* Configurar Redux.
* Registrar reducers.
* Exponer `RootState`.
* Exponer `AppDispatch`.
* Exponer hooks Redux tipados.

Los reducers siguen perteneciendo a sus features.

Ejemplo:

```ts id="vg0ecq"
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

* Crear el root de React.
* Registrar providers globales.
* Registrar Redux.
* Inicializar el router.
* Importar estilos globales.
* Configurar infraestructura HTTP global cuando corresponda.

No deberá contener lógica funcional de features.

---

# 4. Correspondencia Backend / Frontend

La correspondencia entre módulos y features es conceptual y organizacional.

```text id="rj2i7g"
BACKEND                    FRONTEND

src/modules/clients   ->   src/features/clients
src/modules/users     ->   src/features/users
src/modules/patients  ->   src/features/patients
```

Sólo deberá existir un feature cuando exista funcionalidad frontend asociada.

---

# 5. Reglas de dependencia

Conceptualmente:

```text id="3f5eqy"
UI / Presentation
       ↓
Application
       ↓
Domain
       ↑
Infrastructure
```

Reglas:

* `domain` no depende de infraestructura.
* `domain` no depende de UI/presentation.
* `application` puede depender de `domain`.
* `infrastructure` implementa contratos definidos por capas internas.
* `presentation` o `ui` consume la aplicación.
* Los modelos de persistencia no deberán filtrarse hacia dominio o presentación.
* Los DTOs HTTP no deberán utilizarse como modelos de persistencia.
* Un módulo backend no deberá acceder directamente a la infraestructura interna de otro módulo.
* Los mecanismos concretos de autenticación no deberán filtrarse hacia dominio.
* Las cookies y headers pertenecen al límite HTTP y no al dominio.
* `src/store` puede importar reducers desde features.
* `routes` puede importar páginas de features.
* `common` no depende de features.
* `src/ui` global no depende de features concretos.

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
34. Autenticación y autorización deberán tratarse como responsabilidades diferentes.
35. Las implementaciones concretas de autenticación, hashing y sesiones deberán permanecer detrás de abstracciones cuando sean consumidas por capas internas.
36. Una credencial temporal no deberá tratarse automáticamente como una sesión autenticada.
37. Las credenciales de un solo uso deberán contar con un mecanismo que permita impedir su reutilización.
38. Las credenciales sensibles no deberán almacenarse innecesariamente en estado global del frontend.
39. Una sesión almacenada mediante cookie `HttpOnly` no deberá requerir acceso directo al token desde JavaScript.
40. Los mecanismos de seguridad concretos deberán seguir las fuentes de verdad específicas de cada proyecto y no inventarse durante la implementación.

---

# 7. Criterio principal

La arquitectura no debe utilizarse únicamente como una estructura de carpetas.

Cada capa debe tener una responsabilidad real y sus dependencias deben respetar los principios de Clean Architecture.

La estructura deberá permitir que un módulo o feature pueda entenderse, modificarse y evolucionar con el menor conocimiento posible del resto del proyecto.

La seguridad deberá seguir el mismo principio: las decisiones concretas sobre autenticación, sesiones, credenciales y proveedores externos no deberán acoplar innecesariamente las reglas centrales del sistema a frameworks o implementaciones específicas.

En frontend:

```text id="vtepfj"
features   -> funcionalidad de negocio
common     -> elementos técnicos/declarativos transversales
ui         -> componentes y estructuras visuales globales
routes     -> composición de navegación
store      -> configuración global de Redux
main.tsx   -> composición e inicialización
```

En backend:

```text id="xkk0s6"
modules        -> contextos funcionales
application    -> casos de uso y orquestación
domain         -> reglas y modelos centrales
infrastructure -> persistencia e integraciones
presentation   -> entrada HTTP
shared         -> infraestructura verdaderamente transversal
```
