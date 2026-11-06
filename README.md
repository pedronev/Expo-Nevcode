# NevCode en la expo

Página para el celular del equipo del stand (amigos y familia que ayudan a Pedro).
Funciona sin internet una vez abierta y se puede instalar en la pantalla de inicio.

Pestañas:

- **Guía**: qué ofrecemos, frases para acercarse, qué ofrecer a quién, demo, qué hacer si Pedro está ocupado,
  preguntas típicas (filtrables por NevCode Assistant o NevCode Studios), palabras técnicas, datos reales y lo que no se debe hacer.
- **Compartir**: QRs para que el cliente escanee desde el celular del ayudante (demo del asistente, WhatsApp de Pedro y las dos páginas),
  guardar el contacto de Pedro y mensajes listos para mandar por WhatsApp.
- **Anotar**: datos de un interesado. Se guardan primero en el teléfono y luego se envían a Supabase.
- **Lista**: lo anotado en ese teléfono, con su estado (enviado o pendiente), copiar y reintentar.

Todo el texto está en `src/content.ts`.

## Puesta en marcha

1. En tu proyecto de Supabase abre **SQL Editor** y corre `supabase/expo_leads.sql`.
   Antes cambia `pon-aqui-tu-codigo` por el código que les darás a tus ayudantes.
2. Copia `.env.example` como `.env` y pon la URL del proyecto y la llave **publishable / anon**
   (Project Settings > API). Nunca la `service_role`.
3. `npm install` y `npm run dev` para probar en tu compu.
4. Para el celular, publica la carpeta `dist` (`npm run build`) en Vercel o Netlify y agrega las mismas
   dos variables de entorno en el panel del hosting.

Sin `.env` la página funciona igual, pero lo anotado se queda solo en cada teléfono.

## Cómo ves a los interesados

En Supabase > Table Editor > `expo_leads`. La tabla no se puede leer con la llave pública;
la página solo puede insertar a través de la función `submit_expo_lead`, que exige el código del equipo.
Al final de `supabase/expo_leads.sql` hay consultas útiles (ordenar por interés, marcar como contactado).

## Diseño

Sistema del skill `landing-page-design` de elayadesign/ai-design-skills: Geist (Geist Mono para cifras),
fondos planos oscuros, un solo acento (#8F9CE8), escala tipográfica de Tailwind, espaciados y radios del skill,
iconos Phosphor y la curva cubic-bezier(0.22, 1, 0.36, 1).
# Expo-Nevcode
