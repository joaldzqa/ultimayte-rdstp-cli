---
name: env-credentials
description: URLs correctas de los ambientes QA, cuentas registradas, y dónde están las credenciales Jira
metadata:
  node_type: memory
  type: project
---

## Credenciales Jira (NO están en el repo)

Las credenciales viven en DOS lugares que hay que configurar en cada PC nuevo:
1. `.env` del proyecto (gitignored) — plantilla en `.env.example`
2. `C:\Users\<usuario>\.claude\settings.json` sección `env` — para que los scripts Node las vean como `process.env.*`

Variables: `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_BASE_URL` (https://tbtbglobaltest.atlassian.net), `APP_URL`, `CONNECT_URL`.

**NUNCA leer `.env` directamente** — usar siempre `process.env.*` en scripts o `$env:*` en PowerShell.

## URLs correctas

| Sistema | URL correcta |
|---|---|
| App TpT | https://rdglobaldx.com/rdstp_app_qa |
| Connect AZ | https://rdglobaldx.com/rdstp_connect_qa |

**NUNCA usar** `rdstp_app_prd_qa` ni `rdstp_connect_prd_qa` — es otro ambiente donde varias cuentas no están registradas y los resultados serán incorrectos.

## Cuentas registradas en App TpT (`rdstp_app_qa`)

| Perfil | Email | Estado |
|---|---|---|
| HCP Venezuela | diego.rodriguez@tbtbglobal.com | ✅ activa |
| HI Venezuela | anderson.garcia.hi@yopmail.com | ✅ activa |
| HI Japan | hijapansebas@yopmail.com | ✅ activa |
| HCP Venezuela alt | anderson.garcia@yopmail.com | ❌ no registrada |
| HCP Brasil | testbrazilqa@yopmail.com | ❌ no registrada |
| HCP USA (Labcorp) | testlabcorpqa@yopmail.com | ❌ no registrada |
| HCP Saudi (Gulf) | gulfhcpqa@yopmail.com | ❌ no registrada |
| PSC Humania (App) | qahumania@yopmail.com | ❌ no registrada |

(Passwords en la tabla de credenciales del CLAUDE.md)

## Cuentas registradas en Connect AZ (`rdstp_connect_qa`)

| Perfil | Email | Estado |
|---|---|---|
| Control Tower QA | qa.connectprd@yopmail.com | ✅ activa |
| Labcorp | labcorp@yopmail.com | ✅ activa |
| Humania Brasil | qahumania@yopmail.com | ✅ activa |
| Admin TBTB | anderson.garcia@tbtbglobal.com | ❌ buzón corporativo, no verificable |

## Nota operativa
Reset passwords vía yopmail → el email de reset llega a soportetbtb@yopmail.com (no a la bandeja propia del usuario).
