---
name: feedback-workflow
description: Correcciones y preferencias sobre cómo trabajar — lo que Claude debe y NO debe hacer en este proyecto
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 172668d7-4101-4f06-b7ef-9ea8fdb021ed
---

## Regla: Siempre generar HTML antes de cualquier acción en Jira
Flujo obligatorio: resultado.json → gen_report.js → HTML preview → usuario aprueba → recién ejecutar en Jira.

**Why:** El usuario fue explícito en que quiere revisar el reporte HTML antes de que Claude haga cualquier cosa en Jira. En sesiones anteriores Claude saltó este paso y el usuario lo corrigió.

**How to apply:** En TODA prueba, sin excepción, generar el HTML y mostrarlo al usuario antes de subir evidencia o transicionar tickets.

---

## Regla: NUNCA hacer cosas inline, siempre delegar a sub-agents
playwright-cli, toma de screenshots, análisis de elementos — todo va al qa-executor. El contexto principal no se ensucia.

**Why:** El usuario notó que Claude dejó de delegar y empezó a hacer todo inline, lo que llena el contexto y hace que las sesiones largas se vuelvan lentas.

**How to apply:** Si el próximo paso es ejecutar algo en el browser → invocar qa-executor. Si es leer un ticket → invocar qa-planner.

---

## Regla: Transición bugs = "APROBADO POR QA" (ID 81), NUNCA "HECHO"
**Why:** "HECHO" es un estado incorrecto en el flujo GxP. El usuario lo ha corregido múltiples veces.

---

## Regla: Resultado JSON va en evidencia/PRDTEST-XXX/, no en plantillas/
**Why:** gen_report.js espera `evidencia/PRDTEST-XXX/resultado.json`. Si va en plantillas/, el reporte falla.

---

## Confirmado por el usuario (2026-06-09)
`d:/qa-prdtest/` es el mejor proyecto de todos los intentados. No sugerir alternativas ni volver a versiones anteriores.

**Relacionado con:** [[project-prdtest]]
