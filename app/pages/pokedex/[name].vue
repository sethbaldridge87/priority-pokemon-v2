<script setup lang="ts">
import type { CapturedPokemon, PokemonDetails } from '~~/shared/types/pokemon'
import { displayName, isGrassType } from '~~/shared/types/pokemon'

const route = useRoute()
const name = String(route.params.name).toLowerCase()
const { data: pokemon, error } = await useFetch<PokemonDetails>(`/api/pokemon/${encodeURIComponent(name)}`)
const { pokemonCollection, refreshCollection, addCaptured } = useCollection()
const showShiny = ref(false)
const catching = ref(false)
const catchError = ref('')
const collectionError = ref('')
const isCaptured = computed(() => pokemonCollection.value.some(item => item.Id === pokemon.value?.id))
const canShowShiny = computed(() => Boolean(pokemon.value && isGrassType(pokemon.value.types) && pokemon.value.shinyImage))
const visibleImage = computed(() => showShiny.value && canShowShiny.value ? pokemon.value?.shinyImage : pokemon.value?.image)

useHead({ title: () => `${displayName(name)} | Priority Pokémon` })

onMounted(async () => {
  try { await refreshCollection() } catch { collectionError.value = 'Collection status is unavailable right now.' }
})

async function catchPokemon(): Promise<void> {
  if (!pokemon.value || catching.value || isCaptured.value) return
  catching.value = true
  catchError.value = ''
  try {
    const response = await $fetch<{ capturedPokemon: CapturedPokemon }>('/api/collection', {
      method: 'POST',
      body: { name: pokemon.value.name, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    })
    addCaptured(response.capturedPokemon)
  } catch (cause) {
    const status = (cause as { statusCode?: number }).statusCode
    if (status === 409) {
      await refreshCollection().catch(() => {})
    } else {
      catchError.value = 'Could not catch this Pokémon. Please try again.'
    }
  } finally {
    catching.value = false
  }
}
</script>

<template>
  <div class="container entry-page">
    <NuxtLink class="back-link" :to="pokemon ? `/#${String(pokemon.id).padStart(4, '0')}` : '/'">← Back to Pokédex</NuxtLink>

    <div v-if="error || !pokemon" class="empty-state" role="alert">
      <h1>Pokémon not found</h1>
      <p>This entry isn’t available right now.</p>
      <NuxtLink class="button button--dark" to="/">Explore Pokémon</NuxtLink>
    </div>

    <template v-else>
      <section class="entry-hero" :class="`entry-hero--${pokemon.types[0]}`">
        <div class="entry-hero__topline">
          <span class="eyebrow">POKÉDEX ENTRY</span>
          <span class="entry-hero__number">#{{ String(pokemon.id).padStart(4, '0') }}</span>
        </div>
        <div class="entry-hero__layout">
          <div class="entry-hero__copy">
            <h1>{{ displayName(pokemon.name) }}</h1>
            <div class="badge-row"><TypeBadge v-for="type in pokemon.types" :key="type" :type="type" /></div>
            <p>Take a closer look at this Pokémon’s stats and abilities, then add it to your collection.</p>
          </div>
          <div class="entry-hero__art">
            <span class="entry-hero__art-ring" aria-hidden="true" />
            <img v-if="visibleImage" :src="visibleImage" :alt="`${displayName(pokemon.name)} ${showShiny ? 'shiny' : 'normal'} artwork`">
            <span v-else class="entry-hero__no-image">Artwork unavailable</span>
          </div>
        </div>
        <div v-if="canShowShiny" class="entry-hero__toggle"><ShinyToggle v-model="showShiny" /></div>
      </section>

      <div class="entry-content">
        <section class="stat-panel" aria-labelledby="stats-title">
          <span id="stats-title" class="eyebrow">THE DETAILS</span>
          <div class="stat-panel__grid">
            <div class="stat-panel__item"><span>Height</span><strong>{{ pokemon.height }} <small>dm</small></strong></div>
            <div class="stat-panel__item"><span>Weight</span><strong>{{ pokemon.weight }} <small>hg</small></strong></div>
            <div class="stat-panel__item stat-panel__item--wide">
              <span>Abilities</span>
              <strong>{{ pokemon.abilities.map(displayName).join(', ') }}</strong>
            </div>
          </div>
        </section>

        <aside class="catch-panel">
          <h2>Make it yours.</h2>
          <p>Every great team is built one Pokémon at a time.</p>
          <p v-if="collectionError" class="form-error" role="status">{{ collectionError }}</p>
          <p v-if="catchError" class="form-error" role="alert">{{ catchError }}</p>
          <button class="button button--red" type="button" :disabled="catching || isCaptured" @click="catchPokemon">
            {{ isCaptured ? 'This Pokémon has been added to your collection!' : catching ? 'Catching…' : 'Catch' }}
          </button>
          <NuxtLink v-if="isCaptured" class="text-link" to="/collection">View your collection →</NuxtLink>
        </aside>
      </div>
    </template>
  </div>
</template>
