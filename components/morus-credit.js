/**
 * <morus-credit> — reusable "Created by Morus AI" footer credit.
 *
 * Usage:
 *   <script src="components/morus-credit.js" defer></script>
 *   <morus-credit></morus-credit>
 *
 * Optional attributes:
 *   logo-src  Path to the Morus AI logo   (default: "public/morus-ai-logo.png")
 *   href      Link target                 (default: "https://morusai.com")
 *   label     Lead-in text                (default: "Created by")
 *   theme     "dark" (for dark pages, default) or "light"
 *
 * Themable from the host page via CSS custom properties:
 *   --morus-credit-color, --morus-credit-backing, --morus-credit-size
 *
 * Put a plain fallback link inside the tag; it shows only if JS doesn't run:
 *   <morus-credit><a href="https://morusai.com">Created by Morus AI</a></morus-credit>
 */
(function () {
  if (!('customElements' in window) || customElements.get('morus-credit')) return;

  const template = document.createElement('template');
  template.innerHTML = `
    <style>
      :host {
        display: block;
        text-align: center;
        font: 500 12px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        letter-spacing: 0.04em;
        color: var(--morus-credit-color, rgba(255, 255, 255, 0.62));
        padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 0px));
      }
      :host([theme="light"]) { color: var(--morus-credit-color, rgba(0, 0, 0, 0.55)); }
      a {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: inherit;
        text-decoration: none;
        opacity: 0.85;
        border-radius: 999px;
        padding: 4px 6px;
        transition: opacity 0.2s ease;
      }
      a:hover, a:focus-visible { opacity: 1; }
      a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
      .backing {
        display: inline-flex;
        align-items: center;
        background: var(--morus-credit-backing, rgba(255, 255, 255, 0.92));
        border-radius: 6px;
        padding: 4px 7px;
      }
      img { display: block; height: var(--morus-credit-size, 18px); width: auto; }
      .fallback { font-weight: 700; color: inherit; }
      [hidden] { display: none !important; }
    </style>
    <a target="_blank" rel="noopener">
      <span class="label"></span>
      <span class="backing"><img alt="Morus AI" decoding="async" loading="lazy"></span>
      <span class="fallback" hidden>Morus AI</span>
    </a>
  `;

  class MorusCredit extends HTMLElement {
    static get observedAttributes() { return ['logo-src', 'href', 'label']; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: 'open' });
      root.appendChild(template.content.cloneNode(true));
      this._a = root.querySelector('a');
      this._img = root.querySelector('img');
      this._label = root.querySelector('.label');
      this._backing = root.querySelector('.backing');
      this._fallback = root.querySelector('.fallback');
      this._img.addEventListener('error', () => {
        this._backing.hidden = true;
        this._fallback.hidden = false;
      });
    }

    connectedCallback() { this._render(); }
    attributeChangedCallback() { this._render(); }

    _render() {
      const href = this.getAttribute('href') || 'https://morusai.com';
      const label = this.getAttribute('label') || 'Created by';
      this._a.href = href;
      this._a.setAttribute('aria-label', `${label} Morus AI (opens in a new tab)`);
      this._label.textContent = label;
      this._backing.hidden = false;
      this._fallback.hidden = true;
      this._img.src = this.getAttribute('logo-src') || 'public/morus-ai-logo.png';
    }
  }

  customElements.define('morus-credit', MorusCredit);
})();
