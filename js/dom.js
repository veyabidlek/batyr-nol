// Tiny DOM helpers. Everything here exists so the screen modules can describe
// structure instead of shuffling createElement calls.

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'style') node.setAttribute('style', value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export const img = (name, alt = '', cls = '', filter = '') =>
  el('img', {
    src: `assets/${name}.webp`, alt, class: cls,
    loading: 'lazy', decoding: 'async',
    style: filter ? `filter:${filter}` : null,
  });

export const clear = (node) => { node.innerHTML = ''; return node; };

export const prefersReducedMotion = () =>
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

/** Bar fill as a percentage, floored at 0 so a killing blow still animates to empty. */
export const pct = (value, max) => `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
