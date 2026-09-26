<script setup lang="ts">
/** Text input with optional label and icon slot. */
const model = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    id?: string
    type?: string
  }>(),
  {
    label: undefined,
    placeholder: undefined,
    id: undefined,
    type: 'text',
  },
)
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="mb-1 block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <div class="relative">
      <span
        v-if="$slots.icon"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
      >
        <slot name="icon" />
      </span>
      <input
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        class="block w-full rounded-lg border-0 bg-white py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
        :class="$slots.icon ? 'pl-10 pr-3' : 'px-3'"
      />
    </div>
  </div>
</template>
