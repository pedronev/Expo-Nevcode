// Todo el texto de la guía. Los precios y respuestas vienen de las preguntas
// frecuentes del bot de NevCode (tenant nevcode-studios), para que digan lo mismo.

export type Product = 'studios' | 'assistant'
export type Topic = Product | 'general'

export const PRODUCT_INFO: Record<Product, { name: string; short: string }> = {
  studios: { name: 'NevCode Studios', short: 'Studios' },
  assistant: { name: 'NevCode Assistant', short: 'Assistant' },
}

export const CONTACT = {
  person: 'Pedro Nevarez',
  phoneDisplay: '667 389 3023',
  phoneIntl: '+526673893023',
  demoPhoneDisplay: '667 849 4381',
  studiosUrl: 'https://www.nevcodestudios.com',
  assistantUrl: 'https://www.nevcodeassistant.com',
}

// Mismos textos que los QRs de los videos del stand (verificados).
export const LINKS = {
  pedroWhatsApp: 'https://wa.me/526673893023/?text=Hola%2C+estoy+interesado+en+un+proyecto+de+software+para+mi+negocio',
  demoWhatsApp: 'https://wa.me/526678494381/?text=Hola%2C+vi+su+stand+en+la+expo+y+quiero+probar+el+asistente',
}

export const PRODUCTS: {
  id: Product
  title: string
  what: string
  forWho: string
  hook: string
  signals: string[]
}[] = [
  {
    id: 'assistant',
    title: 'Un asistente con IA para el WhatsApp del negocio',
    what: 'Contesta a los clientes las 24 horas, agenda citas solo y le avisa al dueño cuando algo es urgente, con un resumen del problema. También da reportes del negocio.',
    forWho: 'Barberías, salones, dentistas, consultorios, spas, veterinarias y cualquier negocio que trabaje con citas.',
    hook: '30 días de prueba gratis',
    signals: ['Agenda citas', 'Le escriben mucho por WhatsApp', 'No alcanza a contestar'],
  },
  {
    id: 'studios',
    title: 'Hacemos el software que el negocio necesite',
    what: 'Apps, páginas web, tiendas en línea, sistemas de inventario, nómina, punto de venta, reportes y usar IA en el negocio. Hecho a la medida, no un programa genérico.',
    forWho: 'Cualquier negocio, grande o chico, aunque no sepan nada de tecnología.',
    hook: 'Primera reunión y cotización sin costo',
    signals: ['Lleva todo en libreta o Excel', 'Quiere una app o página', 'No sabe cuánto vende'],
  },
]

export const OPENERS = [
  '¡Hola! ¿Tienes negocio o trabajas en uno?',
  '¿A qué se dedica tu negocio?',
  '¿Tus clientes te escriben por WhatsApp? ¿Alcanzas a contestarles a todos?',
  '¿Qué es lo que más tiempo te quita en el día?',
]

export const PITCH: Record<Product, { when: string; examples: string; say: string }> = {
  assistant: {
    when: 'Si su negocio trabaja con citas',
    examples: 'Barbería, salón, uñas, dentista, doctor, nutriólogo, psicólogo, spa, veterinaria, gimnasio con clases.',
    say: 'Tenemos un asistente que contesta el WhatsApp de tu negocio a cualquier hora y te agenda las citas solo. Lo puedes probar 30 días gratis. ¿Quieres verlo funcionando? Escanea este código y escríbele.',
  },
  studios: {
    when: 'Si tiene otra necesidad o una idea',
    examples: 'Lleva todo en libreta o en Excel, quiere una página o una app, no sabe cuánto vende, batalla con el inventario o la nómina.',
    say: 'Nosotros hacemos el sistema a la medida de tu negocio, para que no tengas que adaptarte a un programa. Pedro te explica todo sin palabras técnicas, y la primera reunión y la cotización no cuestan.',
  },
}

export const DEMO_STEPS = [
  'Abre la pestaña Compartir y enséñale el QR "Probar el asistente". Se abre WhatsApp con un mensaje listo; solo tiene que enviarlo.',
  'Dile que le cuente al asistente a qué se dedica su negocio y que le pida que le muestre cómo atendería a sus clientes.',
  'Que haga como si fuera un cliente: que pida una cita o pregunte precios y horarios. El asistente le contesta en segundos.',
]

export const BUSY = [
  { title: 'Tiene prisa', body: 'Que escanee el QR de WhatsApp de Pedro y le mande el mensaje ahí mismo. Así a Pedro le queda su contacto.' },
  { title: 'Tiene tiempo', body: 'Enséñale los videos de la pantalla o que pruebe el demo mientras Pedro se desocupa. Avísale a Pedro que alguien lo espera.' },
  { title: 'No quiere escanear nada', body: 'Pídele permiso y anota sus datos en la pestaña Anotar. Pedro le escribe después.' },
]

