# Slider

Wiederverwendbarer "Peek"-Slider/Carousel. Reines JavaScript (ES-Modul, keine
Abhängigkeiten) + reines CSS — kein Build-Schritt nötig, einfach `slider.js`
und `slider.css` in ein Projekt kopieren.

Verhalten (`slider.js`), Layout/Mechanik (`funktion.css`) und Aussehen
(`slider.css`) sind strikt getrennt: Das Script kennt keine
Projekt-Klassennamen, sondern steuert nur über `data-*`-Attribute.
`funktion.css` enthält nur das CSS, das der Slider zwingend braucht, um zu
funktionieren — daran sollte nichts geändert werden:

- `.tw-slider`: `position: relative` + `overflow: hidden`, damit nur der
  aktive Ausschnitt des Tracks sichtbar ist.
- `.tw-slider__track`: `display: flex` + `gap` + `transition` auf
  `transform`, das eigentliche Slide-Mechanismus (JS setzt `transform`,
  CSS animiert es).
- `.tw-slider__slide`: `width: 100%` + `flex-shrink: 0`, damit jeder Slide
  exakt eine Kachel im Track belegt.
- `.tw-slider__nav` / `.tw-slider__dots`: `display: flex` +
  `align-items`/`justify-content`, um Pfeile und Dots zu zentrieren.
- `.tw-slider__arrow`: feste `width`/`height` + `display: grid` +
  `place-items: center` (Icon zentrieren) + `cursor: pointer`.
- `.tw-slider__dot`: feste `width`/`height` + `cursor: pointer`.

`slider.css` liefert das neutrale Skeleton zum Anpassen über
CSS-Variablen (Farben, Formen, Übergangs-Effekte) — der funktionale Teil
ist direkt mit ausgeliefert (kein `@import`, keine zusätzliche
HTTP-Anfrage). `funktion.css` liegt zusätzlich als eigene Datei bei und
dient als Referenz/Dokumentation, welcher Teil des CSS zwingend nötig ist
und beim Ersetzen von `slider.css` durch eigenes CSS erhalten bleiben
muss — eingebunden wird nur `slider.css`.

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
  onChange: (index) => {},
});
```

`createSlider()` gibt `null` zurück, falls Track/Slides fehlen, sonst:

```js
{ slides, goTo(i), next(), prev(), current, destroy() }
```

`initSliders(selector?, options?)` initialisiert alle passenden Slider im
Dokument auf einmal.

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
