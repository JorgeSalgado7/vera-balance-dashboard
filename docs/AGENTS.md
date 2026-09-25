# Vera Balance - Instrucciones para Codex

## 1. Propósito

Este repositorio utiliza un flujo de desarrollo basado en especificaciones mediante User Stories (US).

Los requerimientos funcionales se encuentran en:

`docs/user-stories/`

Las reglas técnicas, arquitectónicas, de persistencia y contratos se encuentran en:

`docs/`

Cuando se solicite implementar una User Story, no comiences a modificar código inmediatamente.

Primero debes entender el proyecto, revisar su estructura, leer la documentación relevante, analizar la User Story solicitada, revisar sus dependencias y estudiar la implementación existente.

Una solución técnicamente válida no es suficiente si rompe la consistencia del proyecto.

No es suficiente que funcione o que los tests pasen.

---

## 2. Flujo obligatorio de trabajo

Para cada User Story solicitada debes seguir, en orden, el siguiente proceso:

1. Analizar la estructura del proyecto.
2. Leer la documentación técnica.
3. Localizar y leer completamente la User Story solicitada.
4. Revisar el `Scope` y `Status` de la User Story.
5. Analizar sus dependencias.
6. Revisar la implementación existente relacionada.
7. Identificar los patrones arquitectónicos utilizados por el proyecto.
8. Determinar los cambios necesarios.
9. Implementar todos los criterios de aceptación.
10. Agregar o actualizar las pruebas necesarias.
11. Verificar que la terminal utilice Node.js `24.21.0`.
12. Ejecutar las pruebas mediante `npm run test` únicamente si las dependencias necesarias ya están instaladas.
13. Revisar todos los criterios de aceptación.
14. Revisar las reglas de negocio.
15. Revisar la Definition of Done.
16. Revisar el diff final para detectar cambios no relacionados.
17. Identificar dependencias, instalaciones o comandos manuales que deba ejecutar el responsable del proyecto.
18. Cambiar el `Status` de la User Story a `Under Review` cuando la implementación esté lista para revisión.

No omitas estas etapas.

Codex no debe instalar dependencias, ejecutar builds ni realizar tareas de preparación del entorno que correspondan al responsable del proyecto.

---

## 3. Entender el proyecto antes de implementar

Antes de modificar código, inspecciona el repositorio.

Debes identificar como mínimo:

* estructura general;
* aplicaciones existentes;
* módulos;
* capas;
* código compartido;
* dirección de dependencias;
* convenciones de nombres;
* patrones de implementación existentes;
* organización de pruebas;
* configuración relevante para la tarea.

No deduzcas toda la arquitectura únicamente a partir de la User Story.

La implementación debe integrarse con la arquitectura existente del proyecto.

Antes de crear una nueva abstracción, revisa si el proyecto ya tiene una solución o patrón equivalente.

---

## 4. Documentación obligatoria

Antes de implementar una User Story, revisa la documentación disponible en `docs/`.

Como mínimo debes considerar:

* `docs/database.md`
* `docs/openapi.yaml`
* `docs/definitions.md`
* `docs/vera-balance-architecture.md`
* `docs/architecture-guidelines.md`

Analiza con mayor profundidad los documentos relacionados con la funcionalidad solicitada.

Las referencias indicadas dentro de la propia User Story también deben ser revisadas.

Toda esta documentación es `SOLO LECTURA` durante una implementación normal, salvo autorización explícita del usuario para modificar un documento específico.

---

## 5. Orden de autoridad

Cuando exista un conflicto entre fuentes de información, utiliza el siguiente orden de autoridad:

1. `docs/database.md`
2. `docs/openapi.yaml`
3. `docs/definitions.md`
4. `docs/vera-balance-architecture.md`
5. `docs/architecture-guidelines.md`
6. implementación existente

Una fuente de menor prioridad no debe sobrescribir una fuente de mayor prioridad.

Si la User Story introduce explícitamente un nuevo requerimiento que todavía no aparece en la documentación técnica, puede implementarse siempre que no contradiga una fuente de mayor autoridad.

Si existe una contradicción que no puede resolverse utilizando el repositorio y su documentación, no inventes una solución.

Reporta el conflicto y detén únicamente la parte de la implementación afectada.

---

## 6. User Stories

Las User Stories se encuentran en:

`docs/user-stories/`

La estructura esperada es:

`docs/user-stories/{module}/US-{MODULE}-{NUMBER}-{description}.md`

Por ejemplo:

`docs/user-stories/users/US-USER-001-create-user.md`

Cuando el usuario solicite:

`Implementa US-USER-001`

debes localizar la User Story correspondiente dentro de `docs/user-stories/`.

Lee el archivo completo antes de modificar código.

Una User Story puede contener:

* Historia de usuario
* Scope
* Status
* Descripción
* Criterios de aceptación
* Reglas de negocio
* Dependencias
* Consideraciones técnicas
* Referencias
* Definition of Done

