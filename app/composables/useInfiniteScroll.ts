/**
 * Calls `onLoadMore` when `target` enters the viewport.
 *
 * `IntersectionObserver` only fires on changes, and short content keeps the
 * target visible, so the target is re-observed whenever `watch` changes:
 * `observe()` always emits an initial entry, and this also honours `rootMargin`
 * (unlike a manual `getBoundingClientRect` check).
 *
 * `supported` is `false` on the server and without `IntersectionObserver`, so
 * callers can fall back to an explicit button.
 *
 * @param target     Element to observe (usually a sentinel after the list).
 * @param onLoadMore Called when the target becomes visible.
 * @param options    `rootMargin` pre-loads before the target is on screen;
 *                   `enabled` gates the callback (e.g. "there are more pages");
 *                   `watch` re-checks after each change (e.g. `() => items.length`).
 */
import type { WatchSource } from 'vue'

export function useInfiniteScroll(
  target: Ref<Element | null>,
  onLoadMore: () => void,
  options: { rootMargin?: string; enabled?: () => boolean; watch?: WatchSource } = {},
) {
  const { rootMargin = '0px 0px 600px 0px', enabled = () => true } = options

  // Hooks registered after the first `await` in setup() are dropped, so the
  // observer would never start. Warn in dev only.
  if (import.meta.dev && !getCurrentInstance()) {
    console.warn(
      '[useInfiniteScroll] no active component instance — call it before the first `await` of setup(), otherwise onMounted/onBeforeUnmount are dropped.',
    )
  }

  const supported = ref(false)
  let observer: IntersectionObserver | undefined

  function trigger() {
    if (enabled()) onLoadMore()
  }

  function stop() {
    observer?.disconnect()
    observer = undefined
  }

  /** (Re)observes the target, which emits an initial entry every time. */
  function start() {
    if (!import.meta.client || !supported.value || !target.value) return
    stop()
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) trigger()
      },
      { rootMargin, threshold: 0 },
    )
    observer.observe(target.value)
  }

  if (options.watch) {
    // The target moved: measure it only after the new content is rendered.
    watch(options.watch, async () => {
      await nextTick()
      start()
    })
  }

  onMounted(() => {
    if (!import.meta.client || !('IntersectionObserver' in window)) return
    supported.value = true
    start()
  })

  // Re-observe when the sentinel mounts/unmounts (e.g. behind a `v-if`).
  watch(target, (el) => {
    if (!supported.value) return
    if (el) start()
    else stop()
  })

  onBeforeUnmount(stop)

  return { supported }
}
