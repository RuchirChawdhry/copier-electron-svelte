param(
  [Parameter(Mandatory = $true)][string]$GeneratedAppDir,
  [Parameter(Mandatory = $true)][string]$OutputFile
)

$ErrorActionPreference = 'Stop'

$appDir = [IO.Path]::GetFullPath($GeneratedAppDir)
$outputPath = [IO.Path]::GetFullPath($OutputFile)
$package = Get-Content (Join-Path $appDir 'package.json') -Raw | ConvertFrom-Json
$builderConfig = Get-Content (Join-Path $appDir 'electron-builder.yml') -Raw
$appId = [regex]::Match($builderConfig, '(?m)^appId:\s*"([^"]+)"').Groups[1].Value
$appName = [regex]::Match($builderConfig, '(?m)^productName:\s*"([^"]+)"').Groups[1].Value
if (-not $appId -or -not $appName) { throw 'Cannot read the packaged app identity' }

$exe = Join-Path $appDir "dist/win-unpacked/$($package.name).exe"
if (-not (Test-Path $exe -PathType Leaf)) { throw "Packaged Windows executable missing: $exe" }

Add-Type -Namespace JumpListCapture -Name Native -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("user32.dll", CharSet = System.Runtime.InteropServices.CharSet.Unicode)]
public static extern System.IntPtr FindWindow(string className, string windowName);
[System.Runtime.InteropServices.DllImport("user32.dll")]
public static extern System.IntPtr GetForegroundWindow();
'@

$process = Start-Process -FilePath $exe -PassThru
try {
  $taskbarButton = $null
  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 500
    $taskbar = [JumpListCapture.Native]::FindWindow('Shell_TrayWnd', $null)
    if ($taskbar -eq [IntPtr]::Zero) { continue }

    $tree = winapp ui inspect -w $taskbar --interactive --json | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0) { throw 'WinApp could not inspect the Windows taskbar' }
    $taskbarButton = @($tree.windows[0].elements) | Where-Object {
      $_.automationId -eq "Appid: $appId" -or $_.name -like "$appName*"
    } | Select-Object -First 1
    if ($taskbarButton) { break }
  }
  if (-not $taskbarButton) { throw "Windows taskbar button not found for $appName" }

  # WinApp only injects a taskbar click when the taskbar owns foreground focus.
  # Win+T focuses the taskbar without closing the packaged app.
  winapp ui send-keys 'win+t' -a $process.Id --via send-input --allow-system-keys --json
  if ($LASTEXITCODE -ne 0) { throw 'WinApp could not focus the Windows taskbar' }
  Start-Sleep -Milliseconds 250

  winapp ui click $taskbarButton.selector -w $taskbar --right --json
  if ($LASTEXITCODE -ne 0) { throw 'WinApp could not right-click the app taskbar button' }

  # The Jump List belongs to ShellExperienceHost and appears asynchronously.
  Start-Sleep -Milliseconds 1200
  $popup = [JumpListCapture.Native]::GetForegroundWindow()
  $menu = winapp ui inspect -w $popup --depth 8 --json | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0) { throw 'WinApp could not inspect the Jump List popup' }
  if ($menu.windows[0].title -ne "Jump List for $appName") {
    throw "Expected Jump List for $appName, got '$($menu.windows[0].title)'"
  }

  $menuText = $menu | ConvertTo-Json -Depth 30
  foreach ($task in @('New workspace tab', 'Open folder', 'Open settings')) {
    if ($menuText -notmatch [regex]::Escape($task)) {
      throw "The Jump List does not contain the expected task: $task"
    }
  }

  New-Item -ItemType Directory -Path (Split-Path $outputPath) -Force | Out-Null
  $screenshot = winapp ui screenshot -w $popup --capture-screen --output $outputPath --json | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0) { throw 'WinApp could not capture the native Jump List' }
  if ($screenshot.width -lt 200 -or $screenshot.height -lt 150) {
    throw 'WinApp screenshot does not contain the native popup window'
  }
  if (-not (Test-Path $outputPath -PathType Leaf)) { throw 'WinApp produced no PNG' }
  Write-Host "Captured $($screenshot.width)x$($screenshot.height) Jump List: $outputPath"
} finally {
  Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}
