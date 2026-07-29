# Tools

Sammlung wiederverwendbarer, projektunabhängiger UI-Bausteine. Jedes Tool
lebt in seinem eigenen Ordner und ist eigenständig (keine gemeinsamen
Abhängigkeiten, kein Build-Schritt) — ein Ordner kopieren reicht, um das
Tool in einem anderen Projekt einzusetzen.

## Struktur pro Tool-Ordner

```
<ToolName>/
  <toolname>.js     — Verhalten, ES-Modul, keine Abhängigkeiten
  <toolname>.css    — Aussehen, neutrales Skeleton über CSS-Variablen
  README.md         — Einbau-Anleitung, Optionen, Design-Variablen
  demo.html         — lauffähige Testseite mit Beispielinhalt
```

Verhalten und Aussehen sind bewusst getrennt: die `.js`-Dateien steuern
ausschließlich über `data-*`-Attribute und kennen keine Projekt-spezifischen
Klassennamen. Die `.css`-Dateien sind ein Startpunkt, der über CSS-Variablen
oder komplett eigenes CSS ersetzt werden kann.

## Enthaltene Tools

- **[Slider](Slider/README.md)** — "Peek"-Slider/Carousel mit Dots, Pfeilen, Touch-Swipe, Tastatur, Auto-Höhe.
- **[Marquee](Marquee/README.md)** — Endlos-Laufband mit automatischer Inhalts-Vervielfachung und konstanter Geschwindigkeit.
- **[LightboxPopup](LightboxPopup/README.md)** — Bild-Lightbox-Popup: Klick auf ein Item öffnet eine Großansicht mit optionaler Bildunterschrift.
- **[BlueprintBox](BlueprintBox/README.md)** — Generische Zu-/Abschalt-Steuerung für Tools: Variablenspeicher zur Kopplung, rekursive Baumstruktur für Sub-Tools.

## Testcenter (`index.html`)

`index.html` öffnen: listet alle Tools links auf, lädt die jeweilige
`demo.html` rechts in einem iframe zum direkten Ausprobieren. Links pro
Eintrag führen zusätzlich direkt zur Demo (eigener Tab) und zum README.

## Blueprint (`blueprint.html`)

`blueprint.html` öffnen: leere Fläche zum Start, Tools werden über
**BlueprintBox** zu-/abgeschaltet (`../BlueprintBox/blueprintbox.js`).
LightboxPopup koppelt sich automatisch an aktive Slider-/Marquee-Sections
(Variablenspeicher der Blueprint Box). Slider spannt für Marquee zusätzlich
eine eigene Kind-Box auf (`api.createChildBox()`) — Marquee läuft dort als
Thumbnail-Symbolleiste direkt im Slider, als Beispiel für die rekursive
Baumstruktur der Blueprint Box.

## Neues Tool ergänzen

1. Neuen Ordner nach obigem Schema anlegen.
2. In `index.html` die `TOOLS`-Liste um `{ name, description }` erweitern
   (Name muss dem Ordnernamen entsprechen, `demo.html` und `README.md`
   werden darüber automatisch verlinkt).
3. In dieser Datei unter "Enthaltene Tools" ergänzen.