Todos los criterios de aceptación son obligatorios salvo que la propia User Story indique explícitamente lo contrario.

No debes eliminar, debilitar, reinterpretar o modificar criterios de aceptación para adaptarlos a la implementación existente.

---

## 7. Estados de las User Stories

Los únicos estados válidos son:

* `Backlog`
* `Approved`
* `In Progress`
* `Under Review`
* `Done`

### Backlog

La User Story está definida pero todavía no está aprobada para desarrollo.

No debe implementarse salvo que el usuario solicite explícitamente trabajar en ella.

### Approved

La User Story está aprobada y lista para comenzar su implementación.

Al comenzar a trabajar en ella, cambia su estado a:

`In Progress`

### In Progress

La implementación se encuentra en desarrollo.

Si una User Story ya se encuentra en este estado, revisa primero qué partes fueron implementadas antes de continuar.

No vuelvas a implementar desde cero funcionalidad que ya existe correctamente.

### Under Review

La implementación fue terminada por Codex y está pendiente de revisión manual por parte del responsable del proyecto.

Si una User Story ya se encuentra en `Under Review`, no vuelvas a implementarla desde cero.

Si el usuario solicita revisar o corregir la implementación, compara el código existente contra los criterios de aceptación y realiza únicamente los cambios necesarios.

### Done

La User Story fue revisada y aprobada manualmente por el responsable del proyecto.

`Done` es un estado reservado para validación humana.

Codex no debe cambiar automáticamente ninguna User Story a `Done`.

Si una User Story está en `Done`, no debes modificar su implementación salvo que el usuario solicite explícitamente una corrección, modificación o regresión.

---

## 8. Transiciones de estado

Durante una implementación normal, Codex puede realizar únicamente las siguientes transiciones:

`Approved -> In Progress`

`In Progress -> Under Review`

Codex nunca debe realizar automáticamente:

`Under Review -> Done`

La transición a `Done` será realizada manualmente por el responsable del proyecto después de revisar la implementación.

Si una User Story comienza en `Backlog` y el usuario solicita explícitamente implementarla, puede cambiarse a:

`In Progress`

al comenzar el trabajo.

Cuando la implementación y las validaciones permitidas hayan terminado, cambia el estado de la User Story a:

`Under Review`

La imposibilidad de ejecutar una validación debido a dependencias que el responsable debe instalar manualmente no obliga a mantener la User Story en `In Progress`, siempre que la implementación esté terminada y el pendiente se reporte claramente.

Este cambio debe realizarse directamente en el archivo `.md` correspondiente.

Ejemplo:

Antes:

`Status: In Progress`

Después:

`Status: Under Review`

Nunca cambies automáticamente:

`Status: Under Review`

a:

`Status: Done`

---

## 9. Scope

Los únicos scopes válidos son:

* `Backend`
* `Frontend`
* `Fullstack`

### Backend

La User Story requiere implementación backend.

No modifiques frontend salvo que sea estrictamente necesario para preservar un contrato existente o que el usuario lo solicite explícitamente.

### Frontend

La User Story requiere implementación frontend.

No modifiques backend salvo que la User Story lo requiera explícitamente.

### Fullstack

La User Story requiere analizar e implementar los cambios necesarios tanto en backend como en frontend.

Una User Story `Fullstack` no está lista para `Under Review` hasta que todos los criterios correspondientes a ambos scopes estén implementados.

No modifiques scopes no relacionados.

---

## 10. Dependencias

Antes de implementar, revisa la sección `Dependencias` de la User Story.

Para cada dependencia:

1. localiza la User Story o funcionalidad relacionada;
2. revisa su estado;
3. verifica su implementación existente;
4. determina si satisface lo requerido por la nueva User Story.

No asumas que una dependencia está disponible únicamente porque aparece documentada.

Comprueba la implementación real.

No recrees funcionalidad que ya existe correctamente.

Si una dependencia obligatoria no existe y bloquea la implementación correcta, informa el bloqueo en lugar de introducir una solución que viole la arquitectura.

---

## 11. Revisión de implementación existente

Antes de crear archivos nuevos, revisa el módulo relacionado y módulos comparables que ya estén implementados.

Identifica cómo el proyecto implementa actualmente:

* entidades;
* DTOs;
* casos de uso;
* servicios de dominio;
* repositorios;
* ports;
* adapters;
* mappers;
* controllers;
* módulos;
* errores;
* validaciones;
* pruebas.

Las User Stories con `Status: Done` pueden utilizarse como referencia para identificar implementaciones ya validadas.

Reutiliza los patrones existentes siempre que sean compatibles con la documentación del proyecto.

No introduzcas un segundo patrón arquitectónico para resolver una responsabilidad que el proyecto ya resuelve de otra manera.

---

## 12. Clinics como referencia obligatoria y consistencia de código

El módulo `src/modules/clinics/` es la referencia obligatoria de calidad, arquitectura, estructura y organización para los demás módulos backend.

Antes de implementar una responsabilidad equivalente, revisa cómo Clinics resuelve:

