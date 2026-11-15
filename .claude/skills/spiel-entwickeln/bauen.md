# Auftrag an den Bau-Agenten

Vorlage für den Skill `spiel-entwickeln`. Der Skill füllt `{{…}}` und schickt den **gemeinsamen Teil** plus den
Abschnitt der Phase (Entwurf, Schnellweg, Prototyp oder Ausbau), ab der zweiten Runde dazu „Befunde umsetzen“. Jede
Runde bekommt einen **neuen** Bau-Agenten; ein Bau-Agent wird nie fortgesetzt (sein ganzer Kontext würde bei jedem
Zug neu gelesen). Prüfen darf er nie.

---

## Gemeinsamer Teil

Du baust das Lernspiel **{{ID}} „{{NAME}}“** für Kinder der Klassen 1–4. Arbeitsordner: `{{WORKTREE}}` (Branch
`{{BRANCH}}`); arbeite nur dort. Spielordner: `{{SPIELORDNER}}`, Entwurf: `{{ENTWURF}}`.

Verbindlich, vor der Arbeit lesen: `docs/spielentwicklung.md` (ganz), `docs/grundsaetze.md`,
`docs/grundsaetze-bilder.md`, `docs/figuren.md`, `docs/stimme.md`, `docs/bedienung.md`; der Katalog-Eintrag
`{{KATALOG_DATEI}}` „### {{ID}} …“ und sein Eintrag in `docs/spielkatalog/welten.md` (Vorrang nach
`docs/spielkatalog.md` §8a); dazu der Eintrag der Heimatwelt in `spiele/lernplan.json` (`welten[]`: `beschreibung` =
worum es in der Welt geht, so lesen es die Eltern im Reiter „Sachwelten“; `eltern`; `fakten`). Der Eintrag ist ein Vorschlag: Passt Welt, Figur oder Mechanik nicht, weiche ab und
schreibe den Grund in den Entwurf. **Ausnahme:** Was der Eintrag als Entscheidung von Christian kennzeichnet
(„Christian“, mit Datum), ist gesetzt; auch ein Prüfbefund ist kein Grund, davon wegzubauen. Widerspricht es einem
Kriterium, benenne den Widerspruch offen und stelle ihn unter „Freigabe nötig“ als Frage.

Regeln:
- Niemanden fragen. Was offen ist, entscheidest du nach den Dokumenten und markierst es im Entwurf als **(Annahme)**.
  Nur bei Zerstörerischem, Sicherheit oder Wirkung nach außen anhalten und melden.
- Keine Unteragenten starten. Nicht pushen, nicht nach `main` mergen. `spiele/mit-echten-dingen/` nie anfassen (das
  läuft in einem eigenen Branch).
- Kein Plattform-Zugriff außerhalb `spiele/kern/`; die Test-Schnittstelle nur im Testbetrieb (`spiele/rahmen/pruefen.js`).
- Commits auf Deutsch, Form `feat(<spiel>): …` / `fix(<spiel>): …` / `docs(<spiel>): …`, Leerzeile, dann
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Du prüfst nicht, ob dein Ergebnis „grün“ ist; das tun andere. Tests und Prüfstand laufen lassen darfst und sollst du.

- Was vor dir gebaut wurde, liegt im Branch und im Entwurf; lies es dort, statt es neu zu erfinden.

Rückmeldung am Ende (kurz): was entstanden ist (Dateien), Commits, Annahmen, was du bewusst offen gelassen hast.

---

## Entwurf

Schreibe `{{ENTWURF}}` als **Pflichtliste** (höchstens etwa 80 Zeilen, Stichpunkte statt Prosa) mit den elf
Pflichtteilen aus `docs/spielentwicklung.md` §1 in dieser Reihenfolge und mit diesen Überschriften: Zweck in der
Spielwelt · Die Runde in fünf Sätzen · Lernhandlung = Spielhandlung · Sachwelt und Sachgrund · Figur ·
Bildschirm-Skizze · Rückmeldung · Hilfe-Leiter · Stufen · Aufgabenschlüssel und arten · Spielobjekte · dazu am Ende
**Bausteine**.

