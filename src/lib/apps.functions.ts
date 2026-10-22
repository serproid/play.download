import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm'
import { auth } from './auth'
import {
  hasAdminRole,
  isDemoMode,
  requireAdmin,
  requireUser,
} from './auth.functions'
import { db } from './db'
import {
  apps,
  categories,
  downloads,
  reviews,
  user,
  type AppStatus,
  type AppType,
} from './db/schema'
import {
  demoApps,
  demoCategories,
  demoUsers,
  getDemoAdminApp,
  getDemoAdminApps,
  getDemoAdminStats,
  getDemoAppBySlug,
} from './demo-data'
import type {
  AdminApp,
  AdminStats,
  AppDetail,
  AppInput,
  CatalogApp,
  MySpaceData,
  UserRow,
} from './types'

type CatalogRow = {
  id: string
  slug: string
  name: string
  type: AppType
  tagline: string | null
  developer: string | null
  iconUrl: string | null
  bannerUrl: string | null
  rating: number
  reviewCount: number
  downloads: number
  featured: boolean
  ageRating: string | null
  updatedAt: Date
  status: AppStatus
  categoryName: string | null
}

const catalogSelection = {
  id: apps.id,
  slug: apps.slug,
  name: apps.name,
  type: apps.type,
  tagline: apps.tagline,
  developer: apps.developer,
  iconUrl: apps.iconUrl,
  bannerUrl: apps.bannerUrl,
  rating: apps.rating,
  reviewCount: apps.reviewCount,
  downloads: apps.downloads,
  featured: apps.featured,
  ageRating: apps.ageRating,
  updatedAt: apps.updatedAt,
  status: apps.status,
  categoryName: categories.name,
}

const realDownloadsSelection = sql<number>`(select count(*)::int from ${downloads} where ${downloads.appId} = ${apps.id})`

function toCatalogApp(row: CatalogRow): CatalogApp {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    tagline: row.tagline,
    developer: row.developer,
    iconUrl: row.iconUrl,
    bannerUrl: row.bannerUrl,
    rating: Number(row.rating ?? 0),
    reviewCount: row.reviewCount,
    downloads: row.downloads,
    featured: row.featured,
    ageRating: row.ageRating,
    updatedAt: row.updatedAt.toISOString(),
    status: row.status,
    categoryName: row.categoryName,
  }
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeDownloads(value: number | null | undefined) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.floor(Number(value)))
}

function normalizeRating(value: number | null | undefined) {
  const rating = Number(value)
  if (!Number.isFinite(rating)) return 4.6
  return Math.round(Math.min(5, Math.max(0, rating)) * 10) / 10
}

function normalizeReviewCount(value: number | null | undefined) {
  const count = Number(value)
  if (!Number.isFinite(count)) return 100000
  return Math.max(0, Math.floor(count))
}

function slugify(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'app'
  )
}

const reservedSlugs = new Set([
  'admin',
  'api',
  'users',
  'adicionar',
  'meus-apps',
  'app',
  'assets',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
])

