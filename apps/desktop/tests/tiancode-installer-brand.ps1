<# Capture the shipped installer from welcome through completion in both themes. #>
[CmdletBinding()]
param([Parameter(Mandatory)][string]$Installer, [Parameter(Mandatory)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'windows-installer-ui.ps1')
[InstallerCapture]::Initialize()
[InstallerCapture]::ProductName = 'TianCode'
New-Item -ItemType Directory -Force $OutputDirectory | Out-Null
$identity = (Get-Item -LiteralPath $Installer).VersionInfo
if ($identity.ProductName -ne 'TianCode') { throw "Unexpected installer product: $($identity.ProductName)" }
$icon = [Drawing.Icon]::ExtractAssociatedIcon($Installer)
try {
    $bitmap = $icon.ToBitmap()
    try { $bitmap.Save((Join-Path $OutputDirectory 'installer-icon.png'), [Drawing.Imaging.ImageFormat]::Png) }
    finally { $bitmap.Dispose() }
} finally { $icon.Dispose() }
[InstallerCapture]::AssertIcon((Join-Path $OutputDirectory 'installer-icon.png'), (Join-Path $PSScriptRoot '../resources/TianCode.ico'))
$root = Join-Path ([IO.Path]::GetTempPath()) ('tiancode-installer-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $root | Out-Null
$installPath = Join-Path $root 'TianCode'
$copy = @{}
Get-Content (Join-Path $PSScriptRoot '../installer/strings.nsh') -Encoding UTF8 | ForEach-Object {
    if ($_ -match '^LangString (INSTALLER_\w+) \$\{LANG_(ENGLISH|SIMPCHINESE)\} "(.*)"$') {
        if (-not $copy.ContainsKey($Matches[2])) { $copy[$Matches[2]] = @{} }
        $copy[$Matches[2]][$Matches[1]] = $Matches[3]
    }
}
$processes = [Collections.Generic.List[Diagnostics.Process]]::new()
function Assert-Brand([Diagnostics.Process]$Process, [string]$Stage) {
    $text = [InstallerCapture]::Caption([InstallerCapture]::Find($Process.Id)) + [Environment]::NewLine + [InstallerCapture]::VisibleText($Process.Id)
    if ($text -match '(?i)deepseek|\bDSH\b') { throw "Unexpected product text on $Stage`: $text" }
    $text | Set-Content (Join-Path $OutputDirectory "$Stage-text.txt") -Encoding UTF8
}
function Save-Brand([IntPtr]$Window, [string]$Stage, [string]$Theme) {
    $capture = Join-Path $OutputDirectory "$Stage.png"
    [void][InstallerCapture]::Save($Window, $capture)
    $asset = if ($Theme -eq 'dark') { 'brand-dark-2x.bmp' } else { 'brand-2x.bmp' }
    [InstallerCapture]::AssertBrandImage($capture, (Join-Path $PSScriptRoot "../.desktop-build/targets/win-x64/installer-ui/$asset"))
}
function Wait-Until([scriptblock]$Condition, [Diagnostics.Process]$Process, [int]$Seconds = 120) {
    $timer = [Diagnostics.Stopwatch]::StartNew()
    do {
        if ($Process.HasExited) { throw "Installer exited unexpectedly: $($Process.ExitCode)" }
        if (& $Condition) { return }
        Start-Sleep -Milliseconds 25
    } while ($timer.Elapsed.TotalSeconds -lt $Seconds)
    throw "Installer condition timed out: $([InstallerCapture]::VisibleText($Process.Id))"
}
try {
    foreach ($theme in @('light', 'dark')) {
        $process = Start-Process -FilePath $Installer -ArgumentList "/THEME=$theme /D=$installPath" -PassThru
        $processes.Add($process)
        Wait-Until { [InstallerCapture]::Find($process.Id) -ne [IntPtr]::Zero } $process
        $window = [InstallerCapture]::Find($process.Id)
        Wait-Until { [InstallerCapture]::GetProp($window, 'HarnessInstaller.Presented') -ne [IntPtr]::Zero } $process
        [InstallerCapture]::Reveal($window)
        $languages = @($copy.Keys | Where-Object {
            [InstallerCapture]::FindButton($process.Id, $copy[$_].INSTALLER_INSTALL) -ne [IntPtr]::Zero
        })
        if ($languages.Count -ne 1) { throw 'Could not identify the installer language' }
        $strings = $copy[$languages[0]]
        Assert-Brand $process "$theme-welcome"
        Save-Brand $window "$theme-welcome" $theme
        [InstallerCapture]::Click([InstallerCapture]::FindButton($process.Id, $strings.INSTALLER_INSTALL))
        $progressCaptured = $false
        Wait-Until {
            if (-not $progressCaptured -and [InstallerCapture]::FindClass($window, 'HarnessInstallerProgress') -ne [IntPtr]::Zero) {
                Assert-Brand $process "$theme-progress"
                Save-Brand $window "$theme-progress" $theme
                $script:progressCaptured = $true
            }
            [InstallerCapture]::FindButton($process.Id, $strings.INSTALLER_FINISH) -ne [IntPtr]::Zero
        } $process 300
        if (-not $progressCaptured) { throw 'The shipped progress page was not captured' }
        if ([InstallerCapture]::GetProp($window, 'HarnessInstaller.CompletedPercent').ToInt32() -ne 100) {
            throw 'Installation did not report successful completion'
        }
        if (-not (Test-Path -LiteralPath (Join-Path $installPath 'TianCode.exe'))) { throw 'TianCode.exe is missing after installation' }
        Assert-Brand $process "$theme-finish"
        Save-Brand $window "$theme-finish" $theme
        $launch = [InstallerCapture]::FindText($process.Id, $strings.INSTALLER_LAUNCH)
        if ([InstallerCapture]::SendMessage($launch, 0xF0, [IntPtr]::Zero, [IntPtr]::Zero).ToInt32() -eq 1) {
            [InstallerCapture]::Click($launch)
            Wait-Until { [InstallerCapture]::SendMessage($launch, 0xF0, [IntPtr]::Zero, [IntPtr]::Zero).ToInt32() -eq 0 } $process
        }
        [InstallerCapture]::Click([InstallerCapture]::FindButton($process.Id, $strings.INSTALLER_FINISH))
        if (-not $process.WaitForExit(30000) -or $process.ExitCode -ne 0) { throw 'Installer did not exit successfully' }
    }
    'Shipped TianCode installer welcome, progress and completion checks passed in light and dark themes.' |
        Set-Content (Join-Path $OutputDirectory 'result.txt') -Encoding UTF8
} finally {
    foreach ($process in $processes) {
        if (-not $process.HasExited) { $process.Kill(); $process.WaitForExit() }
    }
    $uninstaller = Join-Path $installPath 'Uninstall TianCode.exe'
    if (Test-Path -LiteralPath $uninstaller) {
        $ownedUninstaller = Join-Path $root 'uninstall-copy.exe'
        Copy-Item -LiteralPath $uninstaller -Destination $ownedUninstaller
        $cleanup = Start-Process -FilePath $ownedUninstaller -ArgumentList "/S /KEEP_APP_DATA _?=$installPath" -PassThru
        if (-not $cleanup.WaitForExit(60000)) { $cleanup.Kill(); $cleanup.WaitForExit(); throw 'Installer verification cleanup timed out' }
        if ($cleanup.ExitCode -ne 0) { throw "Installer verification cleanup failed: $($cleanup.ExitCode)" }
    }
    $cleanupTimer = [Diagnostics.Stopwatch]::StartNew()
    while (Test-Path -LiteralPath (Join-Path $installPath 'TianCode.exe')) {
        if ($cleanupTimer.Elapsed.TotalSeconds -gt 60) { throw 'Installed application files remain after verification cleanup' }
        Start-Sleep -Milliseconds 100
    }
    if (Test-Path -LiteralPath $root) { Remove-Item -LiteralPath $root -Recurse -Force }
}
