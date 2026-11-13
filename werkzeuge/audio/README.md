# Audiodateien für die Sprachausgabe

Regeln für gesprochene Texte (Erzähler statt sprechender Figuren): `docs/stimme.md`.

Die Spiele lesen mit vorab erzeugten Dateien vor (`spiele/audio/`). `spiele/kern/stimme.js` spielt die Datei
zum Text ab. Gibt es keine, spricht die Systemstimme (weiterhin ohne Zahlen). Erzeugt wird am Mac mit
**Azure Speech**. Die App selbst braucht kein Internet und keinen Schlüssel.

## Einmal einrichten

1. Speech-Ressource anlegen (Region in der EU, Tarif S0: gut 1,5 Cent je 1.000 Zeichen bei
   Standardstimmen, 2–3 Cent bei HD-Stimmen; das ganze Projekt hat heute rund 11.000 Zeichen):

   ```sh
   az group create -n lernen-spielen -l westeurope
   az cognitiveservices account create -n lernen-spielen-stimme -g lernen-spielen \
     --kind SpeechServices --sku S0 -l westeurope --yes
   ```

2. Schlüssel: Die Skripte holen ihn selbst über die angemeldete Azure-CLI (`az login`) aus der Ressource in
   `einstellungen.json › azure`. Wer ohne CLI arbeitet, setzt `AZURE_SPEECH_KEY` in der Shell (nie ins Repo).

## Ablauf

1. **Stimme wählen:** `npm run audio:vergleich` erzeugt dieselben Probesätze mit allen deutschen
   Kandidaten und öffnet sie als Seite (`werkzeuge/audio/vergleich/index.html`, nicht versioniert).
   Die gewählte Stimme kommt in `einstellungen.json` (`stimme`; bei Wechsel auch neuer `ordner`).
2. **Erzeugen:** `npm run audio` sammelt alle Texte (`texte.mjs`), erzeugt fehlende oder geänderte Dateien
   und schreibt `spiele/audio/index.json`. Ein zweiter Lauf erzeugt nichts neu.
3. **Anhören:** `npm run audio:anhoeren` öffnet unter http://127.0.0.1:8766 eine Liste aller Aufnahmen
   (Leertaste abspielen, Enter passt und weiter, K korrigieren). „passt“ setzt `gehoert` in `index.json`.
   Eine Korrektur landet in `aussprache.json` und wird sofort neu erzeugt.
4. **Korrigieren:** Spricht die Stimme etwas falsch, in `aussprache.json` eine andere Schreibweise (`sprich`),
   SSML (`ssml`, z. B. `<phoneme>`) oder eine von Hand ersetzte Datei (`datei`) eintragen, dann
   `npm run audio`. Von Hand ersetzte Dateien werden nie überschrieben.
5. **Prüfen:** `npm run audio -- --pruefen` meldet Texte ohne Datei (Exit 1). `--aufraeumen` löscht Dateien zu
   Texten, die kein Spiel mehr spricht.
6. Dateien und `index.json` committen. Builds brauchen dann weder Azure noch Schlüssel.

## Was das Sammeln findet und was nicht

Gefunden werden: Startseite (`spiele.json`), Themennamen (`lernplan.json`), Einführungen
(`einfuehrungen/*.json`), Diktatsätze (`saetze/saetze.json`, auch „Hör noch mal hin. …“) und jeder
Sprechaufruf im Spielcode mit fester Zeichenkette.

Sätze, die ein Spiel zur Laufzeit zusammensetzt (`` `${artikel} ${wort}. …` ``, Wortstücke der
Einhorn-Steine, Rechensätze), findet es nicht. `npm run audio` zählt diese Stellen je Datei. Sie werden
erfasst, sobald die Vorlagen als Daten vorliegen (Plattform-Spec: `inhalte/vorlagen.json`): Das Skript
erzeugt dann alle Belegungen. Beim 1×1 sind das ein paar hundert Sätze, also ohne Weiteres machbar.

## Zahlen

`einstellungen.json › zahlen` ist an (Christian, 2026-11-13): Erzeugte und angehörte Aufnahmen dürfen Zahlen
sprechen. Die Regel „Zahlen werden nie gesprochen“ gilt weiter für die Systemstimme, die Zahlen falsch spricht.
Spricht Azure eine Zahl falsch (z. B. als Ordinalzahl), hilft in `aussprache.json` ein Zahlwort (`sprich`) oder
`<say-as interpret-as="cardinal">`. Ob ein Satz eine Lösung verrät, entscheidet weiter jedes Spiel.

## Warum Azure (Stand 2026-11-13)

- **ElevenLabs** schließt Anwendungen für Kinder aus: „Apps, products, or experiences directed at individuals
  under 18 are prohibited … unless we have assessed and approved them in writing“ (Prohibited Use Policy,
  Stand 09.10.2026). Das gilt ausdrücklich auch für heruntergeladene Ausgaben (Terms 4(a)). Dazu
  normalisiert das schnelle Modell Flash v2.5 keine Zahlen.
- **Azure Speech** erlaubt den Einsatz, verlangt aber einen Hinweis an die Eltern bei Angeboten für kleine
  Kinder (Disclosure-Leitfaden). Der Hinweis steht im Elternbereich unter „Stimme und Ton“. Dazu kommen volles
  SSML (Aussprache, Tempo, Pausen), eine EU-Region und eine Kinderstimme (Gisela). Ausgabe für die
  Weitergabe laut Produktbedingungen nur mit bezahltem Tarif (S0), nicht mit dem kostenlosen F0.
- **Piper** (lokal, kostenlos) bleibt Ausweg ohne Cloud, klingt aber schwächer, und die Lizenzen der Stimmen
  müssten einzeln geprüft werden.
