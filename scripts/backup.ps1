# scripts/backup.ps1
$ErrorActionPreference = "Stop"

$stamp  = Get-Date -Format "yyyyMMdd-HHmmss"
$dest   = "backups"
$zip    = Join-Path $dest "retrograve-$stamp.zip"

New-Item -ItemType Directory -Force -Path $dest | Out-Null

$include = @(
  "app",
  "public",
  "components",
  "globals.css",
  "next.config.mjs",
  "package.json",
  "package-lock.json",
  ".env.local",
  "README.md"
) | Where-Object { Test-Path $_ }

Compress-Archive -Path $include -DestinationPath $zip -Force

Write-Host "✅ Backup created:" $zip
