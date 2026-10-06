<script setup lang="ts">
import type { CapturedPokemon } from '~~/shared/types/pokemon'
import { displayName, isGrassType } from '~~/shared/types/pokemon'

useHead({ title: 'My Collection | Priority Pokémon' })

const { pokemonCollection, collectionLoaded, refreshCollection, removeCaptured } = useCollection()
const loading = ref(true)
const loadError = ref('')
const releaseError = ref('')
const selected = ref<CapturedPokemon | null>(null)
const showShiny = ref(false)
const releasing = ref(false)
const detailsDialog = ref<HTMLDialogElement | null>(null)
const confirmDialog = ref<HTMLDialogElement | null>(null)
type SortOrder = 'number-asc' | 'number-desc' | 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc'
const sortOrder = ref<SortOrder>('number-asc')
const canShowShiny = computed(() => Boolean(selected.value && isGrassType(selected.value.Types) && selected.value.ShinyImage))
const selectedImage = computed(() => showShiny.value && canShowShiny.value ? selected.value?.ShinyImage : selected.value?.Image)

function caughtAt(pokemon: CapturedPokemon): number {
  const [month, day, year] = pokemon.DayCaught.split('.').map(Number)
  const time = pokemon.TimeCaught.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i)
  if (!month || !day || !year || !time) return 0

  const hour = Number(time[1]) % 12 + (time[3]?.toUpperCase() === 'PM' ? 12 : 0)
  return Date.UTC(year, month - 1, day, hour, Number(time[2]))
}

const sortedPokemon = computed(() => {
  const pokemon = [...pokemonCollection.value]
  switch (sortOrder.value) {
    case 'number-asc': return pokemon
    case 'number-desc': return pokemon.sort((a, b) => b.Id - a.Id)
    case 'name-asc': return pokemon.sort((a, b) => a.name.localeCompare(b.name) || a.Id - b.Id)
    case 'name-desc': return pokemon.sort((a, b) => b.name.localeCompare(a.name) || a.Id - b.Id)
    case 'date-desc': return pokemon.sort((a, b) => caughtAt(b) - caughtAt(a) || a.Id - b.Id)
    case 'date-asc': return pokemon.sort((a, b) => caughtAt(a) - caughtAt(b) || a.Id - b.Id)
  }
})

