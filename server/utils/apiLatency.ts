import { setTimeout as sleep } from 'node:timers/promises'

/** Simulated API latency in ms. Set to 0 to disable. */
const API_LATENCY_MS = 600

/**
 * Adds latency to the mocked API so loading states are visible in dev.
 *
 * The data comes from a local JSON, so responses would return in a few
 * milliseconds and no skeleton would ever show. Dev only: `import.meta.dev` is
 * resolved at build time, so the delay is dropped from the production build.
 */
export async function simulateApiLatency(): Promise<void> {
  if (!import.meta.dev || API_LATENCY_MS <= 0) return
  await sleep(API_LATENCY_MS)
}
