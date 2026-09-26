import { readCollection } from '../utils/collection'
import { getVisitorId } from '../utils/visitor'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return { pokemonCollection: await readCollection(getVisitorId(event)) }
})