* estructura de carpetas;
* ubicación y granularidad de archivos;
* naming de archivos, clases e interfaces;
* entidades y DTOs;
* use cases y domain services;
* repositories, ports y adapters;
* persistence models y mappers;
* controllers y módulos NestJS;
* errores y validaciones;
* dependency injection;
* pruebas y mocks.

Si Clinics ya establece un patrón para una responsabilidad equivalente, **el patrón de Clinics es obligatorio.**

No introduzcas una alternativa porque sea más corta, genérica, abstracta, moderna o de tu preferencia.

No simplifiques, generalices, combines o reorganices responsabilidades que Clinics mantiene separadas.

El código nuevo debe sentirse como una continuación natural del módulo Clinics y mantener como mínimo su mismo nivel de calidad.

Por ejemplo, si Clinics utiliza errores específicos como `MissingClinicNameError` o `InvalidClinicStatusError`, no introduzcas errores genéricos parametrizados como `InvalidUserError(field)` para responsabilidades equivalentes.

Utiliza errores específicos conforme a las reglas reales del nuevo módulo.

Antes de crear cualquier archivo nuevo, localiza su equivalente conceptual en Clinics y respeta su carpeta, naming, granularidad y relación con las demás capas.

---

## 13. Servicios de dominio

Los servicios de dominio deberán mantener responsabilidades pequeñas y explícitas.

Cuando existan reglas diferentes, deberán separarse en servicios diferentes si Clinics utiliza esa granularidad para responsabilidades equivalentes.

No concentres múltiples validaciones o reglas independientes en un servicio genérico únicamente para reducir la cantidad de archivos.

Un servicio deberá representar una responsabilidad de dominio claramente identificable.

No introduzcas servicios genéricos como:

`ValidationService`

si las reglas reales corresponden a responsabilidades de dominio distintas.

Prefiere servicios específicos conforme al patrón existente.

---

## 14. Repositories

Los repositories deberán representar las operaciones requeridas por los casos de uso y mantener responsabilidades específicas.

La dirección esperada es:

`Use Case -> Repository específico -> Adapter específico`

No conviertas los repositories en interfaces genéricas CRUD si el proyecto utiliza interfaces específicas por operación.

No agregues operaciones a un repository únicamente porque pertenecen a la misma entidad.

La agrupación deberá seguir el patrón arquitectónico establecido por Clinics.

---

## 15. Adapters

Los adapters de persistencia deberán mantenerse separados por operación cuando ese sea el patrón utilizado por Clinics.

No combines múltiples operaciones de persistencia no relacionadas en un único adapter únicamente para reducir archivos.

Cada adapter debe implementar el contrato que le corresponde y conservar una responsabilidad clara.

Los detalles de DynamoDB pertenecen exclusivamente a Infrastructure.

---

## 16. Errores específicos

Los errores deberán representar condiciones concretas del dominio o aplicación.

No utilices errores genéricos parametrizados cuando el proyecto ya utiliza errores específicos para responsabilidades equivalentes.

Por ejemplo:

```text
MissingUserNameError
MissingUserEmailError
InvalidUserRoleError
InvalidUserStatusError
```

es preferible a:

```text
InvalidUserError('name')
InvalidUserError('email')
InvalidUserError('role')
```

cuando el patrón existente utiliza errores específicos.

Los errores de dominio no deberán conocer códigos HTTP.

La traducción a HTTP pertenece a Presentation.

---

## 17. Prohibición de modificar documentación

Durante la implementación normal de una User Story, toda la documentación técnica es estrictamente de `SOLO LECTURA`.

Está prohibido modificar, entre otros:

* `docs/database.md`;
* `docs/openapi.yaml`;
* `docs/definitions.md`;
* `docs/vera-balance-architecture.md`;
* `docs/architecture-guidelines.md`;
* README;
* diagramas;
* contratos;
* documentación de módulos;
* otras User Stories.

Dentro de `docs/`, el único archivo que Codex puede modificar durante una implementación normal es la User Story que está ejecutando.

Dentro de esa User Story únicamente puede modificar automáticamente:

* `Status`;
* checks de `Definition of Done`.

No puede modificar Historia de usuario, Scope, Descripción, Criterios de aceptación, Reglas de negocio, Dependencias, Consideraciones técnicas ni Referencias salvo solicitud explícita del usuario.

Si detectas que cualquier otro documento necesita un cambio, no lo realices.

Reporta:

1. el documento;
2. el cambio propuesto;
3. la razón.

Después espera autorización explícita.

La Definition of Done nunca constituye autorización para modificar documentación técnica.

Antes de finalizar, revisa el diff.

Si aparece documentación protegida modificada sin autorización explícita, revierte esos cambios.

---

## 18. Persistencia no documentada

`docs/database.md` es la fuente de verdad del Single Table Design.

Está prohibido inventar estructuras de persistencia no documentadas, incluyendo:

