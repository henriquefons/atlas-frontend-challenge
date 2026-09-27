<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getAvatarColor, getInitials } from '@/utils/avatar'

const props = withDefaults(
  defineProps<{
    name: string
    src?: string | null
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { src: null, size: 'md' },
)

/** A failed photo (404, offline CDN, blocked host) degrades to the initials badge. */
const failed = ref(false)

/** The rendered <img>, read back after hydration to catch a lost `error`. */
const imgRef = ref<HTMLImageElement | null>(null)

// A new src deserves a new attempt, otherwise a card recycled by the listing would stay failed.
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)

const photoSrc = computed(() => props.src || '')
const showPhoto = computed(() => photoSrc.value !== '' && !failed.value)
const initials = computed(() => getInitials(props.name))
const colorClass = computed(() => getAvatarColor(props.name))

onMounted(() => {
  const img = imgRef.value
  if (img && img.complete && img.naturalWidth === 0) failed.value = true
})

const SIZES: Record<string, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-2xl',
}

/** The large avatar is the profile header portrait (above the fold), so it loads eagerly. */
const loading = computed(() => (props.size === 'lg' ? 'eager' : 'lazy'))
</script>

<template>
  <img
    v-if="showPhoto"
    ref="imgRef"
    :src="photoSrc"
    :alt="name"
    width="160"
    height="160"
    :loading="loading"
    decoding="async"
    referrerpolicy="no-referrer"
    class="shrink-0 rounded-full bg-slate-200 object-cover text-transparent"
    :class="SIZES[size]"
    @error="failed = true"
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
