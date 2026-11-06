import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// QR generado en el teléfono (funciona sin internet). Siempre negro sobre blanco
// para que lo lea cualquier cámara.
export function Qr({ value, size, label }: { value: string; size: number | string; label: string }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    let alive = true
    QRCode.toString(value, { type: 'svg', margin: 2, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } })
      .then((s) => alive && setSvg(s))
      .catch(() => alive && setSvg(''))
    return () => {
      alive = false
    }
  }, [value])
  return (
    <div
      role="img"
      aria-label={label}
      className="aspect-square max-w-full rounded-lg bg-white [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      style={{ width: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
