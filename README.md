# qa-prdtest

Proyecto QA PRDTEST (TBTB Global) â€” GxP/Xray.
VersiÃ³n v3 con sub-agents oficiales, slash commands, hooks y comparador visual.

## ðŸš€ Arrancar

```bash
cd D:\qa-prdtest
code .
```

Dentro de Claude Code:
```
/probar-hu PRDTEST-22 HCP Venezuela
```

## ðŸŽ¯ Slash commands

| Comando | QuÃ© hace |
|---|---|
| `/probar-hu PRDTEST-XXX [perfil]` | Workflow completo |
| `/crear-bug` | Crea bug Jira (tras aprobaciÃ³n) |
| `/regresion [perfil]` | Suite de regresiÃ³n |
| `/verificar-email [marken\|nbcc]` | Verifica yopmail |
| `/actualizar-indice` | Regenera reportes/index.html |

## ðŸ¤– Sub-agents (.claude/agents/)

- **qa-planner** â†’ lee Jira y arma plan
- **qa-executor** â†’ ejecuta con playwright-cli
- **bug-reporter** â†’ formatea bugs con reglas PRDTEST

## ðŸŒ Mapa paÃ­s â†’ courier â†’ email

| PaÃ­s | Courier | Email destino | Adjuntos |
|---|---|---|---|
| 96 sin RC | Marken | soportetbtb@yopmail.com | Booking+Proforma+TRFs |
| 12 con RC | Marken (CT) | soportetbtb | Todos |
| Brasil | Marken (Humania) | soportetbtb | Todos |
| USA | FedEx (PSC) | (consultar) | TRFs |
| Gulf | NBCC | ajahlan@bloodandcancer.org | **Solo TRFs** |

## ðŸ“Š Reportes

```bash
node gen_report.js --json plantillas/ejemplo-reporte.json --ticket PRDTEST-17
node gen_compare.js   # comparador visual baseline vs actual
node gen_index.js     # regenera Ã­ndice
start reportes/index.html
```

## ðŸ†• Mejoras v3 vs qa-rdstp

| Mejora | Beneficio |
|---|---|
| Sub-agents oficiales | Contexto separado â†’ Claude no se ralentiza |
| Slash commands | Atajos para tareas comunes |
| Hook post-test | Auto-regenera Ã­ndice |
| Comparador visual | Detecta cambios UI vs baseline |
| Todos los flujos detallados | A/B/C/D-Brasil/USA/Gulf/Collection |
| Tabla paÃ­s â†’ courier â†’ email | DecisiÃ³n rÃ¡pida sin pensar |
| Reglas de negocio crÃ­ticas | Anti-falsos bugs documentado |
| HTML mejorado | Lightbox, filtros, donut, dark mode, PDF, copiar Jira |
| Plantillas por flujo | Reuso entre Tests |
| Helper yopmail | VerificaciÃ³n sistematizada |
| Sin plugins externos | No depende de neonwatty u otros que fallan |
| RDSTP â†’ PRDTEST | Yohann Pardo asignado |

## ðŸ“ Estructura

```
qa-prdtest/
â”œâ”€â”€ CLAUDE.md
â”œâ”€â”€ .claude/
â”‚   â”œâ”€â”€ agents/    â† qa-planner, qa-executor, bug-reporter
â”‚   â”œâ”€â”€ commands/  â† /probar-hu, /crear-bug, /regresion, etc.
â”‚   â””â”€â”€ hooks/     â† post-test.ps1
â”œâ”€â”€ planes/        â† planes markdown
â”œâ”€â”€ plantillas/    â† JSONs por flujo
â”œâ”€â”€ helpers/       â† yopmail
â”œâ”€â”€ evidencia/
â”‚   â”œâ”€â”€ baseline/  â† para comparador visual
â”‚   â”œâ”€â”€ regresion/
â”‚   â””â”€â”€ PRDTEST-XXX/
â”œâ”€â”€ gen_report.js
â”œâ”€â”€ gen_compare.js â† NUEVO: comparador visual
â”œâ”€â”€ gen_index.js
â””â”€â”€ reportes/      â† incluye index.html navegable
```
