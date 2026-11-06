import { useState, type FormEvent } from 'react'
import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react'
import {
  LEVEL_LABEL,
  PRODUCT_LABEL,
  addLead,
  checkTeamCode,
  getHelperName,
  getTeamCode,
  setHelperName,
  setTeamCode,
  syncPending,
  type LeadLevel,
  type LeadProduct,
} from '../lib/leads'
import { isConfigured } from '../lib/supabase'
import { Button, Card, Section } from '../components/ui'

const field = 'w-full rounded-lg border border-line bg-surface px-3 py-3 text-base text-fg placeholder:text-[#6f6f6f]'

function Choices<T extends string>({ name, value, options, onChange, legend }: { name: string; value: T; options: Record<T, string>; onChange: (v: T) => void; legend: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="title-4 mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((k) => (
          <label key={k} className="cursor-pointer">
            <input type="radio" name={name} value={k} checked={value === k} onChange={() => onChange(k)} className="peer sr-only" />
            <span className="title-4 inline-block rounded-full border border-line bg-surface px-3 py-2 transition duration-300 ease-base peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
              {options[k]}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function TeamCode({ onDone }: { onDone: () => void }) {
  const [code, setCode] = useState(getTeamCode())
  const [name, setName] = useState(getHelperName())
  const [msg, setMsg] = useState<{ tone: 'bad' | 'warn'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setMsg({ tone: 'bad', text: 'Escribe tu nombre para saber quién anotó a cada persona.' })
    if (!code.trim()) return setMsg({ tone: 'bad', text: 'Escribe el código que te dio Pedro.' })
    setBusy(true)
    const r = await checkTeamCode(code)
    setBusy(false)
    if (r === 'bad') return setMsg({ tone: 'bad', text: 'Ese código no es correcto. Pídeselo otra vez a Pedro.' })
    setHelperName(name)
    setTeamCode(code)
    if (r === 'offline') setMsg({ tone: 'warn', text: 'Sin internet para revisar el código. Puedes anotar; se revisa cuando vuelva la conexión.' })
    onDone()
  }

  return (
    <Section eyebrow="Antes de empezar" title="Configura tu teléfono">
      <p className="body-3 text-dim">Solo se hace una vez. Pedro te da el código del equipo.</p>
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <label className="title-4 flex flex-col gap-1" htmlFor="helper-name">
          Tu nombre
          <input id="helper-name" className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="Ej. Ana" />
        </label>
        <label className="title-4 flex flex-col gap-1" htmlFor="team-code">
          Código del equipo
          <input id="team-code" className={field} value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="none" autoCorrect="off" placeholder="El que te dio Pedro" />
        </label>
        {msg && <p className={`body-6 ${msg.tone === 'bad' ? 'text-bad' : 'text-warn'}`}>{msg.text}</p>}
        <Button type="submit" disabled={busy} className="py-3">
          {busy ? 'Revisando…' : 'Guardar y empezar'}
        </Button>
      </form>
    </Section>
  )
}

export function Capture({ go }: { go: (tab: 'lista') => void }) {
  const [ready, setReady] = useState(() => !isConfigured || (!!getTeamCode() && !!getHelperName()))
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [business, setBusiness] = useState('')
  const [product, setProduct] = useState<LeadProduct>('no_sabe')
  const [level, setLevel] = useState<LeadLevel>('medio')
  const [notes, setNotes] = useState('')
  const [helper, setHelper] = useState(getHelperName())
  const [err, setErr] = useState('')
  const [saved, setSaved] = useState<{ name: string; tone: 'ok' | 'warn'; text: string } | null>(null)

  if (!ready) return <TeamCode onDone={() => { setHelper(getHelperName()); setReady(true) }} />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    setSaved(null)
    if (!name.trim()) return setErr('Falta el nombre de la persona.')
    if (phone.replace(/\D/g, '').length < 10) return setErr('El WhatsApp debe tener al menos 10 dígitos.')
    if (!isConfigured) setHelperName(helper)
    const lead = addLead({ name: name.trim(), phone: phone.trim(), business: business.trim(), product, level, notes: notes.trim(), capturedBy: helper.trim() })
    setName('')
    setPhone('')
    setBusiness('')
    setNotes('')
    setProduct('no_sabe')
    setLevel('medio')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (!isConfigured) {
      setSaved({ name: lead.name, tone: 'warn', text: 'quedó guardado en este teléfono. La página aún no está conectada a la base de datos.' })
      return
    }
    setSaved({ name: lead.name, tone: 'ok', text: 'quedó guardado en este teléfono. Enviando a la lista de Pedro…' })
    const r = await syncPending()
    if (r.badCode) setSaved({ name: lead.name, tone: 'warn', text: 'quedó guardado en este teléfono, pero el código del equipo no es correcto. Revísalo en la pestaña Lista.' })
    else if (r.offline || r.failed) setSaved({ name: lead.name, tone: 'warn', text: 'quedó guardado en este teléfono. No hay conexión; se envía solo cuando vuelva el internet.' })
    else setSaved({ name: lead.name, tone: 'ok', text: 'quedó en la lista de Pedro y también en este teléfono.' })
  }

  return (
    <div className="flex flex-col gap-8">
      <Section eyebrow="Anotar a un interesado" title="Datos para que Pedro le escriba">
        <p className="body-3 text-dim">Pide permiso antes de anotar. Con nombre y WhatsApp es suficiente; lo demás ayuda a Pedro a saber de qué hablarle.</p>
      </Section>

      {saved && (
        <Card className={saved.tone === 'ok' ? 'border-ok' : 'border-warn'}>
          <div className="flex items-start gap-3">
            {saved.tone === 'ok' ? <CheckCircleIcon size={24} className="shrink-0 text-ok" /> : <WarningCircleIcon size={24} className="shrink-0 text-warn" />}
            <p className="body-3">
              <span className="font-semibold">{saved.name}</span> {saved.text}
            </p>
          </div>
          <button type="button" onClick={() => go('lista')} className="button-sm self-start text-accent underline underline-offset-4">
            Ver la lista
          </button>
        </Card>
      )}

      <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
        {!isConfigured && (
          <label className="title-4 flex flex-col gap-1" htmlFor="lead-helper">
            Tu nombre
            <input id="lead-helper" className={field} value={helper} onChange={(e) => setHelper(e.target.value)} placeholder="Ej. Ana" />
          </label>
        )}
        <label className="title-4 flex flex-col gap-1" htmlFor="lead-name">
          Nombre de la persona
          <input id="lead-name" className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" placeholder="Ej. Jorge López" />
        </label>
        <label className="title-4 flex flex-col gap-1" htmlFor="lead-phone">
          WhatsApp
          <input id="lead-phone" className={`${field} font-mono`} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="off" placeholder="667 123 4567" />
        </label>
        <label className="title-4 flex flex-col gap-1" htmlFor="lead-business">
          Negocio o a qué se dedica
          <input id="lead-business" className={field} value={business} onChange={(e) => setBusiness(e.target.value)} autoComplete="off" placeholder="Ej. Barbería en Las Quintas" />
        </label>
        <Choices name="product" legend="¿Qué le interesa?" value={product} options={PRODUCT_LABEL} onChange={setProduct} />
        <Choices name="level" legend="¿Qué tan interesado está?" value={level} options={LEVEL_LABEL} onChange={setLevel} />
        <label className="title-4 flex flex-col gap-1" htmlFor="lead-notes">
          Notas
          <span className="body-6 text-dim">Qué necesita, cuándo prefiere que le escriban</span>
          <textarea id="lead-notes" className={`${field} min-h-24 resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. Lleva sus citas en libreta, prefiere que le escriban en la tarde" />
        </label>
        {err && <p className="body-6 text-bad">{err}</p>}
        <Button type="submit" className="py-3">
          Guardar
        </Button>
      </form>


      {isConfigured && (
        <p className="caption-4 text-dim">
          Anotando como {getHelperName() || 'sin nombre'}.{' '}
          <button type="button" className="underline underline-offset-2" onClick={() => setReady(false)}>
            Cambiar nombre o código
          </button>
        </p>
      )}
    </div>
  )
}
