/** Extrai uma mensagem legível de um erro desconhecido. Função pura. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'unexpected_error'
}
