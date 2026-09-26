globalThis.__timing__.logStart('Load chunks/_/pokeapi');import { c as createError } from './nitro.mjs';

const POKEAPI_BASE = "https://pokeapi.co/api/v2";
function cleanPokemonName(value) {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(value)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid Pok\xE9mon name." });
  }
  return value;
}
async function getPokemonList(offset) {
  try {
    return await $fetch(`${POKEAPI_BASE}/pokemon`, {
      query: { limit: 50, offset }
    });
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Pok\xE9API is unavailable. Please try again." });
  }
}
async function getPokemonDetails(name) {
  var _a, _b, _c, _d;
  let pokemon;
  try {
    pokemon = await $fetch(`${POKEAPI_BASE}/pokemon/${encodeURIComponent(name)}`);
  } catch (error) {
    const status = error.statusCode;
    throw createError({
      statusCode: status === 404 ? 404 : 502,
      statusMessage: status === 404 ? "Pok\xE9mon not found." : "Pok\xE9API is unavailable. Please try again."
    });
  }
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: (_b = (_a = pokemon.sprites.other.home) == null ? void 0 : _a.front_default) != null ? _b : null,
    shinyImage: (_d = (_c = pokemon.sprites.other.home) == null ? void 0 : _c.front_shiny) != null ? _d : null,
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities.map((item) => item.ability.name),
    types: pokemon.types.map((item) => item.type.name)
  };
}

export { getPokemonDetails as a, cleanPokemonName as c, getPokemonList as g };;globalThis.__timing__.logEnd('Load chunks/_/pokeapi');
//# sourceMappingURL=pokeapi.mjs.map
