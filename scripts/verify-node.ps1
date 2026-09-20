$ErrorActionPreference = 'Stop'
$nodePath = (Get-Command node -ErrorAction Stop).Source
$nodeSignature = Get-AuthenticodeSignature -LiteralPath $nodePath
$expectedHash = 'ba4e6d110e8c1592a1ecd390f6b05f3da124b13871a5be62b341a07a853c6c32'
$actualHash = (Get-FileHash -LiteralPath $nodePath -Algorithm SHA256).Hash
if ($actualHash -ne $expectedHash) {
    throw 'El ejecutable no coincide con Node.js 24.21.0 oficial para Windows x64. Verifica la versión y sus SHASUMS en nodejs.org antes de usarlo.'
}
if ($nodeSignature.Status -ne 'Valid' -or $nodeSignature.SignerCertificate.Subject -notmatch 'OpenJS Foundation') {
    throw 'No se pudo validar la firma de OpenJS Foundation.'
}
Write-Output 'Node.js 24.21.0 Windows x64: SHA256 y firma de OpenJS verificados.'
