<script setup lang="ts">
/** Sort selector for the listing. */
import { SORT_OPTIONS } from '@/constants/professional'
import type { SortOption } from '@/types/professional'

// Two-way binding via `defineModel` (Vue 3.4+): replaces the
// `modelValue` prop + `update:modelValue` emit pair with a writable ref.
const model = defineModel<SortOption>({ required: true })
</script>

<template>
  <BaseSelect id="professional-sort" v-model="model" :options="SORT_OPTIONS" label="Ordenar por" />
</template>
