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
