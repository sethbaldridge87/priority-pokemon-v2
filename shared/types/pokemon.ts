export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  results: PokemonListItem[]
}

export interface PokemonDetails {
  id: number
  name: string
  image: string | null
  shinyImage: string | null
  height: number
  weight: number
  abilities: string[]
  types: string[]
}

export interface CapturedPokemon {
  Id: number
  name: string
  Height: number
  Weight: number
  Abilities: string[]
  Types: string[]
  DayCaught: string
  TimeCaught: string
  Image: string | null
  ShinyImage?: string
}

export interface CollectionResponse {
  pokemonCollection: CapturedPokemon[]
}

export function displayName(name: string): string {
  return name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
}

export function isGrassType(types: string[]): boolean {
  return types.includes('grass')
}
