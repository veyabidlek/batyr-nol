// KaTeX helpers. The library is vendored rather than pulled from a CDN — a maths
// game whose formulas silently fail to render is worse than no game.

/** Render a LaTeX snippet into an element, falling back to plain text. */
export function tex(latex, { display = false } = {}) {
  const span = document.createElement('span');
  span.className = display ? 'tex tex-display' : 'tex';
  if (!latex) return span;
  if (window.katex) {
    try {
      window.katex.render(latex, span, {
        displayMode: display,
        throwOnError: false,
        output: 'html',
      });
      return span;
    } catch {
      /* fall through to plain text */
    }
  }
  span.textContent = latex.replace(/\\[a-zA-Z]+|[{}]/g, ' ').trim();
  return span;
}

/**
 * Some strings mix words and maths ("40 см²" vs "\frac{1}{2}"). Treating every
 * option as LaTeX keeps one code path and lets KaTeX handle \text{} itself.
 */
export const texNode = (value, opts) => tex(String(value ?? ''), opts);
