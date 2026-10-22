import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { auth } from './auth'
import { hasAdminRole, isDemoMode, requireAdmin, requireUser } from './auth.functions'
import { db } from './db'
import {
  apps,
  categories,
  downloads,
  reviews,
  user,
  wishlist,
  type AppStatus,
  type AppType,
} from './db/schema'
import {
  demoApps,
  demoCategories,
  getDemoAppBySlug,
  getDemoHomeData,
} from './demo-data'
import type {
  AdminApp,
  AdminStats,
  AppDetail,
  AppInput,
  CatalogApp,
  HomeData,
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

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name)
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

async function fetchPublished(type?: AppType) {
  const rows = await db
    .select(catalogSelection)
    .from(apps)
    .leftJoin(categories, eq(apps.categoryId, categories.id))
    .where(
      and(
        eq(apps.status, 'published'),
        type ? eq(apps.type, type) : undefined,
      ),
    )
    .orderBy(desc(apps.featured), desc(apps.downloads))
    .limit(120)
  return rows.map(toCatalogApp)
}

export const listCategories = createServerFn({ method: 'GET' }).handler(async () => {
  if (isDemoMode()) return demoCategories
  const rows = await db.select().from(categories).orderBy(categories.name)
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
})

export const listApps = createServerFn({ method: 'GET' })
  .validator(
    (input: { type?: AppType; q?: string; category?: string; limit?: number }) =>
      input,
  )
  .handler(async ({ data }) => {
    if (isDemoMode()) {
      const query = data.q?.trim().toLowerCase()
      return demoApps
        .filter((app) => (data.type ? app.type === data.type : true))
        .filter((app) =>
          query
            ? `${app.name} ${app.tagline ?? ''}`.toLowerCase().includes(query)
            : true,
        )
        .filter((app) =>
          data.category ? app.categoryName === data.category : true,
        )
        .slice(0, data.limit ?? 60)
    }

    const query = data.q?.trim()
    const categorySlug = data.category?.trim()

    const rows = await db
      .select(catalogSelection)
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(
        and(
          eq(apps.status, 'published'),
          data.type ? eq(apps.type, data.type) : undefined,
          query
            ? or(
                ilike(apps.name, `%${query}%`),
                ilike(apps.tagline, `%${query}%`),
                ilike(apps.developer, `%${query}%`),
              )
            : undefined,
          categorySlug ? eq(categories.slug, categorySlug) : undefined,
        ),
      )
      .orderBy(desc(apps.featured), desc(apps.downloads))
      .limit(data.limit ?? 60)

    return rows.map(toCatalogApp)
  })

export const getHomeData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeData> => {
    if (isDemoMode()) return getDemoHomeData()

    const all = await fetchPublished()
    return {
      featured: all.filter((app) => app.featured).slice(0, 5),
      popular: [...all].sort((a, b) => b.downloads - a.downloads).slice(0, 6),
      recent: [...all]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 8),
      byType: {
        app: all.filter((app) => app.type === 'app').slice(0, 8),
        game: all.filter((app) => app.type === 'game').slice(0, 8),
        movie: all.filter((app) => app.type === 'movie').slice(0, 8),
        book: all.filter((app) => app.type === 'book').slice(0, 8),
      },
    }
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
      .where(and(eq(apps.slug, data.slug), eq(apps.status, 'published')))
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
        userId: reviews.userId,
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

    let inWishlist = false
    if (userId) {
      const [wish] = await db
        .select({ id: wishlist.id })
        .from(wishlist)
        .where(and(eq(wishlist.appId, row.id), eq(wishlist.userId, userId)))
        .limit(1)
      inWishlist = Boolean(wish)
    }

    const userReview = userId
      ? (reviewRows.find((review) => review.userId === userId) ?? null)
      : null

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
      inWishlist,
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
      userReview: userReview
        ? {
            id: userReview.id,
            rating: userReview.rating,
            comment: userReview.comment,
            createdAt: userReview.createdAt.toISOString(),
            helpfulCount: userReview.helpfulCount,
            userName: userReview.userName,
            userImage: userReview.userImage,
          }
        : null,
    }
  })

export const getMySpace = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MySpaceData> => {
    const session = await requireUser()

    const wishRows = await db
      .select(catalogSelection)
      .from(wishlist)
      .innerJoin(apps, eq(wishlist.appId, apps.id))
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(and(eq(wishlist.userId, session.user.id), eq(apps.status, 'published')))
      .orderBy(desc(wishlist.createdAt))

    const submissionRows = await db
      .select(catalogSelection)
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(eq(apps.submittedBy, session.user.id))
      .orderBy(desc(apps.createdAt))

    return {
      wishlist: wishRows.map(toCatalogApp),
      submissions: submissionRows.map(toCatalogApp),
    }
  },
)

export const submitApp = createServerFn({ method: 'POST' })
  .validator((input: AppInput) => input)
  .handler(async ({ data }) => {
    const session = await requireUser()

    if (!data.name?.trim() || data.name.trim().length < 2) {
      throw new Error('Informe o nome do app.')
    }
    if (!data.type) {
      throw new Error('Escolha a categoria principal.')
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
      screenshots: data.screenshots.filter(Boolean),
      fileUrl: normalizeText(data.fileUrl),
      fileName: normalizeText(data.fileName),
      fileSize: data.fileSize,
      status: 'pending',
      submittedBy: session.user.id,
    })

    return { slug }
  })