- Kopf: Katalog-Id, Name, Fach, Spielordner, Stand (Datum), Abweichungen vom Katalog-Eintrag mit Grund.
- **Bausteine:** je Bedienteil, Lernzeichen, Spielobjekt und Figur, das das Spiel braucht, eine Zeile mit
  „vorhanden“ (Pfad: `spiele/rahmen/…`, `spiele/objekte/…`) oder „neu“, nach der Tabelle in
  `docs/spielentwicklung.md` „Zwei Wege“. Dazu, ob die Lernhandlung ohne Änderung an `spiele/rahmen/`,
  `spiele/kern/`, `spiele/lernsteuerung.js` und dem RAHMEN der Vorlage geht. Danach entscheidet der Skill den Weg; ein
  Spiel aus lauter Vorhandenem ist schneller fertig, aber erfinde kein „vorhanden“: Was es nicht gibt, ist neu.
- Alle gesprochenen Sätze **wörtlich** (Erzähler; Figuren sprechen nicht, `docs/stimme.md`), keine Wörter aus
  `docs/grundsaetze.md` §3.2, Fachbegriffe nach §5.1.
- Figur: eine aus `docs/figuren.md` §2 mit genau einer Aufgabe (§3), Platz im Bild, Haltungen.
- Bildschirm-Skizze als ASCII nach `docs/bedienung.md` §3.
- Folgen je Aufgabe mit Varianten (W-Freude: sichtbare Folge einer richtigen Lösung, ~1 s Handlung, bis ~3 s Folge, überspringbar; Reaktionen der Runde nutzen)
- Spielobjekte: Dinge, Zustände, Bewegungen, welches das Regal-Bild ist (Abschnitt „Spielobjekte“ in
  `docs/spielentwicklung.md`); was es schon in `spiele/objekte/` gibt, wiederverwenden. Im Regal steht für ein Thema
  zuerst sein Lernzeichen (Perlenstab bei Zahlen und Zerlegen, Wortart-Zeichen, Graphem-Karte), erst danach das
  Regal-Bild des Spiels (Abschnitt „Regal-Bild“): Bei solchen Themen bleibt der Perlenstab vorn, das Regal-Bild gilt
  für die übrigen; schreib dazu, für welche Themen es sichtbar wird.
- **Figur des Spiels** (`docs/grundsaetze-bilder.md` §16): zuerst in `spiele/objekte/` nachsehen, sonst eine eigene
  entwerfen; kein Kind der Runde. Eintrag `karte: { figur, zustand, welt }` mit dem typischen Moment; begründe, wie
  sich die Silhouette von den anderen Karten des Fachs (`spiele/spiele.json`) unterscheidet und dass
  `(figur, welt, zustand)` im Fach noch frei ist. Die Figur ist zugleich das Regal-Bild, ihre Kopfform das Spielsymbol (Kopfleiste, Regal-Detail).
- Braucht das Spiel ein neues Lernzeichen oder Bedienteil (`docs/spielkatalog.md` §8a) oder eine offene Frage aus
  `docs/grundsaetze-bilder.md` §15: entwerfen, als **(Annahme)** markieren und unter der Überschrift
  „Freigabe nötig“ als konkrete Frage an Christian notieren. Das Spiel wird dann gebaut und geprüft, aber nicht gemergt.
- Prüfe selbst die Liste `docs/grundsaetze.md` §12, bevor du abgibst.

Committen: `docs({{ORDNERNAME}}): Spielentwurf`.

---

## Schnellweg: das ganze Spiel in einem Zug

Das Spiel braucht nur Vorhandenes (Weg im Kopf des Entwurfs). Du baust es **ganz**, mit allen Lernstufen, ohne
Prototyp dazwischen; danach spielt der Skill jede Stufe automatisch durch, und ein Prüfer prüft alles auf einmal.

Erst `frontend-design:frontend-design` laden (Skill), dann bauen. Farbwelt (`docs/grundsaetze-bilder.md` §6) und
`docs/bedienung.md` sind verbindlich und gehen vor allgemeinen Gestaltungsvorschlägen.

