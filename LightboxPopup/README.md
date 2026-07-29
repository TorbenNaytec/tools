# LightboxPopup

Wiederverwendbares Bild-Lightbox-Popup. Reines JavaScript (ES-Modul, keine
Abhängigkeiten) + reines CSS — kein Build-Schritt nötig, einfach beide
Dateien in ein Projekt kopieren.

Klick auf ein Item öffnet ein Overlay mit Großansicht des Bildes. Das
Overlay ist ein Singleton pro Dokument — beliebig viele Lightbox-Container
auf einer Seite teilen sich dasselbe Popup, da ohnehin nur ein Bild
gleichzeitig angezeigt werden kann.

## Einbauen

1. `lightboxpopup.js` und `lightboxpopup.css` ins Projekt kopieren.
2. CSS einbinden, JS als Modul importieren.
3. Markup nach folgendem Vertrag aufbauen:

```html
<link rel="stylesheet" href="lightboxpopup.css">

<div data-lightbox>
  <div data-lightbox-item data-lightbox-caption="Optionale Bildunterschrift">
    <img src="thumb.jpg" alt="">
  </div>
  <div data-lightbox-item data-lightbox-src="full-res.jpg">
    <img src="thumb2.jpg" alt="">
  </div>
</div>

<script type="module">
  import { createLightbox } from './lightboxpopup.js';
  createLightbox('[data-lightbox]');
</script>
```

- `data-lightbox-src` (optional): überschreibt die im Popup angezeigte
  Bildquelle — nützlich, wenn im Item nur ein Thumbnail steckt und die
  Vollauflösung woanders liegt. Ohne dieses Attribut wird der `src` des
  enthaltenen `<img>` verwendet.
- `data-lightbox-caption` (optional): Bildunterschrift, wird unter dem
  Bild angezeigt. Fehlt das Attribut, bleibt die Caption komplett
  ausgeblendet — kein leerer Platzhalter.

## Optionen

```js
createLightbox('[data-lightbox]', {
  closeOnBackdrop: true,
  closeOnEscape: true,
  onOpen: null,   // (item) => {}
  onClose: null,  // () => {}
});
```

`createLightbox()` gibt `null` zurück, falls keine `[data-lightbox-item]`
im Container gefunden werden, sonst:

```js
{ items, open(index), close(), destroy() }
```

`items` sind die Trigger-Elemente in Dokumentreihenfolge — praktisch, um
z.B. programmatisch ein bestimmtes Bild zu öffnen (`open(2)`).

`initLightboxes(selector?, options?)` initialisiert alle passenden
Container im Dokument auf einmal.

Da das Overlay ein geteiltes Singleton ist, werden Backdrop-Klick,
Escape-Taste und der Schließen-Button nur einmal verdrahtet — von der
zuerst initialisierten Instanz. Bei mehreren Containern auf derselben Seite
gelten `closeOnBackdrop`/`closeOnEscape` der ersten `createLightbox()`-
Aufrufs global fürs Overlay.

## Demo

`demo.html` öffnen (oder über die Übersicht in `../index.html` laden).

## Design-Anpassung

| Variable | Zweck |
|---|---|
| `--lightbox-bg` | Hintergrundfarbe des Overlays |
| `--lightbox-radius` | Eckenradius des Großbilds |
| `--lightbox-max-height` | Maximale Höhe des Großbilds (Standard `80vh`) |
| `--lightbox-close-size` | Durchmesser des Schließen-Buttons |
| `--lightbox-close-bg` / `--lightbox-close-color` | Farben des Schließen-Buttons |
| `--lightbox-caption-color` | Textfarbe der Bildunterschrift |
| `--lightbox-z` | z-index des Overlays |

`lightboxpopup.js` injiziert das CSS oben beim ersten Aufruf automatisch als
`<style>` ins Dokument — `lightboxpopup.css` einbinden ist optional, aber
empfohlen, falls eigenes CSS darauf aufbauen soll.
