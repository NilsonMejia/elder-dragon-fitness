# Guion y ensayo del Entregable 2

## Preparación técnica

Ejecutar los comandos desde la carpeta que contiene `backend`, `frontend` y el `package.json` principal.

```powershell
npm.cmd run db:migrate
npm.cmd run db:delivery-demo
npm.cmd run dev
```

La base debe existir y estar configurada en `backend/.env`. El preparador DEMO no sustituye la instalación inicial del esquema. En una instalación nueva, seguir primero el README. No usar `db:demo` sobre una base con datos ni ejecutar `db:seed` para repetir la presentación: ese comando restablece contraseñas de las cuentas de prueba.

Abrir `http://localhost:5173` y comprobar `http://localhost:3000/api/health`. El día de la exposición confirmar el funcionamiento con la misma computadora y conexión que se usarán ante el docente.

## Cuentas y datos de demostración

| Rol | Cuenta preparada | Pantalla |
|---|---|---|
| Entrenador DEMO | `entrenador.entrega@example.invalid` | `/entrenador` |
| Cliente DEMO | `cliente.entrega@example.invalid` | `/cliente/perfil` y `/cliente/rutina` |
| Administrador | Usar la cuenta administrativa existente y comprobada por el equipo | `/admin/dashboard`, `/admin/usuarios`, `/admin/pagos` |
| Recepción | Usar la cuenta de recepción existente y comprobada por el equipo | `/recepcion/clientes`, `/recepcion/pagos` |

Las cuentas DEMO nuevas utilizan `SEED_TEST_PASSWORD` de `backend/.env`; si no está definido, el valor de desarrollo es `Temporal123!`. Repetir el preparador **no restablece contraseñas existentes**. No publicar el `.env` ni usar contraseñas de demostración en un despliegue real.

La rutina se llama **DEMO entrega - rutina inicial** y su seguimiento indica expresamente que es simulado. El preparador no registra pagos ni membresías, no envía correos y no cambia usuarios o rutinas ajenos. Las cuentas DEMO sí aparecen en listados y recuentos de usuarios/clientes; explicar que son datos de muestra. No presentarlas como actividad real del gimnasio.

Para la parte financiera, usar una **base de ensayo** con clientes/planes/pagos de muestra. Registrar un pago durante la demostración escribe realmente en la base configurada: no hacerlo sobre una cuenta real para simular una venta. La aplicación puede demostrar los registros existentes sin generar un pago nuevo en la base operativa.

## Secuencia propuesta: 12–15 minutos

| Paso | Acción en vivo | Resultado que debe verse | Explicación |
|---|---|---|---|
| 1 | Iniciar sesión como administrador | Dashboard con ingresos, activos y morosos | De dónde provienen los indicadores y qué protege el acceso. |
| 2 | Abrir Usuarios, editar un usuario de ensayo y recargar | Cambio persistido sin error 500 | Validación, SQL parametrizado y cuándo se revoca una sesión. |
| 3 | Mostrar Planes y Pagos del administrador | Panel administrativo consistente e historial de pagos | Misma operación financiera con permisos y navegación por rol. |
| 4 | En la base de ensayo, seleccionar cliente y plan y registrar un pago | Importe, fechas calculadas e historial actualizado | Transacción, idempotencia y conservación de días prepagados. |
| 5 | Entrar como recepción y mostrar clientes/membresías | Listado y verificación del estado | Diferencia entre funciones de recepción y administración. |
| 6 | Entrar como entrenador DEMO | Rutina preparada, detalles e historial | Ejercicios, series, repeticiones, peso y descanso. |
| 7 | Entrar como cliente DEMO y abrir Mi rutina | Solo su rutina; seguimiento simulado ya disponible | La copia de la plantilla y el aislamiento por propietario. |
| 8 | Guardar otra observación marcada como ensayo | Registro persistido al recargar | Relación asignación–seguimiento–autor. |
| 9 | Volver al entrenador DEMO y abrir notificaciones | Aviso de progreso del cliente | Filtrado por rol y propietario, actualización al abrir. |
| 10 | Exportar un reporte administrativo a PDF y Excel | Archivos reales que se abren | Consulta del reporte y formato de exportación. |
| 11 | Mostrar arquitectura y matriz de avance | Correspondencia entre requisitos, pantallas, API y datos | Decisiones, problemas corregidos y límites del alcance. |

No es obligatorio ejecutar todos los CRUD completos durante la exposición si el tiempo no alcanza, pero todos deben poder demostrarse a solicitud. La automatización complementa la demostración en vivo; no la sustituye.

## Ensayo de todos los integrantes

El equipo debe asignar nombres reales y tiempos. Los siguientes son bloques de responsabilidad, no una suposición sobre cuántas personas integran el equipo; pueden distribuirse o dividirse según corresponda.

| Bloque | Responsable real | Debe poder explicar y ejecutar |
|---|---|---|
| Seguridad y arquitectura | Por asignar por el equipo | Inicio de sesión, roles, bcrypt, JWT, revocación y recorrido de una solicitud. |
| Administración y finanzas | Por asignar por el equipo | Usuarios, planes, cobro, vencimientos, dashboard y reportes. |
| Entrenamiento y cliente | Por asignar por el equipo | Plantilla, asignación independiente, seguimiento y permisos por propietario. |
| Datos, pruebas y cierre | Por asignar por el equipo | PK/FK/CHECK, migraciones, evidencia de pruebas, pendientes y exclusiones. |

Cada integrante debe ensayar también una pregunta fuera de su bloque. El dominio técnico humano no se marca como realizado por haber pasado pruebas de software.

Preguntas de ensayo:

1. ¿Qué evita que un cliente abra datos de otro cliente cambiando un ID?
2. ¿Por qué una edición del nombre conserva la sesión y un cambio de contraseña puede revocarla?
3. ¿Qué ocurre al reintentar un pago cuya respuesta se perdió?
4. ¿Qué sucede con la rutina asignada cuando cambia la plantilla original?
5. ¿Cuál es la diferencia entre una clave foránea, un CHECK y una validación en la API?
6. ¿Por qué una tabla con datos y una pantalla visible no bastan para decir que un requisito está terminado?
7. ¿Qué queda explícitamente fuera del alcance y qué no debe presentarse como función implementada?

## Acta de ensayo para completar por el equipo

- Fecha y computadora utilizadas: ____________________
- Integrantes presentes y bloque ejecutado: ____________________
- Duración real: ____________________
- Pasos que fallaron y corrección acordada: ____________________
- Fecha de repetición si aplica: ____________________
- Confirmación de que todos pueden explicar su parte: ____________________

Este espacio se deja pendiente deliberadamente: el ensayo debe realizarlo el equipo, no se presume realizado.
