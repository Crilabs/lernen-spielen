# Prüfung – Zehn Meisen, zwei Zweige

Geprüft am 2026-11-15. Ersetzt „Zehn Gäste, zwei Häuser“ (Perlen in gezeichneten Häusern), weil Christian echte
Geschichten mit Fotos will statt Lernbuch-Szenen.

## Tierwahl (Recherche)

Igel überwintern **einzeln** (NABU: einzelgängerisch, jeder baut ein eigenes Winternest) – der Arbeitstitel „Zehn Igel
suchen ein Winterbett“ hätte Falsches gelehrt. Gewählt: **Schwanzmeisen**. Sie leben im Winter in Trupps von etwa 5–30
Vögeln und schlafen eng zusammengekuschelt auf Zweigen im Gebüsch; allein verliert ein Vogel über Nacht mehr Wärme.
Nicht belegt ist, dass sich dieselbe Gruppe Nacht für Nacht anders auf zwei Zweige verteilt – die Geschichte erzählt es
deshalb als Szenen einzelner Abende, nicht als Regel. Zaunkönige (bis 20 in einem Nistkasten) wären belegter, sind im
Kasten aber nicht zählbar zu fotografieren.

## Bilder

Jedes Bild mit dem Read-Werkzeug angesehen, jede Meise gezählt. Maßstab: Anzahl links/rechts wie `zaehlung`, Körperbau
(zwei Beine, zwei Augen, langer Schwanz), echte Art, ruhig, hell, keine Schrift. 1024 × 1024 mit `--basis foto`, WebP
`cwebp -q 82`; Prompts in `bilder/herkunft.json`.

| Bild | Kernaussage | gezählt | Versuche |
|---|---|---|---|
| 01 | eine Schwanzmeise vor dem Fenster: klein, rund, langer Schwanz | 1, Fensterrahmen unscharf am Rand | 1 |
| 02 | tagsüber Futter suchen in der bereiften Hecke | 5 Meisen an Zweigen, Wintersonne | 1 |
| 03 | 1 links, 9 rechts dicht gedrängt | 1 \| 9 | 1 |
| 04 | allein: eine aufgeplusterte Meise in der Dämmerung | 1 | 1 |
| 05 | 2 links, 8 rechts | 2 \| 8 | 1 |
| 06 | 3 links, 7 rechts | 3 \| 7 | 2 (erster Versuch 3 \| 6) |
| 07 | Frage: 4 links, rechts verdeckt ein verschneiter Nadelast | 4 \| verdeckt, nichts dahinter sichtbar | 1 |
| 08 | Auflösung: 4 links, 6 rechts, Schnee rieselt | 4 \| 6 | 2 (erster Versuch 4 \| 5) |
| 09 | 5 links, 5 rechts, gleich voll | 5 \| 5 | 1 |
| 10 | Schnee fällt, beide Fünfergruppen eng aneinander | 5 \| 5 | 1 |
| 11 | gezeichnet: alle Abende als Perlenpaare untereinander (Montessori), Ela und Kofi | – | – |

12 Bilder erzeugt (2 verworfen); Kosten in `kosten.json`.

Hinweis zum Bildwerkzeug: Bei fünf parallelen Aufrufen meldet Azure „429 RateLimitReached“; nacheinander mit
kurzer Pause geht es.
