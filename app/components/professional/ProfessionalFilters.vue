<script setup lang="ts">
/** Category filter as a row of chips. */
import type { ProfessionalCategory } from '@/types/professional'

const model = defineModel<ProfessionalCategory | null>({ required: true })

defineProps<{
  categories: ProfessionalCategory[]
}>()

function select(category: ProfessionalCategory | null) {
  model.value = model.value === category ? null : category
}
</script>

<template>
  <div class="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
    <button
      type="button"
      class="rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      :class="
        model === null
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
      "
      :aria-pressed="model === null"
      @click="select(null)"
    >
      Todas
    </button>
    <button
      v-for="category in categories"
      :key="category"
      type="button"
      class="rounded-full px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      :class="
        model === category
          ? 'bg-indigo-600 text-white'
          : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
      "
      :aria-pressed="model === category"
      @click="select(category)"
    >
      {{ category }}
    </button>
  </div>
</template>
