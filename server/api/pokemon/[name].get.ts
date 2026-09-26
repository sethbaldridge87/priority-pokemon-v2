import { cleanPokemonName, getPokemonDetails } from '../../utils/pokeapi'

export default defineCachedEventHandler(async (event) => {
  const name = cleanPokemonName(getRouterParam(event, 'name'))
  return await getPokemonDetails(name)
}, { maxAge: 60 * 60 * 24, swr: true })
