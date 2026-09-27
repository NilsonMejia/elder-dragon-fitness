# Entregable 2: avance y cierre de correcciones

Fecha de preparación: 26 de septiembre de 2026.

Este documento reúne la matriz, las correcciones y el material de exposición. El alcance de referencia es la lista funcional entregada por el usuario y la rúbrica del PDF **Entregable 2 - Entrega de Propuesta de SISTEMA.pdf**. No se recibió la propuesta técnica original; la comparación con sus tecnologías, modelo de datos e identificadores sigue pendiente del equipo.

La [revisión inicial](REVISION_ENTREGABLE_2.md) se conserva como evidencia histórica: sus errores y porcentajes describen el estado inspeccionado antes de las correcciones. No debe sustituirse su resultado por una afirmación retrospectiva de que todo funcionaba.

## Matriz de requisitos

Se mantienen los 14 criterios `REV-*` de la auditoría para permitir la comparación. La matriz editable es [MATRIZ_ENTREGABLE_2.csv](MATRIZ_ENTREGABLE_2.csv). Sus IDs son de revisión, no los IDs de una propuesta original desconocida. Los 14 criterios están verificados al cierre: 14/14, equivalente al 100 % de este recuento funcional con pesos iguales. Esto no certifica el 100 % de la entrega académica ni predice una nota: siguen pendientes el ensayo humano y la comparación con la propuesta técnica original. El recuento histórico de 12/14 corresponde al estado anterior.

| ID | Requisito y rol | Estado final | Avance | Evidencia principal |
|---|---|---|---|---|
| REV-01 | Autenticación, contraseñas protegidas y permisos por rol | Verificado | 100 % | `backend/controllers/authController.js`, `backend/middleware/authMiddleware.js`, `backend/test/workflows.test.js` |
| REV-02 | CRUD administrativo de usuarios | Verificado | 100 % | `backend/controllers/adminController.js`, `backend/test/workflows.test.js` |
| REV-03 | CRUD de clientes por recepción | Verificado | 100 % | `backend/controllers/recepcionController.js`, `backend/scripts/browser-check.js` |
| REV-04 | Gestión de planes por administrador | Verificado | 100 % | `backend/controllers/adminController.js`, `frontend/src/views/admin/Planes.jsx` |
| REV-05 | Consulta y verificación de membresías por recepción | Verificado | 100 % | `backend/controllers/recepcionController.js`, `backend/test/workflows.test.js` |
| REV-06 | Registro/cobro de mensualidades por recepción | Verificado | 100 % | `backend/controllers/recepcionController.js`, `frontend/src/components/PaymentForm.jsx`, `backend/test/workflows.test.js` |
| REV-07 | Estados y vencimientos automáticos | Verificado | 100 % | `backend/services/membershipService.js`, `backend/index.js`, `backend/test/workflows.test.js` |
| REV-08 | Creación de rutinas por entrenador | Verificado | 100 % | `backend/controllers/deportivoController.js`, `backend/test/workflows.test.js` |
| REV-09 | Asignación personalizada de rutinas | Verificado | 100 % | `backend/controllers/assignmentController.js`, `backend/test/workflows.test.js` |
| REV-10 | Seguimiento de rutinas por cliente y entrenador | Verificado | 100 % | `backend/controllers/assignmentController.js`, `backend/test/workflows.test.js`, `backend/test/delivery-demo.test.js` |
| REV-11 | Ejercicios, series, repeticiones, peso y descanso | Verificado | 100 % | `frontend/src/components/ExerciseEditor.jsx`, `backend/database/migrations/001_complete_workflows.sql` |
| REV-12 | Dashboard: ingresos, clientes activos y morosos | Verificado | 100 % | `backend/controllers/adminController.js`, `backend/scripts/browser-check.js` |
| REV-13 | Reportes PDF y Excel del administrador | Verificado | 100 % | `frontend/src/views/admin/Reportes.jsx`, `backend/scripts/browser-check.js` |
| REV-14 | Gestión de pagos desde el panel administrativo | Verificado | 100 % | `frontend/src/views/admin/Pagos.jsx`, `frontend/src/App.jsx`, `frontend/src/components/PaymentForm.jsx` |

## Correcciones y datos deportivos

