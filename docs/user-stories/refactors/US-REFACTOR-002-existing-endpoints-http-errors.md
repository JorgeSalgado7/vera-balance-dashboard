## Historia de usuario

Como consumidor del API de Vera Balance,
quiero que los endpoints existentes utilicen respuestas de error consistentes,
para recibir el mismo comportamiento HTTP independientemente del módulo utilizado.

Scope: Backend
Status: Approved

## Descripción

El sistema debe revisar los endpoints existentes y alinear sus respuestas de error con el contrato HTTP y el mecanismo global de manejo de errores.

Este refactor no debe modificar el comportamiento exitoso ni las reglas de negocio de los endpoints existentes.

## Criterios de aceptación

### CA-01 - Revisar endpoints existentes

Dado que existen endpoints implementados,
cuando se realiza el refactor,
entonces deben revisarse los endpoints de Clinics, Users, Catalogs, Patients, Therapeutic Processes, Records y Home Works.

### CA-02 - Errores específicos

Dado que una operación produce un error conocido,
cuando se procesa el error,
entonces debe utilizarse el error específico correspondiente.

### CA-03 - Recurso inexistente

Dado que se solicita un recurso que no existe,
cuando se procesa la operación,
entonces debe devolverse la respuesta definida para un recurso no encontrado.

### CA-04 - Solicitud inválida

Dado que una solicitud no cumple con las reglas definidas,
cuando se procesa,
entonces debe devolverse la respuesta correspondiente a una solicitud inválida.

### CA-05 - Conflictos

Dado que una operación produce un conflicto conocido,
cuando se procesa,
entonces debe devolverse la respuesta definida para dicho conflicto.

### CA-06 - Errores inesperados

Dado que ocurre un error inesperado,
cuando se procesa,
entonces debe utilizarse el mecanismo global de manejo de errores.

### CA-07 - Proteger información interna

Dado que un endpoint devuelve un error,
cuando se genera la respuesta,
entonces no debe exponer información interna o sensible del sistema.

### CA-08 - Mantener respuestas exitosas

Dado que un endpoint existente funciona correctamente,
cuando se realiza este refactor,
entonces su respuesta exitosa no debe modificarse como consecuencia del cambio.

### CA-09 - Mantener reglas de negocio

Dado que existen reglas de negocio implementadas,
cuando se realiza este refactor,
entonces dichas reglas no deben modificarse salvo que sea necesario para cumplir el contrato definido.

## Reglas de negocio

* Este refactor modifica únicamente el manejo HTTP de errores de los endpoints existentes.
* Las respuestas exitosas no deben modificarse.
* Las reglas de negocio existentes deben conservarse.
* Los errores específicos deben mantenerse.
* No deben introducirse nuevos endpoints como parte de este refactor.

## Dependencias

* Estandarización del manejo global de errores.

## Consideraciones técnicas

* El contrato HTTP debe respetar `docs/baas-vera-balance-dashboard.yaml`.
* La implementación debe respetar `docs/PROJECT_ARCHITECTURE.md`.
* Debe reutilizarse el mecanismo global de manejo de errores definido por el proyecto.
* Los controladores deben mantenerse sin lógica de negocio innecesaria.

## Referencias

* `docs/baas-vera-balance-dashboard.yaml`
* `docs/DEFINITIONS.md`
* `docs/PROJECT_ARCHITECTURE.md`

## Definition of Done

* [ ] Todos los criterios de aceptación fueron implementados.
* [ ] Se agregaron o actualizaron las pruebas necesarias.
* [ ] Las pruebas pasan correctamente.
* [ ] La implementación fue revisada.
