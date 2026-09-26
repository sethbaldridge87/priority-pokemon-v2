# Priority Pokémon

A Pokémon themed Nuxt 4 single page application. Browse PokéAPI in pages of 50, inspect Pokédex entries, and keep a personal collection without creating an account.

## Stack and architecture

- Nuxt 4 and Vue 3 provide client side routing and the three requested pages.
- Nuxt's Nitro server routes run on Node.js and handle PokéAPI requests and collection writes. A separate Express server would duplicate routing and add deployment work on Vercel, so this project uses Nitro instead.
- Upstash Redis stores each visitor's collection. The Redis key is `pokemonCollection:<visitor-id>`; its fields hold captured Pokémon objects. `GET /api/collection` returns them as the requested `pokemonCollection` array. Atomic Redis hash writes prevent duplicate catches.
- A signed, HTTP only cookie identifies a browser. Visitors do not need login credentials and never receive database credentials. Clearing cookies or using another browser creates a new collection; there is no account recovery or cross-device sync.
- PokéAPI list and detail responses are cached for 24 hours by Nitro and expose CDN cache headers. Collection responses are private and never cached.
- All styling comes from `app/assets/scss/main.scss`. Breakpoint mixins in `_tokens.scss` use the 640px, 768px, 1024px, and 1280px mobile-first breakpoints.

## Local development

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Visit `http://localhost:3000`. Without Redis credentials, development uses an in-memory collection that resets when the server restarts. For persistent local data, copy `.env.example` to `.env` and fill in its values.

```sh
npm run typecheck
npm run build
```

The optional local API smoke check exercises pagination, details, anonymous visitor isolation, catching, duplicate prevention, and release:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/smoke.ps1
```

Run it while the dev server is listening on port 3000.

## Deploy to Vercel

1. Import this repository as a Nuxt project in Vercel.
2. Add an Upstash Redis database through the Vercel Marketplace and connect it to the project.
3. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel if the integration has not added them automatically.
4. Set `NUXT_SESSION_SECRET` to a stable random value of at least 32 bytes. For example, generate a hex value with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and add it as an environment variable. Changing this value invalidates existing visitor cookies.
5. Deploy. Nuxt selects the Vercel server preset in Vercel's build environment; no separate Express service is needed.

Production collection routes return an error until the Redis credentials and session secret are configured. Images remain hosted by PokéAPI's sprite repository; only image URLs and text are stored in Redis.

## Routes

| Page or API | Purpose |
| --- | --- |
| `/` | Browse 50 Pokémon at a time and see collection checkmarks. |
| `/pokedex/:name` | View one Pokémon and catch it. Grass Pokémon can switch to shiny art. |
| `/collection` | Open captured Pokémon details and confirm release. |
| `GET /api/pokemon?offset=0` | Get a PokéAPI list page of 50. |
| `GET /api/pokemon/:name` | Get typed card and entry details. |
| `GET /api/collection` | Get the current visitor's `pokemonCollection` array. |
| `POST /api/collection` | Catch a Pokémon from `{ "name": "bulbasaur", "timeZone": "America/Denver" }`. |
| `DELETE /api/collection/:name` | Release the current visitor's Pokémon. |

PokéAPI supplies height in decimeters and weight in hectograms; the UI displays those units next to the original values.
