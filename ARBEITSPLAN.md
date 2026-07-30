# Arbeitsplan

Stand: 2026-07-30. Bezieht sich auf die laufende Erweiterung von Slider/Marquee/BlueprintBox in diesem Repo.

## Erkenntnis aus `Downloads/live-theme` (therapieWERK-Theme)

Das Referenz-Layout "Praxisräume" (`section/rooms.php`, `.rooms__gallery` in `style.css`) ist
**kein Slider/Carousel**, sondern ein statisches CSS-Grid mit fixen Zeilenhöhen:

```css
.rooms__gallery{display:grid;grid-template-columns:1.3fr .8fr .9fr;grid-template-rows:280px 180px;gap:16px}
.rooms__gallery>*:nth-child(1){grid-row:1/3}   /* großes Bild, spannt beide Zeilen */
.rooms__gallery>*:nth-child(4){grid-column:2/4} /* .rooms__marquee, spannt 2 Spalten */
@media(max-width:900px){
  .rooms__gallery{grid-template-columns:1fr 1fr;grid-template-rows:220px 180px}
  .rooms__gallery>*:nth-child(1){grid-row:auto;grid-column:1/3}
  .rooms__gallery>*:nth-child(4){grid-column:1/3}
}
```

Die "4. Kachel" ist kein Bild, sondern das eingebettete **Marquee-Tool**
(`.rooms__marquee` mit 8 Bildern × 3 Wiederholungen, `height:100%`,
`aspect-ratio:4/3` pro Item). Die bisherige Slider-"featured"-Mode-Arbeit
(Flex-Carousel mit großem + kleinen Peek-Slides) zielte auf die falsche Form
— bleibt als generischer Peek-Baustein sinnvoll, ersetzt aber nicht dieses
Grid-Pattern.

## Offene Aufgaben

| # | Aufgabe | Zeit |
|---|---|---|
| 1 | Slider-Bugfix: Track-Höhe bei Modus-/Variablenwechsel falsch gemessen (width-Transition läuft noch beim Messen) — `transitionend`-Listener nachrüsten | 15 min |
| 2 | Rooms-Grid (analog `.rooms__gallery`: 3 Spalten/2 Zeilen, Kachel 1 spannt beide Zeilen, Kachel 4 = Marquee-Instanz, Breakpoint bei 900px) als **Slide-Inhalt im Slider** bauen — kein eigener Modus/Tool, sondern komplexes HTML in einer `.tw-slider__slide` (siehe "komplexes HTML pro Slide", bereits vorbereitet). Offen: Zielort noch zu klären (Tools-Demo in `blueprint.html` vs. echter Code für `Downloads/live-theme`) | 45–60 min |
| 3 | Einbindung ins BlueprintBox-Testcenter (`blueprint.html`) als eigene Registry-Option, Kachel 4 = echte `createMarquee()`-Instanz | 20 min |
| 4 | README/Doku für das neue Pattern (Einbau, Variablen, Breakpoint) | 10 min |
| 5 | Visueller Abgleich per Screenshot gegen die Referenz-Screenshots | 10 min |

**Gesamt: ca. 2–2,5 Stunden**

## Bereits erledigt (diese Sitzung)

- Bug behoben: Marquee/Slider als eingehängtes Slide/Item ohne `tw-slider__slide`-Klasse unsichtbar
- Slider: responsive Variable `--slider-visible-slides` (1/3/4 nach Breite)
- Marquee: responsive Variable `--marquee-visible-items` (1/3/4 nach Breite), `setSpeed()`
- Slider: `mode`-System (`single`/`multi`/`featured`) inkl. `setMode()`, `setVisibleSlides()`, `refresh()`, Container-Query-Context für eigenen Slide-Inhalt
- Slider: beliebiges/komplexes Slide-HTML wird automatisch korrekt dimensioniert (Klasse wird erzwungen, nicht nur Attribut)
- `blueprint.html`: Control-Bar pro aktiviertem Tool mit "Übernehmen"-Button statt Live-Update
- `blueprint.html`: LightboxPopup als einziger globaler Schalter statt Baum-Knoten pro Ebene

## Bekannte offene Bugs

- Slider-Track-Höhe nach `setMode()`/`setVisibleSlides()` kurzzeitig falsch, solange die CSS-`width`-Transition noch läuft (siehe Aufgabe 1)