- **Grenzen des Schnellwegs:** nichts ändern in `spiele/rahmen/`, `spiele/kern/`, `spiele/lernsteuerung.js`,
  `spiele/objekte/objekt.js`, `spiele/aufgabenarten.js` (auch `ZIEL_MS`), den `aufgaben` in `spiele/lernplan.json` und
  im RAHMEN von `spiele/vorlage/spiel.js`; keine neue Aufgabenart, kein neues Lernzeichen, kein Bedienteil im Spiel
  nachbauen. Erlaubt sind nur der Spielordner, der Eintrag in `spiele/spiele.json`, neue Arten als eigene Datei
  `spiele/objekte/<neue art>.js` (vorher auf `main` nachsehen, ob es die Art inzwischen gibt) und der Entwurf. Geht es ohne nicht, **halte an** und melde, was fehlt und warum (dann wechselt der Skill in den
  vollen Weg); bau es nicht trotzdem.
- **Grundgerüst** wie im Abschnitt Prototyp unten (Kopie der Vorlage, „../“ → „../../“, Test-Schnittstelle,
  `spiele.json`, `logik.js` mit Node-Tests, RAHMEN mit `?stufe` und `lernstufe` behalten).
- **Alle Lernstufen** (material / vorstellung / kopf), soweit der Entwurf sie vorsieht, in einem Zug; jede über
  `?stufe=<id>` im Testbetrieb erreichbar.
- **Umfang des Ausbaus** wie im Abschnitt Ausbau unten: Spielobjekte als animierte SVG, Regal-Bild, Kartenbild mit
  Silhouettentest, Szenenbild nur über das Werkzeug, Texte als Daten (`npm run audio` startest du nicht),
  vollständiger Eintrag in `spiele.json` einschließlich `beschreibung` (siehe Ausbau unten).
- **Einführung in der Welt des Spiels:** Erzählt die Einführung eines Themas (`spiele/einfuehrungen/*.json`) eine
  andere Welt, schreib eine eigene Einführung in der Sachwelt des Spiels (gleiches Format, `{{SPIELORDNER}}/einfuehrung.json`)
  und trag sie in der SPIELWELT ein: `const EINFUEHRUNG = { vorlage: "<fach>/<spiel>/einfuehrung.json" }` (Pfad
  relativ zu `spiele/`, Kopf von `spiele/vorlage/spiel.js`); der RAHMEN spielt sie dann statt der des Themas. Nicht
  abschalten (L5, A4b).
- Checklisten `docs/bedienung.md` §10 und `docs/grundsaetze.md` §12 durchgehen; selbst laufen lassen, bis alles
  durchläuft: `npm test` und `NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs
  {{SEITE}}`, dazu `--stufe <id>` für jede Lernstufe.

Committen in sinnvollen Schritten (`feat({{ORDNERNAME}}): …`). In der Rückmeldung außerdem die Liste der neuen Texte
wörtlich.

---

## Prototyp

Erst `frontend-design:frontend-design` laden (Skill), dann bauen. Farbwelt (`docs/grundsaetze-bilder.md` §6) und
`docs/bedienung.md` sind verbindlich und gehen vor allgemeinen Gestaltungsvorschlägen.

Nach `docs/spielentwicklung.md` §3 und dem Kopf von `spiele/vorlage/spiel.js` (Schritte 1–3 und 7):
- `spiele/vorlage/` nach `{{SPIELORDNER}}` kopieren; in `index.html` und `spiel.js` jedes „../“ zu „../../“;
  `<title>` und `<ls-leiste spiel fach titel thema>` setzen.
- Genau **eine Stufe** und **eine Runde** nach dem Entwurf; ohne erzeugtes Bild und ohne Aufnahmen (Systemstimme);
  Figur als Platzhalter aus der Runde (`spiele/runde/`), schlichte Welt-Fläche; Spielobjekte dürfen einfache
  Platzhalter sein, ihre Rolle (Wirkung, nicht Zählmaterial) muss stimmen.
