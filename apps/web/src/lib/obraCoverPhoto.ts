import { obraCoverPhotoCropRect } from '@tcc-sistema/cover-motifs'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Não foi possível carregar a capa'))
    img.src = src
  })
}

/** Recorta a área da foto na capa composta (obras antigas sem capa_foto_url). */
export async function extractObraCoverPhotoFile(imageUrl: string): Promise<File> {
  const img = await loadImage(imageUrl)
  const crop = obraCoverPhotoCropRect(img.naturalWidth, img.naturalHeight)
  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível')
  ctx.drawImage(
    img,
    crop.originX,
    crop.originY,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Falha ao recortar a foto da capa'))),
      'image/jpeg',
      0.92,
    )
  })
  return new File([blob], 'capa-foto.jpg', { type: 'image/jpeg' })
}

export async function obraCoverPhotoFileFromUrl(url: string): Promise<File> {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Não foi possível baixar a foto da capa')
  const blob = await res.blob()
  const type = blob.type.startsWith('image/') ? blob.type : 'image/jpeg'
  return new File([blob], 'capa-foto.jpg', { type })
}
