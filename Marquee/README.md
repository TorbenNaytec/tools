# Marquee

Wiederverwendbares Endlos-Laufband. Reines JavaScript (ES-Modul, keine
Abhängigkeiten) + reines CSS — kein Build-Schritt nötig, einfach beide
Dateien in ein Projekt kopieren.

Anders als eine reine CSS-Lösung übernimmt `marquee.js` das Vervielfachen
des Inhalts (Original nur 1× im Markup nötig) und berechnet die
Animationsdauer aus der tatsächlichen Inhaltsbreite — die Geschwindigkeit
bleibt dadurch konstant, egal wie viele Items im Markup stehen oder wie
breit der Container ist.

## Einbauen

1. `marquee.js` und `marquee.css` ins Projekt kopieren.
2. CSS einbinden, JS als Modul importieren.
3. Markup nach folgendem Vertrag aufbauen — Items **nur einmal**:

```html
<link rel="stylesheet" href="marquee.css">

<div class="tw-marquee" data-marquee>
  <div class="tw-marquee__track" data-marquee-track>
    <span class="tw-marquee__item" data-marquee-item>Item 1</span>
    <span class="tw-marquee__item" data-marquee-item>Item 2</span>
    <span class="tw-marquee__item" data-marquee-item>Item 3</span>
  </div>
</div>

<script type="module">
  import { createMarquee } from './marquee.js';
  createMarquee('[data-marquee]');
</script>
```

## Optionen

```js
createMarquee('[data-marquee]', {
  speed: 60,          // px pro Sekunde
  gap: null,          // überschreibt --marquee-gap
  pauseOnHover: true,
  reverse: false,
  items: null,         // optional: Array von HTML-Strings/Elementen statt vorgefertigtem Markup im Track
});
```

`items` (Option) ersetzt vorhandenes Markup im Track (nicht additiv) — pro
Instanz entweder Markup im HTML vorgeben ODER das Array übergeben, nicht
beides.

`createMarquee()` gibt `null` zurück, falls Track/Items fehlen, sonst:

```js
{
  items, rebuild(), destroy(),
  setSpeed(px), // Geschwindigkeit (px/s) live ändern, baut die Klone neu auf
  addItem(content), // content: HTML-String oder Element; hängt ans Ende an
  removeItem(itemEl),
}
```

`items` ist ein Snapshot der aktuellen Original-Elemente (ohne die
automatisch erzeugten Klone) — praktisch, um z.B. Klick-Handler nur einmal
pro Motiv zu binden. `addItem`/`removeItem` mutieren die interne Quelle der
Wahrheit direkt und bauen den Klon-Zyklus neu auf (kein `destroy()`+
`createMarquee()` nötig, um nachträglich ein Item aufzunehmen).

`initMarquees(selector?, options?)` initialisiert alle passenden Marquees im
Dokument auf einmal.

Respektiert automatisch `prefers-reduced-motion` (Animation wird deaktiviert,
Klone werden nicht erzeugt).

## Demo

`demo.html` öffnen (oder über die Übersicht in `../index.html` laden) — mit
Testreglern für Geschwindigkeit, Richtung und Pause-bei-Hover.

## Design-Anpassung

| Variable | Zweck |
|---|---|
| `--marquee-gap` | Abstand zwischen Items — standardmäßig responsiv (`clamp(16px, 4vw, 32px)`) |
| `--marquee-fade` | Breite der Ausblend-Zone an den Rändern (Soft-Edge per Mask) |
| `--marquee-visible-items` | Anzahl gleichzeitig sichtbarer Items (Standard responsiv: `1` unter 600px, `3` ab 600px, `4` ab 1200px) — setzt die Item-Breite über `[data-marquee-item]`, eigene feste Item-Breiten im Markup überschreiben das wieder |
| `--marquee-duration` | Wird von `marquee.js` automatisch gesetzt — nicht manuell überschreiben |

`marquee.js` injiziert das CSS oben beim ersten Aufruf automatisch als
`<style>` ins Dokument — `marquee.css` einbinden ist optional, aber
empfohlen, falls eigenes CSS darauf aufbauen soll.
