// Wiederverwendbares Endlos-Laufband (Marquee) — projektunabhängig.
//
// Anders als eine reine CSS-Lösung übernimmt dieses Script das Vervielfachen
// des Inhalts (Original nur 1× im Markup nötig) und berechnet die Animations-
// dauer aus der tatsächlichen Inhaltsbreite, sodass die Geschwindigkeit
// unabhängig von der Anzahl der Items konstant bleibt.
//
// Markup-Vertrag:
//   <div data-marquee>
//     <div data-marquee-track>
//       <span data-marquee-item>…</span>
//       <span data-marquee-item>…</span>
//     </div>
//   </div>

const SEL = {
  track: '[data-marquee-track]',
  item:  '[data-marquee-item]',
};

const STYLE_ID = 'tw-marquee-styles';

// Identisch zu marquee.css — hier eingebettet, damit der Marquee ohne
// zusätzlichen <link> lauffähig ist. Wird einmalig pro Dokument injiziert.
const CSS = `
.tw-marquee {
  --marquee-gap: clamp(16px, 4vw, 32px);
  --marquee-duration: 30s;
  --marquee-fade: 48px;

  position: relative;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, #000 var(--marquee-fade), #000 calc(100% - var(--marquee-fade)), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--marquee-fade), #000 calc(100% - var(--marquee-fade)), transparent);
}

.tw-marquee__track {
  display: flex;
  align-items: center;
  gap: var(--marquee-gap);
  width: max-content;
  animation: tw-marquee var(--marquee-duration) linear infinite;
}

.tw-marquee.is-paused .tw-marquee__track {
  animation-play-state: paused;
}

@keyframes tw-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .tw-marquee__track { animation: none; }
}
`;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function createMarquee(root, options = {}) {
  injectStyles();

  const el = typeof root === 'string' ? document.querySelector(root) : root;
  if (!el) return null;

  const track = el.querySelector(SEL.track);
  if (!track) return null;

  const originals = [...track.querySelectorAll(SEL.item)];
  if (!originals.length) return null;

  const {
    speed = 60,          // px pro Sekunde
    gap = null,          // überschreibt --marquee-gap, sonst per CSS gesetzt
    pauseOnHover = true,
    reverse = false,
  } = options;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (gap !== null) track.style.setProperty('--marquee-gap', `${gap}px`);
  if (reverse) track.style.animationDirection = 'reverse';

  const appendClones = () => {
    originals.forEach((n) => {
      const clone = n.cloneNode(true);
      clone.setAttribute('data-marquee-clone', '');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  };

  const build = () => {
    track.querySelectorAll('[data-marquee-clone]').forEach((n) => n.remove());

    if (reduceMotion) {
      track.style.animation = 'none';
      return;
    }

    const minWidth = el.getBoundingClientRect().width * 2;
    let copies = 1;
    while (copies < 2 || track.scrollWidth < minWidth) {
      appendClones();
      copies++;
    }
    if (copies % 2 !== 0) {
      appendClones();
      copies++;
    }

    const duration = (track.scrollWidth / 2) / speed;
    track.style.setProperty('--marquee-duration', `${duration}s`);
  };

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  };
  window.addEventListener('resize', onResize);

  if (pauseOnHover) {
    el.addEventListener('mouseenter', () => el.classList.add('is-paused'));
    el.addEventListener('mouseleave', () => el.classList.remove('is-paused'));
  }

  build();

  return {
    items: originals,
    rebuild: build,
    destroy() {
      window.removeEventListener('resize', onResize);
      track.querySelectorAll('[data-marquee-clone]').forEach((n) => n.remove());
    },
  };
}

// Initialisiert alle Marquees im Dokument (oder einem übergebenen Selector) auf einmal.
export function initMarquees(selector = '[data-marquee]', options = {}) {
  return [...document.querySelectorAll(selector)]
    .map((el) => createMarquee(el, options))
    .filter(Boolean);
}
