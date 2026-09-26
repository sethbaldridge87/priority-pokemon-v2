import type { CapturedPokemon, PokemonDetails } from '~~/shared/types/pokemon'
import { displayName, isGrassType } from '~~/shared/types/pokemon'
import { catchPokemon } from '../utils/collection'
import { cleanPokemonName } from '../utils/pokeapi'
import { getVisitorId } from '../utils/visitor'

function catchDate(timeZone: string): { day: string, time: string } {
  let zone = timeZone
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
  } catch {
    zone = 'UTC'
  }
  const now = new Date()
  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, month: 'numeric', day: 'numeric', year: 'numeric',
  }).formatToParts(now)
  const dayParts = Object.fromEntries(dateParts.map(part => [part.type, part.value]))
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: zone, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(now).replace(/\s/g, '')
  return { day: `${dayParts.month}.${dayParts.day}.${dayParts.year}`, time }
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const body = await readBody<{ name?: string, timeZone?: string }>(event)
  const name = cleanPokemonName(body?.name)
  const details = await event.$fetch<PokemonDetails>(`/api/pokemon/${name}`)
  const { day, time } = catchDate(typeof body.timeZone === 'string' ? body.timeZone : 'UTC')
  const capturedPokemon: CapturedPokemon = {
    Id: details.id,
    name: displayName(details.name),
    Height: details.height,
    Weight: details.weight,
    Abilities: details.abilities,
    Types: details.types,
    DayCaught: day,
    TimeCaught: time,
    Image: details.image,
    ...(isGrassType(details.types) && details.shinyImage ? { ShinyImage: details.shinyImage } : {}),
  }

  const created = await catchPokemon(getVisitorId(event), details.name, capturedPokemon)
  if (!created) throw createError({ statusCode: 409, statusMessage: 'This Pokémon is already in your collection.' })
  setResponseStatus(event, 201)
  return { capturedPokemon }
})
