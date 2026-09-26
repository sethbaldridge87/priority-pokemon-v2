globalThis.__timing__.logStart('Load chunks/routes/api/collection.post');import { d as defineEventHandler, s as setResponseHeader, r as readBody, c as createError, a as setResponseStatus } from '../../_/nitro.mjs';
import { c as catchPokemon, g as getVisitorId } from '../../_/visitor.mjs';
import { c as cleanPokemonName } from '../../_/pokeapi.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@upstash/redis';

function displayName(name) {
  return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
function isGrassType(types) {
  return types.includes("grass");
}

function catchDate(timeZone) {
  let zone = timeZone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
  } catch {
    zone = "UTC";
  }
  const now = /* @__PURE__ */ new Date();
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    month: "numeric",
    day: "numeric",
    year: "numeric"
  }).formatToParts(now);
  const dayParts = Object.fromEntries(dateParts.map((part) => [part.type, part.value]));
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(now).replace(/\s/g, "");
  return { day: `${dayParts.month}.${dayParts.day}.${dayParts.year}`, time };
}
const collection_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");
  const body = await readBody(event);
  const name = cleanPokemonName(body == null ? void 0 : body.name);
  const details = await event.$fetch(`/api/pokemon/${name}`);
  const { day, time } = catchDate(typeof body.timeZone === "string" ? body.timeZone : "UTC");
  const capturedPokemon = {
    Id: details.id,
    name: displayName(details.name),
    Height: details.height,
    Weight: details.weight,
    Abilities: details.abilities,
    Types: details.types,
    DayCaught: day,
    TimeCaught: time,
    Image: details.image,
    ...isGrassType(details.types) && details.shinyImage ? { ShinyImage: details.shinyImage } : {}
  };
  const created = await catchPokemon(getVisitorId(event), details.name, capturedPokemon);
  if (!created) throw createError({ statusCode: 409, statusMessage: "This Pok\xE9mon is already in your collection." });
  setResponseStatus(event, 201);
  return { capturedPokemon };
});

export { collection_post as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/collection.post');
//# sourceMappingURL=collection.post.mjs.map