export const saveReview = createServerFn({ method: 'POST' })
  .validator(
    (input: { appId: string; rating: number; comment: string }) => input,
  )
  .handler(async ({ data }) => {
    const session = await requireUser()
    const rating = Math.min(5, Math.max(1, Math.round(data.rating)))

    const [app] = await db
      .select({ id: apps.id })
      .from(apps)
      .where(and(eq(apps.id, data.appId), eq(apps.status, 'published')))
      .limit(1)

    if (!app) throw new Error('App não encontrado.')

    const comment = normalizeText(data.comment)

    await db
      .insert(reviews)
      .values({
        appId: data.appId,
        userId: session.user.id,
        rating,
        comment,
      })
      .onConflictDoUpdate({
        target: [reviews.appId, reviews.userId],
        set: { rating, comment, updatedAt: new Date() },
      })

    const [aggregate] = await db
      .select({
        average: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.appId, data.appId))

    await db
      .update(apps)
      .set({
        rating: Math.round(Number(aggregate?.average ?? 0) * 10) / 10,
        reviewCount: Number(aggregate?.count ?? 0),
      })
      .where(eq(apps.id, data.appId))

    return { ok: true }
  })

export const toggleWishlist = createServerFn({ method: 'POST' })
  .validator((input: { appId: string }) => input)
  .handler(async ({ data }) => {
    const session = await requireUser()

    const [existing] = await db
      .select({ id: wishlist.id })
      .from(wishlist)
      .where(
        and(
          eq(wishlist.appId, data.appId),
          eq(wishlist.userId, session.user.id),
        ),
      )
      .limit(1)

    if (existing) {
      await db.delete(wishlist).where(eq(wishlist.id, existing.id))
      return { inWishlist: false }
    }

    await db
      .insert(wishlist)
      .values({ appId: data.appId, userId: session.user.id })
      .onConflictDoNothing()

    return { inWishlist: true }
  })

export const adminListApps = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminApp[]> => {
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
    }))
  },
)

export const adminGetApp = createServerFn({ method: 'GET' })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<AdminApp | null> => {
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
    }
  })

async function persistApp(
  data: AppInput & {
    id?: string
    status?: AppStatus
    featured?: boolean
  },
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
    screenshots: data.screenshots.filter(Boolean),
    fileUrl: normalizeText(data.fileUrl),
    fileName: normalizeText(data.fileName),
    fileSize: data.fileSize,
    status: data.status ?? 'pending',
    featured: data.featured ?? false,
  }

  if (data.id) {
    await db
      .update(apps)
      .set(values)
      .where(eq(apps.id, data.id))
    return { id: data.id }
  }

  const slug = await uniqueSlug(data.name)
  const [created] = await db
    .insert(apps)
    .values({ ...values, slug })
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
    await requireAdmin()
    if (!data.name?.trim()) throw new Error('Informe o nome do app.')
    return persistApp(data)
  })

export const adminSetStatus = createServerFn({ method: 'POST' })
  .validator((input: { id: string; status: AppStatus }) => input)
  .handler(async ({ data }) => {
    await requireAdmin()
    await db.update(apps).set({ status: data.status }).where(eq(apps.id, data.id))
    return { ok: true }
  })

export const adminToggleFeatured = createServerFn({ method: 'POST' })
  .validator((input: { id: string; featured: boolean }) => input)
  .handler(async ({ data }) => {
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
    await requireAdmin()
    await db.delete(apps).where(eq(apps.id, data.id))
    return { ok: true }
  })

export const adminStats = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminStats> => {
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
    (input: {
      name: string
      email: string
      password: string
      role: string
    }) => input,
  )
  .handler(async ({ data }) => {
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
    const session = await requireAdmin()
    if (session.user.id === data.userId) {
      throw new Error('Você não pode bloquear a si mesmo.')
    }
    await auth.api.banUser({
      body: { userId: data.userId, banReason: data.banReason || 'Violação dos termos' },
      headers: getRequestHeaders(),
    })
    return { ok: true }
  })

export const adminUnbanUser = createServerFn({ method: 'POST' })
  .validator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
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

export const registerDownload = createServerFn({ method: 'POST' })
  .validator((input: { appId: string }) => input)
  .handler(async ({ data }) => {
    if (isDemoMode()) return { ok: true }

    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    const [app] = await db
      .select({ id: apps.id, fileUrl: apps.fileUrl })
      .from(apps)
      .where(and(eq(apps.id, data.appId), eq(apps.status, 'published')))
      .limit(1)

    if (!app) throw new Error('App não encontrado.')

    await db.insert(downloads).values({
      appId: app.id,
      userId: session?.user.id ?? null,
    })
    await db
      .update(apps)
      .set({ downloads: sql`${apps.downloads} + 1` })
      .where(eq(apps.id, app.id))

    return { ok: true, fileUrl: app.fileUrl }
  })

export const listMyFavoriteIds = createServerFn({ method: 'GET' }).handler(
  async () => {
    if (isDemoMode()) return [] as string[]
    const session = await auth.api.getSession({ headers: getRequestHeaders() })
    if (!session) return [] as string[]
    const rows = await db
      .select({ appId: wishlist.appId })
      .from(wishlist)
      .where(eq(wishlist.userId, session.user.id))
    return rows.map((row) => row.appId)
  },
)

export const adminUserCount = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()
    const rows = await db.select({ id: user.id }).from(user)
    return rows.length
  },
)

export const getAppsByIds = createServerFn({ method: 'GET' })
  .validator((input: { ids: string[] }) => input)
  .handler(async ({ data }) => {
    if (!data.ids.length) return [] as CatalogApp[]
    if (isDemoMode()) return demoApps.filter((app) => data.ids.includes(app.id))
    const rows = await db
      .select(catalogSelection)
      .from(apps)
      .leftJoin(categories, eq(apps.categoryId, categories.id))
      .where(and(inArray(apps.id, data.ids), eq(apps.status, 'published')))
    return rows.map(toCatalogApp)
  })

export { hasAdminRole }
