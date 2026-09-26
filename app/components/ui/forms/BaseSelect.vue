<script setup lang="ts">
/** Native select with label. */
export interface SelectOption {
  value: string
  label: string
}

// Two-way binding via `defineModel` (Vue 3.4+): replaces the
// `modelValue` prop + `update:modelValue` emit pair with a writable ref.
const model = defineModel<string>({ required: true })

withDefaults(
  defineProps<{
    options: SelectOption[]
    label?: string
    id?: string
  }>(),
  {
    label: undefined,
    id: undefined,
  },
)
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="mb-1 block text-sm font-medium text-slate-700">
      {{ label }}
    </label>
    <select
      :id="id"
      v-model="model"
      class="block w-full rounded-lg border-0 bg-white py-2 pl-3 pr-8 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
