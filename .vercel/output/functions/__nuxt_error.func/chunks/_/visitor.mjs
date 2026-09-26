globalThis.__timing__.logStart('Load chunks/_/visitor');import { c as createError, e as useRuntimeConfig, f as getCookie, h as setCookie } from './nitro.mjs';
import { Redis } from '@upstash/redis';
import { timingSafeEqual, randomBytes, createHmac } from 'node:crypto';

const localCollections = /* @__PURE__ */ new Map();
let redis;
function storage() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis != null ? redis : redis = Redis.fromEnv();
    return redis;
  }
  {
    throw createError({ statusCode: 503, statusMessage: "Collection storage is not configured." });
  }
}
function key(visitorId) {
  return `pokemonCollection:${visitorId}`;
}
function localCollection(visitorId) {
  let collection = localCollections.get(visitorId);
  if (!collection) {
    collection = /* @__PURE__ */ new Map();
    localCollections.set(visitorId, collection);
  }
  return collection;
}
async function readCollection(visitorId) {
  const database = storage();
  if (!database) return [...localCollection(visitorId).values()].sort((a, b) => a.Id - b.Id);
  const values = await database.hgetall(key(visitorId));
  return Object.values(values != null ? values : {}).map((value) => typeof value === "string" ? JSON.parse(value) : value).sort((a, b) => a.Id - b.Id);
}
async function catchPokemon(visitorId, slug, pokemon) {
  const database = storage();
  if (!database) {
    const collection = localCollection(visitorId);
    if (collection.has(slug)) return false;
    collection.set(slug, pokemon);
    return true;
  }
  return await database.hsetnx(key(visitorId), slug, JSON.stringify(pokemon)) === 1;
}
async function releasePokemon(visitorId, slug) {
  const database = storage();
  if (!database) return localCollection(visitorId).delete(slug);
  return await database.hdel(key(visitorId), slug) === 1;
}

const COOKIE_NAME = "priority_pokemon_visitor";
const developmentSecret = randomBytes(32).toString("hex");
function signature(id, secret) {
  return createHmac("sha256", secret).update(id).digest("hex");
}
function getVisitorId(event) {
  const configuredSecret = useRuntimeConfig(event).sessionSecret;
  if (!configuredSecret && true) {
    throw createError({ statusCode: 503, statusMessage: "Collection storage is not configured." });
  }
  const secret = configuredSecret || developmentSecret;
  const existing = getCookie(event, COOKIE_NAME);
  if (existing) {
    const [id2, suppliedSignature] = existing.split(".");
    if (id2 && suppliedSignature && /^[a-f0-9]{32}$/.test(id2) && /^[a-f0-9]{64}$/.test(suppliedSignature)) {
      const expected = Buffer.from(signature(id2, secret), "hex");
      const supplied = Buffer.from(suppliedSignature, "hex");
      if (timingSafeEqual(expected, supplied)) return id2;
    }
  }
  const id = randomBytes(16).toString("hex");
  setCookie(event, COOKIE_NAME, `${id}.${signature(id, secret)}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return id;
}

export { releasePokemon as a, catchPokemon as c, getVisitorId as g, readCollection as r };;globalThis.__timing__.logEnd('Load chunks/_/visitor');
//# sourceMappingURL=visitor.mjs.map
