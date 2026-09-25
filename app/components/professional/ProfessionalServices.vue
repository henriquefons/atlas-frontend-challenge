<script setup lang="ts">
/** List of services offered by the professional. */
defineProps<{ services: string[] }>()
</script>

<template>
  <section class="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
    <h2 class="text-lg font-semibold text-slate-900">Serviços prestados</h2>
    <ul v-if="services.length" class="mt-3 flex flex-wrap gap-2">
      <li v-for="service in services" :key="service">
        <BaseBadge>{{ service }}</BaseBadge>
      </li>
    </ul>
    <p v-else class="mt-3 text-sm text-slate-500">Nenhum serviço informado.</p>
  </section>
</template>