* nuevos tipos de items;
* patrones de `pk`;
* patrones de `sk`;
* persistence models auxiliares;
* índices;
* tablas;
* lookups;
* estructuras de unicidad;
* duplicación de datos;
* desnormalización no documentada.

No crees estructuras como:

```text
UserEmailModel
UserLookupModel
EmailIndexModel
```

o equivalentes si no están definidas en `docs/database.md`.

Esta regla también aplica a mecanismos de autenticación y seguridad.

No inventes estructuras como:

```text
PublicOperationTokenModel
PasswordRecoveryTokenModel
SessionModel
TokenLookupModel
```

ni items, índices o patrones de claves equivalentes si no están definidos previamente en `docs/database.md`.

Si un criterio de aceptación, como la unicidad de email, parece requerir una estructura no documentada:

1. identifica el criterio afectado;
2. explica la limitación del modelo actual;
3. presenta las alternativas técnicas;
4. no selecciones una alternativa por iniciativa propia;
5. no modifiques `docs/database.md`;
6. detén únicamente la parte afectada;
7. solicita una decisión al responsable del proyecto.

La misma regla aplica cuando una funcionalidad requiere persistencia para garantizar propiedades como:

* unicidad;
* single-use;
* anti-replay;
* revocación;
* expiración persistida;
* consumo de tokens;
* recuperación de contraseña.

No resuelvas silenciosamente estas necesidades creando persistencia nueva.

---

## 19. Entorno de ejecución, Node.js, dependencias y comandos permitidos

El proyecto utiliza obligatoriamente Node.js `24.21.0`.

Antes de ejecutar cualquier comando relacionado con Node.js o npm, ejecuta:

`node --version`

La versión debe ser:

`v24.21.0`

El entorno de Codex es Ubuntu.

Si la terminal está utilizando otra versión y NVM está disponible, cambia la versión en esa misma terminal mediante:

`nvm use 24.21.0`

Después vuelve a ejecutar:

`node --version`

y confirma:

`v24.21.0`

No ejecutes los tests con otra versión de Node.js.

No atribuyas errores de Jest, TypeScript, ESM, CommonJS o dependencias al código antes de comprobar la versión de Node.

Si Node.js `24.21.0` no puede activarse:

* no ejecutes las pruebas con otra versión;
* no modifiques Jest;
* no modifiques TypeScript;
* no modifiques dependencias para adaptarlas al entorno;
* no modifiques configuración de módulos;
* no adaptes el proyecto a la versión disponible.

Reporta el bloqueo.

### Instalación de dependencias

Codex no debe instalar dependencias bajo ninguna circunstancia durante una implementación normal.

Está prohibido ejecutar:

```text
npm install
npm i
npm ci
npm install <package>
npm i <package>
npm uninstall
npm update
npx <comando que instale o descargue paquetes>
yarn
yarn install
yarn add
pnpm install
pnpm add
```

Esta lista no es exhaustiva.

La regla general es:

**Codex no instala, actualiza ni elimina dependencias del entorno.**

Si una User Story requiere una dependencia nueva:

1. identifica la dependencia necesaria;
2. determina el paquete y, cuando corresponda, la versión compatible con el proyecto;
3. realiza únicamente los cambios de código y configuración necesarios para utilizarla;
4. actualiza `package.json` únicamente si forma parte del cambio requerido;
5. no ejecutes la instalación;
6. no generes ni actualices `package-lock.json` mediante una instalación;
7. reporta al finalizar la dependencia que debe instalar manualmente el responsable del proyecto;
8. proporciona el comando que el responsable debe ejecutar manualmente.

Si una dependencia necesaria no está instalada y esto impide ejecutar las pruebas, no la instales.

Reporta:

```text
Pruebas: no ejecutadas o bloqueadas por dependencia pendiente de instalación manual.
```

e indica cuál dependencia falta.

No consumas tiempo de ejecución intentando preparar automáticamente el entorno.

### Comandos npm permitidos

El único comando npm de validación que Codex puede ejecutar es:

`npm run test`

Pueden utilizarse argumentos soportados por dicho script cuando sean necesarios para ejecutar una parte específica de las pruebas.

No ejecutes otros scripts npm por iniciativa propia.

Está prohibido ejecutar, entre otros:

```text
npm run build
npm run lint
npm run format
npm run typecheck
npm run compile
npm run generate
npm run migrate
npm run migration
npm run seed
npm run start
npm run dev
```

salvo que una regla futura del proyecto autorice explícitamente alguno de ellos.

### Builds

Está estrictamente prohibido ejecutar cualquier build.

Esto incluye:

```text
npm run build
nest build
tsc
tsc --build
vite build
webpack
next build
```

y cualquier otro comando cuyo propósito sea compilar, empaquetar o generar un build del proyecto.

No ejecutes un comando equivalente utilizando directamente una herramienta para evitar la restricción de `npm run build`.

El build será ejecutado manualmente por el responsable del proyecto cuando corresponda.

El build no es requisito para pasar una User Story a `Under Review`.

Si la Definition of Done contiene:

