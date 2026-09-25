import type { Professional } from '~/types/professional'
import professionals from '#data/professionals.json'

/** Professional detail by id. Returns 404 when not found. */
export default defineEventHandler((event): Professional => {
  const id = getRouterParam(event, 'id')
  const professional = (professionals as Professional[]).find((item) => item.id === id)

  if (!professional) {
    throw createError({
      statusCode: 404,
      statusMessage: `Profissional "${id}" não encontrado.`,
    })
  }

  return professional
})
