# BlueprintBox

Generische Zu-/Abschalt-Steuerung für ein Set von "Tools" — reines
JavaScript (ES-Modul, keine Abhängigkeiten) + reines CSS, kein Build-Schritt
nötig.

Ein Tool ist ein beliebiges Objekt `{ name, desc, activate(api), deactivate(api) }`.
`createBlueprintBox` rendert selbst eine Picker-UI (Karten-Grid zum Start,
danach Auswahlfeld für weitere Tools, Fertig-Hinweis, sowie eine Stage für
den von den Tools gerenderten Inhalt) in den übergebenen Container.

Die Blueprint Box implementiert selbst **keine Kopplungslogik zwischen
Tools** — sie liefert dafür nur:

- `isActive(key)` / `getActive()` — welche Tools laufen gerade
- `getVar(name)` / `setVar(name, value)` — freier Variablenspeicher, über den
  Tools sich gegenseitig Zusatzinfos zuspielen können, ohne sich direkt zu
  kennen
- `onChange(fn)` — Callback bei jeder Aktivierung/Deaktivierung/Variablen-
  Änderung, gibt eine Unsubscribe-Funktion zurück

Die eigentliche Kopplung (z.B. "Tool B liest die Variable, die Tool A
schreibt") implementieren die Tool-Definitionen selbst.

## Baumstruktur

`api.createChildBox(mountEl, childTools)` ruft `createBlueprintBox` rekursiv
auf — ein Tool kann so in seiner eigenen Section eine eigene Blueprint Box
für seine Sub-Tools aufspannen. Dieselbe Funktion steuert also jede Ebene im
Baum; `api.destroyAll()` deaktiviert beim Aufräumen alle aktiven Sub-Tools
einer Kind-Box auf einmal.

## Einbauen

1. `blueprintbox.js` und `blueprintbox.css` ins Projekt kopieren.
2. CSS einbinden, JS als Modul importieren.
3. Tools-Objekt definieren und die Box in einen leeren Container rendern:

```html
<link rel="stylesheet" href="blueprintbox.css">
<div id="blueprint-root"></div>

<script type="module">
  import { createBlueprintBox } from './blueprintbox.js';

  const TOOLS = {
    beispiel: {
      name: 'Beispiel',
      desc: 'Kurze Beschreibung für Karte/Auswahlfeld.',
      activate(api) {
        api.addSection(`
          <div data-tool-id="beispiel">
            Inhalt … <button type="button" data-close>×</button>
          </div>
        `);
      },
      deactivate() {
        document.querySelector('[data-tool-id="beispiel"]')?.remove();
      },
    },
  };

  createBlueprintBox('#blueprint-root', TOOLS);
</script>
```

## Markup-Vertrag für Tool-Inhalt

Tools rendern ihren eigenen Inhalt über `api.addSection(html)` in die Stage.
Das Wurzel-Element der Section muss `data-tool-id="<key>"` tragen (gleicher
Key wie im Tools-Objekt); ein optionales Element darin mit `[data-close]`
deaktiviert das Tool per Klick (Klick-Delegation läuft auf der Stage).

## API

```js
const api = createBlueprintBox('#blueprint-root', TOOLS);
// oder direkt ein DOM-Element statt Selector übergeben
```

`createBlueprintBox()` gibt `null` zurück, falls Container oder Tools-Objekt
fehlen, sonst die API, die auch an jedes Tool durchgereicht wird:

```js
{
  isActive(key), getActive(),
  getVar(name), setVar(name, value),
  onChange(fn),      // -> Unsubscribe-Funktion
  addSection(html),  // Tool-Markup in die Stage rendern
  stage,              // Stage-Element, falls direkter Zugriff nötig
  createChildBox(mountEl, childTools), // rekursiv: nächste Ebene im Baum
  destroyAll(),       // alle aktiven Tools dieser Box deaktivieren
}
```

## Demo

`demo.html` öffnen (oder über die Übersicht in `../index.html` laden) —
zeigt Variablen-Kopplung zwischen zwei Tools sowie eine verschachtelte
Kind-Box als drittes Beispiel.

## Design-Anpassung

Struktur kommt vollständig aus `data-blueprint-*`-Attributen, Aussehen über
CSS-Variablen bzw. eigenes CSS ersetzbar:

| Variable | Zweck |
|---|---|
| `--blueprint-gap` | Abstand zwischen Karten/Blöcken |
| `--blueprint-radius` | Eckenradius der Karten |
| `--blueprint-accent` | Farbe des Aktivieren-Buttons |
| `--blueprint-border` | Rahmenfarbe von Karten/Fertig-Hinweis |
| `--blueprint-muted` | Farbe für Beschreibungstexte |
| `--blueprint-select-bg` / `--blueprint-select-border` | Hintergrund/Rahmen des Auswahlfelds |
