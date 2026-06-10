---
description: Verifica si un bug reportado ya fue corregido en el ambiente QA. Uso: /verificar-bug PRDTEST-XXX
---

Voy a verificar si el bug **$ARGUMENTS** está corregido en el ambiente QA.

## Lo que NO hago antes de tu aprobación
- NO cambio el estado del ticket en Jira
- NO subo evidencia
- Solo ejecuto, genero reporte, y te muestro

## Paso 1 — Planificación
Invoco al sub-agent `qa-planner` con estas instrucciones específicas:
- Lee el ticket del bug en Jira (descripción, pasos para reproducir, comentarios del dev)
- Genera un plan de verificación con mínimo 2 casos:
  - **TC-01 Reproducción**: intenta reproducir el bug tal como se reportó → resultado esperado: NO debe reproducirse
  - **TC-02 Flujo completo**: ejecuta el flujo completo alrededor del bug para detectar regresiones
- Identifica el perfil y ambiente correcto (App o Connect)
- Guarda el plan en `planes/plan-PRDTEST-XXX.md`

## Paso 2 — Ejecución
Invoco al sub-agent `qa-executor` para ejecutar el plan. El executor debe:
- Intentar reproducir el bug EXACTAMENTE como se describió
- Si el bug aparece de nuevo → FAIL (bug regresó o nunca se arregló)
- Si el bug NO aparece → PASS (corregido)
- Guardar JSON en `evidencia/PRDTEST-XXX/resultado.json`

## Paso 3 — Reporte
Genero el reporte HTML:
```bash
node gen_report.js --json evidencia/PRDTEST-XXX/resultado.json
```

## Paso 4 — Te presento resultado

**Si PASS (corregido):** te muestro el reporte HTML y el preview del comentario de aprobación. Espero tu "sí" para:
- Subir evidencia al ticket
- Transicionar a "APROBADO POR QA" (transition ID 81)

**Si FAIL (persiste):** te muestro la evidencia y los pasos exactos donde falló. Espero tu instrucción antes de cualquier acción en Jira.

Procediendo...
