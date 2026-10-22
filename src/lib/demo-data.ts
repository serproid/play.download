import type { AppDetail, CatalogApp, ReviewItem } from './types'

export const demoCategories = [
  {
    id: 'cat-vendas',
    name: 'Vendas e Negócios',
    slug: 'vendas-e-negocios',
    type: 'app' as const,
  },
  {
    id: 'cat-comunicacao',
    name: 'Comunicação',
    slug: 'comunicacao',
    type: 'app' as const,
  },
  {
    id: 'cat-fotografia',
    name: 'Fotografia',
    slug: 'fotografia',
    type: 'app' as const,
  },
  {
    id: 'cat-musica',
    name: 'Música e Áudio',
    slug: 'musica-e-audio',
    type: 'app' as const,
  },
  { id: 'cat-acao', name: 'Ação', slug: 'acao', type: 'game' as const },
  {
    id: 'cat-corrida',
    name: 'Corrida',
    slug: 'corrida',
    type: 'game' as const,
  },
  { id: 'cat-drama', name: 'Drama', slug: 'drama', type: 'movie' as const },
  {
    id: 'cat-negocios',
    name: 'Negócios',
    slug: 'negocios',
    type: 'book' as const,
  },
]

const base = (
  data: Omit<CatalogApp, 'iconUrl' | 'bannerUrl' | 'status' | 'updatedAt'> & {
    updatedAt?: string
  },
): CatalogApp => ({
  iconUrl: null,
  bannerUrl: null,
  status: 'published',
  updatedAt: data.updatedAt ?? '2026-10-19T17:36:33.164Z',
  ...data,
})

export const demoApps: CatalogApp[] = [
  base({
    id: 'demo-ponto-de-coleta',
    slug: 'ponto-de-coleta',
    name: 'Ponto de Coleta',
    type: 'app',
    tagline: 'Encontre pontos de coleta perto de você',
    developer: 'Mercado Livre',
    rating: 4.9,
    reviewCount: 998,
    downloads: 900_000_000,
    featured: true,
    categoryName: 'Vendas e Negócios',
    ageRating: 'Livre',
  }),
  base({
    id: 'demo-nexus-chat',
    slug: 'nexus-chat',
    name: 'Nexus Chat',
    type: 'app',
    tagline: 'Conversas rápidas, chamadas e comunidades',
    developer: 'Nexus Labs',
    rating: 4.7,
    reviewCount: 320,
    downloads: 120_000_000,
    featured: true,
    categoryName: 'Comunicação',
    ageRating: '12',
  }),
  base({
    id: 'demo-turbo-race',
    slug: 'turbo-race',
    name: 'Turbo Race',
    type: 'game',
    tagline: 'Corridas de rua com gráficos de nova geração',
    developer: 'Speed Studios',
    rating: 4.6,
    reviewCount: 412,
    downloads: 55_000_000,
    featured: true,
    categoryName: 'Corrida',
    ageRating: '10',
  }),
  base({
    id: 'demo-cineflix',
    slug: 'cineflix',
    name: 'CineFlix',
    type: 'movie',
    tagline: 'Filmes e séries para assistir onde quiser',
    developer: 'CineFlix',
    rating: 4.8,
    reviewCount: 210,
    downloads: 340_000_000,
    featured: false,
    categoryName: 'Drama',
    ageRating: '14',
  }),
  base({
    id: 'demo-leitura-mais',
    slug: 'leitura-mais',
    name: 'Leitura+',
    type: 'book',
    tagline: 'Milhares de livros no seu bolso',
    developer: 'Leitura+',
    rating: 4.5,
    reviewCount: 143,
    downloads: 28_000_000,
    featured: true,
    categoryName: 'Negócios',
    ageRating: 'Livre',
  }),
  base({
    id: 'demo-pixel-studio',
    slug: 'pixel-studio',
    name: 'Pixel Studio',
    type: 'app',
    tagline: 'Edite fotos com inteligência artificial',
    developer: 'Pixel Labs',
    rating: 4.4,
    reviewCount: 89,
    downloads: 12_500_000,
    featured: false,
    categoryName: 'Fotografia',
    ageRating: 'Livre',
  }),
  base({
    id: 'demo-batalha-real',
    slug: 'batalha-real',
    name: 'Batalha Real',
    type: 'game',
    tagline: '100 jogadores, uma ilha, um vencedor',
    developer: 'Arena Games',
    rating: 4.3,
    reviewCount: 501,
    downloads: 210_000_000,
    featured: false,
    categoryName: 'Ação',
    ageRating: '16',
  }),
  base({
    id: 'demo-sonora',
    slug: 'sonora',
    name: 'Sonora Music',
    type: 'app',
    tagline: 'Sua música favorita em qualquer lugar',
    developer: 'Sonora',
    rating: 4.8,
    reviewCount: 733,
    downloads: 480_000_000,
    featured: false,
    categoryName: 'Música e Áudio',
    ageRating: 'Livre',
  }),
  base({
    id: 'demo-a-origem',
    slug: 'a-origem',
    name: 'A Origem',
    type: 'movie',
    tagline: 'Um thriller que desafia a sua percepção',
    developer: 'Estúdio Aurora',
    rating: 4.7,
    reviewCount: 98,
    downloads: 4_200_000,
    featured: false,
    categoryName: 'Drama',
    ageRating: '14',
  }),
  base({
    id: 'demo-codigo-limpo',
    slug: 'codigo-limpo',
    name: 'Código Limpo',
    type: 'book',
    tagline: 'Boas práticas para escrever software melhor',
    developer: 'Editora Técnica',
    rating: 4.9,
    reviewCount: 64,
    downloads: 1_800_000,
    featured: false,
    categoryName: 'Negócios',
    ageRating: 'Livre',
  }),
]