export const FAQ: { topic: Topic; q: string; a: string }[] = [
  { topic: 'assistant', q: '¿Cuánto cuesta el asistente?', a: 'Hay dos planes. Personal cuesta $800 al mes, para quien atiende su propia agenda. Establecimiento cuesta $960 al mes más $60 por cada empleado con agenda propia. Ya incluyen IVA. Los dos tienen 30 días gratis y la instalación no cuesta.' },
  { topic: 'assistant', q: '¿Puedo seguir usando mi WhatsApp como siempre?', a: 'Sí. Es el mismo número. El dueño sigue contestando desde su celular cuando quiera y el asistente atiende al mismo tiempo.' },
  { topic: 'assistant', q: '¿La IA se inventa cosas?', a: 'No. Contesta con la información que le da el negocio: servicios, precios y horarios. Si no sabe algo, le pasa la plática a una persona del negocio.' },
  { topic: 'assistant', q: '¿Y si un cliente tiene una urgencia o una queja?', a: 'El asistente deja de contestar ese chat y le avisa al dueño con un resumen de lo que pasa, para que él lo atienda.' },
  { topic: 'assistant', q: '¿Qué más hace, además de contestar?', a: 'Tiene agenda con confirmación y recordatorio a los clientes, reportes de lo cobrado y de quién atendió, y un asistente interno que da el resumen del día y sugerencias para el negocio.' },
  { topic: 'assistant', q: '¿Qué necesito para empezar?', a: 'Un número para WhatsApp Business, la lista de servicios con su duración, los horarios y el calendario donde lleva sus citas. La instalación es acompañada.' },
  { topic: 'assistant', q: '¿Funciona con Instagram o Facebook?', a: 'Todavía no. Por ahora es WhatsApp. No lo prometas.' },
  { topic: 'assistant', q: '¿Están seguros los datos de mis clientes?', a: 'Sí. La información de cada negocio está separada y ningún otro negocio puede verla.' },
  { topic: 'studios', q: '¿Cuánto cuesta una app, página o sistema?', a: 'Depende de lo que necesite. Pedro primero platica con la persona y después le da una cotización clara, con precio fijo si el proyecto está definido. La primera reunión y la cotización no cuestan. No des precios tú.' },
  { topic: 'studios', q: '¿Cuánto se tardan en hacerlo?', a: 'Depende del tamaño. Una página puede tomar unas semanas; un sistema completo, varios meses. Pedro da fechas cuando entiende el proyecto.' },
  { topic: 'studios', q: 'No sé nada de tecnología, ¿me sirve?', a: 'Sí. La mayoría de los clientes no son técnicos. Ellos cuentan cómo trabajan y el equipo lo convierte en el sistema, explicando todo en palabras sencillas.' },
  { topic: 'studios', q: 'Mi negocio es muy chico, ¿es para mí?', a: 'Sí. Se puede empezar con lo más importante y crecer después.' },
  { topic: 'studios', q: '¿Qué necesito para empezar?', a: 'Nada técnico. Solo contar cómo maneja hoy sus ventas, inventario, citas o reportes, y qué le quita tiempo o dinero.' },
  { topic: 'general', q: '¿Hay descuento por la expo?', a: 'No prometas descuentos. Lo que sí hay: 30 días gratis del asistente y cotización sin costo para proyectos. Si insisten, que lo platiquen con Pedro.' },
  { topic: 'general', q: '¿De dónde son?', a: 'De Culiacán. NevCode Studios es un equipo de ingenieros de software con años de experiencia, y NevCode Assistant es un producto hecho por ellos.' },
]

export const GLOSSARY = [
  { term: 'IA (inteligencia artificial)', def: 'Un programa que entiende lo que le escriben y contesta como lo haría una persona.' },
  { term: 'Bot o asistente', def: 'El programa que contesta los mensajes de WhatsApp por el negocio.' },
  { term: 'Software a la medida', def: 'Un sistema hecho especialmente para ese negocio, en lugar de uno ya hecho al que hay que acostumbrarse.' },
  { term: 'App', def: 'Una aplicación que se instala en el celular.' },
  { term: 'Sistema', def: 'Un programa para controlar el negocio: ventas, inventario, empleados, citas o reportes.' },
]

export const STATS: { topic: Topic; value: string; text: string; source: string }[] = [
  { topic: 'assistant', value: '21 veces', text: 'más probable que un cliente siga adelante si le contestas en 5 minutos en vez de 30.', source: 'Lead Response Management Study, InsideSales.com y James Oldroyd (2007).' },
  { topic: 'general', value: '35 de 100', text: 'negocios en Sinaloa usan internet para trabajar.', source: 'INEGI, Censos Económicos 2024, resultados de Sinaloa.' },
]

export const DONTS = [
  'Dar precios de apps, páginas o sistemas. Eso lo cotiza Pedro.',
  'Prometer fechas de entrega o descuentos.',
  'Prometer cosas que no sabes si se pueden. Mejor di: "déjame preguntarle a Pedro".',
  'Anotar datos de alguien sin pedirle permiso.',
  'Insistir. Si alguien no está interesado, dale las gracias y sigue.',
]

export const SHARE_MESSAGES: Record<Product, string> = {
  assistant: `Hola, gracias por pasar al stand de NevCode. Te comparto el asistente con IA que contesta el WhatsApp de tu negocio y agenda citas solo. Tiene 30 días de prueba gratis.

Pruébalo aquí: ${LINKS.demoWhatsApp}
Más información: ${CONTACT.assistantUrl}
Dudas con Pedro: ${CONTACT.phoneDisplay}`,
  studios: `Hola, gracias por pasar al stand de NevCode. Hacemos apps, páginas web y sistemas a la medida de tu negocio. La primera reunión y la cotización son sin costo.

Escríbele a Pedro: ${LINKS.pedroWhatsApp}
Conoce lo que hacemos: ${CONTACT.studiosUrl}`,
}