`[ ] El proyecto compila correctamente.`

debe permanecer sin marcar.

Ese elemento no autoriza la ejecución del build.

En la respuesta final indica exactamente:

`Build: no ejecutado por restricción del proyecto.`

---

## 20. Arquitectura

El proyecto sigue principios de Clean Architecture.

Debe mantenerse una separación clara entre:

* Presentation
* Application
* Domain
* Infrastructure

La dirección esperada para operaciones de persistencia es:

`Use Case -> Repository específico -> Adapter específico`

Cada responsabilidad debe permanecer separada.

No conviertas los repositories en interfaces genéricas con múltiples responsabilidades si el proyecto utiliza repositories específicos por operación.

No conviertas los adapters en componentes con múltiples operaciones no relacionadas.

No introduzcas dependencias desde Domain hacia NestJS, DynamoDB, JWT, bcrypt, cookies, headers u otras tecnologías concretas.

---

## 21. Persistencia, dominio y HTTP

Debes mantener la separación entre:

`Persistence Model != Domain Entity != Request DTO != Response DTO`

No reutilices automáticamente un mismo objeto para representar estos conceptos.

Los detalles específicos de DynamoDB pertenecen a Infrastructure.

El dominio no debe conocer campos como:

* `pk`
* `sk`

Los DTO HTTP tampoco deben depender de la estructura interna de DynamoDB.

Utiliza mappers para transformar las representaciones cuando corresponda.

Los nombres HTTP pueden diferir de los nombres utilizados por Domain o Persistence.

No modifiques una capa únicamente para hacerla coincidir artificialmente con otra.

---

## 22. Controllers

Los controllers deben permanecer delgados.

Sus responsabilidades deben limitarse principalmente a:

* recibir la petición;
* obtener información propia del transporte;
* validar mediante los mecanismos establecidos;
* invocar el caso de uso correspondiente;
* devolver la respuesta.

No coloques reglas de negocio en controllers.

No coloques lógica de persistencia en controllers.

No implementes manualmente autorización compleja dentro de controllers si el proyecto dispone de guards, decorators o capacidades específicas para dicha responsabilidad.

---

## 23. Comunicación entre módulos

Un módulo no debe acceder directamente a repositories, adapters o modelos de persistencia internos de otro módulo.

Cuando un módulo necesite una capacidad propiedad de otro módulo, utiliza un port o abstracción explícita.

Conceptualmente:

`Consumer Module -> Port -> Provider Module`

El módulo proveedor conserva la responsabilidad sobre su información y su implementación.

No rompas los límites entre módulos para simplificar una implementación.

Por ejemplo, `AuthModule` no deberá importar directamente un adapter DynamoDB interno de `UsersModule`.

Si Auth necesita:

* consultar un usuario;
* verificar su estado;
* obtener información necesaria para autenticación;
* modificar una contraseña;

deberá utilizar una capacidad explícita expuesta por el módulo propietario.

---

## 24. DynamoDB

El proyecto utiliza DynamoDB con Single Table Design.

La estructura de persistencia debe respetar:

`docs/database.md`

Los campos específicos de DynamoDB deben permanecer en Infrastructure.

No expongas detalles de DynamoDB en:

* entidades de dominio;
* casos de uso;
* request DTOs;
* response DTOs.

No agregues items, índices o relaciones no documentadas para facilitar una implementación.

---

## 25. API HTTP

Los contratos HTTP deben respetar:

`docs/openapi.yaml`

No inventes:

* endpoints;
* métodos HTTP;
* propiedades de request;
* propiedades de response;
* códigos de estado;
* mecanismos de seguridad;
* headers;
* cookies;
* scopes;
* comportamiento del API;

cuando ya exista una definición en la documentación.

El proyecto utiliza versionado URI.

Cada endpoint versionado de NestJS debe utilizar explícitamente:

`@Version('1')`

Respeta las convenciones existentes del proyecto.

Los mecanismos de seguridad definidos por cada operación en OpenAPI forman parte del contrato HTTP y deben respetarse.

No conviertas una operación protegida mediante sesión en una operación pública.

No sustituyas un Public Operation Token por una sesión, ni una sesión por un Public Operation Token, salvo que las fuentes de verdad hayan sido modificadas explícitamente.

---

## 26. Seguridad

La información sensible nunca debe exponerse mediante respuestas del API salvo que el contrato defina expresamente que una credencial debe entregarse al cliente.

Las contraseñas:

* nunca deben almacenarse en texto plano;
* nunca deben devolverse mediante el API;
* deben procesarse mediante un algoritmo adecuado de hashing de contraseñas, como bcrypt.

No utilices cifrado reversible como sustituto del hashing de contraseñas.

Las confirmaciones de contraseña:

* son datos transitorios de entrada;
* deben validarse antes del hashing;
* no deben persistirse;
* no deben devolverse mediante el API.

Los hashes de contraseña nunca deben exponerse.

Los tokens y credenciales sensibles no deben escribirse en logs.

