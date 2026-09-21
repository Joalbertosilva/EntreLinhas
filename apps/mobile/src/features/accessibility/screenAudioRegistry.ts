type Region = {
  order: number
  getText: () => string | null | undefined
}

const regions = new Map<string, Region>()
let orderCounter = 0

export function resetScreenAudioRegions() {
  regions.clear()
  orderCounter = 0
}

export function registerScreenAudioRegion(id: string, getText: () => string | null | undefined) {
  const existing = regions.get(id)
  regions.set(id, {
    order: existing?.order ?? orderCounter++,
    getText,
  })
}

export function unregisterScreenAudioRegion(id: string) {
  regions.delete(id)
}

export function getScreenAudioFullText() {
  return [...regions.values()]
    .sort((a, b) => a.order - b.order)
    .map((region) => region.getText()?.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('. ')
}

export function getScreenAudioRegionCount() {
  return regions.size
}
