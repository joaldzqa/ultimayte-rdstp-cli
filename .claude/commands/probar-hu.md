---
description: Workflow completo de prueba de una HU/Test PRDTEST. Uso /probar-hu PRDTEST-XXX [perfil]
---

Voy a probar el ticket **$ARGUMENTS**.

Paso 1: invoco al sub-agent `qa-planner` para que lea el ticket y genere el plan.

Paso 2: cuando el plan estÃ© listo, invoco a `qa-executor` para ejecutarlo con playwright-cli.

Paso 3: si hay FAILs, invoco a `bug-reporter` para que prepare el preview de bugs.

Paso 4: te presento:
- Reporte HTML generado con `node gen_report.js`
- Preview de bugs (si los hay) para tu aprobaciÃ³n

**Recordatorio:** NO creo nada en Jira hasta que tÃº apruebes.

Procediendo...
