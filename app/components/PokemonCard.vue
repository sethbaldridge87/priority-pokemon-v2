<script setup lang="ts">
import type { CapturedPokemon, PokemonDetails } from '~~/shared/types/pokemon'
import { displayName } from '~~/shared/types/pokemon'

const props = withDefaults(defineProps<{
  name: string
  pokemonId?: number
  capturedPokemon?: CapturedPokemon
  isCaptured?: boolean
  mode?: 'link' | 'button'
}>(), { mode: 'link', isCaptured: false })

const emit = defineEmits<{ select: [] }>()
const nuxtLink = resolveComponent('NuxtLink')
const details = ref<PokemonDetails | null>(null)
const loading = ref(!props.capturedPokemon)
const failed = ref(false)

const id = computed(() => props.capturedPokemon?.Id ?? props.pokemonId ?? details.value?.id)
const types = computed(() => props.capturedPokemon?.Types ?? details.value?.types ?? [])
const image = computed(() => props.capturedPokemon?.Image ?? details.value?.image)

onMounted(async () => {
  if (props.capturedPokemon) return
  try {
    details.value = await $fetch<PokemonDetails>(`/api/pokemon/${encodeURIComponent(props.name)}`)
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <article :id="id ? String(id).padStart(4, '0') : undefined" class="pokemon-card" :class="types[0] ? `pokemon-card--${types[0]}` : ''">
    <span v-if="isCaptured" class="pokemon-card__caught" aria-label="Already in your collection" title="Already in your collection">✓</span>

    <component
      :is="mode === 'button' ? 'button' : nuxtLink"
      class="pokemon-card__main"
      :type="mode === 'button' ? 'button' : undefined"
      :to="mode === 'link' ? `/pokedex/${name}` : undefined"
      :aria-label="mode === 'button' ? `View ${displayName(name)} in your collection` : `View ${displayName(name)} Pokédex entry`"
      @click="mode === 'button' && emit('select')"
    >
      <span class="pokemon-card__art">
        <span v-if="loading" class="pokemon-card__placeholder" aria-hidden="true" />
        <img v-else-if="image" :src="image" :alt="displayName(name)" loading="lazy" width="180" height="180">
        <span v-else class="pokemon-card__fallback" aria-hidden="true">?</span>
      </span>
      <span class="pokemon-card__body">
        <span class="pokemon-card__number">{{ id ? `#${String(id).padStart(4, '0')}` : 'Loading…' }}</span>
        <span class="pokemon-card__name">{{ displayName(name) }}</span>
        <span v-if="failed" class="pokemon-card__error">Details unavailable</span>
        <span v-else-if="types.length" class="pokemon-card__types">
          <TypeBadge v-for="type in types" :key="type" :type="type" />
        </span>
      </span>
      <span class="pokemon-card__arrow" aria-hidden="true">↗</span>
    </component>

  </article>
</template>
