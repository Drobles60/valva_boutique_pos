/**
 * Utility to capture recharts SVG charts as base64 PNG images
 * for embedding into PDF exports.
 * Uses direct SVG serialization instead of html2canvas for accurate rendering.
 */

/**
 * Captures a recharts chart container by finding its SVG, serializing it,
 * and rendering it onto a canvas at high resolution.
 *
 * @param element - The wrapper div containing the recharts SVG
 * @param options - Optional config for scale and background color
 * @returns base64 PNG data URL, or null on failure
 */
export async function captureChartAsImage(
  element: HTMLElement | null,
  options?: { scale?: number; backgroundColor?: string }
): Promise<string | null> {
  if (!element) return null

  const scale = options?.scale ?? 2
  const bgColor = options?.backgroundColor ?? "#ffffff"

  try {
    const svg = element.querySelector("svg")
    if (!svg) return null

    // Get the actual rendered size of the SVG
    const rect = svg.getBoundingClientRect()
    const svgWidth = rect.width
    const svgHeight = rect.height

    // Clone the SVG so we can safely modify it
    const clone = svg.cloneNode(true) as SVGSVGElement

    // Set explicit width/height attributes for correct rendering
    clone.setAttribute("width", String(svgWidth))
    clone.setAttribute("height", String(svgHeight))
    // Ensure viewBox is set
    if (!clone.getAttribute("viewBox")) {
      clone.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
    }

    // Inline all computed styles into the SVG elements so they render correctly
    // when extracted from the DOM context
    inlineStyles(svg, clone)

    // Remove tooltip wrappers and interactive elements from the clone
    clone.querySelectorAll(".recharts-tooltip-wrapper").forEach((el) => el.remove())

    // Serialize to string
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(clone)

    // Ensure XML namespace is present
    if (!svgString.includes("xmlns=")) {
      svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    // Create a blob URL from the SVG
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    return new Promise<string | null>((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = svgWidth * scale
        canvas.height = svgHeight * scale
        const ctx = canvas.getContext("2d")!
        // White background
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0, svgWidth, svgHeight)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL("image/png"))
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(null)
      }
      img.src = url
    })
  } catch (error) {
    console.error("Error capturing chart:", error)
    return null
  }
}

/**
 * Recursively copies computed styles from the original DOM elements into
 * the cloned SVG elements as inline styles. This ensures text, fills,
 * strokes, and fonts render correctly outside the DOM.
 */
function inlineStyles(original: Element, clone: Element) {
  const computedStyle = window.getComputedStyle(original)

  // Key SVG-relevant CSS properties to inline
  const props = [
    "fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-opacity",
    "fill-opacity", "opacity", "font-family", "font-size", "font-weight",
    "font-style", "text-anchor", "dominant-baseline", "color", "visibility",
    "display",
  ]

  const inlineStr = props
    .map((prop) => {
      const val = computedStyle.getPropertyValue(prop)
      return val ? `${prop}:${val}` : ""
    })
    .filter(Boolean)
    .join(";")

  if (inlineStr && clone instanceof SVGElement) {
    const existing = clone.getAttribute("style") || ""
    clone.setAttribute("style", existing ? `${existing};${inlineStr}` : inlineStr)
  }

  // Recurse into children
  const origChildren = original.children
  const cloneChildren = clone.children
  for (let i = 0; i < origChildren.length && i < cloneChildren.length; i++) {
    inlineStyles(origChildren[i], cloneChildren[i])
  }
}

/**
 * Captures multiple chart elements in parallel.
 *
 * @param refs - Array of objects with a title and React ref to a DOM element
 * @returns Array of { title, dataUrl } for successfully captured charts
 */
export async function captureMultipleCharts(
  refs: { title?: string; ref: React.RefObject<HTMLElement | null> }[]
): Promise<{ title?: string; dataUrl: string }[]> {
  const results = await Promise.all(
    refs.map(async ({ title, ref }) => {
      const dataUrl = await captureChartAsImage(ref.current)
      return dataUrl ? { title, dataUrl } : null
    })
  )

  return results.filter((r): r is NonNullable<typeof r> => r !== null)
}