Las reglas de seguridad definidas en las User Stories y documentación son obligatorias.

---

## 27. Autenticación y sesión

Vera Balance distingue entre:

```text
Public Operation Token
Session JWT
Password Recovery Token o credencial de recuperación
```

Estos conceptos tienen propósitos diferentes.

No los combines ni reutilices indistintamente.

### Session JWT

El JWT de sesión:

* representa una sesión autenticada;
* identifica al usuario autenticado;
* se entrega mediante la cookie `HttpOnly` definida en `docs/openapi.yaml`;
* no debe devolverse en el body;
* no debe almacenarse en `localStorage`;
* no debe almacenarse en `sessionStorage`;
* no debe requerir que el frontend lea directamente su contenido.

La identidad utilizada para operaciones autenticadas debe obtenerse de la sesión cuando así lo defina el contrato.

No confíes en un `user_id`, email u otro identificador enviado por el frontend para sustituir la identidad autenticada cuando la operación debe actuar sobre el usuario de la sesión.

### Public Operation Token

El Public Operation Token no representa una sesión.

Actualmente se utiliza únicamente para proteger:

```text
POST /v1/users
POST /v1/auth/sign-in
POST /v1/auth/forgot-password
```

Los scopes definidos actualmente son:

```text
users:create
auth:sign-in
auth:forgot-password
```

El endpoint:

```text
POST /v1/auth/public-token
```

es el único endpoint de este flujo que no requiere previamente sesión autenticada ni otro Public Operation Token.

Un Public Operation Token:

* debe corresponder al scope de la operación;
* tiene vigencia limitada;
* es de un solo uso;
* no identifica una sesión de usuario;
* no puede utilizarse como JWT de sesión;
* no puede utilizarse para otra operación;
* debe rechazarse si está expirado;
* debe rechazarse si ya fue consumido;
* debe rechazarse si su scope no corresponde.

No agregues nuevos scopes ni nuevas operaciones protegidas mediante Public Operation Token salvo que las fuentes de verdad los definan.

### Consumo del Public Operation Token

El token debe validarse antes de ejecutar la operación protegida.

Cuando la solicitud haya sido aceptada para ejecutar la operación correspondiente, el token debe consumirse conforme a las reglas documentadas.

No implementes un mecanismo de single-use únicamente confiando en un JWT autocontenido si no existe una forma documentada de determinar que ya fue utilizado.

Si garantizar single-use requiere persistencia que todavía no está definida en `docs/database.md`, reporta el bloqueo.

No inventes la persistencia.

### Recuperación de contraseña

El Public Operation Token con scope:

`auth:forgot-password`

únicamente autoriza la solicitud inicial de recuperación de contraseña.

No debe utilizarse como credencial para establecer posteriormente una nueva contraseña.

Una futura credencial de recuperación deberá considerarse independiente de:

* Public Operation Token;
* Session JWT.

No inventes:

* endpoint de finalización de recuperación;
* formato del Recovery Token;
* persistencia del Recovery Token;
* expiración;
* mecanismo de envío;
* proveedor de email;
* comportamiento de consumo;

si todavía no están definidos en las fuentes de verdad.

---

## 28. Autenticación vs autorización

Autenticación y autorización son responsabilidades diferentes.

Conceptualmente:

