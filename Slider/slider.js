// Wiederverwendbarer "Peek"-Slider — projektunabhängig.
//
// Steuert Verhalten ausschließlich über data-Attribute (kein Bezug zu
// Projekt-Klassennamen). Styling ist bewusst getrennt: siehe slider.css.
//
// Markup-Vertrag:
//   <div data-slider>
//     <div data-slider-track>
//       <div data-slider-slide>…</div>
//       <div data-slider-slide>…</div>
//     </div>
//     <button data-slider-prev></button>
//     <div data-slider-dots></div>   <!-- leer lassen: Dots werden erzeugt -->
//     <button data-slider-next></button>
//   </div>

const SEL = {
  track: '[data-slider-track]',
  slide: '[data-slider-slide]',
  prev:  '[data-slider-prev]',
  next:  '[data-slider-next]',
  dots:  '[data-slider-dots]',
  dot:   '[data-slider-dot]',
};

export function createSlider(root, options = {}) {
  const el = typeof root === 'string' ? document.querySelector(root) : root;
  if (!el) return null;

  const {
    loop = true,
    autoplay = false,       // Intervall in ms, false = aus
    autoHeight = false,     // Container-Höhe an aktiven Slide anpassen
    heightSelector = null,  // z.B. '.container' — misst ein Kind statt des Slides selbst
    startIndex = 0,
    swipe = true,
    keyboard = true,
    onChange = null,
  } = options;

  const track  = el.querySelector(SEL.track);
  const slides = [...el.querySelectorAll(SEL.slide)];
  if (!track || !slides.length) return null;

  const prevBtn  = el.querySelector(SEL.prev);
  const nextBtn  = el.querySelector(SEL.next);
  const dotsWrap = el.querySelector(SEL.dots);

  let dots = dotsWrap ? [...dotsWrap.querySelectorAll(SEL.dot)] : [];
  if (dotsWrap && dots.length !== slides.length) {
    dotsWrap.innerHTML = '';
    dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tw-slider__dot';
      b.setAttribute('data-slider-dot', '');
      b.setAttribute('aria-label', `Slide ${i + 1}`);
      dotsWrap.appendChild(b);
      return b;
    });
  }

  let current = Math.min(Math.max(startIndex, 0), slides.length - 1);
  let autoplayTimer = null;

  const step = () => {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  };

  const setHeight = () => {
    if (!autoHeight) return;
    const measureEl = heightSelector ? slides[current].querySelector(heightSelector) : slides[current];
    if (measureEl) track.style.height = `${measureEl.offsetHeight}px`;
  };

  const setPosition = () => {
    track.style.transform = `translateX(-${current * step()}px)`;
  };

  const render = () => {
    dots.forEach((d, i)   => d.classList.toggle('is-active', i === current));
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    setPosition();
    setHeight();
  };

  const goTo = (idx) => {
    current = loop
      ? (idx + slides.length) % slides.length
      : Math.min(Math.max(idx, 0), slides.length - 1);
    render();
    onChange?.(current);
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);

  const onResize = () => render();
  window.addEventListener('resize', onResize);

  let onKeydown = null;
  if (keyboard) {
    onKeydown = (e) => {
      if (!el.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    el.addEventListener('keydown', onKeydown);
  }

  let dragging = false;
  let dragStartX = 0;
  const onDragStart = (x) => {
    dragging = true;
    dragStartX = x;
    track.style.transition = 'none';
  };
  const onDragEnd = (x) => {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    const delta = x - dragStartX;
    if (Math.abs(delta) > 40) (delta < 0 ? next : prev)();
    else render();
  };

  let onTouchStart = null;
  let onTouchEnd = null;
  if (swipe) {
    onTouchStart = (e) => onDragStart(e.touches[0].clientX);
    onTouchEnd   = (e) => onDragEnd(e.changedTouches[0].clientX);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd);
  }

  const startAutoplay = () => {
    if (!autoplay) return;
    stopAutoplay();
    autoplayTimer = setInterval(next, autoplay);
  };
  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  };
  if (autoplay) {
    startAutoplay();
    el.addEventListener('mouseenter', stopAutoplay);
    el.addEventListener('mouseleave', startAutoplay);
  }

  render();

  return {
    slides,
    goTo,
    next,
    prev,
    get current() { return current; },
    destroy() {
      window.removeEventListener('resize', onResize);
      stopAutoplay();
      if (onKeydown) el.removeEventListener('keydown', onKeydown);
      if (swipe) {
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchend', onTouchEnd);
      }
    },
  };
}

// Initialisiert alle Slider im Dokument (oder einem übergebenen Selector) auf einmal.
export function initSliders(selector = '[data-slider]', options = {}) {
  return [...document.querySelectorAll(selector)]
    .map((el) => createSlider(el, options))
    .filter(Boolean);
}
