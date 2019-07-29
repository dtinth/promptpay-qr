import { mat4 } from 'gl-matrix'
// @ts-check

/**
 * @param {HTMLCanvasElement} canvas
 */
export function createExplosionRenderer(canvas) {
  /** @type {WebGLRenderingContext} */
  const gl = canvas.getContext('webgl')
  if (!gl) {
    throw new Error('Unable to initialize WebGL.')
  }

  const vertexShaderCode = `
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform float uTime;

    attribute vec4 aVertexPosition;
    attribute vec4 aVertexLocation;
    attribute float aColor;
    attribute vec3 aInitialVelocity;
    attribute vec2 aRotationAxis;
    attribute float aRotationSpeed;

    varying lowp vec4 vColor;

    // Copy-and-pasted from
    // http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
    mat4 rotationMatrix(vec3 axis, float angle)
    {
        axis = normalize(axis);
        float s = sin(angle);
        float c = cos(angle);
        float oc = 1.0 - c;
        return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                    0.0,                                0.0,                                0.0,                                1.0);
    }

    void main() {
      mat4 rotationMatrix = rotationMatrix(vec3(aRotationAxis[0], aRotationAxis[1], 0), uTime * aRotationSpeed);
      vec4 translation =
        aVertexLocation +
        uTime * vec4(aInitialVelocity[0], aInitialVelocity[1], aInitialVelocity[2], 0) +
        uTime * uTime * vec4(0, 16, 0, 0);
      mat4 translationMatrix = mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        translation[0], translation[1], translation[2], 1.0);
      vec4 position = (rotationMatrix * (aVertexPosition - vec4(0.5, 0.5, 0.0, 0.0))) + vec4(0.5, 0.5, 0.0, 0.0);
      gl_Position = uProjectionMatrix * uModelViewMatrix * translationMatrix * position;
      vColor = vec4(aColor, aColor, aColor, 1.0);
      // gl_Position = aVertexPosition;
    }
  `
  const fragmentShaderCode = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `
  const vertexShader = loadShader(
    gl,
    'vertex shader',
    gl.VERTEX_SHADER,
    vertexShaderCode,
  )
  const fragmentShader = loadShader(
    gl,
    'fragment shader',
    gl.FRAGMENT_SHADER,
    fragmentShaderCode,
  )
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      'Cannot link shader program: ' + gl.getProgramInfoLog(program),
    )
  }

  gl.useProgram(program)

  const aVertexLocation = gl.getAttribLocation(program, 'aVertexLocation')
  const aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition')
  const aColor = gl.getAttribLocation(program, 'aColor')
  const aInitialVelocity = gl.getAttribLocation(program, 'aInitialVelocity')
  const aRotationAxis = gl.getAttribLocation(program, 'aRotationAxis')
  const aRotationSpeed = gl.getAttribLocation(program, 'aRotationSpeed')
  gl.enableVertexAttribArray(aVertexLocation)
  gl.enableVertexAttribArray(aVertexPosition)
  gl.enableVertexAttribArray(aColor)
  gl.enableVertexAttribArray(aInitialVelocity)
  gl.enableVertexAttribArray(aRotationAxis)
  gl.enableVertexAttribArray(aRotationSpeed)

  canvas.width = 720
  canvas.height = 720
  gl.viewport(0, 0, 720, 720)

  const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix')
  const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix')
  const uTime = gl.getUniformLocation(program, 'uTime')

  function createRenderer(size) {
    const fieldOfView = Math.atan2(1, 1.61) * 2
    const projectionMatrix = mat4.create()
    mat4.perspective(projectionMatrix, fieldOfView, 1, 0.01, 999)
    const modelViewMatrix = mat4.create()
    mat4.fromTranslation(modelViewMatrix, [
      -size / 2,
      size / 2,
      -size * 1.61 * 0.5,
    ])
    mat4.scale(modelViewMatrix, modelViewMatrix, [1, -1, 1])

    let batches = []
    let requested = false

    function dispose() {
      batches.forEach(b => b.dispose())
      batches = []
    }

    return { render, addBlocks, dispose }

    function addBlocks(items) {
      const locations = []
      const positions = []
      const colors = []
      const velocities = []
      const rotationAxes = []
      const rotationSpeeds = []
      let vertices = 0
      items.forEach(({ x, y, color }) => {
        positions.push(0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1)
        const wX = ((x + 0.5) / size - 0.5) * 2
        const wY = ((y + 0.5) / size - 0.5) * 2
        const rSquared = wX ** 2 + wY ** 2 + 0.25
        const theta = Math.random() * Math.PI * 2
        const vx =
          wX * 16 * (1 - Math.random() * 0.2) / rSquared + (Math.random() - 0.5)
        const vy = wY * 16 * (1 - Math.random() * 0.2) / rSquared
        const vz = 8 / rSquared
        const rx = Math.cos(theta)
        const ry = Math.sin(theta)
        const rSpeed = Math.random() * 20 - 2.5
        for (let i = 0; i < 6; i++) {
          colors.push(color)
          locations.push(x, y)
          velocities.push(vx, vy, vz)
          rotationAxes.push(rx, ry)
          rotationSpeeds.push(rSpeed)
        }
        vertices += 6
      })

      const positionBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW,
      )

      const locationBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, locationBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(locations),
        gl.STATIC_DRAW,
      )

      const velocityBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(velocities),
        gl.STATIC_DRAW,
      )

      const colorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

      const rotationAxisBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, rotationAxisBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(rotationAxes),
        gl.STATIC_DRAW,
      )

      const rotationSpeedBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, rotationSpeedBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(rotationSpeeds),
        gl.STATIC_DRAW,
      )

      const batch = {
        start: Date.now(),
        positionBuffer,
        locationBuffer,
        colorBuffer,
        velocityBuffer,
        rotationAxisBuffer,
        rotationSpeedBuffer,
        vertices,
        done: false,
        dispose() {
          if (batch.done) return
          batch.done = true
          gl.deleteBuffer(positionBuffer)
          gl.deleteBuffer(locationBuffer)
          gl.deleteBuffer(colorBuffer)
          gl.deleteBuffer(velocityBuffer)
          gl.deleteBuffer(rotationAxisBuffer)
          gl.deleteBuffer(rotationSpeedBuffer)
        },
      }
      batches.unshift(batch)
    }

    function nextFrame() {
      requested = false
      render()
    }

    function render() {
      let shouldContinue = false
      gl.clearColor(0.0, 0.0, 0.0, 0.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix)
      gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix)
      for (const batch of batches) {
        if (batch.done) continue
        const elapsed = (Date.now() - batch.start) / 1000
        const pt = elapsed * 2
        const t =
          pt < 1 / Math.sqrt(3)
            ? pt ** 3
            : pt - 1 / Math.sqrt(3) + (1 / Math.sqrt(3)) ** 3
        gl.uniform1f(uTime, t)
        gl.bindBuffer(gl.ARRAY_BUFFER, batch.positionBuffer)
        gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, batch.locationBuffer)
        gl.vertexAttribPointer(aVertexLocation, 2, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, batch.colorBuffer)
        gl.vertexAttribPointer(aColor, 1, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, batch.velocityBuffer)
        gl.vertexAttribPointer(aInitialVelocity, 3, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, batch.rotationAxisBuffer)
        gl.vertexAttribPointer(aRotationAxis, 2, gl.FLOAT, false, 0, 0)
        gl.bindBuffer(gl.ARRAY_BUFFER, batch.rotationSpeedBuffer)
        gl.vertexAttribPointer(aRotationSpeed, 1, gl.FLOAT, false, 0, 0)
        gl.drawArrays(gl.TRIANGLES, 0, batch.vertices)
        const done = t > 3
        if (done) {
          batch.dispose()
        } else {
          shouldContinue = true
        }
      }
      if (shouldContinue) {
        if (!requested) {
          requested = true
          window.requestAnimationFrame(nextFrame)
        }
      } else {
        batches = []
      }
    }
  }

  let currentRenderer = null
  let currentSize = null
  return {
    setSize(size) {
      if (currentRenderer && size !== currentSize) {
        currentRenderer.dispose()
        currentRenderer = null
      }
      if (!currentRenderer) {
        currentRenderer = createRenderer(size)
      }
      currentSize = size
    },
    dispose() {
      if (currentRenderer) {
        currentRenderer.dispose()
        currentRenderer = null
      }
    },
    addBlocks(blocks) {
      if (currentRenderer) {
        currentRenderer.addBlocks(blocks)
        currentRenderer.render()
      }
    },
  }
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} name
 * @param {number} type
 * @param {string} source
 */
function loadShader(gl, name, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const text = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Cannot compile ${name}: ${text}`)
  }
  return shader
}
