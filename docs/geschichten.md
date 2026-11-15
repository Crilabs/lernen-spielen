# Geschichten

Stand: 2026-11-15 · freigegeben (Christian, 2026-11-15: Entwurf „Geschichten statt Sachwelten in Spielen“,
Auswahlfragen, Beurteilung) · **(Annahme)** = korrigierbar.

Sachwelten werden nicht mehr mit Spielen verknüpft. Sachthemen werden **Sachgeschichten** oder **Sachspiele**, Lernthemen
können mit einer **Lerngeschichte** eingeführt werden. Welches Thema welche Geschichte bekommt, steht in
`spiele/geschichten/beurteilung.json` (Familien je Lerngeschichte, Form je Welt).

## 1. Was eine Geschichte ist

Text und ein Bild je Seite. Das Kind sieht je Seite das Bild, liest selbst oder lässt sich vorlesen, und blättert selbst
weiter; nichts läuft von allein (`spielbau.md` §8).

| Art | Bild | trägt |
|---|---|---|
| `sachgeschichte` | **fotorealistisch, KI** (Christian), jedes Bild geprüft | Zusammenhänge, Ursachen, Wandel, Staunen über die echte Welt |
| `sinn` | gezeichnet (Szene aus Bausteinen) | wozu man es braucht, woher es kommt |
| `form` | gezeichnet | ein Bild wird Seite für Seite zum neuen Zeichen (Schwan → 2) |
| `struktur` | gezeichnet | eine Beziehung, die im Bild sichtbar ist (Zehnerpaare, Tausch, Bündeln) |

**Lerngeschichten zeichnen ihre Bilder aus den Bausteinen der App** (Kinder der Runde, Perlenstäbe, Spielobjekte,
Ziffern), nicht mit KI: Bei Struktur und Form müssen Anzahlen und Formen genau stimmen, und das kann ein Bildgenerator nicht
sicher **(Annahme)**.

## 2. Regeln

- **Umfang:** 6–10 Seiten; je Seite 1–3 Sätze, Satzlänge wie `spielbau.md` §3 (bis Kl. 2 höchstens 8 Wörter, Kl. 3–4
  höchstens 12).
- **Kein Transfer** (`spielbau.md` §8): Das Bild zeigt, was der Satz sagt. Bei Struktur zeigt das Bild die Struktur selbst,
  angeordnet wie das Montessori-Material; bei Form wird das Bild schrittweise zum schlichten Zeichen, die letzte Seite zeigt
  das Zeichen allein (neben dem Perlenstab).
- **Höchstens eine Frage zum Vorhersagen** je Geschichte (L2), aufgelöst auf der nächsten Seite; keine Antwort ist falsch,
  nichts wird gespeichert, nichts geprüft (K7).
- **Wahres stimmt** (G11): In Sachgeschichten nur Fakten mit Quelle (`quellen`), generische Sprache („Katzen …“), keine
  Mythen; jedes Bild zeigt nur, was stimmt. Erzeugte Bilder tragen den kleinen Hinweis „Bild erzeugt“.
- **Grenzen wie bei Spielen:** G1 keine Bewertung, G8 Vielfalt beiläufig, G9 Sicherheit (ruhig, hell, Ende in Ruhe), G10
  Erzähler in der dritten Person, Figuren sprechen nicht.
- **Keine Regeln mit Verfallsdatum** (`grundsaetze.md` §5): Eine Geschichte trägt eine Form oder Struktur, nie eine
  Bedeutungsregel („Nomen kann man anfassen“, „das Krokodil frisst die größere Zahl“).
- **Fantasie als Gedächtnisstütze** (Christian, 2026-11-15): erlaubt, wenn das Bild die Form selbst zeigt und schrittweise
  zum schlichten Zeichen führt; im Spiel und im Material bleibt das Zeichen schlicht (ändert `grundsaetze.md` §4).

## 3. Ablage

```
spiele/geschichten/<id>/geschichte.json   die Geschichte
spiele/geschichten/<id>/bilder/*.webp     Fotos der Sachgeschichte (1536 × 1024, WebP), herkunft.json daneben
spiele/geschichten/<id>/kosten.json       Kosten (werkzeuge/kosten/)
```

```json
{
  "id": "haustiere",
  "titel": "Ein Tag mit Mia, der Katze",
  "art": "sachgeschichte",
  "welt": "haustiere",
  "familie": null,
  "klasse": 1,
  "quellen": [ { "fakt": "Katzen schlafen viele Stunden am Tag.", "quelle": "https://…, abgerufen 2026-11-15" } ],
  "seiten": [
    { "text": "Mia schläft auf dem Sofa.", "bild": "bilder/01.webp" },
    { "text": "Was glaubst du: Was frisst Mia am liebsten?", "bild": "bilder/02.webp", "frage": true },
    { "text": "Zehn Gäste. 3 im roten Haus, 7 im blauen.", "szene": [ { "perlen": ["3", "7"], "x": 50 } ] }
  ]
}
```

- `text` steht unter dem Bild und wird vorgelesen; `sprich` (optional) ersetzt den gesprochenen Text, wenn er vom
  geschriebenen abweichen muss.
- `bild` (Foto, Pfad relativ zum Ordner der Geschichte) **oder** `szene` (gezeichnet): Bildelemente wie in
  `spiele/einfuehrung.js` (`figur`, `perlen`, `zahl`, `objekt`), erweiterbar um Elemente, die eine Geschichte braucht
  (dann dort dokumentiert und getestet).
- `frage: true` markiert die eine Seite mit Frage zum Vorhersagen.
- `familie` (Lerngeschichte) bzw. `welt` (Sachgeschichte) verbinden sie mit `beurteilung.json`.

## 4. Abspielen

- Baustein `<ls-geschichte src="geschichten/<id>/geschichte.json">` in `spiele/rahmen/geschichte.js`, Seite
  `spiele/geschichte.html?id=<id>` (optional `&weiter=<Pfad>`: dorthin nach der letzten Seite, z. B. ins Spiel).
- Bild groß, Text darunter in Andika, Vorlesen (Florian, vorab aufgenommen, `npm run audio`), Weiter und Zurück per
  Tipp, Wischen und Pfeiltaste, Haus; Fortschritt als Punkte ohne Zahl; nach der letzten Seite „Fertig“.
- Vor dem Spiel: Die Lerngeschichte eines Themas kommt beim ersten Start des Themas und bleibt über „Anleitung“ wieder
  aufrufbar; Sachgeschichten stehen im Bücherregal der Startseite (Christian; Umbau nach der Probe).
