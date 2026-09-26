import type { CapturedPokemon, CollectionResponse } from '~~/shared/types/pokemon'

export function useCollection() {
  const pokemonCollection = useState<CapturedPokemon[]>('pokemon-collection', () => [])
  const collectionLoaded = useState<boolean>('pokemon-collection-loaded', () => false)

  async function refreshCollection(): Promise<void> {
    const response = await $fetch<CollectionResponse>('/api/collection')
    pokemonCollection.value = response.pokemonCollection
    collectionLoaded.value = true
  }

  function addCaptured(pokemon: CapturedPokemon): void {
    if (!pokemonCollection.value.some(item => item.Id === pokemon.Id)) {
      pokemonCollection.value = [...pokemonCollection.value, pokemon].sort((a, b) => a.Id - b.Id)
    }
    collectionLoaded.value = true
  }

  function removeCaptured(id: number): void {
    pokemonCollection.value = pokemonCollection.value.filter(item => item.Id !== id)
  }

  return { pokemonCollection, collectionLoaded, refreshCollection, addCaptured, removeCaptured }
}
