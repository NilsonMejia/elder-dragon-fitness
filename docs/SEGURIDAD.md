# Revisión del entorno y dependencias

Revisión realizada el 20 de septiembre de 2026 en Windows x64.

## Node.js y npm

Se verificó el ejecutable instalado antes de utilizarlo:

- Node.js 24.21.0 LTS, npm 11.19.0.
- Firma Authenticode válida, emitida a OpenJS Foundation.
- SHA256 de `node.exe`: `ba4e6d110e8c1592a1ecd390f6b05f3da124b13871a5be62b341a07a853c6c32`.
- El hash coincide con `win-x64/node.exe` en los [SHASUMS oficiales](https://nodejs.org/download/release/v24.21.0/SHASUMS256.txt).
- [Publicación oficial de Node.js 24.21.0](https://nodejs.org/en/blog/release/v24.21.0).

El script `scripts/verify-node.ps1` repite la comprobación local sin ejecutar Node. Su hash corresponde exclusivamente a Windows x64. `.nvmrc`, `.node-version` y `engines` fijan la versión revisada; no instalan Node automáticamente.

## Paquetes

La revisión inicial detectó `uuid@8.3.2` a través de ExcelJS, afectado por [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq). Se sustituyó ExcelJS por `write-excel-file@4.1.1`, se eliminó una dependencia redundante de la raíz y se fijaron las versiones directas.

Resultado final del registro oficial de npm:

| Proyecto | Vulnerabilidades conocidas (`npm audit`) | Firmas verificadas | Atestaciones verificadas |
| --- | ---: | ---: | ---: |
| Raíz | 0 | 20 | 2 |
| Backend | 0 | 105 | 5 |
| Frontend | 0 | 211 | 71 |

No se detectaron firmas inválidas. La alerta inicial era una vulnerabilidad; no constituye evidencia de que el paquete estuviera infectado. Verificar firmas, integridad y alertas conocidas no garantiza la ausencia absoluta de código malicioso o vulnerabilidades todavía desconocidas.

Los tres `.npmrc` fijan `registry=https://registry.npmjs.org/`, `engine-strict=true`, `save-exact=true` e `ignore-scripts=true`. Esto evita ejecutar automáticamente scripts de los paquetes durante la instalación. Los comandos explícitos como `npm run dev`, `npm test` y `npm run build` siguen disponibles. Se comprobaron bcrypt, Vite y las descargas XLSX/PDF con esta configuración.

## Repetir la revisión

Desde la raíz del proyecto:

```powershell
.\scripts\verify-node.ps1
npm.cmd audit
npm.cmd --prefix backend audit
npm.cmd --prefix frontend audit
npm.cmd audit signatures
npm.cmd --prefix backend audit signatures
npm.cmd --prefix frontend audit signatures
```

Para actualizar Node, revisa la publicación y los SHASUMS oficiales de la nueva versión y actualiza conjuntamente los tres `engines`, `packageManager`, `.nvmrc`, `.node-version` y el hash del verificador. Para actualizar paquetes, revisa sus versiones y cambios, conserva los lock y vuelve a ejecutar auditorías, pruebas, lint y build. No uses `npm audit fix --force` como sustituto de esta revisión.
