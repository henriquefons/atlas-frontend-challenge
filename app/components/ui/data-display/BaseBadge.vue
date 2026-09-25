<script setup lang="ts">
/** Small pill label. */
withDefaults(
  defineProps<{
    variant?: 'neutral' | 'primary' | 'success'
  }>(),
  { variant: 'neutral' },
)

const VARIANTS: Record<string, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-indigo-50 text-indigo-700',
  success: 'bg-emerald-50 text-emerald-700',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="VARIANTS[variant]"
  >
    <slot />
  </span>
</template>
