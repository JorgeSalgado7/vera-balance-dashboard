# US-BAAS-USERS-001 — Crear usuario

**Aplicación:** BAAS  
**Módulo:** Users  
**Endpoint:** `POST /users`  
**Status:** `approved`

## Historia de usuario

Como administrador o usuario de clínica, quiero crear usuarios en el sistema para registrar administradores, responsables de clínica y terapeutas de acuerdo con los permisos de mi rol.

## Reglas de negocio

1. Un administrador puede crear usuarios con cualquiera de los roles permitidos.
2. Un usuario con rol `clinic` únicamente puede crear usuarios con rol `therapist`, asociados a su propia clínica.
3. Un usuario con rol `therapist` no puede crear usuarios.
4. Antes de crear un usuario, se debe verificar si existe otro usuario registrado con el mismo correo electrónico.
5. Si el correo electrónico ya existe, se considera que el usuario está registrado y no se permite su creación.
6. El estado inicial de todos los usuarios será `Activo`.
7. La contraseña deberá almacenarse de forma segura mediante un hash. Se deberá utilizar `@nestjs/authentication` como paquete de autenticación establecido para el proyecto, previa verificación de sus capacidades.
8. La contraseña nunca deberá almacenarse ni exponerse en texto plano.
9. La implementación deberá respetar estrictamente los modelos, campos y contratos definidos en OpenAPI y DynamoDB.
10. No se deberán agregar campos, relaciones ni comportamientos que no estén contemplados en los documentos del proyecto.

## Criterios de aceptación

- **CA01:** Un administrador puede crear usuarios con datos válidos.
- **CA02:** Un usuario de clínica puede crear usuarios con rol terapeuta, asociándolos exclusivamente a su clínica.
- **CA03:** Antes de crear el usuario, el sistema valida si existe otro usuario con el mismo correo electrónico. Si existe, rechaza la creación.
- **CA04:** La contraseña se almacena protegida mediante un hash seguro y nunca se expone en texto plano.

## Documentación de referencia

La implementación deberá apoyarse obligatoriamente en los siguientes archivos:

- `/docs/DB.md`
- `/docs/baas-vera-balance-dashboard.yml`
- `/docs/DEFINITIONS.md`
- `/docs/PROJECT_ARCHITECTURE.md`
- `/docs/ARCHITECTURE_GUIDELINES.md`

Los contratos de entrada y salida deberán respetar OpenAPI y la persistencia deberá seguir las definiciones de DynamoDB.

## Consideraciones técnicas

- Implementar la funcionalidad siguiendo Clean Architecture y la separación por módulos del BAAS.
- Utilizar DynamoDB Single Table Design.
- No utilizar operaciones `Scan`.
- Implementar las validaciones y restricciones de autorización correspondientes.
- Utilizar `@nestjs/authentication` como paquete de autenticación establecido para el proyecto, verificando previamente su disponibilidad y capacidades.
- Utilizar un algoritmo seguro y adecuado para el almacenamiento de contraseñas.
- No implementar mecanismos de autenticación propios cuando exista una capacidad equivalente en las dependencias establecidas.
- Mantener la implementación de autenticación desacoplada de Domain y Application.
- No introducir dependencias ni abstracciones innecesarias.
- No modificar funcionalidades ajenas a esta historia de usuario.

## Definition of Done (DoD)

- [ ] La funcionalidad cumple todos los criterios de aceptación.
- [ ] La implementación respeta los cinco documentos de referencia.
- [ ] Se verificó la disponibilidad de `@nestjs/authentication` y se integraron sus capacidades aplicables.
- [ ] Todos los tests relacionados con la funcionalidad se completaron y pasan correctamente.
- [ ] No se modificó código innecesario.
- [ ] No se realizaron refactorizaciones ajenas al alcance de la historia.
- [ ] No se introdujeron cambios que afecten funcionalidades existentes.
- [ ] La implementación está lista para revisión.

## Estado de la historia

La historia permanecerá en estado `approved` durante su implementación. Una vez completados todos los puntos del Definition of Done, cambiará a `under review` para su revisión.