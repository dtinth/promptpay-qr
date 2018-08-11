/**
 * Creates a fancy pixels renderer
 * @param {HTMLDivElement} el The element to render to
 */
export default function createPixelsRenderer (el) {
  let width = 0
  let height = 0
  let animating = false
  let disposed = false

  /**
   * @type {HTMLCanvasElement}
   */
  let canvas
  let bgCanvas

  /**
   * @type {CanvasRenderingContext2D}
   */
  let context
  let sprites = []
  let previousBlackPixels = {}

  function initCanvas (w, h) {
    width = w
    height = h
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.width = w * 8
      canvas.height = h * 8

      bgCanvas = document.createElement('canvas')
      bgCanvas.width = w * 8
      bgCanvas.height = h * 8

      context = canvas.getContext('2d')
      el.appendChild(canvas)
    }
  }

  function rotate3d (x, y, z, a) {
    const r = Math.sqrt(x ** 2 + y ** 2 + z ** 2)
    x /= r
    y /= r
    z /= r
    const versine = (1 - Math.cos(a))
    const sine = Math.sin(a)
    const matrix = [
      [
        1 + versine * (x ** 2 - 1),
        z * sine + x * y * versine,
        -y * sine + x * z * versine
      ],
      [
        -z * sine + x * y * versine,
        1 + versine * (y ** 2 - 1),
        x * sine + y * z * versine
      ],
      [
        y * sine + x * z * versine,
        -x * sine + y * z * versine,
        1 + versine * (z ** 2 - 1)
      ]
    ]
    return function rotatePoint (px, py, pz) {
      return [
        px * matrix[0][0] + py * matrix[0][1] + pz * matrix[0][2],
        px * matrix[1][0] + py * matrix[1][1] + pz * matrix[1][2],
        px * matrix[2][0] + py * matrix[2][1] + pz * matrix[2][2]
      ]
    }
  }

  function updateSprites (pixels) {
    const { width: canvasWidth, height: canvasHeight } = canvas
    const blackPixels = {}
    for (const { x, y } of pixels) {
      blackPixels[[x, y]] = true
    }
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (!previousBlackPixels[[x, y]] && blackPixels[[x, y]]) {
          addSprite(x, y, 'white')
        } else if (previousBlackPixels[[x, y]] && !blackPixels[[x, y]]) {
          addSprite(x, y, 'black')
        }
      }
    }
    previousBlackPixels = blackPixels
    function addSprite (x, y, color) {
      const wX = x * 8 + 4 - canvasWidth / 2
      const wY = y * 8 + 4 - canvasHeight / 2
      const rSquared = wX ** 2 + wY ** 2 + (canvasWidth / 4) ** 2
      const theta = Math.random() * Math.PI * 2
      sprites.push({
        x: wX,
        y: wY,
        z: 0,
        vx: wX * 40000 * (1 - Math.random() * 0.2) / rSquared,
        vy: wY * 40000 * (1 - Math.random() * 0.2) / rSquared,
        vz: 4000000 / rSquared,
        rx: Math.cos(theta),
        ry: Math.sin(theta),
        rSpeed: Math.random() * 20 - 2.5,
        startTime: Date.now(),
        color: color
      })
    }
    if (sprites.length > 800) {
      sprites = sprites.slice(-800)
    }
  }

  function drawSprites () {
    animating = false
    const { width, height } = canvas
    context.imageSmoothingEnabled = false
    context.clearRect(0, 0, width, height)
    context.drawImage(bgCanvas, 0, 0)
    const now = Date.now()
    const p = width * 1.61
    drawSpritesWithColor('white')
    drawSpritesWithColor('black')
    function drawSpritesWithColor (color) {
      context.fillStyle = color
      context.beginPath()
      for (const sprite of sprites.filter(s => s.color === color)) {
        const elapsed = (now - sprite.startTime) / 1000
        const pt = elapsed * 2
        const t = pt < 1 / Math.sqrt(3)
          ? pt ** 3
          : pt - 1 / Math.sqrt(3) + (1 / Math.sqrt(3)) ** 3
        const x = sprite.x + sprite.vx * t
        const y = sprite.y + sprite.vy * t + 500 * t * t
        const z = sprite.z + sprite.vz * t
        if (z >= p * 0.9) {
          sprite.gone = true
          continue
        }
        const rotate = rotate3d(sprite.rx, sprite.ry, 0, t * sprite.rSpeed)
        const rotatedPoints = [
          rotate(-4, -4, 0),
          rotate(4, -4, 0),
          rotate(4, 4, 0),
          rotate(-4, 4, 0)
        ]
        let visible = false
        for (let i = 0; i < 4; i++) {
          let [px, py, pz] = rotatedPoints[i]
          px += x
          py += y
          pz += z
          const cx = px * (p / (p - pz)) + width / 2
          const cy = py * (p / (p - pz)) + height / 2
          if (cx >= 0 && cx <= width && cy >= 0 && cy <= height) {
            visible = true
          }
          if (i === 0) {
            context.moveTo(cx, cy)
          } else {
            context.lineTo(cx, cy)
          }
        }
        context.closePath()
        if (!visible) {
          sprite.gone = true
        }
      }
      context.fill()
    }
    sprites = sprites.filter(s => !s.gone)
    if (!disposed) {
      if (sprites.length) {
        if (!animating) {
          window.requestAnimationFrame(drawSprites)
          animating = true
        }
      }
    }
  }

  function draw (pixels) {
    const bgContext = bgCanvas.getContext('2d')
    bgContext.clearRect(0, 0, bgCanvas.width, bgCanvas.height)
    for (const { x, y } of pixels) {
      bgContext.fillRect(x * 8, y * 8, 8, 8)
    }
  }

  return {
    update (w, h, pixels) {
      if (w !== width || h !== height) {
        initCanvas(w, h)
      }
      draw(pixels)
      updateSprites(pixels)
      drawSprites()
    },
    dispose () {
      disposed = true
      if (canvas) {
        canvas.remove()
      }
    }
  }
}
