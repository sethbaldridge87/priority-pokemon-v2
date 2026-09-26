import { getPokemonList } from '../utils/pokeapi'

export default defineCachedEventHandler(async (event) => {
  const offset = Number(getQuery(event).offset ?? 0)
  if (!Number.isSafeInteger(offset) || offset < 0 || offset % 50 !== 0) {
    throw createError({ statusCode: 400, statusMessage: 'Offset must be a nonnegative multiple of 50.' })
  }
  return await getPokemonList(offset)
}, { maxAge: 60 * 60 * 24, swr: true })
