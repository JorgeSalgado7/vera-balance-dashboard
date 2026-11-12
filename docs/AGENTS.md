# Vera Balance Dashboard — Instrucciones para Codex

## 1. Propósito

Este archivo define las instrucciones generales que Codex deberá seguir para desarrollar y mantener **Vera Balance Dashboard**.

El proyecto está compuesto por dos aplicaciones:

- **BAAS:** Backend desarrollado con NestJS, TypeScript, Clean Architecture y DynamoDB.
- **MFE:** Frontend desarrollado con React, TypeScript, Vite, Redux Toolkit, Material UI y SCSS.

Ambas aplicaciones implementarán Clean Architecture y deberán respetar sus respectivas responsabilidades.

Las definiciones técnicas, arquitectónicas, funcionales y de contratos se encuentran en:

`docs/`

Este archivo es el **gestor central de instrucciones para Codex** y aplica a ambas aplicaciones.

Una implementación técnicamente funcional no será suficiente si contradice la documentación, los contratos o las convenciones del proyecto.

---

## 2. Organización del proyecto

La estructura general será:

```text
vera-balance-dashboard/
├── AGENTS.md
├── docs/
│   ├── DB.md
│   ├── baas-vera-balance-dashboard.yml
│   ├── DEFINITIONS.md
│   ├── PROJECT_ARCHITECTURE.md
│   ├── ARCHITECTURE_GUIDELINES.md
├── baas/
└── mfe/
```

Las carpetas `baas/` y `mfe/` representan las aplicaciones del proyecto.

No asumir que una carpeta o módulo contiene implementaciones completas únicamente porque existe.

Codex deberá inspeccionar el estado real del repositorio antes de realizar cambios.

---

## 3. Flujo obligatorio de trabajo

Para cada tarea solicitada, Codex deberá:

1. Inspeccionar la estructura del repositorio.
2. Leer íntegramente `AGENTS.md`.
3. Identificar si la tarea pertenece al BAAS o al MFE.
4. Analizar el objetivo y alcance solicitado.
5. Leer la documentación técnica aplicable.
6. Analizar las dependencias de la funcionalidad.
7. Revisar las implementaciones existentes relacionadas.
8. Verificar que no existan funciones o funcionalidades equivalentes antes de crear nuevas implementaciones.
8. Identificar los patrones arquitectónicos aplicables.
9. Determinar los archivos y componentes necesarios.
10. Implementar exclusivamente la funcionalidad solicitada.
11. Agregar o actualizar las pruebas necesarias.
12. Verificar la versión de Node.js.
13. Ejecutar las pruebas permitidas cuando el entorno esté preparado.
14. Verificar el comportamiento esperado.
15. Revisar el diff completo.
16. Identificar bloqueos y acciones manuales pendientes.

No omitir etapas.

No comenzar a modificar código sin haber analizado la documentación y la implementación existente.

---

## 4. Documentación obligatoria

