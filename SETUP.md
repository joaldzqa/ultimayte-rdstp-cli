# 🚀 Setup QA RDSTP — Stack completo 2026
# Ejecuta estos comandos en orden en la terminal

## PRE-REQUISITO: Node.js instalado
node --version   # debe ser v18 o superior
npm --version

## PASO 1 — Instala las herramientas globales
npm install -g @playwright/cli@latest
npm install -g @qaskills/cli

## PASO 2 — Crea la carpeta del proyecto
mkdir qa-rdstp
cd qa-rdstp
mkdir planes reportes

## PASO 3 — Inicializa Playwright CLI
playwright-cli install
playwright-cli install --skills

## PASO 4 — Instala QA Skills especializadas
npx @qaskills/cli init
npx @qaskills/cli add playwright-e2e-testing --agent claude-code
npx @qaskills/cli add accessibility-axe-pa11y --agent claude-code
npx @qaskills/cli add test-data-factories-faker --agent claude-code

## PASO 5 — Instala el plugin de 6 agentes QA
claude plugin marketplace add neonwatty/qa-skills
claude plugin install qa-skills@neonwatty-qa

## PASO 6 — Agrega el MCP de Playwright a Claude Code
claude mcp add playwright npx @playwright/mcp@latest

## PASO 7 — Verifica todo instalado
playwright-cli --version
npx @qaskills/cli list
claude mcp list

## PASO 8 — Copia el CLAUDE.md en la carpeta qa-rdstp
# (descarga el archivo CLAUDE.md y ponlo aquí)

## PASO 9 — Abre en VS Code
code .

## ✅ LISTO
# Abre Claude Code dentro de la carpeta qa-rdstp
# y dile: "prueba la HU RDSTP-796"
# Él hará todo el resto solo.
