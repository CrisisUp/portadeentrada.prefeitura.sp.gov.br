/**
 * Gera slug amigável para URLs a partir de string
 * Remove acentos, caracteres especiais e converte para lowercase
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')     // Substitui não-alfanuméricos por hífen
    .replace(/^-+|-+$/g, '')         // Remove hífens no início/fim
}

/**
 * Gera slug único para programa cultural
 * Adiciona sufixo numérico se necessário
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

/**
 * Gera slug para programa cultural (formato de URL)
 */
export function programaSlug(titulo: string): string {
  return `/${slugify(titulo)}`
}