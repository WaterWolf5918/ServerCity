
$ProcessPID = "55056"

$ProcessName = (Get-Process -Id $ProcessPID).Name
$CpuCores = (Get-WMIObject Win32_ComputerSystem).NumberOfLogicalProcessors
$Samples = (Get-Counter "\Process($Processname*)\% Processor Time").CounterSamples
$Samples | Select `
InstanceName,
@{Name="CPU %";Expression={[Decimal]::Round(($_.CookedValue / $CpuCores), 2)}}