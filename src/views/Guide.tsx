import { useState } from 'react'
import { BUSY, DEMO_STEPS, DONTS, FAQ, GLOSSARY, OPENERS, PITCH, PRODUCTS, STATS, type Product, type Topic } from '../content'
import { Card, ProductTag, Say, Section } from '../components/ui'

type Filter = 'todo' | Product
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'assistant', label: 'Assistant' },
  { id: 'studios', label: 'Studios' },
]
const show = (f: Filter, t: Topic) => f === 'todo' || t === 'general' || t === f

export function Guide({ go }: { go: (tab: 'compartir' | 'anotar') => void }) {
  const [filter, setFilter] = useState<Filter>('todo')
  const faqs = FAQ.filter((x) => show(filter, x.topic))

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <img src="/nevcode-studios.svg" alt="NevCode Studios" className="h-8 w-auto self-start" />
        <h1 className="heading-4 heading-gradient max-w-[680px] pb-1">Gracias por echarle la mano a Pedro</h1>
        <p className="body-3 max-w-[680px] text-dim">
          No necesitas saber de tecnología. Tu trabajo es platicar con la gente, entender a qué se dedica y conectarla con Pedro. Si te
          preguntan algo que no sabes, está perfecto decir <span className="text-fg">"esa te la contesta Pedro"</span>.
        </p>
      </section>

      <Section eyebrow="Qué ofrecemos" title="Son dos cosas distintas">
        <div className="grid gap-3 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Card key={p.id}>
              <ProductTag topic={p.id} />
              <h3 className="heading-6 mt-1">{p.title}</h3>
              <p className="body-6 text-dim">{p.what}</p>
              <p className="body-6">
                <span className="text-dim">Para: </span>
                {p.forWho}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.signals.map((s) => (
                  <span key={s} className="caption-4 rounded-full bg-surface-2 px-2 py-1 text-dim">
                    {s}
                  </span>
                ))}
              </div>
              <p className="title-3 mt-2 text-accent">{p.hook}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="Cómo empezar" title="Frases para acercarte">
        <Say>
          {OPENERS.map((o) => (
            <p key={o}>"{o}"</p>
          ))}
        </Say>
        <p className="body-6 text-dim">Escucha más de lo que hablas. Con lo que te cuente vas a saber cuál de las dos cosas le sirve.</p>
      </Section>

      <Section eyebrow="Decide en 10 segundos" title="¿Qué le ofrezco?">
        {(['assistant', 'studios'] as const).map((id) => (
          <Card key={id}>
            <ProductTag topic={id} />
            <h3 className="heading-6 mt-1">{PITCH[id].when}</h3>
            <p className="body-6 text-dim">{PITCH[id].examples}</p>
            <Say>
              <p>"{PITCH[id].say}"</p>
            </Say>
          </Card>
        ))}
        <Card>
          <h3 className="heading-6">Si no sabes cuál</h3>
          <p className="body-6 text-dim">Pregúntale qué le gustaría que fuera más fácil en su negocio, anótalo y llévalo con Pedro.</p>
        </Card>
      </Section>

      <Section eyebrow="El demo" title="Que pruebe el asistente en su celular">
        <ProductTag topic="assistant" />
        <ol className="flex flex-col gap-3">
          {DEMO_STEPS.map((s, i) => (
            <li key={s} className="grid grid-cols-[32px_1fr] items-start gap-3">
              <span className="caption-3 grid h-8 w-8 place-items-center rounded-full bg-surface-2 font-mono">{i + 1}</span>
              <p className="body-3">{s}</p>
            </li>
          ))}
        </ol>
        <p className="body-6 rounded-xl bg-surface-2 px-4 py-3 text-dim">
          Cuando el asistente actúa como si fuera su negocio no agenda citas reales, así que pueden jugar con él sin pena.
        </p>
        <button type="button" onClick={() => go('compartir')} className="button-sm self-start text-accent underline underline-offset-4">
          Ir a los QRs
        </button>
      </Section>

      <Section eyebrow="Si Pedro está ocupado" title="Tú decides según la persona">
        {BUSY.map((b) => (
          <Card key={b.title}>
            <h3 className="heading-6">{b.title}</h3>
            <p className="body-6 text-dim">{b.body}</p>
          </Card>
        ))}
        <Say>
          <p>"¿Te puedo anotar tu nombre y tu WhatsApp para que Pedro te escriba con calma?"</p>
        </Say>
        <button type="button" onClick={() => go('anotar')} className="button-sm self-start text-accent underline underline-offset-4">
          Ir a Anotar
        </button>
      </Section>

      <Section eyebrow="Preguntas que te van a hacer" title="Respuestas cortas">
        <div role="tablist" aria-label="Filtrar por producto" className="grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`button-sm rounded-lg px-2 py-2 transition duration-300 ease-base ${
                filter === f.id ? 'bg-surface text-fg shadow-sm' : 'text-dim'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
          {faqs.map((x, i) => (
            <div key={x.q} className={`flex flex-col gap-2 p-4 ${i ? 'border-t border-line' : ''}`}>
              <ProductTag topic={x.topic} />
              <p className="title-3">{x.q}</p>
              <p className="body-6 text-dim">{x.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Datos para platicar" title="Datos reales que llaman la atención">
        {STATS.filter((s) => show(filter, s.topic)).map((s) => (
          <Card key={s.value}>
            <ProductTag topic={s.topic} />
            <p className="font-mono text-4xl leading-10 font-semibold text-accent">{s.value}</p>
            <p className="body-3">{s.text}</p>
            <p className="caption-4 text-dim">Fuente: {s.source}</p>
          </Card>
        ))}
      </Section>

      <Section eyebrow="Palabras que te pueden decir" title="En español sencillo">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
          {GLOSSARY.map((g, i) => (
            <div key={g.term} className={`flex flex-col gap-1 p-4 ${i ? 'border-t border-line' : ''}`}>
              <p className="title-3">{g.term}</p>
              <p className="body-6 text-dim">{g.def}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Mejor no" title="Lo que no debes hacer">
        <ul className="flex flex-col gap-3">
          {DONTS.map((d) => (
            <li key={d} className="grid grid-cols-[16px_1fr] gap-3">
              <span className="mt-2 h-2 w-2 rounded-full bg-bad" />
              <p className="body-3">{d}</p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
