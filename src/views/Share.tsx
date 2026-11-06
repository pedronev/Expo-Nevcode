import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ShareNetworkIcon, UserPlusIcon, XIcon, ArrowsOutIcon } from '@phosphor-icons/react'
import { CONTACT, LINKS, SHARE_MESSAGES, type Topic } from '../content'
import { Qr } from '../components/Qr'
import { Button, Card, CopyButton, ProductTag, Section, copyText } from '../components/ui'

type Item = { id: string; topic: Topic; title: string; desc: string; value: string; shareText: string }

const ITEMS: Item[] = [
  {
    id: 'demo',
    topic: 'assistant',
    title: 'Probar el asistente',
    desc: 'Abre WhatsApp con el asistente de demostración. Ideal para que lo prueben ahí mismo.',
    value: LINKS.demoWhatsApp,
    shareText: 'Prueba el asistente con IA de NevCode por WhatsApp:',
  },
  {
    id: 'pedro',
    topic: 'studios',
    title: 'WhatsApp de Pedro',
    desc: 'Para quien tiene una idea o un proyecto. Le llega un mensaje listo a Pedro.',
    value: LINKS.pedroWhatsApp,
    shareText: 'Escríbele a Pedro de NevCode Studios:',
  },
  {
    id: 'assistant-web',
    topic: 'assistant',
    title: 'Página de NevCode Assistant',
    desc: 'Planes, precios y cómo funciona el asistente.',
    value: CONTACT.assistantUrl,
    shareText: 'Conoce NevCode Assistant:',
  },
  {
    id: 'studios-web',
    topic: 'studios',
    title: 'Página de NevCode Studios',
    desc: 'Lo que hacemos: apps, páginas web y sistemas a la medida.',
    value: CONTACT.studiosUrl,
    shareText: 'Conoce NevCode Studios:',
  },
]

async function share(title: string, text: string, url?: string): Promise<'shared' | 'copied' | 'failed'> {
  const data = url ? { title, text, url } : { title, text }
  if (navigator.share) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'failed'
    }
  }
  return (await copyText(url ? `${text} ${url}` : text)) ? 'copied' : 'failed'
}

function ShareButton({ title, text, url, label = 'Compartir' }: { title: string; text: string; url?: string; label?: string }) {
  const [msg, setMsg] = useState('')
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        const r = await share(title, text, url)
        if (r === 'copied') {
          setMsg('Copiado para pegar')
          setTimeout(() => setMsg(''), 1800)
        }
      }}
    >
      <ShareNetworkIcon size={18} />
      {msg || label}
    </Button>
  )
}

function vcard() {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${CONTACT.person}`,
    'N:Nevarez;Pedro;;;',
    'ORG:NevCode Studios',
    `TEL;TYPE=CELL:${CONTACT.phoneIntl}`,
    `URL:${CONTACT.studiosUrl}`,
    `URL:${CONTACT.assistantUrl}`,
    'END:VCARD',
  ].join('\r\n')
}

function saveContact() {
  const blob = new Blob([vcard()], { type: 'text/vcard' })
  const file = new File([blob], 'Pedro-NevCode.vcf', { type: 'text/vcard' })
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    nav.share({ files: [file], title: 'Contacto de Pedro' }).catch(() => {})
    return
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'Pedro-NevCode.vcf'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

function BigQr({ item, onClose }: { item: Item; onClose: () => void }) {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock
    wl?.request('screen').then((l) => (lock = l)).catch(() => {})
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lock?.release().catch(() => {})
    }
  }, [onClose])
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="view-enter fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white px-6 text-[#131209]"
      style={{ paddingTop: 'max(24px, env(safe-area-inset-top))', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
    >
      <p className="heading-5 text-center">{item.title}</p>
      <Qr value={item.value} size="min(86vw, 62vh)" label={`Código QR: ${item.title}`} />
      <p className="body-3 max-w-[480px] text-center text-[#55524a]">Abre la cámara de tu celular y apunta al código.</p>
      <button type="button" onClick={onClose} className="button-md inline-flex items-center gap-2 rounded-lg bg-[#131209] px-3 py-2 text-white">
        <XIcon size={18} /> Cerrar
      </button>
    </div>
  )
}

export function Share() {
  const [open, setOpen] = useState<Item | null>(null)
  const close = useCallback(() => setOpen(null), [])
  return (
    <div className="flex flex-col gap-12">
      <Section eyebrow="Compartir" title="Que lo escaneen desde tu celular">
        <p className="body-3 text-dim">Toca un código para verlo en grande. Sube el brillo de tu pantalla para que la cámara lo lea rápido.</p>
        {ITEMS.map((it) => (
          <Card key={it.id}>
            <div className="flex items-start gap-4">
              <button type="button" onClick={() => setOpen(it)} aria-label={`Ver en grande: ${it.title}`} className="shrink-0">
                <Qr value={it.value} size={96} label={`Código QR: ${it.title}`} />
              </button>
              <div className="flex min-w-0 flex-col gap-2">
                <ProductTag topic={it.topic} />
                <h3 className="heading-6">{it.title}</h3>
                <p className="body-6 text-dim">{it.desc}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={() => setOpen(it)}>
                <ArrowsOutIcon size={18} /> Ver en grande
              </Button>
              <ShareButton title={it.title} text={it.shareText} url={it.value} />
            </div>
          </Card>
        ))}
      </Section>

      <Section eyebrow="Contacto" title="Datos de Pedro">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="caption-4 text-dim">WhatsApp de Pedro</p>
              <p className="font-mono text-lg leading-7 font-semibold select-all">{CONTACT.phoneDisplay}</p>
            </div>
            <CopyButton text={CONTACT.phoneDisplay} />
          </div>
          <Button variant="primary" onClick={saveContact} className="mt-2 self-start">
            <UserPlusIcon size={18} /> Guardar contacto en su celular
          </Button>
          <p className="caption-4 text-dim">Se abre la tarjeta de contacto para que la persona la guarde en su teléfono.</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="caption-4 text-dim">WhatsApp del asistente (demo)</p>
              <p className="font-mono text-lg leading-7 font-semibold select-all">{CONTACT.demoPhoneDisplay}</p>
            </div>
            <CopyButton text={CONTACT.demoPhoneDisplay} />
          </div>
        </Card>
      </Section>

      <Section eyebrow="Mensaje listo" title="Mándale la información por WhatsApp">
        <p className="body-3 text-dim">Si la persona prefiere que se la mandes, comparte uno de estos mensajes. Ya trae los links.</p>
        {(['assistant', 'studios'] as const).map((p) => (
          <Card key={p}>
            <ProductTag topic={p} />
            <p className="body-6 whitespace-pre-line break-words text-dim">{SHARE_MESSAGES[p]}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <ShareButton title="NevCode" text={SHARE_MESSAGES[p]} label="Compartir mensaje" />
              <CopyButton text={SHARE_MESSAGES[p]} />
            </div>
          </Card>
        ))}
      </Section>

      {open && createPortal(<BigQr item={open} onClose={close} />, document.body)}
    </div>
  )
}
