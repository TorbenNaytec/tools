# Slider

Wiederverwendbarer "Peek"-Slider/Carousel. Reines JavaScript (ES-Modul, keine
Abhängigkeiten) + reines CSS — kein Build-Schritt nötig, einfach beide
Dateien in ein Projekt kopieren.

Verhalten (`slider.js`) und Aussehen (`slider.css`) sind strikt getrennt:
Das Script kennt keine Projekt-Klassennamen, sondern steuert nur über
`data-*`-Attribute. Das CSS liefert ein neutrales Skeleton zum Anpassen
über CSS-Variablen — kann auch komplett durch eigenes CSS ersetzt werden,
solange die `data-*`-Struktur erhalten bleibt.

## Einbauen

1. `slider.js` und `slider.css` ins Projekt kopieren.
2. CSS einbinden, JS als Modul importieren.
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