Los documentos principales del proyecto son:

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yml`
- `docs/DEFINITIONS.md`
- `docs/PROJECT_ARCHITECTURE.md`
- `docs/ARCHITECTURE_GUIDELINES.md`

Codex deberá revisar los documentos aplicables a la tarea solicitada.

### BAAS

Para implementaciones del BAAS, revisar obligatoriamente los cinco documentos.

### MFE

Para implementaciones del MFE, revisar obligatoriamente:

- `docs/DEFINITIONS.md`
- `docs/PROJECT_ARCHITECTURE.md`
- `docs/ARCHITECTURE_GUIDELINES.md`
- `docs/baas-vera-balance-dashboard.yml`

Revisar `docs/DB.md` cuando sea necesario comprender reglas de negocio o relaciones entre entidades, sin utilizarlo como contrato directo del frontend.

### Orden de autoridad

Para persistencia:

1. `docs/DB.md`
2. `docs/PROJECT_ARCHITECTURE.md`
3. `docs/ARCHITECTURE_GUIDELINES.md`

Para contratos HTTP:

1. `docs/baas-vera-balance-dashboard.yml`
2. `docs/DEFINITIONS.md`
3. `docs/PROJECT_ARCHITECTURE.md`

Para reglas funcionales:

1. `docs/DEFINITIONS.md`
2. Contratos y documentación funcional aplicable.

Para arquitectura:

1. `docs/PROJECT_ARCHITECTURE.md`
2. `docs/ARCHITECTURE_GUIDELINES.md`
3. Implementación existente compatible.

Si existe una contradicción que no puede resolverse con la documentación, reportarla.

No inventar soluciones ni modificar documentos para eliminar el conflicto.

---

## 5. Alcance de las implementaciones

Cada tarea deberá implementarse de manera independiente.

### BAAS

Las funcionalidades del backend deberán implementarse dentro de `baas/`.

No modificar el MFE salvo autorización explícita.

### MFE

Las funcionalidades del frontend deberán implementarse dentro de `mfe/`.

No modificar el BAAS salvo autorización explícita.

### Reglas generales

- Implementar exclusivamente la funcionalidad solicitada.
- Respetar las dependencias documentadas.
- No implementar funcionalidades futuras.
- No modificar módulos o features ajenos.
- No realizar refactorizaciones innecesarias.
- Reutilizar capacidades existentes cuando corresponda.
- Buscar y verificar implementaciones equivalentes antes de crear código nuevo.
- No inventar contratos ni comportamientos.

Si una dependencia obligatoria no existe, reportar el bloqueo.

---

### Verificación obligatoria antes de crear código

**Antes de crear una función, componente, servicio, caso de uso, repositorio, adapter, módulo o funcionalidad, Codex deberá buscar si ya existe una implementación equivalente en el proyecto.**

1. Inspeccionar los módulos, features y capacidades compartidas relevantes, sin limitar la búsqueda al nombre de la función.
2. Revisar el comportamiento, las interfaces y las dependencias de las implementaciones encontradas.
3. Reutilizar una implementación existente cuando sea compatible con la necesidad y con Clean Architecture.
4. Evitar duplicaciones aunque los nombres o las ubicaciones de los archivos sean diferentes.
5. Cuando exista una implementación parcial, evaluar una ampliación mínima antes de crear otra, sin mezclar responsabilidades independientes.
6. Si reutilizarla requiere cambiar contratos o funcionalidades ajenas, solicitar autorización antes de modificarla.
7. Crear una implementación nueva únicamente cuando no exista una alternativa compatible, manteniendo la separación de responsabilidades.

---

## 6. Clean Architecture

Ambas aplicaciones implementarán Clean Architecture.

### BAAS

Capas:

- Domain.
- Application.
- Infrastructure.
- Presentation.

Dirección conceptual:

`Presentation → Application → Domain`

Infrastructure implementará los contratos requeridos por las capas internas.

### MFE

Capas:

- Domain.
- Application.
- Infrastructure.
- UI.

Dirección conceptual:

`UI → Application → Domain`

Infrastructure implementará los contratos requeridos por las capas internas.

### Reglas

- Domain no deberá depender de frameworks.
- Application no deberá depender de implementaciones concretas de infraestructura.
- Infrastructure contendrá los adaptadores técnicos.
- Presentation y UI no deberán contener reglas de negocio.
- Las dependencias deberán respetar la dirección establecida por Clean Architecture.

---

## 7. Separación estricta de responsabilidades

**Cada función o responsabilidad independiente deberá tener su propio archivo.**

Esta regla aplica tanto al BAAS como al MFE.

No concentrar múltiples funciones independientes dentro de un mismo archivo únicamente porque pertenecen al mismo módulo, feature o capa.

### Reglas obligatorias

1. Cada Use Case deberá tener su propio archivo.
2. Cada Domain Service con una responsabilidad independiente deberá tener su propio archivo.
3. Cada Repository específico deberá estar separado.
4. Cada Adapter deberá implementar una responsabilidad específica.
5. Cada Mapper independiente deberá tener su propio archivo.
6. Cada operación de persistencia deberá tener su propio adapter.
7. Cada operación de comunicación HTTP del MFE deberá tener su propio adapter o implementación específica.
8. No crear archivos genéricos para concentrar múltiples responsabilidades.
9. No combinar operaciones independientes para reducir el número de archivos.
10. Las funciones auxiliares privadas que formen parte inseparable de una operación podrán permanecer dentro de su archivo.

### Restricciones

No crear archivos como:

- `users-utils.ts`
- `users-helpers.ts`
- `users-services.ts`

para concentrar funciones de distintas responsabilidades.

Los archivos compartidos deberán contener únicamente capacidades técnicas verdaderamente reutilizables y cohesionadas.

Los archivos de configuración, composición de dependencias, declaración de módulos y tipos relacionados podrán agrupar definiciones cuando sea necesario para cumplir su responsabilidad específica.

---

## 8. Arquitectura BAAS

El BAAS utiliza NestJS y separación por módulos funcionales.

Ubicación:

`baas/src/modules/`

Estructura esperada:

```text
baas/src/modules/{module}/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── {module}.module.ts
```

Cada módulo deberá encapsular sus responsabilidades.

No crear módulos completos para funcionalidades que todavía no han sido solicitadas.

### 8.1 Use Cases

Cada operación de aplicación tendrá su propio Use Case.

Ejemplo:

```text
application/
└── use-cases/
    ├── create-user.use-case.ts
    ├── get-user.use-case.ts
    └── update-user.use-case.ts