async function loadCollection(): Promise<void> {
  loading.value = true
  loadError.value = ''
  try {
    await refreshCollection()
  } catch {
    loadError.value = 'Could not load your collection. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(loadCollection)

async function openDetails(pokemon: CapturedPokemon): Promise<void> {
  selected.value = pokemon
  showShiny.value = false
  await nextTick()
  detailsDialog.value?.showModal()
}

function openConfirmation(): void {
  confirmDialog.value?.showModal()
}

function closeDetails(): void {
  detailsDialog.value?.close()
  selected.value = null
}

async function confirmRelease(): Promise<void> {
  if (!selected.value || releasing.value) return
  const pokemon = selected.value
  releasing.value = true
  releaseError.value = ''
  confirmDialog.value?.close()
  closeDetails()
  try {
    const slug = pokemon.name.toLowerCase().replaceAll(' ', '-')
    await $fetch(`/api/collection/${encodeURIComponent(slug)}`, { method: 'DELETE' })
    removeCaptured(pokemon.Id)
  } catch {
    releaseError.value = `Could not release ${pokemon.name}. Please try again.`
  } finally {
    releasing.value = false
  }
}
</script>

<template>
  <div class="container collection-page">
    <section class="collection-heading">
      <div>
        <span class="eyebrow">YOUR ADVENTURE</span>
        <h1>My collection<span class="collection-heading__period">.</span></h1>
        <p>A home for every Pokémon you’ve caught along the way.</p>
      </div>
      <div class="collection-heading__count"><strong>{{ pokemonCollection.length }}</strong><span>Pokémon caught</span></div>
    </section>

    <p v-if="loadError" class="notice" role="alert">{{ loadError }} <button type="button" class="text-link" @click="loadCollection">Retry</button></p>
    <p v-if="releaseError" class="notice" role="alert">{{ releaseError }}</p>

    <div v-if="loading && !collectionLoaded" class="empty-state"><p>Loading your collection…</p></div>
    <div v-else-if="!loadError && pokemonCollection.length === 0" class="empty-state empty-state--collection">
      <span class="empty-state__ball" aria-hidden="true" />
      <h2>Your collection is waiting.</h2>
      <p>Oops! You don’t have any Pokemon to view here! Go catch some right now!</p>
      <NuxtLink class="button button--red" to="/">Explore Pokémon <span aria-hidden="true">↗</span></NuxtLink>
    </div>
    <template v-else-if="pokemonCollection.length">
      <div class="collection-sort">
        <label for="collection-sort">Sort by</label>
        <select id="collection-sort" v-model="sortOrder">
          <option value="number-asc">Number (ascending)</option>
          <option value="number-desc">Number (descending)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="date-desc">Date caught (newest)</option>
          <option value="date-asc">Date caught (oldest)</option>
        </select>
      </div>
      <div class="pokemon-grid">
        <PokemonCard
          v-for="pokemon in sortedPokemon"
          :key="pokemon.Id"
          :name="pokemon.name.toLowerCase().replaceAll(' ', '-')"
          :captured-pokemon="pokemon"
          mode="button"
          @select="openDetails(pokemon)"
        />
      </div>
    </template>

    <dialog ref="detailsDialog" class="pokemon-dialog" aria-label="Collected Pokémon details" @close="selected = null">
      <template v-if="selected">
        <div class="pokemon-dialog__header">
          <span class="eyebrow">COLLECTION ENTRY</span>
          <button class="icon-button" type="button" aria-label="Close Pokémon details" @click="closeDetails">×</button>
        </div>
        <div class="pokemon-dialog__art" :class="`pokemon-dialog__art--${selected.Types[0]}`">
          <img v-if="selectedImage" :src="selectedImage" :alt="`${selected.name} ${showShiny ? 'shiny' : 'normal'} artwork`" width="240" height="240">
          <span v-else>Artwork unavailable</span>
        </div>
        <div class="pokemon-dialog__content">
          <div class="pokemon-dialog__title"><span class="pokemon-dialog__number">#{{ String(selected.Id).padStart(4, '0') }}</span><h2>{{ selected.name }}</h2></div>
          <div class="pokemon-dialog__summary">
            <div class="badge-row"><TypeBadge v-for="type in selected.Types" :key="type" :type="type" /></div>
            <ShinyToggle v-if="canShowShiny" v-model="showShiny" />
          </div>
          <dl class="detail-list">
            <div><dt>Height</dt><dd>{{ selected.Height }} dm</dd></div>
            <div><dt>Weight</dt><dd>{{ selected.Weight }} hg</dd></div>
            <div><dt>Abilities</dt><dd>{{ selected.Abilities.map(displayName).join(', ') }}</dd></div>
            <div><dt>Day caught</dt><dd>{{ selected.DayCaught }}</dd></div>
            <div><dt>Time caught</dt><dd>{{ selected.TimeCaught }}</dd></div>
          </dl>
          <div class="pokemon-dialog__actions">
            <button class="button button--outline" type="button" @click="closeDetails">Close</button>
            <button class="button button--danger" type="button" @click="openConfirmation">Release</button>
          </div>
        </div>
      </template>
    </dialog>

    <dialog ref="confirmDialog" class="confirm-dialog" aria-labelledby="confirm-title">
      <span class="confirm-dialog__icon" aria-hidden="true">!</span>
      <h2 id="confirm-title">Are you sure you want to release this Pokemon?</h2>
      <p v-if="selected">{{ selected.name }} will leave your collection.</p>
      <div class="confirm-dialog__actions">
        <button class="button button--outline" type="button" :disabled="releasing" @click="confirmDialog?.close()">No</button>
        <button class="button button--danger" type="button" :disabled="releasing" @click="confirmRelease">Yes</button>
      </div>
    </dialog>
  </div>
</template>
