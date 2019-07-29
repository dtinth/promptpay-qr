import Pointable from 'react-pointable'
import React from 'react'

// Flipper is a component that has two sides: front-side and back-side.
// User can use swipe horizontally to access the other side.
//
// - `front` React element to display in the front side.
// - `back` React element to display in the front side.
// - `flipped` Whether to display front or back side.
// - `onFlip(flipped)` Called when user initiates a flip.
//
class Flipper extends React.Component {
  componentDidMount() {
    this.animator = createFlipperModel(degrees => {
      this.el.style.transform = `rotateY(${degrees}deg)`
    }, this.onFlip)
    this.animator.setFlipped(!!this.props.flipped)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.flipped !== this.props.flipped) {
      this.animator.setFlipped(!!nextProps.flipped)
    }
  }
  onFlip = flipped => {
    if (this.props.onFlip) this.props.onFlip(flipped)
  }
  onPointerDown = e => {
    if (!this.activePointer) {
      this.activePointer = { pointerId: e.pointerId, lastX: e.clientX }
      this.animator.pointerDown()
    }
  }
  onPointerMove = e => {
    if (!this.activePointer) return
    if (this.activePointer.pointerId !== e.pointerId) return
    const delta =
      (e.clientX - this.activePointer.lastX) / this.el.offsetWidth * 180
    this.activePointer.lastX = e.clientX
    this.animator.pointerMove(delta)
  }
  onPointerUp = e => {
    this.animator.pointerUp()
    this.activePointer = null
  }
  onPointerCancel = e => {
    this.animator.pointerUp()
    this.activePointer = null
  }
  render() {
    return (
      <Pointable
        style={{ touchAction: 'pan-y' }}
        touchAction="pan-y"
        onPointerDown={this.onPointerDown}
        onPointerMove={this.onPointerMove}
        onPointerUp={this.onPointerUp}
        onPointerCancel={this.onPointerCancel}
      >
        <div className={'Flipper' + (this.props.flipped ? ' is-flipped' : '')}>
          <div
            className="Flipperのrotor"
            ref={el => {
              this.el = el
            }}
          >
            <div className="Flipperのfront">{this.props.front}</div>
            <div className="Flipperのback">{this.props.back}</div>
          </div>
        </div>
      </Pointable>
    )
  }
}

export default Flipper

// This model object takes care of the state and animation and handles input.
function createFlipperModel(setRotationDegrees, onFlip) {
  // XXX: A lot of mutable variables here!!!
  //      If you are up for a challenge, please help clean up this code!

  // Current rotation to be rendered (degrees)
  let current = 0

  // Target rotation (degrees)
  let target = 0

  // Current rotation speed (degrees/frame)
  let currentSpeed = 0

  // Spring strength
  const springK = 1 / 15

  // Rotation acceleration (degrees/frame^2)
  const acceleration = 0.7

  // Animation parameters...
  let animationActive = false
  let animationStartTime = Date.now()
  let lastFrameNumber = 0

  // State of dragging
  let pointerIsDown = false
  let history = []

  // Returns whether an animation should run.
  function shouldAnimate() {
    // Don’t animate while dragging
    if (pointerIsDown) return false

    const finished = current === target && Math.abs(currentSpeed) < 0.5
    return !finished
  }

  // Ensure that animation frame is requested (if an animation is needed).
  function updateAnimation() {
    if (!animationActive && shouldAnimate()) {
      animationStartTime = Date.now()
      lastFrameNumber = 0
      window.requestAnimationFrame(frame)
      animationActive = true
    }
  }

  // The animation frame. Calls update (handle frameskip) and draw.
  function frame() {
    if (!animationActive) return
    const expectedFrameNumber = (Date.now() - animationStartTime) / 1000 * 60
    const updateCount = Math.min(expectedFrameNumber - lastFrameNumber, 10)
    lastFrameNumber = expectedFrameNumber
    for (let i = 0; i < updateCount; i++) {
      update()
      if (!shouldAnimate()) {
        animationActive = false
        break
      }
    }
    draw()
    if (animationActive) {
      window.requestAnimationFrame(frame)
    }
  }

  // Animation update logic.
  function update() {
    const bestSpeed = (target - current) * springK
    currentSpeed = linearlyApproach(currentSpeed, bestSpeed, acceleration)
    current += currentSpeed
    if (Math.abs(current - target) < 0.1) {
      current = target
    }
  }

  // Linearly approach target by at most delta.
  function linearlyApproach(current, target, delta) {
    if (Math.abs(current - target) < delta) {
      return target
    } else if (current < target) {
      return current + delta
    } else {
      return current - delta
    }
  }

  // Animation draw logic.
  function draw() {
    setRotationDegrees(current)
  }

  // Based on current animation state, simulate the projected rotation angle
  // if we allow the spinning to stop without intervention.
  function getProjection() {
    let projection = current
    let speed = currentSpeed
    for (let i = 0; i < 600; i++) {
      const targetSpeed = speed * (1 - springK)
      speed = linearlyApproach(speed, targetSpeed, acceleration)
      projection += speed
    }
    return projection
  }

  // Based on the animation target angle, are we showing the back side?
  function isFlipped(angle) {
    return Math.round(angle / 180) % 2 !== 0
  }

  // Flips the flipper (if necessary).
  //
  // - `flipped` Set to true to display the backside or false for front side.
  function flip(flipped) {
    const projection = getProjection()
    target = getTargetAngle(projection, flipped)
    updateAnimation()
  }

  // Based on the projected angle `projection` and desired `flipped` state,
  // determine the optimal angle to rotate the flipper to.
  function getTargetAngle(projection, flipped) {
    const offset = flipped ? 180 : 0
    return Math.round((projection - offset - 1) / 360) * 360 + offset
  }

  // Queue a draw frame (for use when animation is not active).
  let pendingDraw = false
  function queueDraw() {
    if (pendingDraw) return
    pendingDraw = true
    window.requestAnimationFrame(() => {
      pendingDraw = false
      draw()
    })
  }

  return {
    setFlipped(flipped) {
      flip(flipped)
    },
    pointerDown() {
      pointerIsDown = true
      history.length = 0
      history.push({ time: Date.now(), current })
    },
    pointerMove(delta) {
      current += delta
      queueDraw()

      // Maintain a brief history of dragging to calculate the ending drag speed.
      history.push({ time: Date.now(), current })
      while (history.length > 1 && history[0].time < Date.now() - 100) {
        history.shift()
      }
    },
    pointerUp() {
      pointerIsDown = false

      // Set the rotation speed to the ending speed of dragging.
      if (history.length > 0) {
        const dt = (Date.now() - history[0].time) / 1000 * 60
        const dx = current - history[0].current
        const dragSpeed = Math.max(-25, Math.min(25, dx / dt))
        currentSpeed = dragSpeed
      }

      // Signal the flipping intent.
      const projection = getProjection()
      if (Math.abs(projection - target) > 90) {
        onFlip(!isFlipped(target))
      }
      updateAnimation()
    },
  }
}
