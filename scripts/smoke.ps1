param([string]$BaseUrl = 'http://127.0.0.1:3000')

$ErrorActionPreference = 'Stop'
$trainer = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$otherTrainer = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Assert($condition, $message) {
  if (-not $condition) { throw $message }
}

$firstPage = Invoke-RestMethod "$BaseUrl/api/pokemon?offset=0"
$secondPage = Invoke-RestMethod "$BaseUrl/api/pokemon?offset=50"
Assert ($firstPage.results.Count -eq 50) 'First page should contain 50 Pokémon.'
Assert ($secondPage.results.Count -eq 50) 'Second page should contain 50 Pokémon.'
Assert ($firstPage.results[0].name -eq 'bulbasaur') 'First Pokémon should be Bulbasaur.'
Assert ($secondPage.results[0].name -eq 'dugtrio') 'Second page should begin with Dugtrio.'

$bulbasaur = Invoke-RestMethod "$BaseUrl/api/pokemon/bulbasaur"
$squirtle = Invoke-RestMethod "$BaseUrl/api/pokemon/squirtle"
Assert ($bulbasaur.types -contains 'grass') 'Bulbasaur should be grass type.'
Assert ($squirtle.types -notcontains 'grass') 'Squirtle should not be grass type.'

$initial = Invoke-RestMethod "$BaseUrl/api/collection" -WebSession $trainer
Assert ($initial.pokemonCollection.Count -eq 0) 'New collection should be empty.'

$body = @{ name = 'bulbasaur'; timeZone = 'America/Denver' } | ConvertTo-Json -Compress
$caughtGrass = Invoke-RestMethod "$BaseUrl/api/collection" -Method Post -WebSession $trainer -ContentType 'application/json' -Body $body
Assert ($caughtGrass.capturedPokemon.ShinyImage) 'Grass capture should include a shiny image.'

try {
  Invoke-RestMethod "$BaseUrl/api/collection" -Method Post -WebSession $trainer -ContentType 'application/json' -Body $body | Out-Null
  throw 'Duplicate catch should return 409.'
} catch [System.Net.WebException] {
  Assert ([int]$_.Exception.Response.StatusCode -eq 409) 'Duplicate catch should return 409.'
}

$body = @{ name = 'squirtle'; timeZone = 'America/Denver' } | ConvertTo-Json -Compress
$caughtWater = Invoke-RestMethod "$BaseUrl/api/collection" -Method Post -WebSession $trainer -ContentType 'application/json' -Body $body
Assert (-not $caughtWater.capturedPokemon.PSObject.Properties['ShinyImage']) 'Non-grass capture should omit ShinyImage.'

$collection = Invoke-RestMethod "$BaseUrl/api/collection" -WebSession $trainer
Assert ($collection.pokemonCollection.Count -eq 2) 'Trainer should have two captured Pokémon.'
$otherCollection = Invoke-RestMethod "$BaseUrl/api/collection" -WebSession $otherTrainer
Assert ($otherCollection.pokemonCollection.Count -eq 0) 'Another visitor should have an empty collection.'

Invoke-RestMethod "$BaseUrl/api/collection/bulbasaur" -Method Delete -WebSession $trainer | Out-Null
$afterRelease = Invoke-RestMethod "$BaseUrl/api/collection" -WebSession $trainer
Assert ($afterRelease.pokemonCollection.Count -eq 1) 'Release should remove exactly one Pokémon.'
Invoke-RestMethod "$BaseUrl/api/collection/squirtle" -Method Delete -WebSession $trainer | Out-Null

Write-Output 'Smoke checks passed: pagination, details, anonymous collection isolation, duplicate catch, grass shiny field, and release.'
