---
description: Suite de regresiÃ³n rÃ¡pida sobre el perfil indicado. Uso /regresion [perfil]
---

Voy a ejecutar la suite de regresiÃ³n para el perfil **$ARGUMENTS**.

Identifica el perfil:
- `hcp-ve` â†’ HCP Venezuela
- `hcp-br` â†’ HCP Brasil
- `hcp-usa` â†’ HCP USA (Labcorp)
- `hcp-gulf` â†’ HCP Saudi Arabia
- `hi-ve` â†’ HI Venezuela
- `hi-jp` â†’ HI Japan
- `ct` â†’ Control Tower (Connect)
- `labcorp` â†’ Labcorp (Connect)

Casos tÃ­picos por perfil:
1. Login exitoso
2. NavegaciÃ³n mÃ³dulos
3. Crear muestra/TRF (si aplica)
4. Solicitar pickup (si aplica al flujo)
5. Verificar email Marken/NBCC
6. Logout

Output: reporte HTML en `reportes/regresion-[perfil]-[YYYY-MM-DD].html`

**Workflow:** invoco a qa-executor con plan de regresiÃ³n pre-armado para ese perfil.

Procediendo...
