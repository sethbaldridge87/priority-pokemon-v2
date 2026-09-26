globalThis.__timing__.logStart('Load chunks/routes/api/collection/_name_.delete');import { d as defineEventHandler, s as setResponseHeader, b as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { a as releasePokemon, g as getVisitorId } from '../../../_/visitor.mjs';
import { c as cleanPokemonName } from '../../../_/pokeapi.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@upstash/redis';

const _name__delete = defineEventHandler(async (event) => {
  setResponseHeader(event, "Cache-Control", "private, no-store");
  const name = cleanPokemonName(getRouterParam(event, "name"));
  const removed = await releasePokemon(getVisitorId(event), name);
  if (!removed) throw createError({ statusCode: 404, statusMessage: "Pok\xE9mon is not in your collection." });
  return { removed: true };
});

export { _name__delete as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/collection/_name_.delete');
//# sourceMappingURL=_name_.delete.mjs.map
