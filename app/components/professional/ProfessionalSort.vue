<script setup lang="ts">
import { SORT_OPTIONS } from '@/constants/professional'
import type { SortOption } from '@/types/professional'

const model = defineModel<SortOption>({ required: true })
</script>

<template>
  <BaseSelect id="professional-sort" v-model="model" :options="SORT_OPTIONS" label="Ordenar por" />
</template>
