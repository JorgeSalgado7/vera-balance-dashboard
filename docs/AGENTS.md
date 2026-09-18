# Vera Balance - Instrucciones para Codex

## 1. Propósito

Este repositorio utiliza un flujo de desarrollo basado en especificaciones mediante User Stories (US).

Los requerimientos funcionales se encuentran en:

`docs/user-stories/`

Las reglas técnicas, arquitectónicas, de persistencia y contratos se encuentran en:

`docs/`

Cuando se solicite implementar una User Story, no comiences a modificar código inmediatamente.

Primero debes entender el proyecto, revisar su estructura, leer la documentación relevante, analizar la User Story solicitada, revisar sus dependencias y estudiar la implementación existente.

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
11. Ejecutar las pruebas.
12. Ejecutar el build.
13. Revisar todos los criterios de aceptación.
14. Revisar las reglas de negocio.
15. Revisar la Definition of Done.
16. Revisar el diff final para detectar cambios no relacionados.
17. Cambiar el `Status` de la User Story a `Under Review` cuando la implementación esté lista para revisión.

No omitas estas etapas.

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

Cuando corresponda, actualiza la documentación técnica como parte de la Definition of Done.

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

Si la User Story ya se encuentra en `Under Review`, no vuelvas a implementarla desde cero.

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

Cuando la implementación, pruebas y validaciones hayan terminado correctamente, cambia el estado de la User Story a:

`Under Review`

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

## 12. Arquitectura

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

---

## 13. Persistencia, dominio y HTTP

Debes mantener la separación entre:

`Persistence Model != Domain Entity != Request DTO != Response DTO`

No reutilices automáticamente un mismo objeto para representar estos conceptos.

Los detalles específicos de DynamoDB pertenecen a Infrastructure.

El dominio no debe conocer campos como:

* `pk`
* `sk`

Los DTO HTTP tampoco deben depender de la estructura interna de DynamoDB.

Utiliza mappers para transformar las representaciones cuando corresponda.

---

## 14. Controllers

Los controllers deben permanecer delgados.

Sus responsabilidades deben limitarse principalmente a:

* recibir la petición;
* validar mediante los mecanismos establecidos;
* invocar el caso de uso correspondiente;
* devolver la respuesta.

No coloques reglas de negocio en controllers.

No coloques lógica de persistencia en controllers.

---

## 15. Comunicación entre módulos

Un módulo no debe acceder directamente a repositories, adapters o modelos de persistencia internos de otro módulo.

Cuando un módulo necesite una capacidad propiedad de otro módulo, utiliza un port o abstracción explícita.

Conceptualmente:

`Consumer Module -> Port -> Provider Module`

El módulo proveedor conserva la responsabilidad sobre su información y su implementación.

No rompas los límites entre módulos para simplificar una implementación.

---

## 16. DynamoDB

El proyecto utiliza DynamoDB con Single Table Design.

La estructura de persistencia debe respetar:

`docs/database.md`

Los campos específicos de DynamoDB deben permanecer en Infrastructure.

No expongas detalles de DynamoDB en:

* entidades de dominio;
* casos de uso;
* request DTOs;
* response DTOs.

---

## 17. API HTTP

Los contratos HTTP deben respetar:

`docs/openapi.yaml`

No inventes:

* endpoints;
* métodos HTTP;
* propiedades de request;
* propiedades de response;
* códigos de estado;
* comportamiento del API;

cuando ya exista una definición en la documentación.

El proyecto utiliza versionado URI.

Cada endpoint versionado de NestJS debe utilizar explícitamente:

`@Version('1')`

Respeta las convenciones existentes del proyecto.

---

## 18. Seguridad

La información sensible nunca debe exponerse mediante respuestas del API.

Las contraseñas:

* nunca deben almacenarse en texto plano;
* nunca deben devolverse mediante el API;
* deben procesarse mediante un algoritmo adecuado de hashing de contraseñas, como bcrypt.

No utilices cifrado reversible como sustituto del hashing de contraseñas.

Las reglas de seguridad definidas en las User Stories y documentación son obligatorias.

---

## 19. Implementación

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
* agregues abstracciones especulativas.

Crear más archivos es correcto cuando la separación de responsabilidades lo requiere.

Crear más abstracciones sin una responsabilidad real no lo es.

---

## 20. Pruebas

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

Las pruebas deben validar comportamiento y reglas de negocio.

Los criterios de aceptación que puedan comprobarse automáticamente deben estar cubiertos por pruebas cuando corresponda.

No modifiques una prueba únicamente para hacer que una implementación incorrecta pase.

---

## 21. Validación posterior a la implementación

Después de implementar debes:

1. ejecutar las pruebas relacionadas;
2. ejecutar la suite relevante cuando sea posible;
3. ejecutar el build;
4. revisar cada criterio de aceptación;
5. revisar cada regla de negocio;
6. revisar la Definition of Done;
7. revisar el diff completo;
8. confirmar que no existen cambios ajenos a la User Story.

Nunca indiques que una prueba o build pasó si no fue ejecutado correctamente.

Si una validación no puede ejecutarse debido al entorno, indícalo explícitamente.

---

## 22. Definition of Done

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

Por ejemplo, si el build no pudo ejecutarse, no marques:

`[x] El proyecto compila correctamente.`

Una User Story puede pasar a `Under Review` únicamente cuando la implementación esté lista para que el responsable del proyecto la revise.

Los elementos que requieran explícitamente validación humana pueden permanecer pendientes.

---

## 23. Finalización de una User Story

Cuando termines la implementación:

1. compara el resultado contra todos los criterios de aceptación;
2. verifica las reglas de negocio;
3. ejecuta las pruebas;
4. ejecuta el build;
5. revisa la Definition of Done;
6. actualiza los elementos verificables de la Definition of Done;
7. revisa el diff final;
8. cambia el `Status` de la User Story a `Under Review`.

El estado final del trabajo realizado por Codex debe ser:

`Status: Under Review`

No:

`Status: Done`

`Done` únicamente puede ser establecido manualmente por el responsable del proyecto después de revisar y aprobar la implementación.

---

## 24. Modificación de especificaciones

Durante la implementación no debes modificar:

* Historia de usuario;
* Scope;
* Descripción;
* Criterios de aceptación;
* Reglas de negocio;

salvo que el usuario solicite explícitamente un cambio en la especificación.

Sí puedes modificar durante el flujo normal:

* `Status`;
* checks de `Definition of Done`;

siguiendo las reglas establecidas en este documento.

---

## 25. Revisión final

Antes de finalizar, compara directamente la implementación contra la User Story solicitada.

Para cada criterio de aceptación determina internamente si está:

* satisfecho;
* no satisfecho;
* bloqueado.

Si existe un criterio obligatorio no satisfecho, no presentes la User Story como completamente implementada.

Si existe un bloqueo, repórtalo claramente.

Comprueba también que la solución no viole documentación de mayor autoridad.

---

## 26. Respuesta final

Al finalizar el trabajo, informa de forma concisa:

* User Story trabajada;
* cambios principales realizados;
* pruebas ejecutadas;
* resultado de las pruebas;
* resultado del build;
* estado de los criterios de aceptación;
* elementos de Definition of Done que no pudieron verificarse;
* bloqueos o pendientes;
* nuevo estado de la User Story.

Si todo lo implementable fue completado y validado, el nuevo estado debe ser:

`Under Review`

La aprobación final y el cambio a:

`Done`

corresponden exclusivamente al responsable del proyecto.
