globalThis.__timing__.logStart('Load chunks/routes/api/pokemon/_name_.get');import { i as defineCachedEventHandler, b as getRouterParam } from '../../../_/nitro.mjs';
import { c as cleanPokemonName, a as getPokemonDetails } from '../../../_/pokeapi.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const _name__get = defineCachedEventHandler(async (event) => {
  const name = cleanPokemonName(getRouterParam(event, "name"));
  return await getPokemonDetails(name);
}, { maxAge: 60 * 60 * 24, swr: true });

export { _name__get as default };;globalThis.__timing__.logEnd('Load chunks/routes/api/pokemon/_name_.get');
//# sourceMappingURL=_name_.get.mjs.map
