/**
 * Pure formatting helpers used across the UI.
 * Auto-imported by Nuxt (no manual import needed).
 */

/** Formats a number as Brazilian currency (e.g. 1234.5 -> "R$ 1.234,50"). */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/** Formats a distance in km (e.g. 3.4 -> "3,4 km"). */
export function formatDistance(km: number): string {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(km)} km`
}

/** Formats a rating with one decimal (e.g. 4.7 -> "4,7"). */
export function formatRating(rating: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating)
}
