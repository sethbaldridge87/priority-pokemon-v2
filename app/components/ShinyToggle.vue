<script setup lang="ts">
defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <button
    class="shiny-toggle"
    type="button"
    :aria-pressed="modelValue"
    :aria-label="modelValue ? 'Show normal image' : 'Show shiny image'"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span aria-hidden="true">✦</span> {{ modelValue ? 'Show normal' : 'Show shiny' }}
  </button>
</template>
