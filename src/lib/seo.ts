export const SITE_NAME = 'Play Store'
export const SITE_URL = 'https://play-download.serproid.workers.dev'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

export function ogImageFor(iconUrl?: string | null) {
  if (
    iconUrl &&
    /^https?:\/\//i.test(iconUrl) &&
    !/\.svg(?:$|\?)/i.test(iconUrl)
  ) {
    return iconUrl
  }
  return DEFAULT_OG_IMAGE
}
