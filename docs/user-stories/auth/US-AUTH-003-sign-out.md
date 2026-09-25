## Historia de usuario

Como usuario autenticado de Vera Balance,
quiero cerrar mi sesión,
para finalizar mi acceso autenticado al sistema.

Scope: Backend
Status: Approved

## Descripción

El sistema debe permitir cerrar la sesión actual de un usuario autenticado eliminando la cookie utilizada para transportar el JWT de sesión.

## Criterios de aceptación

### CA-01 - Requerir sesión

Dado que se solicita cerrar sesión,
cuando se recibe la solicitud,
entonces debe existir una sesión autenticada válida.

### CA-02 - Obtener sesión

Dado que existe una sesión autenticada,
cuando se solicita cerrar sesión,
entonces el JWT debe obtenerse desde la cookie de sesión.

### CA-03 - Eliminar cookie

Dado que existe una sesión autenticada,
cuando se ejecuta el cierre de sesión,
entonces el sistema debe eliminar la cookie de sesión.

### CA-04 - Proteger JWT

Dado que se cierra la sesión,
cuando se genera la respuesta,
entonces el JWT no debe formar parte del body.

### CA-05 - Respuesta

Dado que la sesión fue cerrada correctamente,
cuando finaliza la operación,
entonces el sistema debe devolver la respuesta definida para el endpoint.

## Reglas de negocio

* El cierre de sesión requiere una sesión autenticada.
* La sesión debe obtenerse desde la cookie.
* El JWT no debe recibirse mediante el body.
* El JWT no debe exponerse en la respuesta.
* El cierre de sesión debe eliminar la cookie utilizada por el cliente.

## Dependencias

* Sesión autenticada.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* La manipulación de la cookie debe mantenerse fuera del dominio.

## Referencias

* `docs/baas-vera-balance-dashboard.yaml`
* `docs/DEFINITIONS.md`
* `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] La implementación fue revisada.
