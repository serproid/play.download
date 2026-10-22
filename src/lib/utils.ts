export { cn } from 'cn'

export function formatCount(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value)
}

export function formatFileSize(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return null
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / 1024 ** index
  return `${size.toFixed(size < 10 && index > 0 ? 1 : 0)} ${units[index]}`
}
