# Slider

Wiederverwendbarer "Peek"-Slider/Carousel. Reines JavaScript (ES-Modul, keine
Abhängigkeiten) + reines CSS — kein Build-Schritt nötig, einfach `slider.js`
und `slider.css` in ein Projekt kopieren.

Verhalten (`slider.js`) und Aussehen (`slider.css`) sind strikt getrennt:
Das Script kennt keine Projekt-Klassennamen, sondern steuert nur über
`data-*`-Attribute. Folgender Teil von `slider.css` ist der funktionale
Kern, der zwingend nötig ist, damit der Slider funktioniert — daran sollte
beim Anpassen nichts geändert werden:

- `.tw-slider`: `position: relative` + `overflow: hidden`, damit nur der
  aktive Ausschnitt des Tracks sichtbar ist.
- `.tw-slider__track`: `display: flex` + `gap` + `transition` auf
  `transform`, das eigentliche Slide-Mechanismus (JS setzt `transform`,
  CSS animiert es).
- `.tw-slider__slide`: `width` + `flex-shrink: 0`, damit jeder Slide exakt
  eine Kachel im Track belegt. Die Breite hängt vom `data-slider-mode`-
  Attribut ab, das `slider.js` setzt (siehe `mode`-Option unten) — `slider.js`
  selbst kennt keine Breiten, sondern misst sie nur live per
  `getBoundingClientRect()` nach, um die Track-Position zu berechnen (auch
  bei ungleich breiten Slides in Modus `featured` korrekt).
- `.tw-slider__nav` / `.tw-slider__dots`: `display: flex` +
  `align-items`/`justify-content`, um Pfeile und Dots zu zentrieren.
- `.tw-slider__arrow`: feste `width`/`height` + `display: grid` +
  `place-items: center` (Icon zentrieren) + `cursor: pointer`.
- `.tw-slider__dot`: feste `width`/`height` + `cursor: pointer`.

`slider.css` liefert das neutrale Skeleton zum Anpassen über
CSS-Variablen (Farben, Formen, Übergangs-Effekte) — der funktionale Teil
ist direkt mit ausgeliefert (kein `@import`, keine zusätzliche
HTTP-Anfrage). Beim Ersetzen von `slider.css` durch eigenes CSS muss
dieser funktionale Teil erhalten bleiben.

## Einbauen

1. `slider.js` und `slider.css` ins Projekt kopieren.
2. `slider.css` einbinden, JS als Modul importieren.
3. Markup nach folgendem Vertrag aufbauen:

```html
<link rel="stylesheet" href="slider.css">

<div class="tw-slider" data-slider>
  <div class="tw-slider__track" data-slider-track>
    <div class="tw-slider__slide" data-slider-slide>Slide 1</div>
    <div class="tw-slider__slide" data-slider-slide>Slide 2</div>
    <div class="tw-slider__slide" data-slider-slide>Slide 3</div>
  </div>

  <div class="tw-slider__nav">
    <button class="tw-slider__arrow" data-slider-prev aria-label="Zurück">‹</button>
    <div class="tw-slider__dots" data-slider-dots></div> <!-- leer lassen, Dots werden generiert -->
    <button class="tw-slider__arrow" data-slider-next aria-label="Weiter">›</button>
  </div>
</div>

<script type="module">
  import { createSlider } from './slider.js';
  createSlider('[data-slider]');
</script>
```

## Optionen

```js
createSlider('[data-slider]', {
  loop: true,           // Standard: true — springt am Ende zum Anfang zurück
  autoplay: false,      // z.B. 4000 für automatischen Wechsel alle 4s
  autoHeight: false,    // Container-Höhe an aktiven Slide anpassen
  heightSelector: null, // z.B. '.container' — misst ein Kind statt des Slides selbst
  startIndex: 0,
  swipe: true,          // Touch-Wischen
  keyboard: true,       // Pfeiltasten, wenn der Slider den Fokus enthält
  mode: 'single',        // 'single' (Standard, 1 Bild/Slide) | 'multi' (mehrere gleich breite Slides) | 'featured' (1 großer + kleine Peek-Slides)
  visibleSlides: null,   // überschreibt --slider-visible-slides (Modus 'multi'/'featured'); null = responsiver CSS-Standard (1/3/4 nach Bildschirmbreite)
  slides: null,          // optional: Array von HTML-Strings/Elementen statt vorgefertigtem Markup im Track
  onChange: (index) => {},
});
```

