import { Redis } from '@upstash/redis'
import type { CapturedPokemon } from '~~/shared/types/pokemon'

const localCollections = new Map<string, Map<string, CapturedPokemon>>()
let redis: Redis | undefined

function storage(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis ??= Redis.fromEnv()
    return redis
  }
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 503, statusMessage: 'Collection storage is not configured.' })
  }
  return null
}

function key(visitorId: string): string {
  return `pokemonCollection:${visitorId}`
}

function localCollection(visitorId: string): Map<string, CapturedPokemon> {
  let collection = localCollections.get(visitorId)
  if (!collection) {
    collection = new Map()
    localCollections.set(visitorId, collection)
  }
  return collection
}

export async function readCollection(visitorId: string): Promise<CapturedPokemon[]> {
  const database = storage()
  if (!database) return [...localCollection(visitorId).values()].sort((a, b) => a.Id - b.Id)

  const values = await database.hgetall<Record<string, CapturedPokemon | string>>(key(visitorId))
  return Object.values(values ?? {})
    .map(value => typeof value === 'string' ? JSON.parse(value) as CapturedPokemon : value)
    .sort((a, b) => a.Id - b.Id)
}

export async function catchPokemon(visitorId: string, slug: string, pokemon: CapturedPokemon): Promise<boolean> {
  const database = storage()
  if (!database) {
    const collection = localCollection(visitorId)
    if (collection.has(slug)) return false
    collection.set(slug, pokemon)
    return true
  }
  return await database.hsetnx(key(visitorId), slug, JSON.stringify(pokemon)) === 1
}

export async function releasePokemon(visitorId: string, slug: string): Promise<boolean> {
  const database = storage()
  if (!database) return localCollection(visitorId).delete(slug)
  return await database.hdel(key(visitorId), slug) === 1
}