```text
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

Una sesión válida identifica al usuario.

No implica automáticamente que el usuario pueda acceder a cualquier recurso.

El backend debe validar, según corresponda:

* rol;
* clínica;
* propiedad del recurso;
* estado del usuario;
* permisos definidos por las reglas funcionales.

El frontend puede ocultar acciones, pero eso no sustituye la autorización backend.

No confíes en filtros enviados por el frontend para determinar el alcance de acceso.

---

## 29. Implementación de autenticación

Las capas Application y Domain no deberán depender directamente de implementaciones concretas como:

* JWT libraries;
* bcrypt;
* cookies;
* headers;
* SDKs de proveedores de identidad;
* Cognito;
* servicios externos de autenticación.

Cuando una operación necesite estas capacidades, utiliza ports o abstracciones explícitas conforme a la arquitectura del proyecto.

Conceptualmente:

```text
Application
↓
Authentication / Session / Password Port
↓
Infrastructure
↓
JWT / bcrypt / proveedor externo
```

La implementación actual deberá permitir sustituir la infraestructura de autenticación en el futuro sin obligar a reescribir las reglas centrales del sistema.

No crees abstracciones especulativas que no correspondan a una necesidad real de la User Story.

---

## 30. Implementación

Implementa el cambio mínimo y coherente que satisfaga completamente la User Story.

No realices refactors no relacionados.

No:

* renombres archivos no relacionados;
* cambies módulos ajenos a la US sin necesidad;
* introduzcas funcionalidades futuras;
* inventes requisitos;
* modifiques contratos públicos innecesariamente;
* implementes endpoints no definidos;
* modifiques otras User Stories sin necesidad;
* agregues abstracciones especulativas;
* instales dependencias;
* actualices dependencias;
* elimines dependencias;
* ejecutes builds;
* ejecutes comandos auxiliares no autorizados para validar el proyecto.

Crear más archivos es correcto cuando la separación de responsabilidades lo requiere.

Crear más abstracciones sin una responsabilidad real no lo es.

Si una implementación requiere una dependencia nueva, puedes preparar el código y `package.json`, pero la instalación será responsabilidad manual del usuario.

Una solución más corta no es automáticamente una mejor solución.

Una solución técnicamente válida no es suficiente si rompe la consistencia del proyecto.

No es suficiente que funcione o que los tests pasen.

---

## 31. Pruebas

Las pruebas forman parte de la implementación cuando la Definition of Done las requiere.

Respeta la organización y estilo de pruebas existente.

Para flujos de aplicación NestJS utiliza el patrón establecido en el proyecto con:

* `@nestjs/testing`
* `Test.createTestingModule()`
* `TestingModule`

Para pruebas de casos de uso:

* utiliza el Use Case real;
* utiliza los Domain Services reales relacionados con el flujo;
* mockea repositories y dependencias externas.

No sustituyas este patrón por instanciación manual como:

```ts
new SomeUseCase(...)
```

cuando el flujo equivalente del proyecto utiliza `TestingModule`.

Las pruebas deben validar comportamiento y reglas de negocio.

Los criterios de aceptación que puedan comprobarse automáticamente deben estar cubiertos por pruebas cuando corresponda.

No modifiques una prueba únicamente para hacer que una implementación incorrecta pase.

Para funcionalidades de autenticación, prueba según corresponda:

* credencial ausente;
* credencial inválida;
* credencial expirada;
* scope incorrecto;
* credencial ya consumida;
* sesión ausente;
* sesión inválida;
* sesión expirada;
* usuario inactivo;
* permisos insuficientes;
* reglas funcionales específicas del endpoint.

No inventes comportamientos HTTP que no estén definidos por OpenAPI o las User Stories.

Si las pruebas no pueden ejecutarse porque falta una dependencia, no instales la dependencia.

Reporta la dependencia pendiente para instalación manual.

---

## 32. Validación posterior a la implementación

Después de implementar debes:

1. verificar `node --version`;
2. confirmar Node.js `v24.21.0`;
3. determinar si las dependencias necesarias ya están instaladas;
4. ejecutar las pruebas relacionadas mediante `npm run test` cuando el entorno ya esté preparado;
5. ejecutar la suite relevante cuando sea posible mediante `npm run test`;
6. no instalar dependencias;
7. no ejecutar `npm run build`;
8. no ejecutar ningún otro build equivalente;
9. no ejecutar scripts npm auxiliares no autorizados;
10. revisar cada criterio de aceptación;
11. revisar cada regla de negocio;
12. revisar la Definition of Done;
13. revisar el diff completo;
14. confirmar que no existen cambios ajenos a la User Story;
15. confirmar que no se modificó documentación protegida sin autorización;
16. identificar todas las acciones manuales pendientes para el responsable del proyecto.

Nunca indiques que una prueba o build pasó si no fue ejecutado correctamente.

Si una validación no puede ejecutarse debido al entorno o a una dependencia pendiente, indícalo explícitamente.

No prepares el entorno automáticamente.

No instales paquetes para intentar completar una validación.

---

## 33. Definition of Done

Antes de considerar que la implementación está lista para revisión, verifica cada elemento de `Definition of Done`.

Un elemento:

`[x]`

indica que ya está marcado como satisfecho.

Un elemento:

`[ ]`

debe verificarse antes de considerarlo satisfecho.

Cuando puedas demostrar que un elemento de la Definition of Done fue satisfecho durante la implementación, actualízalo de:

`[ ]`

a:

`[x]`

No marques como completado un elemento que no hayas podido verificar.

Si la Definition of Done contiene:

`[ ] El proyecto compila correctamente.`

debe permanecer sin marcar porque los builds están prohibidos por las reglas del proyecto.

No ejecutes el build para intentar satisfacer ese elemento.

Si las pruebas no pudieron ejecutarse porque falta una dependencia que debe instalar manualmente el responsable, tampoco marques:

`[x] Las pruebas pasan correctamente.`

La imposibilidad de ejecutar un build o una prueba por estas restricciones no impide por sí sola pasar la User Story a `Under Review`, siempre que la implementación esté terminada y el pendiente se reporte claramente.

Los elementos que requieran explícitamente validación humana pueden permanecer pendientes.

---

## 34. Finalización de una User Story

Cuando termines la implementación:

1. compara el resultado contra todos los criterios de aceptación;
2. verifica las reglas de negocio;
3. verifica Node.js `24.21.0`;
4. ejecuta `npm run test` únicamente si las dependencias necesarias ya están instaladas;
5. no instales dependencias;
6. no ejecutes ningún build;
7. no ejecutes scripts npm auxiliares no autorizados;
8. revisa la Definition of Done;
9. actualiza únicamente los elementos verificables de la Definition of Done;
10. revisa el diff final;
11. confirma que no se modificó documentación protegida;
12. identifica dependencias pendientes de instalación manual;
13. identifica comandos que deba ejecutar manualmente el responsable;
14. cambia el `Status` de la User Story a `Under Review`.

El estado final del trabajo realizado por Codex debe ser:

`Status: Under Review`

No:

`Status: Done`

`Done` únicamente puede ser establecido manualmente por el responsable del proyecto después de revisar y aprobar la implementación.

---

## 35. Modificación de especificaciones

Durante la implementación no debes modificar:

* Historia de usuario;
* Scope;
* Descripción;
* Criterios de aceptación;
* Reglas de negocio;
* Dependencias;
* Consideraciones técnicas;
* Referencias;

salvo que el usuario solicite explícitamente un cambio en la especificación.

Sí puedes modificar durante el flujo normal:

* `Status`;
* checks de `Definition of Done`;

siguiendo las reglas establecidas en este documento.

No modifiques otras User Stories.

---

## 36. Revisión final

Antes de finalizar, compara directamente la implementación contra la User Story solicitada.

Para cada criterio de aceptación determina internamente si está:

* satisfecho;
* no satisfecho;
* bloqueado.

Si existe un criterio obligatorio no satisfecho, no presentes la User Story como completamente implementada.

Si existe un bloqueo, repórtalo claramente.

Comprueba también que la solución no viole documentación de mayor autoridad.

Verifica especialmente:

* que no existan cambios no relacionados;
* que no se hayan agregado estructuras DynamoDB no documentadas;
* que no se hayan inventado endpoints;
* que no se hayan inventado códigos HTTP;
* que no se hayan agregado scopes no documentados;
* que no se haya expuesto información sensible;
* que no se hayan modificado documentos protegidos;
* que el patrón de Clinics se haya respetado cuando corresponda;
* que no se hayan instalado dependencias;
* que no se hayan ejecutado builds;
* que no se hayan ejecutado scripts npm no autorizados;
* que todas las acciones manuales pendientes estén identificadas.

---

## 37. Respuesta final

Al finalizar el trabajo, informa de forma concisa:

* User Story trabajada;
* cambios principales realizados;
* pruebas ejecutadas;
* resultado de las pruebas;
* versión de Node.js utilizada;
* resultado de `npm run test`;
* dependencias nuevas requeridas;
* dependencias pendientes de instalación manual;
* comandos que debe ejecutar manualmente el responsable del proyecto;
* estado de los criterios de aceptación;
* elementos de Definition of Done que no pudieron verificarse;
* bloqueos o pendientes;
* nuevo estado de la User Story.

Incluye siempre una sección:

```text
Acciones manuales requeridas:
```

Si existe una dependencia nueva, indica por ejemplo:

```text
Acciones manuales requeridas:
- Instalar dependencia: bcrypt
- Ejecutar: npm install bcrypt
```

Si existen varias:

```text
Acciones manuales requeridas:
- Instalar dependencia: bcrypt
  npm install bcrypt
