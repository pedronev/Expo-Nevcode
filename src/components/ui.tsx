import { useState, type ReactNode } from 'react'
import { CodeIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { PRODUCT_INFO, type Topic } from '../content'

export function Section({ eyebrow, title, children, id }: { eyebrow?: string; title?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="flex flex-col gap-4">
      {(eyebrow || title) && (
        <header className="flex flex-col gap-1">
          {eyebrow && <p className="caption-3 uppercase tracking-wider text-accent">{eyebrow}</p>}
          {title && <h2 className="heading-5">{title}</h2>}
        </header>
      )}
      {children}
    </section>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`flex min-w-0 flex-col gap-2 rounded-2xl border border-line bg-surface p-4 ${className}`}>{children}</div>
}

// Etiqueta que dice a qué producto pertenece algo.
export function ProductTag({ topic }: { topic: Topic }) {
  if (topic === 'general')
    return <span className="caption-3 inline-flex items-center gap-1 self-start rounded-full bg-surface-2 px-2 py-1 text-dim">Para los dos</span>
  const Icon = topic === 'assistant' ? WhatsappLogoIcon : CodeIcon
  return (
    <span
      className={`caption-3 inline-flex items-center gap-1 self-start rounded-full px-2 py-1 ${
        topic === 'assistant' ? 'bg-accent text-accent-ink' : 'border border-accent text-accent'
      }`}
    >
      <Icon size={14} weight="bold" />
      {PRODUCT_INFO[topic].name}
    </span>
  )
}

// Lo que se dice en voz alta.
export function Say({ label = 'Puedes decir', children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface-2 p-4">
      <span className="caption-3 uppercase tracking-wider text-dim">{label}</span>
      <div className="title-2 flex flex-col gap-2 text-fg">{children}</div>
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  const base =
    'button-md inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 transition duration-300 ease-base active:translate-y-px disabled:opacity-50'
  const look = variant === 'primary' ? 'bg-accent text-accent-ink hover:bg-[#a3aeee]' : 'bg-surface-2 text-fg hover:bg-line'
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${look} ${className}`}>
      {children}
    </button>
  )
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }
}

export function CopyButton({ text, label = 'Copiar', variant = 'ghost' }: { text: string; label?: string; variant?: 'primary' | 'ghost' }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')
  return (
    <Button
      variant={variant}
      onClick={async () => {
        setState((await copyText(text)) ? 'ok' : 'fail')
        setTimeout(() => setState('idle'), 1600)
      }}
    >
      {state === 'ok' ? 'Copiado' : state === 'fail' ? 'No se pudo copiar' : label}
    </Button>
  )
}
