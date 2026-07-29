# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Was das hier ist

Eine Sammlung wiederverwendbarer, projektunabhängiger UI-Bausteine (Vanilla-JS
+ CSS, kein Framework, kein Build-Schritt). Jeder Ordner (`Slider/`,
`Marquee/`, ...) ist ein eigenständiges Tool, das komplett unabhängig von den
anderen ist — kein gemeinsamer Code, keine geteilten Abhängigkeiten. Ein
Ordner kopieren reicht, um das Tool in ein anderes Projekt einzusetzen.

## Struktur pro Tool-Ordner

Jedes Tool folgt exakt diesem Schema:

```
<ToolName>/
  <toolname>.js     — Verhalten, ES-Modul, keine Abhängigkeiten
  <toolname>.css    — Aussehen, neutrales Skeleton über CSS-Variablen
  README.md         — Einbau-Anleitung, Optionen, Design-Variablen
  demo.html         — lauffähige Testseite mit Beispielinhalt
```

Zentrales Architekturprinzip: **Verhalten und Aussehen sind strikt getrennt.**
Die `.js`-Dateien steuern ausschließlich über `data-*`-Attribute und kennen
keine projektspezifischen Klassennamen. Die `.css`-Dateien liefern nur ein
neutrales Startpunkt-Skeleton (über CSS-Variablen anpassbar) und können
komplett durch eigenes CSS ersetzt werden, solange die `data-*`-Struktur im
Markup erhalten bleibt.

Jedes Tool exportiert typischerweise zwei Funktionen:
- `create<Tool>(selector, options)` — initialisiert eine einzelne Instanz,
  gibt `null` zurück falls erforderliches Markup (Track/Items/Slides) fehlt,
  sonst ein Handle-Objekt (z.B. `{ destroy(), rebuild()/goTo() }`).
- `init<Tool>s(selector?, options?)` — initialisiert alle passenden
  Instanzen im Dokument auf einmal.

## Testcenter (`index.html`)

`index.html` ist die zentrale Übersichtsseite: listet alle Tools links auf
(Registry-Array `TOOLS` im `<script>`-Block), lädt die jeweilige `demo.html`
rechts in einem iframe. Da die Demos ES-Module nutzen, funktioniert das
**nicht über `file://`** — ein lokaler Server ist nötig:

```
npx --yes serve .
```

Anschließend die ausgegebene `http://localhost:…`-Adresse öffnen.

## Neues Tool ergänzen

1. Neuen Ordner nach obigem Schema anlegen (`.js`, `.css`, `README.md`,
   `demo.html`).
2. In `index.html` die `TOOLS`-Liste um `{ name, description }` erweitern —
   `name` muss exakt dem Ordnernamen entsprechen (`demo.html`/`README.md`
   werden darüber automatisch verlinkt).
3. In der Root-`README.md` unter "Enthaltene Tools" ergänzen.
