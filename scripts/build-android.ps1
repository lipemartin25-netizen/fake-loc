param([switch]$Rebuild)
$ErrorActionPreference = 'Stop'
try {
  & "$PSScriptRoot/diagnostico.ps1"; if ($LASTEXITCODE -ne 0) { throw 'Diagnóstico falhou.' }
  $gradle = Join-Path $PSScriptRoot '../android/gradlew.bat'
  if (-not (Test-Path $gradle)) { throw 'Gradle Wrapper ausente. Gere/adicione o wrapper oficial.' }
  $args = @(':app:assembleDebug', ':app:testDebugUnitTest'); if ($Rebuild) { $args = @('--rerun-tasks') + $args }
  & $gradle @args; if ($LASTEXITCODE -ne 0) { throw "Gradle terminou com código $LASTEXITCODE" }
  $apk = Join-Path $PSScriptRoot '../android/app/build/outputs/apk/debug/app-debug.apk'
  if (-not (Test-Path $apk)) { throw 'Build terminou sem produzir o APK esperado.' }
  Get-Item $apk | Select-Object FullName,Length,LastWriteTime
  Get-FileHash $apk -Algorithm SHA256
} catch { Write-Error $_; exit 1 }
