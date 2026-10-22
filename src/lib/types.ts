import type { AppStatus, AppType } from './db/schema'

export type SessionUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: string | null
}

export type CatalogApp = {
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
  categoryName: string | null
  ageRating: string | null
  updatedAt: string
  status: AppStatus
}

export type ReviewItem = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  helpfulCount: number
  userName: string
  userImage: string | null
}

export type AppDetail = CatalogApp & {
  description: string | null
  version: string | null
  size: string | null
  requirements: string | null
  screenshots: string[]
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  categoryId: string | null
  reviews: ReviewItem[]
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
  submittedBy: string | null
}

export type MySpaceData = {
  submissions: CatalogApp[]
}

export type AppInput = {
  name: string
  type: AppType
  tagline: string
  description: string
  developer: string
  version: string
  size: string
  requirements: string
  ageRating: string
  categoryId: string | null
  iconUrl: string
  bannerUrl: string
  screenshots: string[]
  fileUrl: string
  fileName: string
  fileSize: number | null
}

export type AdminApp = CatalogApp & {
  description: string | null
  version: string | null
  size: string | null
  requirements: string | null
  screenshots: string[]
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  categoryId: string | null
  submittedBy: string | null
  submittedByName: string | null
  createdAt: string
}

export type AdminStats = {
  published: number
  pending: number
  downloads: number
  users: number
  reviews: number
}

export type UserRow = {
  id: string
  name: string
  email: string
  role: string | null
  banned: boolean | null
  createdAt: string
  emailVerified: boolean
  image: string | null
}
