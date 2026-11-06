import { useCallback, useEffect, useState } from 'react'
import { BookOpenTextIcon, QrCodeIcon, NotePencilIcon, ListChecksIcon } from '@phosphor-icons/react'
import { Guide } from './views/Guide'
import { Share } from './views/Share'
import { Capture } from './views/Capture'
import { List } from './views/List'
import { useLeads } from './lib/leads'
import { isConfigured } from './lib/supabase'

type Tab = 'guia' | 'compartir' | 'anotar' | 'lista'
const TABS: { id: Tab; label: string; Icon: typeof BookOpenTextIcon }[] = [
  { id: 'guia', label: 'Guía', Icon: BookOpenTextIcon },
  { id: 'compartir', label: 'Compartir', Icon: QrCodeIcon },
  { id: 'anotar', label: 'Anotar', Icon: NotePencilIcon },
  { id: 'lista', label: 'Lista', Icon: ListChecksIcon },
]
const fromHash = (): Tab => {
  const h = location.hash.replace('#', '') as Tab
  return TABS.some((t) => t.id === h) ? h : 'guia'
}

export default function App() {
  const [tab, setTab] = useState<Tab>(fromHash)
  const leads = useLeads()
  const pending = isConfigured ? leads.filter((l) => l.status !== 'sent').length : 0

  useEffect(() => {
    const on = () => setTab(fromHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const go = useCallback((t: Tab) => {
    if (location.hash !== `#${t}`) location.hash = t
    else setTab(t)
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="min-h-dvh bg-bg">
      <main
        className="mx-auto w-full max-w-[680px] pt-6"
        style={{
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          paddingTop: 'max(24px, env(safe-area-inset-top))',
          paddingBottom: 'calc(112px + env(safe-area-inset-bottom))',
        }}
      >
        <div key={tab} className="view-enter">
          {tab === 'guia' && <Guide go={go} />}
          {tab === 'compartir' && <Share />}
          {tab === 'anotar' && <Capture go={go} />}
          {tab === 'lista' && <List go={go} />}
        </div>
      </main>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-40 bg-bar shadow-[0_-1px_0_#313131]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
      >
        <div className="mx-auto grid max-w-[680px] grid-cols-4">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(id)
                }}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center gap-1 px-2 pt-3 pb-3 transition duration-300 ease-base ${active ? 'text-accent' : 'text-dim'}`}
              >
                <Icon size={24} weight={active ? 'fill' : 'regular'} />
                <span className="caption-4">{label}</span>
                {id === 'lista' && pending > 0 && (
                  <span className="caption-3 absolute top-2 left-1/2 ml-2 min-w-5 rounded-full bg-warn px-1 text-center text-[#131209]">{pending}</span>
                )}
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
