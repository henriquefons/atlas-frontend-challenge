<script setup lang="ts">
/**
 * Avatar with styled initials.
 * Uses the photo when available, otherwise renders deterministic initials.
 */
const props = withDefaults(
  defineProps<{
    name: string
    src?: string | null
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { src: null, size: 'md' },
)

const initials = computed(() => getInitials(props.name))
const colorClass = computed(() => getAvatarColor(props.name))

const SIZES: Record<string, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-2xl',
}
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="name"
    class="shrink-0 rounded-full object-cover"
    :class="SIZES[size]"
  />
  <span
    v-else
    class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
    :class="[SIZES[size], colorClass]"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>
