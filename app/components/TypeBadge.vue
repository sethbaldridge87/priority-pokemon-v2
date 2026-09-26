<script setup lang="ts">
import { displayName } from '~~/shared/types/pokemon'

defineProps<{ type: string }>()
</script>

<template>
  <span class="type-badge" :class="`type-badge--${type}`">{{ displayName(type) }}</span>
</template>
