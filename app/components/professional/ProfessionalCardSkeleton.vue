<script setup lang="ts">
/** Placeholder card for the listing loading states (first page and "load more"). */
</script>

<template>
  <div class="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200" aria-hidden="true">
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
</template>