- Test-Schnittstelle `meldePruefSchnittstelle` mit `zuege`, `richtigerZug`, Hilfe Stufe 2 mit `.markiert`;
  `fehlversuche: false` nur, wenn wirklich kein Zug danebengehen kann.
- Eintrag in `spiele/spiele.json` (`datei`, `symbol` relativ zu `spiele/`, `arten`, Themen); `symbol.svg` (im Prototyp einfach, im Ausbau die von Hand gezeichnete Kopfform der Figur).
- Reine Logik in `logik.js` mit Node-Tests unter `tests/spiele/<fach>/<spiel>.test.mjs`, falls es Logik gibt (`npm test` nimmt
  sie mit; `package.json` nicht ändern).
- Den RAHMEN der Vorlage behalten, auch `?stufe` (nur im Testbetrieb) und `lernstufe` im Zustand.
- Selbst laufen lassen, bis es durchläuft: `npm test` und
  `NODE_PATH=/private/tmp/claude-501/pw/node_modules node tests/browser/durchspielen.mjs {{SEITE}}`.

Committen: `feat({{ORDNERNAME}}): Prototyp – eine Stufe, eine Runde`.

---

## Ausbau

Erst `frontend-design:frontend-design` laden. Nach `docs/spielentwicklung.md` §5, Umfang nach
`docs/spielkatalog.md` §8a (alle Hauptthemen in der Datenstruktur; gebaut die Themen der Einstiegsklasse auf allen
Lernstufen, ruhig und sanft; abenteuer mitgeplant):

- Alle Stufen (material / vorstellung / kopf), soweit der Eintrag sie vorsieht.
- **Spielobjekte** als animierte SVG im Stil der Runde (`docs/figuren.md` §4, Welt-Paletten
  `docs/grundsaetze-bilder.md` §6.2), von Hand, nie KI-generiert; Schnittstelle `spiele/objekte/objekt.js`
  (`meldeObjekt`, Vorbild `tonne.js`); vor einer neuen Art auf `main` nachsehen (`git show main:spiele/objekte/`),
  ob es sie inzwischen gibt; gemeinsam Nutzbares nach `spiele/objekte/`, Spielspezifisches nach
  `{{SPIELORDNER}}/objekte/`; `tests/objekte.test.mjs` grün; in `spiele/rahmen/vorschau.html?objekte` sichtbar.
- **Stil und Farben wie die bestehenden Figuren:** vor dem Zeichnen `spiele/runde/kinder/stil.js` und `schnitt.js`
  lesen (Konturstärke, Lichtstufen, Schattenfarben) und deren Helfer nutzen; `spiele/objekte/tonne.js` als Vorbild;
  `spiele/runde/galerie.html` ansehen. Farben nur aus der Farbwelt (`spiele/rahmen/stil.js` TOKENS,
  `docs/farbwelt.html`) und den Welt-Paletten (`spiele/start/welten.js` PALETTEN, `docs/grundsaetze-bilder.md` §6.2);
  keine eigenen Hexwerte, nie Farben der Lernzeichen (Perlen, Stellenwerte) für die Sachwelt. Vor dem Commit ein
  Vergleichsbild machen (jede neue Figur neben einem Kind der Runde, gleiche Größe, `tests/browser/objektbilder.mjs`)
  und selbst ansehen: gleiche Kontur, gleiche Lichtführung, keine Verläufe.
- **Regal-Bild:** `regal: { objekt, wert }` in `spiele.json`, Objekt in `spiele/objekte/`; Regal-Material
  (`spiele/rahmen/material.js`); im Regal (`spiele/regal.html`) bei einem Thema ansehen, für das es gilt.
- **Kartenbild:** `karte: { figur, zustand, welt }` in `spiele.json`, Figur in `spiele/objekte/` nach
  `docs/grundsaetze-bilder.md` §16 (eine Figur, groß, mittig bis Mitte rechts, kein Knopf, kein Text, keine Lernzeichen); `symbol.svg` als
  Kopfform der Figur. Selbst den Silhouettentest ansehen (alle Karten des Fachs, 64 px, Graustufen).
