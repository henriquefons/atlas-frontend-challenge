/**
 * ofetch rejects with a `FetchError` that carries `statusCode` and
 * `response.status`. A `NuxtError` exposes the canonical `status` (Nuxt 4) and the
 * deprecated `statusCode` as an alias over it; the server payload carries both, and
 * the canonical field is read first.
 *
 * Returns `undefined` for anything else (plain `Error`, network failures without
 * a response, non-objects), so each caller picks its own default.
 */
export function statusCodeOf(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined

  const { status, statusCode, response } = error as {
    status?: unknown
    statusCode?: unknown
    response?: { status?: unknown }
  }
  const code = status || statusCode || response?.status

  return typeof code === 'number' ? code : undefined
}

/**
 * The copy that goes with the status: canonical `statusText` (Nuxt 4) first, then
 * the deprecated `statusMessage` as an alias. `message` is deliberately not read —
 * it can be a raw, technical string, and the error page keeps a safe fallback for
 * exactly that case (it shows `message` in dev only).
 */
export function statusTextOf(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined

  const { statusText, statusMessage } = error as { statusText?: unknown; statusMessage?: unknown }
  const text = statusText || statusMessage

  return typeof text === 'string' && text.trim() !== '' ? text : undefined
}

/** True only for a real 404, so a 500/offline is never reported as "not found". */
export function isNotFoundError(error: unknown): boolean {
  return statusCodeOf(error) === 404
}

/** The error the store throws to reach `app/error.vue`. */
export interface HttpError extends Error {
  statusCode: number
  statusMessage: string
}

/**
 * Builds the error the store throws upstream: a plain `Error` carrying the two
 * fields h3 (and therefore Nuxt) reads as the HTTP status and the copy. Being
 * plain, it keeps the store testable outside a Nuxt runtime, where the
 * `createError` auto-import does not exist.
 */
export function createHttpError(statusCode: number, statusMessage: string): HttpError {
  return Object.assign(new Error(statusMessage), { statusCode, statusMessage })
}
