# Arbeitsbericht — BlueprintBox & Blueprint-Seite

Datum: 2026-07-29

## Ausgangslage

Der Onepager (`onepager.html`) hatte bereits eine einfache Zu-/Abschalt-UI
für Slider, Marquee und LightboxPopup, inklusive automatischer Kopplung von
LightboxPopup an aktive Slider-/Marquee-Sections. Aufgabe war, diese Steuerung
in ein eigenes, wiederverwendbares Modul auszulagern.

## Ergebnis

### Neues Tool: `BlueprintBox/`

Eigener Tool-Ordner nach Repo-Konvention (`blueprintbox.js`, `.css`,
`README.md`, `demo.html`). Kernfunktion `createBlueprintBox(mountEl, tools)`:

- Rendert selbst eine Picker-UI (Karten-Grid → Auswahlfeld → Fertig-Hinweis →
  Stage) in den übergebenen Container.
- Reicht jedem Tool eine API durch: `isActive`, `getActive`, `getVar`/`setVar`
  (freier Variablenspeicher zur Kopplung), `onChange`, `addSection`, `stage`.
- Implementiert selbst **keine** Kopplungslogik zwischen Tools — die API ist
  nur Info-/Steuerkanal, die eigentliche Kopplung bauen die Tools selbst.
- **Baumstruktur:** `api.createChildBox(mountEl, childTools)` ruft
  `createBlueprintBox` rekursiv auf (Wurzel-Label „Stamm", eigenes
  Baum-Diagramm `[data-blueprint-tree]`, live aktualisiert). Wird von
  `demo.html` demonstriert; in der Blueprint-Seite selbst inzwischen nicht
  mehr für die Slider-/Marquee-Kopplung genutzt (siehe unten).
- `destroyAll()` zum sauberen Aufräumen aller aktiven Tools einer Box.

### `onepager.html` → `blueprint.html` umbenannt

Datei sowie alle Verweise (`index.html`, Root-`README.md`, Titel/Überschrift
in der Datei selbst) umbenannt, da die Seite jetzt im Kern die
BlueprintBox-Architektur zeigt.

### Slider-/Marquee-Kopplung: mehrfach iteriert, finaler Stand

Root-Tools: Slider, Marquee (eigenständig), LightboxPopup (koppelt sich
automatisch an aktive Slider-/Marquee-Sections, wie zuvor).

Für Slider+Marquee wurde zunächst eine verschachtelte Kind-Box
(`api.createChildBox`) mit eigenem Sub-Tool gebaut — auf Nachfrage
("warum nicht einfach im JS ein Kindelement erzeugen, wenn ein Tool
dazugeschaltet wird?") wieder entfernt. Finaler Stand: direkte, reaktive
Kopplung in JS, ohne eigenes Sub-Tool/Kind-Box:

- Sind Slider und Marquee gleichzeitig aktiv, bekommt der Slider eine
  **zusätzliche, echte `tw-slider__slide`** mit einer eigenen
  Marquee-Instanz (gleiche Bilder/Chips wie die eigenständige Marquee-
  Section) — kein Platzhalter/Indikator, sondern der reale Marquee-Track.
- **Aktivierungsreihenfolge Marquee → Slider:** Die Zusatz-Slide wird direkt
  beim Aufbau ins Markup gehängt, `createSlider()` läuft einmalig mit
  bereits korrekter Slide-/Dot-Anzahl (Entscheidung fällt synchron über
  `rootApi.isActive('marquee')`, bevor `createSlider()` aufgerufen wird).
- **Reihenfolge Slider → Marquee (nachträgliches Zuschalten):** Da
  `slider.js` seine Slide-/Dot-Listen einmalig bei `createSlider()` anlegt
  und keine Methode zum nachträglichen Anmelden einer Slide bietet, bleibt
  hier ein einmaliger Rebuild (`destroy()` + `createSlider()` neu, mit
  erhaltenem Slide-Index) nötig.
- Rückbau symmetrisch: Marquee aus → Zusatz-Slide entfernt, Slider auf 4
  Slides zurückgebaut (außer der ganze Slider wird gleichzeitig
  deaktiviert — dann nur Instanz-Cleanup, kein sinnloser Rebuild kurz vor
  dem Entfernen).
- Beide Tools rufen sich nur über `rootApi.isActive(...)` gegenseitig ab —
  keine feste Aktivierungsreihenfolge nötig, analog zur bestehenden
  Lightbox-Kopplung.

### Gefundene und behobene Bugs

1. **Endlosschleife in Marquee:** Ein Zwischenstand versuchte, einen
   Thumbnail-Streifen per `display:none` unsichtbar zu machen — `scrollWidth`
   des Tracks blieb dadurch dauerhaft bei 0, während `marquee.js` versucht,
   Klone anzuhängen, bis eine Mindestbreite erreicht ist: Endlosschleife, Tab
   friert ein. Fix (in diesem Zwischenstand): `height:0; overflow:hidden`
   statt `display:none`. Im finalen Stand entfällt das Problem ohnehin, da
   der echte, sichtbare Marquee-Track verwendet wird.
2. **Klick-Interception auf Slider-Pfeile:** Ein Zwischenstand mit
   verschachtelter Kind-Box (eigenem Grid/Select/Stage) sprengte im normalen
   Fluss die Höhe des Slides und überlappte dadurch die Pfeil-Buttons
   darunter. Im finalen Stand hinfällig, da keine Kind-Box mehr existiert.

## Geänderte/neue Dateien

- `BlueprintBox/blueprintbox.js`, `blueprintbox.css`, `README.md`, `demo.html` (neu)
- `blueprint.html` (vormals `onepager.html`, Kernlogik ersetzt)
- `index.html`, `README.md` (BlueprintBox-Eintrag ergänzt, Verweise umbenannt)

## Getestet

Ausschließlich per Playwright-Skript gegen `npx serve` (nicht die
Chrome-Extension), beide Aktivierungsreihenfolgen, Rebuild-Fälle,
Deaktivierung — keine Konsolenfehler. Kein manueller Sichttest im echten
Browser.