`slides` ersetzt vorhandenes Markup im Track (nicht additiv) — pro Instanz
entweder Markup im HTML vorgeben ODER das Array übergeben, nicht beides.

`createSlider()` gibt `null` zurück, falls Track/Slides fehlen, sonst:

```js
{
  slides, goTo(i), next(), prev(), current, destroy(),
  refresh(),           // erzwingt Neu-Layout (Position/Höhe) ohne current zu ändern
  setMode(mode),        // wechselt 'single'/'multi'/'featured' zur Laufzeit
  setVisibleSlides(n),   // setzt --slider-visible-slides zur Laufzeit, z.B. anhand der aktuellen Bildschirmbreite von außen bestimmt
  addSlide(content, { index } = {}), // content: HTML-String oder Element; index Standard: ans Ende
  removeSlide(slideEl),
}
```

`addSlide`/`removeSlide` mutieren `slides` (die Quelle der Wahrheit für
Position/Höhe) direkt und rendern neu — kein `destroy()`+`createSlider()`
nötig, um nachträglich eine Slide aufzunehmen. `slides` ist die live
Array-Referenz, kein Snapshot.

`initSliders(selector?, options?)` initialisiert alle passenden Slider im
Dokument auf einmal.

## Beliebiges/komplexes Slide-Markup

Ein Slide kann jedes beliebige HTML enthalten (mehrspaltige Grids, Bilder,
Texte, ...) — `slider.js` setzt die nötige Klasse `tw-slider__slide` und das
`data-slider-slide`-Attribut automatisch auf das jeweilige Wurzelelement,
egal ob das Markup schon im HTML steht, per `slides`-Option oder per
`addSlide()` reinkommt. Eigenes CSS im Slide-Inhalt muss daher nicht die
Tool-Klassen kennen.

`.tw-slider__slide` ist außerdem ein Container-Query-Context
(`container-type: inline-size`). Wenn eigener Slide-Inhalt intern responsiv
sein soll (z.B. ein Grid, das bei wenig Platz umbricht), sollte er dafür
`@container`-Regeln statt `@media` verwenden — in Modus `multi`/`featured`
ist die tatsächliche Slide-Breite oft nur ein Bruchteil der Viewport-Breite,
auf die `@media` reagieren würde.

## Demo

`demo.html` öffnen (oder über die Übersicht in `../index.html` laden) — mit
Testreglern für Loop/Autoplay/AutoHeight.

## Design-Anpassung

Alle visuellen Werte laufen über CSS-Variablen auf `.tw-slider`:

| Variable | Zweck |
|---|---|
| `--slider-gap` | Abstand zwischen Slides |
| `--slider-arrow-size` | Größe der Pfeil-Buttons |
| `--slider-arrow-bg` / `--slider-arrow-color` / `--slider-arrow-border` | Pfeil-Farben |
| `--slider-dot-size` / `--slider-dot-active-width` | Dot-Größen |
| `--slider-dot-color` / `--slider-dot-active-color` | Dot-Farben |
| `--slider-transition` | Übergangs-Timing des Tracks |
| `--slider-visible-slides` | Nur in Modus `multi`/`featured`: Anzahl gleichzeitig sichtbarer Slides (Standard responsiv: `1` unter 600px, `3` ab 600px, `4` ab 1200px) |
| `--slider-featured-width` | Nur in Modus `featured`: Breite des großen aktiven Slides (Standard `50%`) |

## Wiedergabemöglichkeiten (`mode`)

- **`single`** (Standard): klassisches Verhalten, 1 Bild pro Slide, volle
  Breite — unverändert, wenn `mode` nicht gesetzt wird.
- **`multi`**: mehrere gleich breite Slides gleichzeitig sichtbar, Anzahl
  über `--slider-visible-slides` (responsiv oder per `visibleSlides`-Option/
  `setVisibleSlides()` von der aufrufenden Seite bestimmt, z.B. anhand der
  Bildschirmbreite).
- **`featured`**: der aktive Slide ist groß (`--slider-featured-width`,
  Standard `50%`), die übrigen sichtbaren Slides peeken klein daneben.

Die Navigationslogik (`goTo`/`next`/`prev`) misst Slide-Breiten in jedem
Modus live nach und funktioniert daher auch bei ungleich breiten Slides ohne
Anpassung.
