globalThis.__timing__.logStart('Load chunks/routes/api/pokemon.get');import { i as defineCachedEventHandler, j as getQuery, c as createError } from '../../_/nitro.mjs';
import { g as getPokemonList } from '../../_/pokeapi.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const pokemon_get = defineCachedEventHandler(async (event) => {
  var _a;
  const offset = Number((_a = getQuery(event).offset) != null ? _a : 0);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset % 50 !== 0) {
    throw createError({ statusCode: 400, statusMessage: "Offset must be a nonnegative multiple of 50." });
  }
  return await getPokemonList(offset);
}, { maxAge: 60 * 60 * 24, swr: true });

export { pokemon_get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/pokemon.get');
//# sourceMappingURL=pokemon.get.mjs.map
