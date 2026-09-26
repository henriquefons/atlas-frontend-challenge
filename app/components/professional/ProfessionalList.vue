<script setup lang="ts">
import type { Professional } from '@/types/professional'

withDefaults(
  defineProps<{
    items: Professional[]
    loading?: boolean
    loadingMore?: boolean
    error?: string | null
    skeletonCount?: number
  }>(),
  { loading: false, loadingMore: false, error: null, skeletonCount: 8 },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
    <p class="text-sm font-medium text-red-800">{{ error }}</p>
    <BaseButton class="mt-3" size="sm" variant="secondary" @click="$emit('retry')">
      Tentar novamente
    </BaseButton>
  </div>

  <div
    v-else-if="loading"
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    aria-busy="true"
    aria-label="Carregando profissionais"
  >
    <ProfessionalCardSkeleton v-for="n in skeletonCount" :key="n" />
  </div>

  <div
    v-else-if="items.length === 0"
    class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"
  >
    <p class="font-medium text-slate-700">Nenhum profissional encontrado</p>
    <p class="mt-1 text-sm text-slate-500">Tente ajustar a busca ou os filtros.</p>
  </div>

  <!-- Appends skeletons instead of swapping the grid. -->
  <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <ProfessionalCard
      v-for="professional in items"
      :key="professional.id"
      v-memo="[professional.id]"
      class="card-cv"
      :professional="professional"
    />
    <template v-if="loadingMore">
      <ProfessionalCardSkeleton v-for="n in 4" :key="`more-${n}`" class="card-cv" />
    </template>
  </div>
</template>
