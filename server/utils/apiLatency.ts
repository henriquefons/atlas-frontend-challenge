import { setTimeout as sleep } from 'node:timers/promises'

/** Simulated API latency in ms. Set to 0 to disable. */
const API_LATENCY_MS = 600

/** Adds `API_LATENCY_MS` in dev only, so loading states are visible (dropped from the build). */
export async function simulateApiLatency(): Promise<void> {
  if (!import.meta.dev || API_LATENCY_MS <= 0) return
  await sleep(API_LATENCY_MS)
}
