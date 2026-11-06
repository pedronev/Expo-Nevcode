import { useState } from 'react'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import { LEVEL_LABEL, PRODUCT_LABEL, leadAsText, removeLead, syncPending, useLeads, type Lead } from '../lib/leads'
import { isConfigured } from '../lib/supabase'
import { Button, CopyButton, Section } from '../components/ui'

const STATUS: Record<Lead['status'], { label: string; cls: string }> = {
  sent: { label: 'Enviado a Pedro', cls: 'bg-[#1c3124] text-ok' },
  pending: { label: 'Pendiente de enviar', cls: 'bg-[#3a2f14] text-warn' },
  rejected: { label: 'Código incorrecto', cls: 'bg-[#3d1f1a] text-bad' },
}
const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('es-MX', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

function Row({ l }: { l: Lead }) {
  const [armed, setArmed] = useState(false)
  const s = isConfigured ? STATUS[l.status] : { label: 'Solo en este teléfono', cls: 'bg-surface-2 text-dim' }
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="title-2 break-words">{l.name}</p>
          <p className="body-6 text-dim">{[l.business, PRODUCT_LABEL[l.product]].filter(Boolean).join(' · ')}</p>
        </div>
        <span className={`caption-3 shrink-0 rounded-full px-2 py-1 ${s.cls}`}>{s.label}</span>
      </div>
      <p className="font-mono text-base font-semibold select-all">{l.phone}</p>
      <p className="body-6">{LEVEL_LABEL[l.level]}</p>
      {l.notes && <p className="body-6 break-words text-dim">{l.notes}</p>}
      <p className="caption-4 text-dim">{[l.capturedBy && `Anotó ${l.capturedBy}`, fmt(l.capturedAt)].filter(Boolean).join(' · ')}</p>
      {l.error && l.status !== 'sent' && <p className="caption-4 text-warn">{l.error}</p>}
      <div className="mt-2 flex flex-wrap gap-2">
        <CopyButton text={leadAsText(l)} label="Copiar datos" />
        <Button
          variant="ghost"
          onClick={() => {
            if (!armed) {
              setArmed(true)
              setTimeout(() => setArmed(false), 3000)
              return
            }
            removeLead(l.id)
          }}
          className={armed ? 'text-bad' : ''}
        >
          {armed ? 'Toca otra vez para borrar' : 'Borrar de este teléfono'}
        </Button>
      </div>
    </article>
  )
}

export function List({ go }: { go: (tab: 'anotar') => void }) {
  const leads = useLeads()
  const [syncMsg, setSyncMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = leads.filter((l) => l.status !== 'sent').length
  const all = leads.map(leadAsText).join('\n\n')

  async function retry() {
    setBusy(true)
    setSyncMsg('')
    const r = await syncPending()
    setBusy(false)
    if (r.badCode) setSyncMsg('El código del equipo no es correcto. Cámbialo en la pestaña Anotar y vuelve a intentar.')
    else if (r.offline) setSyncMsg('Sin conexión. Se envían solos cuando vuelva el internet.')
    else if (r.failed) setSyncMsg('Algunos no se pudieron enviar. Se reintenta solo cada minuto.')
    else setSyncMsg(r.sent ? `Listo, se enviaron ${r.sent}.` : 'No había pendientes.')
  }

  return (
    <div className="flex flex-col gap-6">
      <Section eyebrow="Interesados en este teléfono" title={leads.length === 1 ? '1 persona' : `${leads.length} personas`}>
        <p className="body-3 text-dim">
          {isConfigured
            ? 'Todo lo que anotas se queda guardado aquí y también se manda a la lista de Pedro. Pedro ve a todos los que anotó el equipo.'
            : 'La página todavía no está conectada a la base de datos. Lo que anotes se queda en este teléfono; copia la lista y mándasela a Pedro.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {isConfigured && pending > 0 && (
            <Button onClick={retry} disabled={busy}>
              <ArrowClockwiseIcon size={18} /> {busy ? 'Enviando…' : `Enviar ${pending} pendiente${pending === 1 ? '' : 's'}`}
            </Button>
          )}
          {leads.length > 0 && <CopyButton text={all} label="Copiar toda la lista" />}
        </div>
        {syncMsg && <p className="body-6 text-dim">{syncMsg}</p>}
      </Section>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-4 py-8 text-center">
          <p className="title-3">Todavía no has anotado a nadie</p>
          <p className="body-6 max-w-[320px] text-dim">Cuando alguien te dé sus datos, llénalos en Anotar y aparecerán aquí.</p>
          <Button onClick={() => go('anotar')} className="mt-2">
            Anotar a alguien
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((l) => (
            <Row key={l.id} l={l} />
          ))}
        </div>
      )}
    </div>
  )
}
