import { createExplosionRenderer } from './createExplosionRenderer'

/**
 * Creates a fancy pixels renderer
 * @param {HTMLDivElement} el The element to render to
 */
export default function createPixelsRenderer(el) {
  let width = 0
  let height = 0

  /**
   * @type {HTMLCanvasElement}
   */
  let canvas
  let explosion

  /**
   * @type {HTMLCanvasElement}
   */
  let bgCanvas

  let previousBlackPixels = {}

  function initCanvas(w, h) {
    width = w
    height = h
    if (!bgCanvas) {
      bgCanvas = document.createElement('canvas')
      el.appendChild(bgCanvas)
    }
    bgCanvas.width = w * 8
    bgCanvas.height = h * 8

    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.style.background = 'transparent'
      explosion = createExplosionRenderer(canvas)
      el.appendChild(canvas)
    }
    explosion.setSize(w)
  }

  function updateSprites(pixels) {
    const blackPixels = {}
    const blocks = []
    for (const { x, y } of pixels) {
      blackPixels[[x, y]] = true
    }
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (!previousBlackPixels[[x, y]] && blackPixels[[x, y]]) {
          blocks.push({ x, y, color: 1 })
        } else if (previousBlackPixels[[x, y]] && !blackPixels[[x, y]]) {
          blocks.push({ x, y, color: 0 })
        }
      }
    }
    previousBlackPixels = blackPixels
    explosion.addBlocks(blocks)
  }

  function draw(pixels) {
    const bgContext = bgCanvas.getContext('2d')
    bgContext.clearRect(0, 0, bgCanvas.width, bgCanvas.height)
    for (const { x, y } of pixels) {
      bgContext.fillRect(x * 8, y * 8, 8, 8)
    }
  }

  return {
    update(w, h, pixels) {
      if (w !== width || h !== height) {
        initCanvas(w, h)
      }
      draw(pixels)
      updateSprites(pixels)
    },
    dispose() {
      if (canvas) {
        canvas.remove()
        explosion.dispose()
      }
    },
  }
}