| Hallazgo | Trabajo de cierre | Resultado de cierre |
|---|---|---|
| H-01: editar usuario devuelve HTTP 500 | Tipos de parámetros SQL corregidos y revocación de sesión cubierta | Edición válida persistida; nombre conserva sesión y cambios sensibles la revocan. |
| H-02: administrador sin pagos en su panel | Ruta `/admin/pagos` con navegación administrativa y formulario compartido | Administrador consulta y registra; roles no autorizados siguen bloqueados. |
| H-03: cinco restricciones históricas pendientes | `004_validate_data_checks.sql` | Las cinco restricciones muestran `convalidated=true`, sin alterar datos para forzar la validación. |
| H-04: importar inicia un servidor adicional | Exportación separada del arranque explícito | Importar no abre listener; arranque real y cierre de recursos comprobados. |
| Sin asignaciones ni seguimiento de muestra | `prepare-delivery-demo.js` | Rutina y seguimiento DEMO persistidos, sin duplicados ni modificaciones de usuarios ajenos. |

El preparador se ejecuta con `npm.cmd run db:delivery-demo`. Crea las cuentas `entrenador.entrega@example.invalid` y `cliente.entrega@example.invalid`, una asignación con dos ejercicios y un seguimiento marcado como simulado. No crea pagos ni membresías. Las cuentas aparecen en listados y recuentos: deben identificarse como datos de muestra. Conserva las contraseñas existentes y rechaza colisiones de identidad.

La prueba aislada del preparador pasó en una base temporal; demuestra repetibilidad, conservación de datos ajenos y contraseñas, y rechazo de identidades incompatibles. La ejecución local posterior quedó confirmada con los recuentos siguientes.

## Resultados finales de ejecución

Verificados el 26 de septiembre de 2026 (hora de El Salvador).

| Verificación | Resultado |
|---|---|
| `npm.cmd test` | 19 pruebas aprobadas, 0 fallos; incluye edición, sesiones, restricciones, importación y cierre del servidor. |
| `npm.cmd --prefix frontend run lint` | Aprobado. |
| `npm.cmd run build` | Aprobado; advertencia de tamaño de algunos chunks, sin impedir la compilación. |
| `npm.cmd --prefix backend run test:browser` | Aprobado: edición persistente, pagos de administrador y recepción, vista móvil, permisos por rol, rutinas, seguimiento y descargas PDF/XLSX. |
| Respaldo local previo | `backend/backups/elder-dragon-2026-09-27T01-42-42-504Z.sql` |
| `npm.cmd run db:migrate` | Aplicada 004; las cinco restricciones muestran `convalidated=true`. |
| `npm.cmd run db:delivery-demo` | Creados entrenador 26, cliente 27, asignación 1 y seguimiento 1 de muestra. |

La base local pasó de 24 a 26 usuarios y de cero a una asignación y un seguimiento. Conserva 20 pagos y 20 membresías. Los cobros de las pruebas se ejecutaron en bases temporales, que se eliminaron al terminar. Las pruebas de correo utilizan simulaciones y no certifican entrega real.

Capturas locales: `.reports/admin-payments-desktop.png` y `.reports/admin-payments-mobile.png`, además de las evidencias de entrenador/cliente y notificaciones. La carpeta `.reports` y los respaldos están excluidos de Git; los comandos incluidos permiten reproducir las pruebas. No publicar credenciales, respaldos ni capturas con datos personales junto a la evidencia.

## Materiales de exposición y pendientes humanos

- [Arquitectura y decisiones](ARQUITECTURA_Y_DECISIONES.md): organización, recorrido de solicitudes, integridad, decisiones y problemas corregidos.
- [Guion de demostración y ensayo](GUION_DEMOSTRACION.md): secuencia con cuatro roles, datos ficticios, reparto de bloques, preguntas y acta.
- [Matriz CSV](MATRIZ_ENTREGABLE_2.csv): editable para agregar los IDs oficiales y responsables.

El equipo debe asignar nombres, ensayar en la computadora de exposición y completar el acta. También debe aportar la propuesta técnica original para justificar diferencias, si las hubo. Ninguna prueba de software acredita el dominio de todos los integrantes ni reemplaza la demostración en vivo. No se predice una calificación.

## Exclusiones y límites

Aplicación móvil nativa, hardware externo, pasarela de pagos e integración con Hacienda están fuera del alcance. Los recibos son internos. El historial opcional del cliente presenta sus últimos cinco pagos. El respaldo disponible es manual. Los cambios descritos preparan la entrega local; no certifican un despliegue público.

