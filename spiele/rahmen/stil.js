// Gemeinsame Stil-Grundlage der Rahmen-Bausteine (Shadow DOM, nur rem).
// 1rem = 1/108 der Bildhöhe.

/** Maße in rem. */
export const MASSE = { bedien: 11, haupt: 16, klein: 8, rand: 2.4, abstand: 2 };

/** CSS für das Innere jedes Bausteins: Variablen, Grundknopf, Einsinken, reduced motion. */
export const GRUND_CSS = `
:host {
  --ls-tinte: #3B2A6B;
  --ls-papier: rgba(255, 255, 255, 0.9);
  --ls-knopf: ${MASSE.bedien}rem;
  --ls-schatten: 0 0.6rem 0 rgba(59, 42, 107, 0.15);
  --ls-schatten-unten: 0 0.2rem 0 rgba(59, 42, 107, 0.15);
  display: inline-block;
  color: var(--ls-tinte);
  font-family: "Andika", sans-serif;
  font-size: 3.2rem;
  line-height: 1;
}
:host([hidden]) { display: none; }
.knopf {
  box-sizing: border-box;
  width: var(--ls-knopf);
  height: var(--ls-knopf);
  padding: 2rem;
  margin: 0;
  border: 0;
  border-radius: 50%;
  background: var(--ls-papier);
  color: inherit;
  font: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--ls-schatten);
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.knopf:active {
  transform: translateY(0.3rem);
  box-shadow: var(--ls-schatten-unten);
}
.knopf:focus-visible {
  outline: 0.4rem solid var(--ls-tinte);
  outline-offset: 0.4rem;
}
.knopf img { width: 100%; height: 100%; display: block; pointer-events: none; }
.knopf.gespiegelt img { transform: scaleX(-1); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
`;

/**
 * Registriert einen Baustein, falls der Name noch frei ist.
 * @param {string} name
 * @param {CustomElementConstructor} klasse
 * @returns {void}
 */
export function definiere(name, klasse) {
  if (!customElements.get(name)) customElements.define(name, klasse);
}
