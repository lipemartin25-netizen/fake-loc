$ErrorActionPreference = 'Stop'
try {
  Write-Host "Java:"; if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw 'JDK não encontrado; instale JDK 17.' }
  java -version
  $sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { throw 'Defina ANDROID_HOME ou ANDROID_SDK_ROOT nesta sessão.' }
  if (-not (Test-Path $sdk)) { throw "SDK não encontrado: $sdk" }
  Write-Host "Android SDK: $sdk"
} catch { Write-Error $_; exit 1 }
