/**
 * Generates the mock catalog into `data/professionals.json`.
 * Fixed faker seed + pt_BR locale => deterministic data. Usage: npm run generate:data
 */
import { faker } from '@faker-js/faker/locale/pt_BR'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = resolve(__dirname, '../data/professionals.json')

const SEED = 42
const TOTAL = 520

/** Catalog of categories -> professions -> price range (BRL). */
const CATALOG = {
  'Serviços Domésticos': {
    professions: [
      'Diarista',
      'Passadeira',
      'Cozinheira',
      'Babá',
      'Cuidador de Idosos',
      'Jardineiro',
    ],
    price: [80, 250],
  },
  'Construção e Reforma': {
    professions: ['Encanador', 'Eletricista', 'Pintor', 'Pedreiro', 'Marceneiro', 'Gesseiro'],
    price: [150, 900],
  },
  Tecnologia: {
    professions: [
      'Desenvolvedor Web',
      'Designer UX/UI',
      'Suporte Técnico',
      'Analista de Dados',
      'Redator',
      'Social Media',
    ],
    price: [200, 1500],
  },
  'Saúde e Bem-estar': {
    professions: [
      'Psicólogo',
      'Fisioterapeuta',
      'Nutricionista',
      'Personal Trainer',
      'Massoterapeuta',
      'Fonoaudiólogo',
    ],
    price: [120, 600],
  },
  'Beleza e Estética': {
    professions: ['Cabeleireiro', 'Manicure', 'Barbeiro', 'Maquiador', 'Esteticista', 'Depiladora'],
    price: [60, 400],
  },
  Educação: {
    professions: [
      'Professor Particular',
      'Professor de Idiomas',
      'Professor de Música',
      'Tutor de Matemática',
      'Instrutor de Informática',
      'Pedagogo',
    ],
    price: [70, 350],
  },
  Eventos: {
    professions: ['Fotógrafo', 'DJ', 'Cerimonialista', 'Garçom', 'Decorador', 'Buffet'],
    price: [250, 2500],
  },
  Automotivo: {
    professions: [
      'Mecânico',
      'Eletricista Automotivo',
      'Funileiro',
      'Borracheiro',
      'Lavador',
      'Vidraceiro',
    ],
    price: [100, 1200],
  },
}

const AVAILABILITY_OPTIONS = [
  ['Seg a Sex, 08h–18h'],
  ['Seg a Sáb, 09h–19h'],
  ['Ter a Sáb, 08h–17h'],
  ['Seg, Qua e Sex, 13h–20h'],
  ['Fins de semana, 09h–16h'],
  ['Horário flexível'],
]

const SERVICE_SUFFIXES = [
  'Residencial',
  'Comercial',
  'Emergencial',
  'Sob orçamento',
  'Atendimento a domicílio',
  'Pacote mensal',
]

/** pt-BR description templates (faker.lorem outputs Latin). */
const DESCRIPTION_TEMPLATES = [
  'Profissional de {profession} com {years} anos de experiência em {category}. Atende com pontualidade e foco na satisfação do cliente.',
  '{profession} dedicado(a), especializado(a) em {category}. Trabalha com materiais de qualidade e oferece garantia no serviço.',
  'Atuo como {profession} há {years} anos, sempre buscando entregar o melhor resultado em {category}. Orçamento sem compromisso.',
  '{profession} com ampla experiência em {category}. Atendimento personalizado, preços justos e compromisso com prazos.',
  'Sou {profession} e ofereço serviços de {category} com atenção aos detalhes. Mais de {years} anos ajudando clientes na região.',
]

/** imgix params: 160×160, face-aware crop, modern formats (`auto=format`). */
const AVATAR_PARAMS = 'auto=format&fit=crop&crop=faces&w=160&h=160&q=80'
const avatarPhotoUrl = (id) => `https://images.unsplash.com/photo-${id}?${AVATAR_PARAMS}`

const FEMALE_AVATAR_IDS = [
  '1502685104226-ee32379fefbe',
  '1494790108377-be9c29b29330',
  '1438761681033-6461ffad8d80',
  '1534528741775-53994a69daeb',
  '1544005313-94ddf0286df2',
  '1517841905240-472988babdf9',
  '1524504388940-b1c1722653e1',
  '1573496359142-b8d87734a5a2',
  '1580489944761-15a19d654956',
  '1607746882042-944635dfe10e',
  '1544723795-3fb6469f5b39',
]

const MALE_AVATAR_IDS = [
  '1507003211169-0a1dd7228f2d',
  '1500648767791-00dcc994a43e',
  '1547425260-76bcadfb4f2c',
  '1552058544-f2b08422138a',
  '1531427186611-ecfd6d936c79',
  '1519085360753-af0119f7cbe7',
  '1560250097-0b93528c311a',
  '1568602471122-7832951cc4c5',
  '1599566150163-29194dcaad36',
  '1633332755192-727a05c4013d',
  '1463453091185-61582044d556',
  '1472099645785-5658abf4ff4e',
  '1506794778202-cad84cf45f1d',
]

const BROKEN_AVATAR_URLS = [
  'https://images.unsplash.com/photo-0000000000000-000000000000?auto=format&w=160&h=160&q=80',
  'https://images.unsplash.com/avatar-inexistente.jpg',
  'https://cdn.exemplo-invalido.dev/avatar.jpg',
]

/** Rounds to 2 decimal places. */
const round2 = (value) => Math.round(value * 100) / 100

function buildProfessional(index) {
  const categories = Object.keys(CATALOG)
  const category = faker.helpers.arrayElement(categories)
  const { professions, price } = CATALOG[category]
  const profession = faker.helpers.arrayElement(professions)

  const services = faker.helpers
    .arrayElements(SERVICE_SUFFIXES, { min: 2, max: 4 })
    .map((suffix) => `${profession} — ${suffix}`)

  const description = faker.helpers
    .arrayElement(DESCRIPTION_TEMPLATES)
    .replaceAll('{profession}', profession)
    .replaceAll('{category}', category)
    .replaceAll('{years}', String(faker.number.int({ min: 1, max: 20 })))

  const professionalId = `pro-${String(index + 1).padStart(4, '0')}`

  const sex = faker.person.sexType() // 'female' | 'male'
  const name = faker.person.fullName({ sex })

  const validPhotoIds = sex === 'female' ? FEMALE_AVATAR_IDS : MALE_AVATAR_IDS
  const validUrls = validPhotoIds.map(avatarPhotoUrl)

  const avatarUrl = faker.helpers.arrayElement([...validUrls, ...BROKEN_AVATAR_URLS])

  const professional = {
    id: professionalId,
    name,
    profession,
    category,
    avatarUrl,
    price: round2(faker.number.float({ min: price[0], max: price[1], fractionDigits: 2 })),
    rating: round2(faker.number.float({ min: 3, max: 5, fractionDigits: 1 })),
    distanceKm: round2(faker.number.float({ min: 0.5, max: 40, fractionDigits: 1 })),
    city: `${faker.location.city()} - ${faker.location.state({ abbreviated: true })}`,
    description,
    services,
    availability: faker.helpers.arrayElement(AVAILABILITY_OPTIONS),
  }

  return professional
}

function main() {
  faker.seed(SEED)

  const professionals = Array.from({ length: TOTAL }, (_, index) => buildProfessional(index))

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(professionals, null, 2)}\n`, 'utf-8')

  console.log(`✔ ${professionals.length} profissionais gerados em ${OUTPUT_PATH}`)
}

main()