- Instalar dependencia de desarrollo: @types/bcrypt
  npm install --save-dev @types/bcrypt
```

Si no existe ninguna acción manual pendiente, indica:

```text
Acciones manuales requeridas:
- Ninguna.
```

No ejecutes estos comandos.

Son instrucciones para el responsable del proyecto.

Indica también exactamente:

`Build: no ejecutado por restricción del proyecto.`

Si las pruebas no pudieron ejecutarse debido a una dependencia pendiente, indícalo explícitamente.

Por ejemplo:

`Tests: no ejecutados; requieren instalación manual de las dependencias indicadas.`

Si todo lo implementable fue completado, el nuevo estado puede ser:

`Under Review`

La aprobación final y el cambio a:

`Done`

corresponden exclusivamente al responsable del proyecto.

---

## 38. Regla principal de consistencia

Antes de elegir una solución, verifica:

1. si la documentación ya define el comportamiento;
2. si Clinics ya define un patrón equivalente;
3. si otro módulo validado implementa la misma responsabilidad;
4. si la solución respeta la separación de capas;
5. si requiere persistencia no documentada;
6. si modifica un contrato público;
7. si introduce una decisión funcional nueva;
8. si requiere una dependencia nueva;
9. si requiere una acción manual del responsable.

No selecciones una solución únicamente porque:

* utiliza menos archivos;
* requiere menos código;
* parece más moderna;
* utiliza una abstracción genérica;
* es un patrón común en otros proyectos;
* facilita temporalmente la implementación.

La solución debe ser coherente con Vera Balance.

**El patrón de Clinics es obligatorio.**

Una solución técnicamente válida no es suficiente si rompe la consistencia del proyecto.

No es suficiente que funcione o que los tests pasen.

Codex debe concentrarse en implementar el código y las pruebas requeridas.

La instalación de dependencias, ejecución de builds y preparación manual del entorno corresponden al responsable del proyecto.
