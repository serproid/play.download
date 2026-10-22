export function hasAdminRoleClient(role?: string | null) {
  return Boolean(
    role
      ?.split(',')
      .map((value) => value.trim())
      .includes('admin'),
  )
}
