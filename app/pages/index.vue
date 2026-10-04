<script setup lang="ts">
import type { PokemonListItem, PokemonListResponse } from '~~/shared/types/pokemon'

definePageMeta({ keepalive: true })
useHead({ title: 'Explore Pokémon | Priority Pokémon' })

const { data, error } = await useFetch<PokemonListResponse>('/api/pokemon', { query: { offset: 0 } })
const pokemon = ref<PokemonListItem[]>(data.value?.results ?? [])
const total = ref(data.value?.count ?? 0)
const loadingMore = ref(false)
const loadError = ref('')
const collectionError = ref('')
const { pokemonCollection, refreshCollection } = useCollection()
const capturedIds = computed(() => new Set(pokemonCollection.value.map(item => item.name.toLowerCase().replaceAll(' ', '-'))))
const hasMore = computed(() => pokemon.value.length < total.value)

onActivated(async () => {
  try {
    await refreshCollection()
    collectionError.value = ''
  } catch {
    collectionError.value = 'Collection status is unavailable right now.'
  }
})

async function loadMore(): Promise<void> {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  loadError.value = ''
  try {
    const response = await $fetch<PokemonListResponse>('/api/pokemon', { query: { offset: pokemon.value.length } })
    const existing = new Set(pokemon.value.map(item => item.name))
    pokemon.value.push(...response.results.filter(item => !existing.has(item.name)))
    total.value = response.count
  } catch {
    loadError.value = 'Could not load more Pokémon. Please try again.'
  } finally {
    loadingMore.value = false
  }
}
</script>

<template>
  <div class="container page-home">
    <section class="hero">
      <div class="hero__content">
        <span class="eyebrow"><span class="eyebrow__dot" /> THE ADVENTURE STARTS HERE</span>
        <h1>Every great collection starts with a <em>first catch.</em></h1>
        <p>Explore the Pokédex, discover your favorites, and build a collection that’s uniquely yours.</p>
        <a class="button button--dark" href="#pokemon-list">Explore Pokémon <span aria-hidden="true">↘</span></a>
      </div>
      <div class="hero__visual" aria-hidden="true">
        <div class="hero__orbit hero__orbit--one" />
        <div class="hero__orbit hero__orbit--two" />
        <div class="hero__pokeball"><span /></div>
        <span class="hero__spark hero__spark--one">✦</span>
        <span class="hero__spark hero__spark--two">✧</span>
      </div>
    </section>

    <section id="pokemon-list" class="listing-section" aria-labelledby="list-title">
      <div class="section-heading">
        <div>
          <span class="eyebrow">THE POKÉDEX</span>
          <h2 id="list-title">Meet the Pokémon</h2>
          <p>Choose a Pokémon to learn more and add it to your collection.</p>
        </div>
        <span v-if="pokemon.length" class="result-count">Showing {{ pokemon.length }} of {{ total }}</span>
      </div>

      <p v-if="collectionError" class="notice" role="status">{{ collectionError }}</p>
      <div v-if="error" id="pokemon-grid" class="empty-state" role="alert" tabindex="-1">
        <h3>The Pokédex could not load.</h3>
        <p>Please refresh the page and try again.</p>
      </div>
      <template v-else>
        <div id="pokemon-grid" class="pokemon-grid" tabindex="-1">
          <PokemonCard
            v-for="item in pokemon"
            :key="item.name"
            :name="item.name"
            :is-captured="capturedIds.has(item.name)"
          />
        </div>
        <div v-if="hasMore" class="load-more">
          <p v-if="loadError" class="form-error" role="alert">{{ loadError }}</p>
          <button class="button button--outline" type="button" :disabled="loadingMore" @click="loadMore">
            {{ loadingMore ? 'Loading…' : 'Load more Pokémon' }} <span aria-hidden="true">↓</span>
          </button>
        </div>
      </template>
    </section>
  </div>
</template>
