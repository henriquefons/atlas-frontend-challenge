<script setup lang="ts">
defineProps<{ availability: string[] }>()
</script>

<template>
  <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
    <h2 class="text-lg font-semibold text-slate-900">Disponibilidade</h2>
    <ul v-if="availability.length" class="mt-3 space-y-2">
      <li
        v-for="slot in availability"
        :key="slot"
        class="flex items-center gap-2 text-sm text-slate-700"
      >
        <svg
          class="h-4 w-4 shrink-0 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ slot }}</span>
      </li>
    </ul>
    <p v-else class="mt-3 text-sm text-slate-500">Disponibilidade não informada.</p>
  </section>
</template>
