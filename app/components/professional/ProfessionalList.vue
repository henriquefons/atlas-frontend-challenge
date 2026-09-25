<script setup lang="ts">
/** Responsive grid of professional cards with loading/empty/error states. */
import type { Professional } from '@/types/professional'

withDefaults(
  defineProps<{
    items: Professional[]
    loading?: boolean
    error?: string | null
    skeletonCount?: number
  }>(),
  { loading: false, error: null, skeletonCount: 8 },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <!-- Error state -->
  <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
    <p class="text-sm font-medium text-red-800">{{ error }}</p>
    <BaseButton class="mt-3" size="sm" variant="secondary" @click="$emit('retry')">
      Tentar novamente
    </BaseButton>
  </div>

  <!-- Loading state (skeletons) -->
  <div
    v-else-if="loading"
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    aria-busy="true"
    aria-label="Carregando profissionais"
  >
    <div
      v-for="n in skeletonCount"
      :key="n"
      class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <div class="flex items-start gap-3">
        <BaseSkeleton rounded="rounded-full" class="h-12 w-12" />
        <div class="flex-1 space-y-2">
          <BaseSkeleton class="h-4 w-3/4" />
          <BaseSkeleton class="h-3 w-1/2" />
        </div>
      </div>
      <div class="mt-4 space-y-2">
        <BaseSkeleton class="h-3 w-full" />
        <BaseSkeleton class="h-3 w-5/6" />
      </div>
      <BaseSkeleton class="mt-4 h-8 w-full" />
    </div>
  </div>

  <!-- Empty state -->
  <div
    v-else-if="items.length === 0"
    class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"
  >
    <p class="font-medium text-slate-700">Nenhum profissional encontrado</p>
    <p class="mt-1 text-sm text-slate-500">Tente ajustar a busca ou os filtros.</p>
  </div>

  <!-- Results -->
  <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <ProfessionalCard
      v-for="professional in items"
      :key="professional.id"
      :professional="professional"
    />
  </div>
</template>
