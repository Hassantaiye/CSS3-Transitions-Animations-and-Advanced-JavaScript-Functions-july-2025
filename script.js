// Part 2: JavaScript Functions — Parameters, Returns, Scope
// ---------------------------------------------------------
// We define reusable functions with clear inputs/outputs.

// Global configuration object (demonstrates global scope)
const appConfig = {
  animationDurationMs: 900,
  defaultScaleOutput: { min: 0, max: 1 },
};

/**
 * Linearly maps a value from one range to another.
 * Parameters: value, inMin, inMax, outMin, outMax
 * Returns: number
 */
function scaleValue(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) {
    throw new Error("inMax must not equal inMin");
  }
  const clamped = Math.min(Math.max(value, Math.min(inMin, inMax)), Math.max(inMin, inMax));
  const normalized = (clamped - inMin) / (inMax - inMin);
  return outMin + normalized * (outMax - outMin);
}

/**
 * Adds a CSS class for a duration, then removes it.
 * Demonstrates function reuse to trigger animations.
 */
function runClassForDuration(element, className, durationMs) {
  if (!element) return;
  element.classList.remove(className); // restart if already present
  // Force reflow to restart keyframe
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), durationMs);
}

/**
 * Toggles a boolean class state on an element.
 * Returns the resulting boolean state.
 */
function toggleClass(element, className) {
  if (!element) return false;
  const result = element.classList.toggle(className);
  return result;
}

// Demonstrate local scope via an IIFE that creates private helpers
const animate = (() => {
  // Private helper (local scope)
  function withDurationOverride(durationMaybe) {
    return Number.isFinite(durationMaybe) ? durationMaybe : appConfig.animationDurationMs;
  }

  return {
    runOnce: (el, className, durationMs) => runClassForDuration(el, className, withDurationOverride(durationMs)),
    toggle: (el, className) => toggleClass(el, className),
  };
})();

// Part 3: Combine CSS + JS — Wire up interactions
// -----------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Box animation
  const actionBox = document.getElementById("actionBox");
  const animateBoxBtn = document.getElementById("animateBoxBtn");
  animateBoxBtn?.addEventListener("click", () => {
    animate.runOnce(actionBox, "run", appConfig.animationDurationMs);
  });

  // Flip card
  const flipCard = document.getElementById("flipCard");
  const flipBtn = document.getElementById("flipBtn");
  flipBtn?.addEventListener("click", () => {
    const isFlipped = animate.toggle(flipCard, "is-flipped");
    flipBtn.setAttribute("aria-pressed", String(isFlipped));
  });

  // Loader start/stop
  const loader = document.getElementById("loader");
  document.getElementById("startLoadBtn")?.addEventListener("click", () => loader?.classList.add("is-active"));
  document.getElementById("stopLoadBtn")?.addEventListener("click", () => loader?.classList.remove("is-active"));

  // Modal open/close with slide+fade
  const modalOverlay = document.getElementById("modalOverlay");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  openModalBtn?.addEventListener("click", () => {
    modalOverlay?.classList.add("is-open");
    modalOverlay?.setAttribute("aria-hidden", "false");
  });
  function closeModal() {
    modalOverlay?.classList.remove("is-open");
    modalOverlay?.setAttribute("aria-hidden", "true");
  }
  closeModalBtn?.addEventListener("click", closeModal);
  modalOverlay?.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });

  // Part 2 form: demonstrate parameters, returns, and scope
  const scaleForm = document.getElementById("scaleForm");
  const scaleResult = document.getElementById("scaleResult");
  scaleForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = Number(document.getElementById("val").value);
    const inMin = Number(document.getElementById("inMin").value);
    const inMax = Number(document.getElementById("inMax").value);
    const outMin = Number(document.getElementById("outMin").value);
    const outMax = Number(document.getElementById("outMax").value);

    try {
      const scaled = scaleValue(value, inMin, inMax, outMin, outMax);
      scaleResult.textContent = `Scaled value: ${scaled.toFixed(3)}`;
      // Use the scaled result to control an animation speed (example of reuse)
      const duration = 300 + Math.round((1 - (scaled - outMin) / (outMax - outMin)) * 1700);
      loader?.style.setProperty("animation-duration", `${Math.max(200, duration)}ms`);
    } catch (err) {
      scaleResult.textContent = `Error: ${err.message}`;
    }
  });
});


