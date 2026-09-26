import { releasePokemon } from '../../utils/collection'
import { cleanPokemonName } from '../../utils/pokeapi'
import { getVisitorId } from '../../utils/visitor'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const name = cleanPokemonName(getRouterParam(event, 'name'))
  const removed = await releasePokemon(getVisitorId(event), name)
  if (!removed) throw createError({ statusCode: 404, statusMessage: 'Pokémon is not in your collection.' })
  return { removed: true }
})
