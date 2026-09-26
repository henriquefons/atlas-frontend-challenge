<script setup lang="ts">
/** Search input with debounce; the model is updated with the debounced value. */
const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    debounce?: number
  }>(),
  { debounce: 300 },
)

const local = ref(model.value)

// Keep the local value in sync when the parent changes it (e.g. URL navigation).
watch(model, (value) => {
  if (value !== local.value) local.value = value
})

const emitDebounced = useDebounce((value: string) => {
  model.value = value
}, props.debounce)

function onInput(value: string) {
  local.value = value
  emitDebounced(value)
}
</script>

<template>
  <BaseInput
    id="professional-search"
    :model-value="local"
    type="search"
    placeholder="Buscar por nome ou profissão..."
    aria-label="Buscar profissionais"
    @update:model-value="onInput"
  >
    <template #icon>
      <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
          clip-rule="evenodd"
        />
      </svg>
    </template>
  </BaseInput>
</template>
