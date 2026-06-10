---
name: project-prdtest
description: Estado y arquitectura del proyecto qa-prdtest — el más completo de todos los proyectos QA del usuario
metadata: 
  node_type: memory
  type: project
  originSessionId: 172668d7-4101-4f06-b7ef-9ea8fdb021ed
---

**Proyecto activo:** `d:/qa-prdtest/` — este es el proyecto principal y más completo.

**Why:** Evolucionó de qa-rdstp y qa-prdtest-cdp hasta tener la arquitectura correcta: agentes separados, slash commands, Jira helpers probados en producción.

**How to apply:** En futuras sesiones, usar este proyecto como referencia. No sugerir volver a qa-rdstp ni al enfoque code-based de qa-prdtest-cdp.

---

## Otros proyectos en disco (historial)

| Ruta | Qué es | Estado |
|---|---|---|
| `d:/qa-rdstp/` | Versión anterior, misma app, sin slash commands ni .claude/agents/ | Obsoleto |
| `d:/pruebas qa/qa-prdtest-cdp/` | Enfoque code-based con playwright.config.ts y Node | Experimento descartado |
| `d:/pruebas qa/qa-rdstp/` | Copia de qa-rdstp | Obsoleto |

**Conclusión confirmada por el usuario (2026-06-09):** `d:/qa-prdtest/` es el mejor y más completo de todos.

---

## Arquitectura del proyecto (2026-06-09)

- 3 sub-agents: `qa-planner`, `qa-executor`, `bug-reporter`
- 6 slash commands: `/probar-hu`, `/verificar-bug`, `/crear-bug`, `/regresion`, `/verificar-email`, `/actualizar-indice`
- Storage state con `playwright-cli --profile=.playwright/profiles/<perfil>`
- Jira transitions documentadas: APROBADO POR QA = 81, En espera = 41, PUBLICADO EN QA = 61
- Helper `add-evidence-comment.js` para subir screenshots con type:file (UUID real)
- `gen_report.js` para reportes HTML antes de cualquier acción en Jira

## Próxima mejora pendiente (pendiente de aprobación del usuario)
- Migrar de playwright-cli a `@playwright/mcp` (Microsoft, 2025) — usa árbol de accesibilidad, más rápido
- Requiere reescribir comandos del executor — consultar antes de hacer

**Relacionado con:** [[user-profile]], [[feedback-workflow]]
