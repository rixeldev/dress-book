export function createId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function isId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}