async function uniqueSlug(name: string, ignoreId?: string) {
  const raw = slugify(name)
  const base = reservedSlugs.has(raw) ? `app-${raw}` : raw
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`
    const existing = await db
      .select({ id: apps.id })
      .from(apps)
      .where(eq(apps.slug, candidate))
      .limit(1)
    if (!existing[0] || existing[0].id === ignoreId) return candidate
  }
  return `${base}-${Date.now().toString(36)}`
}

function appLimitForRole(role?: string | null) {
  return hasAdminRole(role) ? 10 : 5
}

async function countAppsForUser(userId: string) {
  const [row] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(apps)
    .where(eq(apps.submittedBy, userId))
  return Number(row?.total ?? 0)
}

export const listCategories = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (isDemoMode()) return demoCategories
    const rows = await db.select().from(categories).orderBy(categories.name)
    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }))
  },
)

export const getRootAppSlug = createServerFn({ method: 'GET' }).handler(
  async (): Promise<string | null> => {
    if (isDemoMode()) return demoApps[0]?.slug ?? null

    const [row] = await db
      .select({ slug: apps.slug })
      .from(apps)
      .innerJoin(user, eq(apps.submittedBy, user.id))
      .where(
        and(eq(apps.status, 'published'), sql`${user.role} like '%admin%'`),
      )
      .orderBy(desc(apps.featured), desc(apps.updatedAt))
      .limit(1)

    return row?.slug ?? null
  },
)

export const getAppDetail = createServerFn({ method: 'GET' })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<AppDetail | null> => {
    let userId: string | null = null
    if (!isDemoMode()) {
      const session = await auth.api.getSession({
        headers: getRequestHeaders(),
      })
      userId = session?.user.id ?? null
    }

    if (isDemoMode()) {
      return getDemoAppBySlug(data.slug)
    }

    const [row] = await db
      .select({
        ...catalogSelection,
        description: apps.description,
        version: apps.version,
        size: apps.size,
        requirements: apps.requirements,
        screenshots: apps.screenshots,
        fileUrl: apps.fileUrl,
        fileName: apps.fileName,
        fileSize: apps.fileSize,
        categoryId: apps.categoryId,
        submittedBy: apps.submittedBy,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(
        and(
          eq(apps.slug, data.slug),
          userId
            ? or(eq(apps.status, 'published'), eq(apps.submittedBy, userId))
            : eq(apps.status, 'published'),
        ),
      )
      .limit(1)

    if (!row) return null

    const reviewRows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        helpfulCount: reviews.helpfulCount,
        userName: user.name,
        userImage: user.image,
      })
      .from(reviews)
      .innerJoin(user, eq(reviews.userId, user.id))
      .where(eq(reviews.appId, row.id))
      .orderBy(desc(reviews.createdAt))
      .limit(30)

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const review of reviewRows) {
      const key = review.rating as 1 | 2 | 3 | 4 | 5
      distribution[key] += 1
    }

    if (reviewRows.length === 0 && row.reviewCount > 0) {
      const total = row.reviewCount
      distribution[5] = Math.round(total * 0.82)
      distribution[4] = Math.round(total * 0.12)
      distribution[3] = Math.round(total * 0.04)
      distribution[2] = Math.round(total * 0.015)
      distribution[1] = Math.max(
        0,
        total -
          distribution[5] -
          distribution[4] -
          distribution[3] -
          distribution[2],
      )
    }

    return {
      ...toCatalogApp(row),
      description: row.description,
      version: row.version,
      size: row.size,
      requirements: row.requirements,
      screenshots: row.screenshots ?? [],
      fileUrl: row.fileUrl,
      fileName: row.fileName,
      fileSize: row.fileSize,
      categoryId: row.categoryId,
      submittedBy: row.submittedBy,
      distribution,
      reviews: reviewRows.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        helpfulCount: review.helpfulCount,
        userName: review.userName,
        userImage: review.userImage,
      })),
    }
  })

export const getMySpace = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MySpaceData> => {
    if (isDemoMode()) {
      return { submissions: getDemoAdminApps() }
    }

    const session = await requireUser()

    const submissionRows = await db
      .select({
        ...catalogSelection,
        realDownloads: realDownloadsSelection,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(eq(apps.submittedBy, session.user.id))
      .orderBy(desc(apps.createdAt))

    return {
      submissions: submissionRows.map((row) => ({
        ...toCatalogApp(row),
        realDownloads: Number(row.realDownloads ?? 0),
      })),
    }
  },
)

export const submitApp = createServerFn({ method: 'POST' })
  .validator((input: AppInput) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) {
      return { slug: demoApps[0]?.slug ?? 'ponto-de-coleta' }
    }

    const session = await requireUser()

    if (!data.name?.trim() || data.name.trim().length < 2) {
      throw new Error('Informe o nome do app.')
    }
    if (!data.type) {
      throw new Error('Escolha a categoria principal.')
    }

    const limit = appLimitForRole(session.user.role)
    const total = await countAppsForUser(session.user.id)
    if (total >= limit) {
      throw new Error(`Limite de ${limit} apps atingido.`)
    }

    const slug = await uniqueSlug(data.name)

    await db.insert(apps).values({
      name: data.name.trim(),
      slug,
      type: data.type,
      tagline: normalizeText(data.tagline),
      description: normalizeText(data.description),
      developer: normalizeText(data.developer) ?? session.user.name,
      version: normalizeText(data.version),
      size: normalizeText(data.size),
      requirements: normalizeText(data.requirements),
      ageRating: normalizeText(data.ageRating) ?? 'Livre',
      categoryId: data.categoryId || null,
      iconUrl: normalizeText(data.iconUrl),
      bannerUrl: normalizeText(data.bannerUrl),
      screenshots: data.screenshots.filter(Boolean).slice(0, 8),
      fileUrl: normalizeText(data.fileUrl),
      fileName: normalizeText(data.fileName),
      fileSize: data.fileSize,
      downloads: normalizeDownloads(data.downloads),
      rating: 4.6,
      reviewCount: 100000,
      status: 'published',
      submittedBy: session.user.id,
    })

    return { slug }
  })

export const adminListApps = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminApp[]> => {
    if (isDemoMode()) return getDemoAdminApps()

    await requireAdmin()

    const rows = await db
      .select({
        ...catalogSelection,
        description: apps.description,
        version: apps.version,
        size: apps.size,
        requirements: apps.requirements,
        screenshots: apps.screenshots,
        fileUrl: apps.fileUrl,
        fileName: apps.fileName,
        fileSize: apps.fileSize,
        categoryId: apps.categoryId,
        submittedBy: apps.submittedBy,
        submittedByName: user.name,
        createdAt: apps.createdAt,
        realDownloads: realDownloadsSelection,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .leftJoin(user, eq(apps.submittedBy, user.id))
      .orderBy(desc(apps.createdAt))

    return rows.map((row) => ({
      ...toCatalogApp(row),
      description: row.description,
      version: row.version,
      size: row.size,
      requirements: row.requirements,
      screenshots: row.screenshots ?? [],
      fileUrl: row.fileUrl,
      fileName: row.fileName,
      fileSize: row.fileSize,
      categoryId: row.categoryId,
      submittedBy: row.submittedBy,
      submittedByName: row.submittedByName,
      createdAt: row.createdAt.toISOString(),
      realDownloads: Number(row.realDownloads ?? 0),
    }))
  },
)

export const adminGetApp = createServerFn({ method: 'GET' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<AdminApp | null> => {
    if (isDemoMode()) return getDemoAdminApp(data.id)

    await requireAdmin()

    const [row] = await db
      .select({
        ...catalogSelection,
        description: apps.description,
        version: apps.version,
        size: apps.size,
        requirements: apps.requirements,
        screenshots: apps.screenshots,
        fileUrl: apps.fileUrl,
        fileName: apps.fileName,
        fileSize: apps.fileSize,
        categoryId: apps.categoryId,
        submittedBy: apps.submittedBy,
        submittedByName: user.name,
        createdAt: apps.createdAt,
        realDownloads: realDownloadsSelection,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .leftJoin(user, eq(apps.submittedBy, user.id))
      .where(eq(apps.id, data.id))
      .limit(1)

    if (!row) return null

    return {
      ...toCatalogApp(row),
      description: row.description,
      version: row.version,
      size: row.size,
      requirements: row.requirements,
      screenshots: row.screenshots ?? [],
      fileUrl: row.fileUrl,
      fileName: row.fileName,
      fileSize: row.fileSize,
      categoryId: row.categoryId,
      submittedBy: row.submittedBy,
      submittedByName: row.submittedByName,
      createdAt: row.createdAt.toISOString(),
      realDownloads: Number(row.realDownloads ?? 0),
    }
  })

export const getMyApp = createServerFn({ method: 'GET' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<AdminApp | null> => {
    if (isDemoMode()) return getDemoAdminApp(data.id)

    const session = await requireUser()

    const [row] = await db
      .select({
        ...catalogSelection,
        description: apps.description,
        version: apps.version,
        size: apps.size,
        requirements: apps.requirements,
        screenshots: apps.screenshots,
        fileUrl: apps.fileUrl,
        fileName: apps.fileName,
        fileSize: apps.fileSize,
        categoryId: apps.categoryId,
        submittedBy: apps.submittedBy,
        submittedByName: user.name,
        createdAt: apps.createdAt,
        realDownloads: realDownloadsSelection,
      })
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .leftJoin(user, eq(apps.submittedBy, user.id))
      .where(and(eq(apps.id, data.id), eq(apps.submittedBy, session.user.id)))
      .limit(1)

    if (!row) return null

    return {
      ...toCatalogApp(row),
      description: row.description,
      version: row.version,
      size: row.size,
      requirements: row.requirements,
      screenshots: row.screenshots ?? [],
      fileUrl: row.fileUrl,
      fileName: row.fileName,
      fileSize: row.fileSize,
      categoryId: row.categoryId,
      submittedBy: row.submittedBy,
      submittedByName: row.submittedByName,
      createdAt: row.createdAt.toISOString(),
      realDownloads: Number(row.realDownloads ?? 0),
    }
  })

export const updateMyApp = createServerFn({ method: 'POST' })
  .validator((input: AppInput & { id: string }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) {
      const app = getDemoAdminApp(data.id) ?? getDemoAdminApps()[0]
      return { id: data.id, slug: app?.slug ?? 'ponto-de-coleta' }
    }

    const session = await requireUser()

    const [existing] = await db
      .select({ submittedBy: apps.submittedBy, slug: apps.slug })
      .from(apps)
      .where(eq(apps.id, data.id))
      .limit(1)

    if (!existing || existing.submittedBy !== session.user.id) {
      throw new Error('Você só pode editar as páginas que criou.')
    }

    if (!data.name?.trim()) throw new Error('Informe o nome do app.')

    await db
      .update(apps)
      .set({
        name: data.name.trim(),
        type: data.type,
        tagline: normalizeText(data.tagline),
        description: normalizeText(data.description),
        developer: normalizeText(data.developer),
        version: normalizeText(data.version),
        size: normalizeText(data.size),
        requirements: normalizeText(data.requirements),
        ageRating: normalizeText(data.ageRating) ?? 'Livre',
        categoryId: data.categoryId || null,
        iconUrl: normalizeText(data.iconUrl),
        bannerUrl: normalizeText(data.bannerUrl),
        screenshots: data.screenshots.filter(Boolean).slice(0, 8),
        fileUrl: normalizeText(data.fileUrl),
        fileName: normalizeText(data.fileName),
        fileSize: data.fileSize,
        downloads: normalizeDownloads(data.downloads),
      })
      .where(eq(apps.id, data.id))

    return { id: data.id, slug: existing.slug }
  })

async function persistApp(
  data: AppInput & {
    id?: string
    status?: AppStatus
    featured?: boolean
  },
  submittedBy?: string,
) {
  const values = {
    name: data.name.trim(),
    type: data.type,
    tagline: normalizeText(data.tagline),
    description: normalizeText(data.description),
    developer: normalizeText(data.developer),
    version: normalizeText(data.version),
    size: normalizeText(data.size),
    requirements: normalizeText(data.requirements),
    ageRating: normalizeText(data.ageRating) ?? 'Livre',
    categoryId: data.categoryId || null,
    iconUrl: normalizeText(data.iconUrl),
    bannerUrl: normalizeText(data.bannerUrl),
    screenshots: data.screenshots.filter(Boolean).slice(0, 8),
    fileUrl: normalizeText(data.fileUrl),
    fileName: normalizeText(data.fileName),
    fileSize: data.fileSize,
    downloads: normalizeDownloads(data.downloads),
    rating: normalizeRating(data.rating),
    reviewCount: normalizeReviewCount(data.reviewCount),
    status: data.status ?? 'published',
    featured: data.featured ?? false,
  }

  if (data.id) {
    await db.update(apps).set(values).where(eq(apps.id, data.id))
    return { id: data.id }
  }

  const slug = await uniqueSlug(data.name)
  const [created] = await db
    .insert(apps)
    .values({ ...values, slug, submittedBy })
    .returning({ id: apps.id })
  return { id: created.id }
}

export const adminSaveApp = createServerFn({ method: 'POST' })
  .validator(
    (
      input: AppInput & {
        id?: string
        status?: AppStatus
        featured?: boolean
      },
    ) => input,
  )
  .handler(async ({ data }) => {
    if (isDemoMode()) {
      return {
        id: data.id ?? getDemoAdminApps()[0]?.id ?? 'demo-ponto-de-coleta',
      }
    }

    const session = await requireAdmin()

    if (!data.name?.trim()) throw new Error('Informe o nome do app.')

    if (!data.id) {
      const limit = appLimitForRole(session.user.role)
      const total = await countAppsForUser(session.user.id)
      if (total >= limit) {
        throw new Error(`Limite de ${limit} apps atingido.`)
      }
    }

    return persistApp(data, session.user.id)
  })

export const adminSetStatus = createServerFn({ method: 'POST' })
  .validator((input: { id: string; status: AppStatus }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) return { ok: true }
    await requireAdmin()
    await db
      .update(apps)
      .set({ status: data.status })
      .where(eq(apps.id, data.id))
    return { ok: true }
  })

export const adminToggleFeatured = createServerFn({ method: 'POST' })
  .validator((input: { id: string; featured: boolean }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) return { ok: true }
    await requireAdmin()
    await db
      .update(apps)
      .set({ featured: data.featured })
      .where(eq(apps.id, data.id))
    return { ok: true }
  })

export const adminDeleteApp = createServerFn({ method: 'POST' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) return { ok: true }
    await requireAdmin()
    await db.delete(apps).where(eq(apps.id, data.id))
    return { ok: true }
  })

export const adminStats = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminStats> => {
    if (isDemoMode()) return getDemoAdminStats()

    await requireAdmin()

    const [appStats] = await db
      .select({
        published: sql<number>`count(*) filter (where ${apps.status} = 'published')::int`,
        pending: sql<number>`count(*) filter (where ${apps.status} = 'pending')::int`,
        downloads: sql<number>`coalesce(sum(${apps.downloads}), 0)::double precision`,
      })
      .from(apps)

    const [userStats] = await db
      .select({ users: sql<number>`count(*)::int` })
      .from(user)

    const [reviewStats] = await db
      .select({ reviews: sql<number>`count(*)::int` })
      .from(reviews)

    return {
      published: Number(appStats?.published ?? 0),
      pending: Number(appStats?.pending ?? 0),
      downloads: Number(appStats?.downloads ?? 0),
      users: Number(userStats?.users ?? 0),
      reviews: Number(reviewStats?.reviews ?? 0),
    }
  },
)

export const adminListUsers = createServerFn({ method: 'GET' })
  .validator((input: { q?: string }) => input)
  .handler(async ({ data }): Promise<UserRow[]> => {
    if (isDemoMode()) {
      const query = data.q?.trim().toLowerCase()
      return query
        ? demoUsers.filter((item) =>
            `${item.name} ${item.email}`.toLowerCase().includes(query),
          )
        : demoUsers
    }

    await requireAdmin()

    const query = data.q?.trim()
    const rows = await db
      .select()
      .from(user)
      .where(
        query
          ? or(ilike(user.name, `%${query}%`), ilike(user.email, `%${query}%`))
          : undefined,
      )
      .orderBy(desc(user.createdAt))
      .limit(100)

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      banned: row.banned,
      createdAt: row.createdAt.toISOString(),
      emailVerified: row.emailVerified,
      image: row.image,
    }))
  })

export const adminCreateUser = createServerFn({ method: 'POST' })
  .validator(
    (input: { name: string; email: string; password: string; role: string }) =>
      input,
  )
  .handler(async ({ data }) => {
    if (isDemoMode()) return { id: 'demo-user-new' }

    await requireAdmin()
    const headers = getRequestHeaders()
    const result = await auth.api.createUser({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as 'admin' | 'user',
      },
      headers,
    })
    return { id: result.user.id }
  })

export const adminSetUserRole = createServerFn({ method: 'POST' })
  .validator((input: { userId: string; role: string }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) return { ok: true }

    const session = await requireAdmin()
    if (session.user.id === data.userId) {
      throw new Error('Você não pode alterar o seu próprio nível de acesso.')
    }
    await auth.api.setRole({
      body: { userId: data.userId, role: data.role as 'admin' | 'user' },
      headers: getRequestHeaders(),
    })
    return { ok: true }
  })

export const adminBanUser = createServerFn({ method: 'POST' })
  .validator((input: { userId: string; banReason?: string }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) return { ok: true }

    const session = await requireAdmin()
    if (session.user.id === data.userId) {
      throw new Error('Você não pode bloquear a si mesmo.')
    }
    await auth.api.banUser({
      body: {
        userId: data.userId,
        banReason: data.banReason || 'Violação dos termos',
      },
      headers: getRequestHeaders(),
    })
    return { ok: true }
  })

export const adminUnbanUser = createServerFn({ method: 'POST' })
  .validator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) return { ok: true }

    await requireAdmin()
    await auth.api.unbanUser({
      body: { userId: data.userId },
      headers: getRequestHeaders(),
    })
    return { ok: true }
  })

export const adminDeleteUser = createServerFn({ method: 'POST' })
  .validator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) return { ok: true }

    const session = await requireAdmin()
    if (session.user.id === data.userId) {
      throw new Error('Você não pode excluir a própria conta.')
    }
    await auth.api.removeUser({
      body: { userId: data.userId },
      headers: getRequestHeaders(),
    })
    return { ok: true }
  })

export { hasAdminRole }
