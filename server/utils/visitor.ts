import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'priority_pokemon_visitor'
const developmentSecret = randomBytes(32).toString('hex')

function signature(id: string, secret: string): string {
  return createHmac('sha256', secret).update(id).digest('hex')
}

export function getVisitorId(event: H3Event): string {
  const configuredSecret = useRuntimeConfig(event).sessionSecret
  if (!configuredSecret && process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 503, statusMessage: 'Collection storage is not configured.' })
  }
  const secret = configuredSecret || developmentSecret
  const existing = getCookie(event, COOKIE_NAME)
  if (existing) {
    const [id, suppliedSignature] = existing.split('.')
    if (id && suppliedSignature && /^[a-f0-9]{32}$/.test(id) && /^[a-f0-9]{64}$/.test(suppliedSignature)) {
      const expected = Buffer.from(signature(id, secret), 'hex')
      const supplied = Buffer.from(suppliedSignature, 'hex')
      if (timingSafeEqual(expected, supplied)) return id
    }
  }

  const id = randomBytes(16).toString('hex')
  setCookie(event, COOKIE_NAME, `${id}.${signature(id, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return id
}
