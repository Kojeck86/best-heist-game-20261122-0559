// Velvet Hour — keyboard and mouse input.
// Tracks held keys, click-to-move targets and one-shot key presses so the
// game loop can ask "is the player moving?" without touching the DOM.
export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // keys hit since the last frame was consumed
  let clickTarget = null;
  let clickConsumed = false;

  function keyName(event) {
    return event.key.length === 1 ? event.key.toLowerCase() : event.key;
  }

  function onKeyDown(event) {
    const name = keyName(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(name);
    keys.add(name);
  }

  function onKeyUp(event) {
    keys.delete(keyName(event));
  }

  function onMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    clickTarget = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    clickConsumed = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousedown', onMouseDown);

  return {
    // Held-key movement vector, normalised, from WASD or arrow keys.
    moveVector() {
      let x = 0;
      let y = 0;
      if (keys.has('a') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('d') || keys.has('ArrowRight')) x += 1;
      if (keys.has('w') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('s') || keys.has('ArrowDown')) y += 1;
      if (x !== 0 && y !== 0) {
        const len = Math.hypot(x, y);
        x /= len;
        y /= len;
      }
      return { x, y };
    },

    isSneaking() {
      return keys.has('Shift');
    },

    // True once per physical key press; the game loop calls this each frame.
    // Enter is also accepted as 'enter' for convenience.
    wasPressed(name) {
      if (name === 'enter') return pressed.has('Enter') || pressed.has('enter');
      return pressed.has(name);
    },

    // A fresh click-to-move destination, or null. Reading it marks it used.
    takeClickTarget() {
      if (clickTarget && !clickConsumed) {
        clickConsumed = true;
        return clickTarget;
      }
      return null;
    },

    clearClickTarget() {
      clickTarget = null;
    },

    // Called at the end of every frame so one-shot presses do not linger.
    endFrame() {
      pressed.clear();
    },
  };
}
