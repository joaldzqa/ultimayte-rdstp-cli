# Hook post-test
# Se ejecuta automÃ¡ticamente despuÃ©s de cada generaciÃ³n de reporte
# Regenera el Ã­ndice reportes/index.html

param(
    [string]$ProjectRoot = $PSScriptRoot
)

$projectDir = (Get-Item $PSScriptRoot).Parent.Parent.FullName
Push-Location $projectDir
try {
    if (Test-Path "gen_index.js") {
        Write-Host "ðŸ”„ Regenerando Ã­ndice de reportes..." -ForegroundColor Cyan
        node gen_index.js
        Write-Host "âœ… Ãndice actualizado" -ForegroundColor Green
    }
} catch {
    Write-Host "âš ï¸ No se pudo regenerar Ã­ndice: $_" -ForegroundColor Yellow
} finally {
    Pop-Location
}
