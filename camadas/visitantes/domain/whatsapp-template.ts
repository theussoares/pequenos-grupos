/**
 * Escolhe a chave i18n do template de mensagem de WhatsApp conforme o status do
 * visitante (§1.5/§2.6 do PDF). Domínio puro — devolve a chave, não o texto.
 */
import type { VisitorStatus } from './visitor-status'

const TEMPLATE_KEY_BY_STATUS: Partial<Record<VisitorStatus, string>> = {
  novo: 'whatsapp.templates.welcome',
  contatado: 'whatsapp.templates.invite',
  convidado: 'whatsapp.templates.presenting',
  sem_resposta: 'whatsapp.templates.missed',
  reativacao: 'whatsapp.templates.reactivation'
}

export function whatsappTemplateKey(status: VisitorStatus): string {
  return TEMPLATE_KEY_BY_STATUS[status] ?? 'whatsapp.templates.generic'
}

/** Primeiro nome, para personalizar a saudação. Função pura. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? ''
}
