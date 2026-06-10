---
description: Crea bug en Jira PRDTEST con TODAS las reglas (tras aprobaciÃ³n). Uso /crear-bug
---

Voy a crear los bugs aprobados en Jira PRDTEST.

**Antes de proceder, voy a confirmar contigo:**

1. Â¿CuÃ¡les bugs del Ãºltimo preview apruebas crear? (todos / ninguno / lista especÃ­fica)
2. Â¿AlgÃºn ajuste de severidad o descripciÃ³n antes de crear?

Una vez confirmes, aplicarÃ© para CADA bug:

| Campo | Valor |
|---|---|
| Proyecto | PRDTEST |
| Label | `PRDTEST` |
| Fix Version | `1.0.0-app` o `1.0.0-connect` (segÃºn mÃ³dulo) |
| Sprint | Activo (JQL: `project=PRDTEST AND sprint in openSprints()` â†’ `customfield_10020`) |
| Asignado | Yohann Pardo |
| DescripciÃ³n | EspaÃ±ol, contentFormat: markdown |
| Link al Requerimiento | "Blocks" â†’ al ticket padre |
| TransiciÃ³n Requerimiento | `"En espera"` (transition ID 7) |

**Confirmar antes de proceder.**