export const demoDescriptions: Record<string, string> = {
  'ponto-de-coleta':
    'Encontre os pontos de coleta mais próximos, acompanhe suas entregas e gerencie seus envios em um só lugar. Uma experiência simples, rápida e feita para o seu dia a dia.',
  'nexus-chat':
    'Converse com amigos e equipes, faça chamadas de voz e vídeo e participe de comunidades. Tudo sincronizado entre celular e computador.',
  'turbo-race':
    'Escolha seu carro, personalize cada detalhe e dispute corridas online com jogadores do mundo inteiro.',
  cineflix:
    'Assista a filmes, séries e documentários em alta definição. Baixe seus títulos favoritos para assistir offline.',
  'leitura-mais':
    'Leve sua biblioteca para onde for. Compre, baixe e leia livros digitais com sincronização de página e modo noturno.',
  'pixel-studio':
    'Ferramentas profissionais de edição de fotos com IA, filtros, remoção de fundo e exportação em alta resolução.',
  'batalha-real':
    'Salte de paraquedas, explore o mapa e forme alianças. Sobreviva até o final para vencer a batalha.',
  sonora:
    'Milhões de músicas, playlists personalizadas e podcasts. Baixe para ouvir sem internet.',
  'a-origem':
    'Um especialista em sonhos recebe a missão de plantar uma ideia na mente de um herdeiro. O limite entre sonho e realidade desaparece.',
  'codigo-limpo':
    'Um guia essencial sobre legibilidade, refatoração e disciplina para desenvolvedores que se preocupam com a qualidade do código.',
}

export const demoReviews: Record<string, ReviewItem[]> = {
  'ponto-de-coleta': [
    {
      id: 'rev-1',
      rating: 5,
      comment:
        'Muito bom! Interface simples e intuitiva. Faz tudo o que preciso.',
      createdAt: '2026-10-19T12:00:00.000Z',
      helpfulCount: 297,
      userName: 'Fernanda Rocha',
      userImage: null,
    },
    {
      id: 'rev-2',
      rating: 5,
      comment:
        'Aplicativo excelente! Uso todos os dias e nunca tive problemas.',
      createdAt: '2026-10-16T12:00:00.000Z',
      helpfulCount: 299,
      userName: 'Lucas Oliveira',
      userImage: null,
    },
    {
      id: 'rev-3',
      rating: 4,
      comment:
        'Aplicativo excelente! Uso todos os dias e nunca tive problemas.',
      createdAt: '2026-10-12T12:00:00.000Z',
      helpfulCount: 386,
      userName: 'Gustavo Lima',
      userImage: null,
    },
  ],
}

export function getDemoAppBySlug(slug: string): AppDetail | null {
  const app = demoApps.find((item) => item.slug === slug)
  if (!app) return null

  const reviews = demoReviews[slug] ?? []
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  if (reviews.length > 0) {
    const reviewCount = app.reviewCount || reviews.length
    distribution[5] = Math.round(reviewCount * 0.82)
    distribution[4] = Math.round(reviewCount * 0.12)
    distribution[3] = Math.round(reviewCount * 0.04)
    distribution[2] = Math.round(reviewCount * 0.015)
    distribution[1] = Math.max(
      0,
      reviewCount -
        distribution[5] -
        distribution[4] -
        distribution[3] -
        distribution[2],
    )
  }

  return {
    ...app,
    description: demoDescriptions[slug] ?? app.tagline,
    version: '4.3',
    size: 'Varia por dispositivo',
    requirements: 'Android 8.0 ou superior',
    screenshots: [],
    fileUrl: null,
    fileName: null,
    fileSize: null,
    categoryId: null,
    reviews,
    distribution,
    submittedBy: null,
  }
}
