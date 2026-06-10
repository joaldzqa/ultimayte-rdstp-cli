# setup-profile.ps1 — Guarda el estado de sesión de un perfil para usar en pruebas
# Uso: .\helpers\setup-profile.ps1 <nombre-perfil> <url>
#
# Perfiles disponibles:
#   hcp-venezuela     → App QA  (diego.rodriguez@tbtbglobal.com)
#   hcp-venezuela-alt → App QA  (anderson.garcia@yopmail.com)
#   hcp-brasil        → App QA  (testbrazilqa@yopmail.com)
#   hcp-usa           → App QA  (testlabcorpqa@yopmail.com)
#   hcp-gulf          → App QA  (gulfhcpqa@yopmail.com)
#   hi-japan          → App QA  (hijapansebas@yopmail.com)
#   control-tower     → Connect (qa.connectprd@yopmail.com)
#   humania           → Connect (qahumania@yopmail.com)

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("hcp-venezuela","hcp-venezuela-alt","hcp-brasil","hcp-usa","hcp-gulf","hi-japan","control-tower","humania")]
    [string]$Perfil,

    [Parameter(Mandatory=$false)]
    [string]$Url
)

$APP_URL     = "https://rdglobaldx.com/rdstp_app_qa"
$CONNECT_URL = "https://rdglobaldx.com/rdstp_connect_qa"

if (-not $Url) {
    $Url = if ($Perfil -in @("control-tower","humania")) { $CONNECT_URL } else { $APP_URL }
}

$profilePath = ".playwright\profiles\$Perfil"
New-Item -ItemType Directory -Force -Path $profilePath | Out-Null

Write-Host ""
Write-Host "=== Setup de perfil: $Perfil ==="
Write-Host "URL: $Url"
Write-Host "Perfil guardado en: $profilePath"
Write-Host ""
Write-Host "INSTRUCCIONES:"
Write-Host "  1. El browser se abrira en modo headed."
Write-Host "  2. Inicia sesion manualmente con las credenciales del perfil '$Perfil'."
Write-Host "  3. Una vez logueado y en la pantalla principal, cierra el browser."
Write-Host "  4. El perfil queda guardado y listo para usar en pruebas."
Write-Host ""

playwright-cli open $Url --profile=$profilePath --headed

Write-Host ""
Write-Host "Perfil '$Perfil' guardado correctamente en $profilePath"
