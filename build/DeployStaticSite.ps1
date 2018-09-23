[CmdletBinding()]
param(
	[Parameter(Mandatory)]
	[String] $PublishProfilePath,

	[Parameter(Mandatory)]
	[String[]] $SourceFiles
)

function Main {
	$publishPath = Join-Path $PSScriptRoot 'publish.temp'
	CopySourceFilesToPublishOutput $SourceFiles $publishPath
	DeployDirectory $publishPath $PublishProfilePath
}

function CopySourceFilesToPublishOutput($sourceFiles, $publishPath) {
	Write-Host "Publishing files to: $publishPath"

	if (Test-Path $publishPath) {
		Write-Verbose "Removing existing publish directory: $publishPath"
		Remove-Item $publishPath -Force -Recurse -ErrorAction Stop
	}

	Write-Verbose "Creating publish directory: $publishPath"
	New-Item $publishPath -ItemType Directory | Out-Null

	Get-ChildItem $SourceFiles `
		| Select-Object -ExpandProperty FullName `
		| Foreach-Object {
			Write-Verbose "Copying: $_"
			Copy-Item $_ -Destination $publishPath
		}
}

################################
# MISC

function Find-ExecutablePath {
	foreach ($path in $args) {
		$command = Get-Command $path -ErrorAction SilentlyContinue
		if ($command) {
			return $command.Source
		}
	}

	throw "Can't find required executable in any of paths: $args"
}

################################
# MS DEPLOY

$MsDeployExe = Find-ExecutablePath 'msdeploy.exe' 'C:\Program Files (x86)\IIS\Microsoft Web Deploy V3\msdeploy.exe'

function DeployDirectory($publishDir, $publishProfilePath) {
	$deployParams = ReadPublishProfile $publishProfilePath
	
	Write-Host "Deploying '$publishDir' to '$($deployParams.ComputerName)'"

	$msDeployDest = JoinHashtable $deployParams
    & $MsDeployExe `
        -verb:sync `
        -source:contentPath="$publishDir" `
        -dest:"$msDeployDest"
}

function ReadPublishProfile($profilePath) {
	if (-not (Test-Path $profilePath)) {
		throw "Publish profile '$profilePath' does not exist"
	}

	$publishProfile = Get-Content $profilePath
	$siteName = GetPublishProfileProperty $publishProfile 'msdeploySite'
    $publishUrl = GetPublishProfileProperty $publishProfile 'publishUrl'

    return @{
        ContentPath = $siteName
        ComputerName = "https://$publishUrl/msdeploy.axd?site=$siteName"
        UserName = GetPublishProfileProperty $publishProfile 'userName'
        Password = GetPublishProfileProperty $publishProfile 'userPWD'
        AuthType = 'Basic'
    }
}

function GetPublishProfileProperty($profile, $propertyName) {
    Select-Xml `
        -XPath "/publishData/publishProfile[@publishMethod='MSDeploy']/@$propertyName" `
        -Content $profile
}

function JoinHashtable([Hashtable] $table) {
	return ($table.Keys | ForEach-Object { $_ + '=' + $table.Item($_) }) -join ','
}

Main