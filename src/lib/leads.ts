import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'

// Cada interesado se guarda primero en el teléfono y después se manda a Supabase.
// Si no hay internet queda "pendiente" y se reintenta solo cuando vuelve la conexión.

export type LeadProduct = 'studios' | 'assistant' | 'ambos' | 'no_sabe'
export type LeadLevel = 'alto' | 'medio' | 'bajo'
export type LeadStatus = 'pending' | 'sent' | 'rejected'

export type Lead = {
  id: string
  capturedAt: string
  name: string
  phone: string
  business: string
  product: LeadProduct
  level: LeadLevel
  notes: string
  capturedBy: string
  status: LeadStatus
  error?: string
}

export const PRODUCT_LABEL: Record<LeadProduct, string> = {
  assistant: 'Asistente de WhatsApp',
  studios: 'App, página o sistema',
  ambos: 'Los dos',
  no_sabe: 'No sabe aún',
}
export const LEVEL_LABEL: Record<LeadLevel, string> = {
  alto: 'Quiere que le escriban pronto',
  medio: 'Interesado',
  bajo: 'Solo viendo',
}

const KEY_LEADS = 'nevcode-expo.leads.v1'
const KEY_CODE = 'nevcode-expo.team-code'
const KEY_NAME = 'nevcode-expo.helper-name'

const read = <T,>(k: string, d: T): T => {
  try {
    const v = localStorage.getItem(k)
    return v == null ? d : (JSON.parse(v) as T)
  } catch {
    return d
  }
}
const write = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* almacenamiento lleno o bloqueado: seguimos en memoria */
  }
}

// ---------- tienda en memoria con suscripción ----------
let leads: Lead[] = read<Lead[]>(KEY_LEADS, [])
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const setLeads = (next: Lead[]) => {
  leads = next
  write(KEY_LEADS, leads)
  emit()
}

export function useLeads() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => leads,
  )
}

export const getTeamCode = () => read<string>(KEY_CODE, '')
export const setTeamCode = (c: string) => write(KEY_CODE, c.trim())
export const getHelperName = () => read<string>(KEY_NAME, '')
export const setHelperName = (n: string) => write(KEY_NAME, n.trim())

const uuid = () => {
  const c = globalThis.crypto as Crypto & { randomUUID?: () => string }
  if (typeof c.randomUUID === 'function') return c.randomUUID()
  // respaldo para navegadores sin randomUUID (por ejemplo http en red local)
  const b = c.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

export function addLead(input: Omit<Lead, 'id' | 'capturedAt' | 'status'>): Lead {
  const lead: Lead = { ...input, id: uuid(), capturedAt: new Date().toISOString(), status: 'pending' }
  setLeads([lead, ...leads])
  return lead
}

export function removeLead(id: string) {
  setLeads(leads.filter((l) => l.id !== id))
}

const patch = (id: string, p: Partial<Lead>) => setLeads(leads.map((l) => (l.id === id ? { ...l, ...p } : l)))

// ---------- envío a Supabase ----------
export type SyncResult = { sent: number; failed: number; badCode: boolean; offline: boolean }

let syncing: Promise<SyncResult> | null = null

export function syncPending(): Promise<SyncResult> {
  if (syncing) return syncing
  syncing = (async () => {
    const res: SyncResult = { sent: 0, failed: 0, badCode: false, offline: false }
    if (!supabase) return res
    const code = getTeamCode()
    if (!code) return res
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      res.offline = true
      return res
    }
    const pending = leads.filter((l) => l.status !== 'sent')
    for (const l of pending) {
      const { error } = await supabase.rpc('submit_expo_lead', {
        p_code: code,
        p_lead: {
          id: l.id,
          captured_at: l.capturedAt,
          name: l.name,
          phone: l.phone,
          business: l.business,
          product: l.product,
          interest_level: l.level,
          notes: l.notes,
          captured_by: l.capturedBy,
        },
      })
      if (!error) {
        patch(l.id, { status: 'sent', error: undefined })
        res.sent++
      } else if (error.message?.includes('codigo_invalido')) {
        patch(l.id, { status: 'rejected', error: 'El código del equipo no es correcto.' })
        res.badCode = true
        res.failed++
        break
      } else {
        patch(l.id, { status: 'pending', error: 'No se pudo enviar. Se reintenta solo.' })
        res.failed++
        if (/fetch|network|Failed/i.test(error.message ?? '')) {
          res.offline = true
          break
        }
      }
    }
    return res
  })().finally(() => {
    syncing = null
  })
  return syncing
}

export async function checkTeamCode(code: string): Promise<'ok' | 'bad' | 'offline' | 'unconfigured'> {
  if (!supabase) return 'unconfigured'
  try {
    const { data, error } = await supabase.rpc('check_expo_code', { p_code: code.trim() })
    if (error) return 'offline'
    return data === true ? 'ok' : 'bad'
  } catch {
    return 'offline'
  }
}

export const leadAsText = (l: Lead) =>
  [
    l.name,
    l.phone,
    l.business && `Negocio: ${l.business}`,
    `Le interesa: ${PRODUCT_LABEL[l.product]}`,
    LEVEL_LABEL[l.level],
    l.notes && `Notas: ${l.notes}`,
    l.capturedBy && `Anotó: ${l.capturedBy}`,
  ]
    .filter(Boolean)
    .join('\n')

// Reintento automático: al abrir, al volver la conexión y cada minuto.
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void syncPending())
  setInterval(() => {
    if (leads.some((l) => l.status === 'pending')) void syncPending()
  }, 60_000)
  setTimeout(() => void syncPending(), 1500)
}
