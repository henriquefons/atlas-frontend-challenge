/**
 * Normalizes a string for searching: lowercase and without diacritics.
 *
 * `normalize('NFD')` decomposes "é" into "e" + U+0301 (combining acute) and "ç"
 * into "c" + U+0327 (combining cedilla), so dropping the combining diacritical
 * marks block (U+0300–U+036F) turns "técnico", "TÉCNICO" and "tecnico" into the
 * same string. It is the only reason the API can search "tecnico" and still find
 * "Técnico em Edificações".
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}
