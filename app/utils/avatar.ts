/**
 * Avatar helpers: derive initials and a stable color from a name.
 * Auto-imported by Nuxt (no manual import needed).
 */

/** Extracts up to two initials from a full name (e.g. "Ana Souza" -> "AS"). */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

/** Palette used for avatar backgrounds. */
const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-pink-500',
  'bg-fuchsia-500',
  'bg-purple-500',
  'bg-violet-500',
  'bg-indigo-500',
  'bg-blue-500',
  'bg-sky-500',
  'bg-cyan-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-orange-500',
]

/**
 * Returns a deterministic Tailwind background class based on the name.
 * Keeps avatar colors stable across renders without storing them.
 */
export function getAvatarColor(name: string): string {
  const hash = [...name].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!
}
