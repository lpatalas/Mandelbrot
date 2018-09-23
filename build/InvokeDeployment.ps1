[CmdletBinding()]
param()

$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ..))

& "$PSScriptRoot\DeployStaticSite.ps1" `
    -PublishProfilePath "$PSScriptRoot\mandelbrot.PublishSettings" `
    -SourceFiles "$root\src\*.js", "$root\src\*.html", "$root\src\*.css"