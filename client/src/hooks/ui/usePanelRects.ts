import { useEffect, useRef, useState } from 'react'

export function usePanelRects(panels: any[], layoutData: any[]) {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const [panelRects, setPanelRects] = useState<DOMRect[]>([])

  useEffect(() => {
    if (!panels.length) return
    const rects: DOMRect[] = []
    panelRefs.current.forEach((ref) => {
      if (ref) {
        const rect = ref.getBoundingClientRect()
        rects.push(rect)
      }
    })
    setPanelRects(rects)
  }, [layoutData, panels.map((p) => p.id).join(',')])

  return { panelRefs, panelRects }
}