- **Szenenbild** nur mit `node werkzeuge/bilder/erzeugen.mjs --spiel {{SPIELORDNER}} <ziel> "<Szene>"`, Herkunft in
  `bilder/herkunft.json` (`docs/grundsaetze-bilder.md` §11).
- **Texte als Daten** in `{{SPIELORDNER}}/texte.json` und als feste Zeichenketten (Kopf der Vorlage, Schritt 3).
  `npm run audio` startest du **nicht**; das tut der Skill danach (Kosten). Nichts anhören, nichts als angehört
  markieren. Gib die Liste der neuen Texte wörtlich zurück.
- **Sachwelt bleibt im Rahmen ihrer Beschreibung:** Was das Spiel aus der Heimatwelt zeigt, passt zu `beschreibung` der
  Welt in `spiele/lernplan.json`. Zeigt das gebaute Spiel die Welt anders oder enger (andere Dinge, anderer Sachgrund),
  passe `beschreibung` im selben Branch an: ein bis zwei Sätze für Eltern, worum es geht, ohne Sachfakten, ohne Wörter
  aus `docs/grundsaetze.md` §3.2, keine Klassen; Quelle ist `scripts/welten-beschreibungen.json`, danach
  `node scripts/welten-lernthemen.mjs` ausführen. Nenne die Änderung im Entwurf.
- **Beschreibung für Erwachsene:** Feld `beschreibung` im Eintrag in `spiele.json`, 2–3 Sätze (höchstens 400 Zeichen) in
  einfachem Deutsch für Eltern, abgeleitet aus dem Entwurf (Runde in fünf Sätzen, Lernhandlung, Sachgrund) und am
  gebauten Spiel nachgeprüft: was das Kind im Spiel tut, was es dabei lernt, wie die Welt dazu passt. Neutral (keine
  Wörter aus `docs/grundsaetze.md` §3.2, kein Lob, kein Druck), „das Kind“ / „Ihr Kind“, keine Klassen- oder
  Lehrplanzahlen. Beispiel: „Timo packt Vorräte in den Korb: Schuhpaare, Brötchentüten, Eierkartons. Das Kind rechnet
  aus, wie viele Dinge es zusammen sind, und sieht die Malaufgabe als Perlenkette. So übt es das Einmaleins mit echten
  Packungsgrößen.“ Sie erscheint nur in `?eltern` und im Elternbereich, nie für das Kind (nicht auf Karten, nicht im
  Spiel); `tests/spiele-beschreibung.test.mjs` prüft Länge und Sätze.
- Einführung (`spiele/einfuehrungen/`, Lernplan `einfuehrung`), vollständiger Eintrag in `spiele.json`. Erzählt die
  Einführung des Themas eine andere Welt: eigene Einführung in der Welt des Spiels über `EINFUEHRUNG` in der SPIELWELT, nicht abschalten (A4b, L5).
- Checklisten `docs/bedienung.md` §10 und `docs/grundsaetze.md` §12 durchgehen; `npm test` und Durchspielen grün,
  auch je Lernstufe (`durchspielen.mjs {{SEITE}} --stufe <id>`).

Committen in sinnvollen Schritten (`feat({{ORDNERNAME}}): …`).

---

## Befunde umsetzen

Ein unabhängiger Prüfer (oder das Durchspielen) hat Folgendes rot gegeben (Runde {{RUNDE}}; höchstens 3 Runden, im
Schnellweg 2). Du bist ein neuer Bau-Agent: Der Stand liegt im Branch, der Entwurf in `{{ENTWURF}}`; lies beides,
bevor du änderst, und bau nicht neu, was schon steht.

{{BEFUNDE}}

Seine Hinweise zu grünen Kriterien stehen dabei, wenn er welche gab; sie sind kein Muss, aber nimm sie mit, wo sie
das Spiel klarer machen.

Setze jeden Befund um oder begründe im Entwurf, warum er nicht zutrifft (mit Beleg aus den Dokumenten). Ändere
den Entwurf mit, wenn sich das Spiel ändert. Melde je Befund: umgesetzt (Datei:Zeile, Commit) oder begründet
abgelehnt.
