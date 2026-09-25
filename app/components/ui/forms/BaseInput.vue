<script setup lang="ts">
/** Text input with optional label and icon slot. */
withDefaults(
  defineProps<{
    modelValue: string
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

defineEmits<{ 'update:modelValue': [value: string] }>()
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
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        class="block w-full rounded-lg border-0 bg-white py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
        :class="$slots.icon ? 'pl-10 pr-3' : 'px-3'"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
