import type { ReviewItem } from './types'

const day = 24 * 60 * 60 * 1000

const templates = [
  {
    name: 'Ana Souza',
    rating: 5,
    comment: 'Muito bom! Interface simples e rápida. Recomendo.',
    helpful: 42,
    daysAgo: 3,
  },
  {
    name: 'Bruno Martins',
    rating: 5,
    comment: 'Funciona perfeitamente no meu celular. Não travou até agora.',
    helpful: 128,
    daysAgo: 5,
  },
  {
    name: 'Carla Mendes',
    rating: 5,
    comment: 'Ótimo app, atendeu exatamente o que eu precisava.',
    helpful: 87,
    daysAgo: 8,
  },
  {
    name: 'Diego Alves',
    rating: 4,
    comment:
      'Boa experiência no geral. Poderia ter mais opções, mas cumpre o que promete.',
    helpful: 19,
    daysAgo: 11,
  },
  {
    name: 'Elisa Rocha',
    rating: 5,
    comment: 'Gostei bastante, fácil de usar e sem anúncios chatos.',
    helpful: 64,
    daysAgo: 14,
  },
  {
    name: 'Felipe Costa',
    rating: 4,
    comment: 'Excelente! Já uso todos os dias.',
    helpful: 33,
    daysAgo: 18,
  },
  {
    name: 'Gabriela Nunes',
    rating: 5,
    comment: 'App leve e bem organizado. Parabéns aos desenvolvedores.',
    helpful: 51,
    daysAgo: 23,
  },
  {
    name: 'Henrique Lima',
    rating: 4,
    comment: 'Muito útil, salvou meu dia. Recomendo a todos.',
    helpful: 21,
    daysAgo: 29,
  },
]

export function getDefaultReviews(): ReviewItem[] {
  const now = Date.now()
  return templates.map((template, index) => ({
    id: `default-review-${index + 1}`,
    rating: template.rating,
    comment: template.comment,
    createdAt: new Date(now - template.daysAgo * day).toISOString(),
    helpfulCount: template.helpful,
    userName: template.name,
    userImage: null,
  }))
}
