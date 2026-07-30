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
    autoplay = false,
    autoHeight = false,
    heightSelector = null,
    startIndex = 0,
    swipe = true,
    keyboard = true,
    // Wiedergabemöglichkeit: 'single' (Standard, 1 Bild/Slide, klassisches
    // Verhalten) | 'multi' (mehrere gleich breite Slides gleichzeitig) |
    // 'featured' (1 großer + mehrere kleine Peek-Slides). Rein visuell — das
    // Script kennt keine Breiten, setzt nur das data-Attribut, slider.css
    // übernimmt darüber die tatsächliche Größenverteilung.
    mode = 'single',
    // Überschreibt --slider-visible-slides (Anzahl gleichzeitig sichtbarer
    // Slides in Modus 'multi'/'featured') von außen statt über die
    // responsiven CSS-Standardwerte (1/3/4 nach Bildschirmbreite) — die
    // Variable kommt damit wahlweise aus der API oder aus slider.css.
    visibleSlides = null,
    slides: slidesInput = null, // optional: Array von HTML-Strings/Elementen statt vorgefertigtem Markup
    onChange = null,
  } = options;

  const track = el.querySelector(SEL.track);
  if (!track) return null;

  el.setAttribute('data-slider-mode', mode);
  if (visibleSlides != null) el.style.setProperty('--slider-visible-slides', visibleSlides);

  const toElement = (content) => {
    if (content instanceof Element) return content;
    const wrap = document.createElement('div');
    wrap.innerHTML = content;
    return wrap.firstElementChild;
  };

  // slidesInput ersetzt vorhandenes Markup im Track, statt es zu ergänzen —
  // die aufrufende Seite entscheidet sich pro Instanz für eine Quelle:
  // Markup ODER Array, nicht beides gleichzeitig.
  if (slidesInput) {
    track.innerHTML = '';
    slidesInput.forEach((content) => {
      const slideEl = toElement(content);
      if (!slideEl) return;
      if (!slideEl.hasAttribute('data-slider-slide')) slideEl.setAttribute('data-slider-slide', '');
      track.appendChild(slideEl);
    });
  }

  // slides ist ab hier die alleinige Quelle der Wahrheit für "was wird
  // abgespielt" — offsetTo()/render()/setHeight() lesen ausschließlich daraus.
  // addSlide()/removeSlide() mutieren dieses Array in place (splice/push),
  // nie per Neuzuweisung, damit die zurückgegebene Referenz live bleibt.
  const slides = [...el.querySelectorAll(SEL.slide)];
  if (!slides.length) return null;
  // Die Breiten-Regel in slider.css hängt an dieser Klasse, nicht am
  // data-slider-slide-Attribut — wird hier erzwungen, damit auch komplett
  // eigenes/komplexes Slide-Markup (ohne Kenntnis der Tool-CSS) korrekt
  // dimensioniert wird, statt sich am Inhalt zu verzerren.
  slides.forEach((s) => s.classList.add('tw-slider__slide'));

  const prevBtn  = el.querySelector(SEL.prev);
  const nextBtn  = el.querySelector(SEL.next);
  const dotsWrap = el.querySelector(SEL.dots);

  const buildDots = () => {
    dotsWrap.innerHTML = '';
    return slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tw-slider__dot';
      b.setAttribute('data-slider-dot', '');
      b.setAttribute('aria-label', `Slide ${i + 1}`);
      dotsWrap.appendChild(b);
      return b;
    });
  };

  let dots = dotsWrap ? [...dotsWrap.querySelectorAll(SEL.dot)] : [];
  if (dotsWrap && dots.length !== slides.length) {
    dots = buildDots();
  }
  const wireDots = () => dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  const syncDots = () => {
    if (!dotsWrap) return;
    dots = buildDots();
    wireDots();
  };

  let current = Math.min(Math.max(startIndex, 0), slides.length - 1);
  let autoplayTimer = null;

  // Summe der Breiten (+Gap) aller Slides vor idx — funktioniert auch bei
  // ungleich breiten Slides (Modus 'featured'), weil jede Breite live per
  // getBoundingClientRect() gemessen wird statt eine einheitliche Breite
  // anzunehmen wie im alten step()-Modell.
  const offsetTo = (idx) => {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    let offset = 0;
    for (let i = 0; i < idx; i++) offset += slides[i].getBoundingClientRect().width + gap;
    return offset;
  };

  const setHeight = () => {
    if (!autoHeight) return;
    const measureEl = heightSelector ? slides[current].querySelector(heightSelector) : slides[current];
    if (measureEl) track.style.height = `${measureEl.offsetHeight}px`;
  };

  const setPosition = () => {
    track.style.transform = `translateX(-${offsetTo(current)}px)`;
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

  wireDots();
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
    // Erzwingt Neu-Layout (Position/Höhe), ohne current zu ändern — nötig
    // nach externen Änderungen, die die Slide-Breiten beeinflussen (z.B.
    // --slider-visible-slides/--slider-featured-width von außen gesetzt).
    refresh: render,
    // Wechselt die Wiedergabemöglichkeit zur Laufzeit (siehe mode-Option)
    // und rendert neu, da sich dadurch die Slide-Breiten ändern können.
    setMode(newMode) {
      el.setAttribute('data-slider-mode', newMode);
      render();
    },
    // Setzt --slider-visible-slides zur Laufzeit (z.B. von der aufrufenden
    // Seite anhand der aktuellen Bildschirmbreite bestimmt) und rendert neu.
    setVisibleSlides(n) {
      el.style.setProperty('--slider-visible-slides', n);
      render();
    },
    // Fügt eine Slide in slides ein (Quelle der Wahrheit für offsetTo()/render())
    // und baut Dots + Position neu auf — kein destroy()/createSlider()-Zyklus
    // nötig, um eine nachträgliche Slide aufzunehmen.
    addSlide(content, { index = slides.length } = {}) {
      const slideEl = toElement(content);
      if (!slideEl) return null;
      if (!slideEl.hasAttribute('data-slider-slide')) slideEl.setAttribute('data-slider-slide', '');
      slideEl.classList.add('tw-slider__slide');
      track.insertBefore(slideEl, slides[index] || null);
      slides.splice(index, 0, slideEl);
      if (index <= current) current++;
      syncDots();
      render();
      return slideEl;
    },
    removeSlide(slideEl) {
      const idx = slides.indexOf(slideEl);
      if (idx === -1) return;
      slides.splice(idx, 1);
      slideEl.remove();
      current = Math.max(0, Math.min(current > idx ? current - 1 : current, slides.length - 1));
      syncDots();
      render();
    },
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

export function initSliders(selector = '[data-slider]', options = {}) {
  return [...document.querySelectorAll(selector)]
    .map((el) => createSlider(el, options))
    .filter(Boolean);
}
