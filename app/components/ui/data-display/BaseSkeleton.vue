<script setup lang="ts">
/** Loading placeholder block. */
withDefaults(
  defineProps<{
    rounded?: string
  }>(),
  { rounded: 'rounded-md' },
)
</script>

<template>
  <div class="animate-pulse bg-slate-200" :class="rounded" />
</template>
