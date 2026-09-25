/**
 * Debounce helpers.
 *
 * `useDebounce` wraps a callback so it only runs after `delay` ms without new
 * calls. `useDebouncedRef` keeps a ref in sync with a debounced delay.
 * Auto-imported by Nuxt (no manual import needed).
 */

/**
 * Returns a debounced version of `fn`.
 *
 * The returned function shares a single timer, so rapid calls reset the delay.
 * The timer is cleared automatically when the component unmounts.
 *
 * @param fn    Callback to debounce.
 * @param delay Delay in milliseconds (default 300).
 */
export function useDebounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: Args) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  /** Cancels a pending call. */
  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  onBeforeUnmount(() => debounced.cancel())

  return debounced
}

/**
 * Returns a ref that mirrors `source` but only updates after `delay` ms of
 * inactivity. Useful to debounce a value (e.g. a search term) before reacting.
 *
 * @param source Ref (or getter) to observe.
 * @param delay  Delay in milliseconds (default 300).
 */
export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return debounced
}
