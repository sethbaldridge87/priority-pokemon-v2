import type { PokemonDetails, PokemonListResponse } from '~~/shared/types/pokemon'

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'

interface RawPokemon {
  id: number
  name: string
  height: number
  weight: number
  abilities: Array<{ ability: { name: string } }>
  types: Array<{ type: { name: string } }>
  sprites: {
    other: {
      home: {
        front_default: string | null
        front_shiny: string | null
      } | null
    }
  }
}

export function cleanPokemonName(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(value)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Pokémon name.' })
  }
  return value
}

export async function getPokemonList(offset: number): Promise<PokemonListResponse> {
  try {
    return await $fetch<PokemonListResponse>(`${POKEAPI_BASE}/pokemon`, {
      query: { limit: 50, offset },
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'PokéAPI is unavailable. Please try again.' })
  }
}

export async function getPokemonDetails(name: string): Promise<PokemonDetails> {
  let pokemon: RawPokemon
  try {
    pokemon = await $fetch<RawPokemon>(`${POKEAPI_BASE}/pokemon/${encodeURIComponent(name)}`)
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    throw createError({
      statusCode: status === 404 ? 404 : 502,
      statusMessage: status === 404 ? 'Pokémon not found.' : 'PokéAPI is unavailable. Please try again.',
    })
  }

  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprites.other.home?.front_default ?? null,
    shinyImage: pokemon.sprites.other.home?.front_shiny ?? null,
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities.map(item => item.ability.name),
    types: pokemon.types.map(item => item.type.name),
  }
}
