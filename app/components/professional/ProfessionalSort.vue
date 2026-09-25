<script setup lang="ts">
/** Sort selector for the listing. */
import { SORT_OPTIONS } from '@/constants/professional'
import type { SortOption } from '@/types/professional'

defineProps<{ modelValue: SortOption }>()
defineEmits<{ 'update:modelValue': [value: SortOption] }>()
</script>

<template>
  <BaseSelect
    id="professional-sort"
    :model-value="modelValue"
    :options="SORT_OPTIONS"
    label="Ordenar por"
    @update:model-value="$emit('update:modelValue', $event as SortOption)"
  />
</template>
