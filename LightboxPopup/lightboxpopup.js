const SEL = {
  item: '[data-lightbox-item]',
};

const STYLE_ID = 'tw-lightbox-styles';
const OVERLAY_ID = 'tw-lightbox-overlay';

const CSS = `
.tw-lightbox {
  --lightbox-bg: rgba(0, 0, 0, .85);
  --lightbox-radius: 8px;
  --lightbox-max-height: 80vh;
  --lightbox-close-size: 40px;
  --lightbox-close-bg: rgba(255, 255, 255, .15);
  --lightbox-close-color: #fff;
  --lightbox-caption-color: #fff;
  --lightbox-z: 100;

  position: fixed;
  inset: 0;
  z-index: var(--lightbox-z);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
  background: var(--lightbox-bg);
}

.tw-lightbox[hidden] { display: none; }

.tw-lightbox__img {
  max-width: 100%;
  max-height: var(--lightbox-max-height);
  border-radius: var(--lightbox-radius);
  object-fit: contain;
}

.tw-lightbox__caption {
  margin: 0;
  color: var(--lightbox-caption-color);
  font-size: 15px;
  text-align: center;
}

.tw-lightbox__caption[hidden] { display: none; }

.tw-lightbox__close {
  position: absolute;
  top: 20px;
  right: 24px;
  width: var(--lightbox-close-size);
  height: var(--lightbox-close-size);
  border: none;
  border-radius: 50%;
  background: var(--lightbox-close-bg);
  color: var(--lightbox-close-color);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

[data-lightbox-item] { cursor: zoom-in; }
`;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

function getOverlay() {
  let overlay = document.getElementById(OVERLAY_ID);
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.className = 'tw-lightbox';
  overlay.hidden = true;
  overlay.innerHTML = `
    <button type="button" class="tw-lightbox__close" data-lightbox-close aria-label="Schließen">×</button>
    <img class="tw-lightbox__img" data-lightbox-img alt="">
    <p class="tw-lightbox__caption" data-lightbox-caption-el hidden></p>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

export function createLightbox(root, options = {}) {
  injectStyles();

  const el = typeof root === 'string' ? document.querySelector(root) : root;
  if (!el) return null;

  const items = [...el.querySelectorAll(SEL.item)];
  if (!items.length) return null;

  const {
    closeOnBackdrop = true,
    closeOnEscape = true,
    onOpen = null,
    onClose = null,
  } = options;

  const overlay    = getOverlay();
  const imgEl      = overlay.querySelector('[data-lightbox-img]');
  const captionEl  = overlay.querySelector('[data-lightbox-caption-el]');
  const closeBtn   = overlay.querySelector('[data-lightbox-close]');

  const close = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    imgEl.src = '';
    onClose?.();
  };

  const open = (item) => {
    const thumb = item.querySelector('img');
    imgEl.src = item.getAttribute('data-lightbox-src') || thumb?.src || '';
    imgEl.alt = thumb?.alt || '';

    const caption = item.getAttribute('data-lightbox-caption');
    captionEl.textContent = caption || '';
    captionEl.hidden = !caption;

    overlay.hidden = false;
    onOpen?.(item);
  };

  const onItemClick = (e) => {
    const item = e.target.closest(SEL.item);
    if (item && el.contains(item)) open(item);
  };
  el.addEventListener('click', onItemClick);

  if (!overlay.dataset.wired) {
    overlay.dataset.wired = '1';

    closeBtn.addEventListener('click', close);

    if (closeOnBackdrop) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
    }

    if (closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });
    }
  }

  return {
    items,
    open: (index) => items[index] && open(items[index]),
    close,
    destroy() {
      el.removeEventListener('click', onItemClick);
      close();
    },
  };
}

export function initLightboxes(selector = '[data-lightbox]', options = {}) {
  return [...document.querySelectorAll(selector)]
    .map((el) => createLightbox(el, options))
    .filter(Boolean);
}
