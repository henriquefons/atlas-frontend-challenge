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

  return {
    id: `pro-${String(index + 1).padStart(4, '0')}`,
    name: faker.person.fullName(),
    profession,
    category,
    avatarUrl: null,
    price: round2(faker.number.float({ min: price[0], max: price[1], fractionDigits: 2 })),
    rating: round2(faker.number.float({ min: 3, max: 5, fractionDigits: 1 })),
    distanceKm: round2(faker.number.float({ min: 0.5, max: 40, fractionDigits: 1 })),
    city: `${faker.location.city()} - ${faker.location.state({ abbreviated: true })}`,
    description,
    services,
    availability: faker.helpers.arrayElement(AVAILABILITY_OPTIONS),
  }
}

function main() {
  faker.seed(SEED)

  const professionals = Array.from({ length: TOTAL }, (_, index) => buildProfessional(index))

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(professionals, null, 2)}\n`, 'utf-8')

  console.log(`✔ ${professionals.length} profissionais gerados em ${OUTPUT_PATH}`)
}

main()
