import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { hashPassword } from 'better-auth/crypto'
import * as schema from '../src/lib/db/schema'
import {
  demoApps,
  demoCategories,
  demoDescriptions,
  demoReviews,
} from '../src/lib/demo-data'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error(
    'DATABASE_URL não definida. Copie .env.example para .env e configure a conexão do Supabase.',
  )
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.DATABASE_SSL === 'false'
      ? false
      : /supabase|neon|sslmode=require/.test(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
})

const db = drizzle(pool, { schema })

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@playdownload.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin12345'
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Administrador'

async function ensureUser({
  name,
  email,
  password,
  role,
}: {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
}) {
  const [existing] = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, email))
    .limit(1)

  if (existing) {
    if (role === 'admin' && existing.role !== 'admin') {
      await db
        .update(schema.user)
        .set({ role: 'admin' })
        .where(eq(schema.user.id, existing.id))
    }
    return existing
  }

  const id = randomUUID()
  const now = new Date()
  await db.insert(schema.user).values({
    id,
    name,
    email,
    emailVerified: true,
    role,
    createdAt: now,
    updatedAt: now,
  })

  await db.insert(schema.account).values({
    id: randomUUID(),
    accountId: id,
    providerId: 'credential',
    userId: id,
    password: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  })

  return { id, name, email, role }
}

async function main() {
  console.log('Semeando categorias...')
  for (const category of demoCategories) {
    await db
      .insert(schema.categories)
      .values({
        name: category.name,
        slug: category.slug,
        type: category.type,
      })
      .onConflictDoNothing({ target: schema.categories.slug })
  }

  const categoryRows = await db.select().from(schema.categories)
  const categoryByName = new Map(categoryRows.map((row) => [row.name, row.id]))

  console.log('Criando administrador...')
  const admin = await ensureUser({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  })

  console.log('Criando usuários de demonstração...')
  const demoUsers = [
    { name: 'Fernanda Rocha', email: 'fernanda@example.com' },
    { name: 'Lucas Oliveira', email: 'lucas@example.com' },
    { name: 'Gustavo Lima', email: 'gustavo@example.com' },
  ]
  const userByName = new Map<string, { id: string }>()
  for (const person of demoUsers) {
    const created = await ensureUser({
      ...person,
      password: 'demo12345',
      role: 'user',
    })
    userByName.set(person.name, created)
  }

  console.log('Publicando apps de demonstração...')
  for (const app of demoApps) {
    await db
      .insert(schema.apps)
      .values({
        name: app.name,
        slug: app.slug,
        type: app.type,
        tagline: app.tagline,
        description: demoDescriptions[app.slug] ?? app.tagline,
        developer: app.developer,
        version: '4.3',
        size: 'Varia por dispositivo',
        requirements: 'Android 8.0 ou superior',
        ageRating: app.ageRating,
        categoryId: app.categoryName
          ? (categoryByName.get(app.categoryName) ?? null)
          : null,
        iconUrl: null,
        bannerUrl: null,
        screenshots: [],
        rating: app.rating,
        reviewCount: app.reviewCount,
        downloads: app.downloads,
        featured: app.featured,
        status: 'published',
        submittedBy: admin.id,
        createdAt: new Date(app.updatedAt),
        updatedAt: new Date(app.updatedAt),
      })
      .onConflictDoNothing({ target: schema.apps.slug })
  }

  console.log('Criando avaliações de demonstração...')
  const [pontoDeColeta] = await db
    .select({ id: schema.apps.id })
    .from(schema.apps)
    .where(eq(schema.apps.slug, 'ponto-de-coleta'))
    .limit(1)

  if (pontoDeColeta) {
    const reviews = demoReviews['ponto-de-coleta'] ?? []
    for (const review of reviews) {
      const author = userByName.get(review.userName)
      if (!author) continue
      await db
        .insert(schema.reviews)
        .values({
          appId: pontoDeColeta.id,
          userId: author.id,
          rating: review.rating,
          comment: review.comment,
          helpfulCount: review.helpfulCount,
          createdAt: new Date(review.createdAt),
          updatedAt: new Date(review.createdAt),
        })
        .onConflictDoNothing()
    }
  }

  console.log('')
  console.log('Seed concluído.')
  console.log(`Admin: ${ADMIN_EMAIL}`)
  console.log(`Senha: ${ADMIN_PASSWORD}`)
  console.log('')
  console.log('Acesse http://localhost:3000/admin após entrar.')
}

main()
  .catch((error) => {
    console.error('Falha ao executar o seed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