```

No concentrar todos los casos de uso en un único servicio.

### 8.2 Domain Services

Cada servicio de dominio deberá representar una responsabilidad concreta.

No utilizar servicios genéricos para agrupar validaciones independientes.

### 8.3 Repositories

Los repositories deberán representar operaciones específicas.

Dirección esperada:

`Use Case → Repository específico → Adapter específico`

No crear repositories CRUD genéricos cuando las operaciones tengan responsabilidades independientes.

### 8.4 Infrastructure Adapters

**Cada operación independiente contra DynamoDB deberá tener su propio adapter y su propio archivo.**

Ejemplo conceptual:

```text
infrastructure/
└── adapters/
    ├── create-user.adapter.ts
    ├── get-user-by-id.adapter.ts
    ├── get-user-by-email.adapter.ts
    └── update-user.adapter.ts
```

Los nombres son ilustrativos y no autorizan operaciones de persistencia no documentadas.

Está prohibido implementar un único `users-dynamodb.adapter.ts` que concentre creación, consulta, actualización y eliminación.

Cada adapter deberá implementar exclusivamente su operación.

Una operación podrá realizar varias llamadas técnicas cuando sean necesarias para completar una única responsabilidad.

### 8.5 Controllers

Los controllers deberán mantenerse delgados.

Podrán:

- Recibir solicitudes.
- Obtener información de transporte.
- Aplicar validaciones HTTP.
- Invocar casos de uso.
- Devolver respuestas.

No deberán contener lógica de negocio ni persistencia.

### 8.6 Errores

Los errores deberán representar condiciones concretas.

No utilizar errores genéricos parametrizados cuando existan responsabilidades de dominio diferentes.

Los errores de dominio no deberán conocer códigos HTTP.

La traducción a HTTP pertenece a Presentation.

---

## 9. Arquitectura MFE

El MFE utiliza React, TypeScript y separación por features.

Ubicación:

`mfe/src/features/`

Estructura esperada:

```text
mfe/src/features/{feature}/
├── domain/
├── application/
├── infrastructure/
├── ui/
└── scss/
```

### 9.1 Domain

Contiene modelos, contratos y reglas del dominio.

No deberá depender de React, Redux ni Material UI.

### 9.2 Application

Contiene los casos de uso y la coordinación del estado.

Los casos de uso deberán mantener responsabilidades independientes.

### 9.3 Infrastructure

Contiene clientes HTTP, repositories y adapters para comunicarse con el BAAS.

Cada operación independiente deberá mantener su propia implementación.

No concentrar múltiples peticiones HTTP no relacionadas dentro de un único adapter genérico.

### 9.4 UI

Contiene páginas, componentes React, formularios y elementos visuales.

Los componentes no deberán implementar directamente reglas de negocio ni solicitudes HTTP.

### 9.5 SCSS

Cada feature tendrá su propia carpeta `scss`.

Los estilos específicos deberán mantenerse dentro del feature correspondiente.

No duplicar valores globales del tema.

---

## 10. Sistema de diseño MFE

El MFE utilizará una librería propia de componentes basada en Material UI.

Ubicación:

`mfe/src/ui/`

El tema global estará definido en:

`mfe/src/ui/scss/theme/_theme.scss`

### Reglas

1. SCSS será la fuente de verdad de los tokens visuales.
2. Material UI deberá consumir los valores definidos en SCSS.
3. No mantener dos temas independientes.
4. Los componentes reutilizables deberán ubicarse en `mfe/src/ui/components/`.
5. Los layouts compartidos deberán ubicarse en `mfe/src/ui/layouts/`.
6. Los features deberán consumir el tema global.
7. No duplicar colores, tipografías, espaciados ni otros valores globales.
8. No introducir componentes visuales compartidos dentro de un feature cuando correspondan a la librería global.

---

## 11. Redux Toolkit

El MFE utilizará Redux Toolkit para la gestión de estado.

### Reglas

- Organizar el estado por feature y flujo.
- Mantener los casos de uso dentro de Application.
- Mantener la comunicación HTTP dentro de Infrastructure.
- No realizar peticiones HTTP directamente desde componentes React.
- No concentrar todo el estado de la aplicación en un único slice.
- No introducir lógica de dominio directamente en reducers o componentes visuales.
- Mantener responsabilidades independientes separadas por archivo cuando corresponda.

---

## 12. Modelos y contratos

Mantener separadas las representaciones utilizadas por cada capa.

### BAAS

`Persistence Model != Domain Entity != Request DTO != Response DTO`

### MFE

`API DTO != Domain Model != UI State`

No reutilizar automáticamente una misma estructura para responsabilidades diferentes.

Utilizar mappers cuando corresponda.

Cada mapper independiente deberá estar separado en su propio archivo.

---

## 13. DynamoDB

Esta sección aplica a implementaciones BAAS.

La fuente de verdad es:

`docs/DB.md`

El proyecto utiliza DynamoDB Single Table Design.

### Reglas obligatorias

- Respetar los patrones de `pk` y `sk`.
- Utilizar únicamente los índices documentados.
- Priorizar `GetItem`, `Query` y `BatchGetItem`.
- No utilizar operaciones `Scan`.
- Mantener DynamoDB dentro de Infrastructure.
- Utilizar un adapter específico por operación.
- No inventar estructuras de persistencia.
- No modificar el modelo de datos sin autorización.

### Persistencia no documentada

Está prohibido crear por iniciativa propia:

- Nuevos tipos de items.
- Nuevos patrones de claves.
- Nuevos índices.
- Tablas adicionales.
- Lookups auxiliares.
- Estructuras de unicidad.
- Duplicaciones de datos no documentadas.
- Persistencia adicional para sesiones o tokens.

Si una funcionalidad requiere persistencia adicional:

1. Identificar el requisito afectado.
2. Explicar la limitación del modelo.
3. Presentar alternativas técnicas.
4. No seleccionar una alternativa sin autorización.
5. No modificar `DB.md`.
6. Detener únicamente la parte afectada.
7. Solicitar una decisión al responsable.

---

## 14. Contratos HTTP

La fuente de verdad es:

`docs/baas-vera-balance-dashboard.yml`

Esta regla aplica tanto al BAAS como al MFE.

### BAAS

Deberá implementar los endpoints, validaciones, respuestas y errores definidos en OpenAPI.

### MFE

Deberá consumir los endpoints respetando exactamente sus contratos.

### Restricciones

No inventar:

- Endpoints.
- Métodos HTTP.
- Propiedades de request.
- Propiedades de response.
- Códigos de estado.
- Headers.
- Cookies.
- Mecanismos de autenticación.
- Comportamientos no documentados.

No agregar prefijos ni versionado URI que no estén definidos.

Los errores deberán respetar el contrato correspondiente.

---

## 15. Seguridad y autenticación

La autenticación y autorización son responsabilidades del BAAS.

El MFE únicamente deberá utilizar los mecanismos de autenticación establecidos en los contratos.

### BAAS

Se utilizarán las dependencias definidas en `PROJECT_ARCHITECTURE.md`:

- `@nestjs/authentication`, sujeto a verificación de disponibilidad y compatibilidad.
- `@nestjs/jwt`.

No sustituir silenciosamente dependencias establecidas.

Las contraseñas deberán almacenarse mediante hashes seguros.

No exponer contraseñas ni hashes.

La autorización deberá validar los permisos correspondientes al rol, clínica, estado y recurso.

Domain y Application no deberán depender directamente de bibliotecas concretas de autenticación.

### MFE

- No implementar mecanismos de autenticación no documentados.
- No exponer credenciales.
- No almacenar secretos del backend.
- No asumir que ocultar una acción visual sustituye la autorización backend.
- Respetar los mecanismos de sesión y tokens definidos en OpenAPI.

---

## 16. Comunicación entre módulos y features

### BAAS

Un módulo no deberá acceder directamente a repositories, adapters o modelos internos de otro módulo.

Utilizar contratos explícitos cuando sea necesaria una capacidad externa.

### MFE

Un feature no deberá depender directamente de implementaciones internas de Infrastructure de otro feature.

Utilizar contratos o capacidades compartidas cuando corresponda.

No introducir dependencias circulares.

No crear servicios compartidos genéricos para concentrar lógica funcional.

---

## 17. Entorno de ejecución

El proyecto utiliza obligatoriamente:

`Node.js 24.21.0`

Antes de ejecutar comandos Node.js o npm:

```bash
node --version
```

La versión requerida es:

```text
v24.21.0
```

Si la versión no coincide y NVM está disponible:

```bash
nvm use 24.21.0
```

Verificar nuevamente.

No ejecutar pruebas con otra versión.

Si no puede activarse la versión requerida, reportar el bloqueo.

No modificar la configuración del proyecto para adaptarla al entorno.

---

## 18. Dependencias

Codex no deberá instalar, actualizar ni eliminar dependencias durante una implementación normal.

Están prohibidos:

```text
npm install
npm i
npm ci
npm uninstall
npm update
yarn install
yarn add
pnpm install
pnpm add
```

También se prohíben comandos equivalentes que descarguen o instalen paquetes.

Si una dependencia nueva es necesaria:

1. Identificar el paquete.
2. Verificar su compatibilidad cuando sea posible.
3. Preparar el código correspondiente.
4. Modificar `package.json` únicamente cuando sea necesario.
5. No instalar la dependencia.
6. No ejecutar comandos que generen o modifiquen automáticamente archivos lock.
7. Reportar la dependencia pendiente.
8. Proporcionar el comando de instalación manual.

La instalación corresponde al responsable del proyecto.

---

## 19. Comandos permitidos

El único comando npm autorizado para validación es:

```bash
npm run test
```

Deberá ejecutarse en el directorio de la aplicación correspondiente, cuando las dependencias estén instaladas.

Se permiten argumentos del script para ejecutar pruebas específicas.

No ejecutar otros scripts npm sin autorización.

Están prohibidos:

```text
npm run build
npm run lint
npm run format
npm run typecheck
npm run compile
npm run generate
npm run migrate
npm run seed
npm run start
npm run dev
```

### Builds

No ejecutar builds de ninguna aplicación.

Esto incluye:

```text
nest build
tsc
tsc --build
vite build
webpack
```

No ejecutar comandos equivalentes para evadir la restricción.

El responsable del proyecto ejecutará los builds manualmente.

En la respuesta final indicar:

`Build: no ejecutado por restricción del proyecto.`

---

## 20. Pruebas

Las pruebas forman parte de la implementación cuando sean necesarias para validar el comportamiento solicitado.

### BAAS

Utilizar Jest y las capacidades de pruebas de NestJS.

Cuando corresponda:

- `@nestjs/testing`
- `Test.createTestingModule()`
- `TestingModule`

Para casos de uso:

- Utilizar el Use Case real.
- Utilizar los Domain Services reales.
- Mockear repositories y dependencias externas.

### MFE

Utilizar el framework de pruebas configurado en el proyecto.

Respetar las convenciones existentes.

Probar el comportamiento funcional, los estados y las interacciones relevantes.

No introducir nuevas herramientas de pruebas sin necesidad justificada.

### Reglas generales

- Mantener las pruebas separadas por responsabilidad.
- No concentrar pruebas independientes en archivos genéricos.
- Cubrir los comportamientos verificables de la funcionalidad.
- No modificar pruebas únicamente para hacer pasar código incorrecto.
- No inventar comportamientos no documentados.

### Ejecución

1. Verificar Node.js `24.21.0`.
2. Confirmar que las dependencias estén instaladas.
3. Ejecutar `npm run test` en la aplicación correspondiente.

Si faltan dependencias, no instalarlas.

Reportar:

`Tests: no ejecutados; requieren instalación manual de dependencias.`

No afirmar que una prueba pasó si no fue ejecutada.

---

## 21. Restricciones de implementación

Implementar el cambio mínimo y coherente que satisfaga completamente la tarea solicitada.

No:

- Modificar código no relacionado.
- Refactorizar módulos o features ajenos.
- Crear funcionalidades futuras.
- Inventar requisitos.
- Modificar contratos públicos innecesariamente.
- Crear endpoints adicionales.
- Agregar abstracciones especulativas.
- Duplicar funciones o funcionalidades existentes, incluso bajo nombres distintos.
- Combinar responsabilidades independientes en un único archivo.
- Combinar operaciones DynamoDB en un mismo adapter.
- Combinar múltiples operaciones HTTP independientes en un adapter genérico del MFE.
- Instalar dependencias.
- Ejecutar builds.
- Ejecutar scripts no autorizados.
- Crear commits automáticamente.

Crear más archivos es correcto cuando la separación de responsabilidades lo requiere.

Reducir archivos a costa de combinar responsabilidades está prohibido.

---

## 22. Protección de documentación

Durante una implementación normal, Codex no podrá modificar:

- `docs/DB.md`
- `docs/baas-vera-balance-dashboard.yml`
- `docs/DEFINITIONS.md`
- `docs/PROJECT_ARCHITECTURE.md`
- `docs/ARCHITECTURE_GUIDELINES.md`
- README.
- Diagramas.
- Contratos.

Si un documento requiere cambios, informar:

1. Documento afectado.
2. Cambio propuesto.
3. Justificación.

Esperar autorización explícita.

---

## 23. Validación final

Al terminar:

1. Comparar la implementación con la funcionalidad solicitada.
2. Verificar las reglas de negocio.
3. Verificar que no se hayan duplicado funciones o funcionalidades existentes.
4. Verificar la arquitectura correspondiente al BAAS o MFE.
4. Confirmar la separación de responsabilidades por archivos.
5. Confirmar que cada operación independiente tiene su propio adapter.
6. Revisar los contratos OpenAPI.
7. Revisar los patrones de persistencia cuando corresponda.
8. Confirmar que no se utilizaron operaciones `Scan` en el BAAS.
9. Revisar los tests.
10. Ejecutar las pruebas cuando esté permitido.
11. Revisar el diff completo.
12. Confirmar que no existen cambios no relacionados.
13. Confirmar que no se modificó documentación protegida.
14. Identificar dependencias y acciones manuales pendientes.

No presentar una implementación con funcionalidades pendientes como completamente terminada.

---

## 24. Respuesta final

Al finalizar, informar de forma concisa:

- Aplicación trabajada: BAAS o MFE.
- Funcionalidades implementadas.
- Archivos creados o modificados.
- Comportamientos verificados.
- Funcionalidades bloqueadas o pendientes.
- Tests ejecutados y resultados.
- Versión de Node.js utilizada.
- Dependencias nuevas necesarias.
- Acciones manuales pendientes.

Incluir siempre:

```text
Acciones manuales requeridas:
```

Si no existen acciones pendientes:

```text
Acciones manuales requeridas:
- Ninguna.
```

Si existen dependencias pendientes, indicar los comandos de instalación manual sin ejecutarlos.

Incluir:

`Build: no ejecutado por restricción del proyecto.`

---

## 25. Regla principal de consistencia

Antes de implementar, verificar:

1. Que la tarea corresponde a la aplicación identificada.
2. Que respeta la documentación.
3. Que satisface el comportamiento solicitado.
4. Que mantiene Clean Architecture.
5. Que se revisaron y reutilizaron las implementaciones existentes compatibles, evitando duplicados.
6. Que cada responsabilidad independiente está separada en su propio archivo.
6. Que cada operación de persistencia o comunicación externa utiliza su adapter correspondiente.
7. Que respeta los contratos y modelos definidos.
8. Que no introduce persistencia ni comportamientos no documentados.
9. Que no modifica funcionalidades ajenas.
10. Que no incorpora dependencias innecesarias.
11. Que identifica las acciones manuales pendientes.

**AGENTS.md es el gestor central de instrucciones para BAAS y MFE.**

**La separación de responsabilidades por archivos es obligatoria.**

**Cada adapter deberá representar una operación independiente.**

Codex deberá implementar únicamente el código y las pruebas correspondientes a la tarea solicitada.

La instalación de dependencias, ejecución de builds y preparación del entorno corresponden al responsable del proyecto.