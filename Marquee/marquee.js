const SEL = {
  track: '[data-marquee-track]',
  item:  '[data-marquee-item]',
};

const STYLE_ID = 'tw-marquee-styles';

const CSS = `
.tw-marquee {
  --marquee-gap: clamp(16px, 4vw, 32px);
  --marquee-duration: 30s;
  --marquee-fade: 48px;
  --marquee-visible-items: 1;

  container-type: inline-size;
  position: relative;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, #000 var(--marquee-fade), #000 calc(100% - var(--marquee-fade)), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--marquee-fade), #000 calc(100% - var(--marquee-fade)), transparent);
}

@media (min-width: 600px) {
  .tw-marquee { --marquee-visible-items: 3; }
}
@media (min-width: 1200px) {
  .tw-marquee { --marquee-visible-items: 4; }
}

.tw-marquee__track {
  display: flex;
  align-items: center;
  gap: var(--marquee-gap);
  width: max-content;
  animation: tw-marquee var(--marquee-duration) linear infinite;
}

[data-marquee-item] {
  width: calc((100cqw - (var(--marquee-visible-items) - 1) * var(--marquee-gap)) / var(--marquee-visible-items));
  flex-shrink: 0;
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

  let {
    speed = 60,
    gap = null,
    pauseOnHover = true,
    reverse = false,
    items: itemsInput = null, // optional: Array von HTML-Strings/Elementen statt vorgefertigtem Markup
  } = options;

  const toElement = (content) => {
    if (content instanceof Element) return content;
    const wrap = document.createElement('div');
    wrap.innerHTML = content;
    return wrap.firstElementChild;
  };

  // itemsInput ersetzt vorhandenes Markup im Track, statt es zu ergänzen —
  // die aufrufende Seite entscheidet sich pro Instanz für eine Quelle:
  // Markup ODER Array, nicht beides gleichzeitig.
  if (itemsInput) {
    track.innerHTML = '';
    itemsInput.forEach((content) => {
      const itemEl = toElement(content);
      if (!itemEl) return;
      if (!itemEl.hasAttribute('data-marquee-item')) itemEl.setAttribute('data-marquee-item', '');
      track.appendChild(itemEl);
    });
  }

  // originals ist ab hier die alleinige Quelle der Wahrheit für "was wird
  // abgespielt" — build() liest ausschließlich daraus. addItem()/
  // removeItem() mutieren dieses Array; die Klone für die Endlosschleife
  // werden danach komplett neu aus dem aktuellen Stand erzeugt.
  const originals = [...track.querySelectorAll(SEL.item)];
  if (!originals.length) return null;

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
    get items() { return [...originals]; },
    rebuild: build,
    // Ändert die Geschwindigkeit (px/s) live nach — build() berechnet die
    // Animationsdauer aus der aktuellen Inhaltsbreite neu.
    setSpeed(px) { speed = px; build(); },
    // Hängt ein weiteres Item an die Sammlung an — originals ist die Quelle
    // der Wahrheit für build(), das Element landet dadurch korrekt mit im
    // Endlosschleifen-Klon-Zyklus statt nur einmalig sichtbar zu sein.
    addItem(content) {
      const itemEl = toElement(content);
      if (!itemEl) return null;
      if (!itemEl.hasAttribute('data-marquee-item')) itemEl.setAttribute('data-marquee-item', '');
      track.appendChild(itemEl);
      originals.push(itemEl);
      build();
      return itemEl;
    },
    removeItem(itemEl) {
      const idx = originals.indexOf(itemEl);
      if (idx === -1) return;
      originals.splice(idx, 1);
      itemEl.remove();
      build();
    },
    destroy() {
      window.removeEventListener('resize', onResize);
      track.querySelectorAll('[data-marquee-clone]').forEach((n) => n.remove());
    },
  };
}

export function initMarquees(selector = '[data-marquee]', options = {}) {
  return [...document.querySelectorAll(selector)]
    .map((el) => createMarquee(el, options))
    .filter(Boolean);
}
