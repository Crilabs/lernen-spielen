# Bildprüfung – Ein Tag mit Mia, der Katze

Geprüft am 2026-11-15, jedes Bild mit dem Read-Werkzeug angesehen. Maßstab: passt zu Satz und Fakt, Körperbau stimmt
(Beine, Ohren, Augen, Schnurrhaare), keine erfundenen Details, keine Schrift, ruhig, hell, schön; Menschen nur beiläufig,
keine Gesichter. Mia ist in allen Bildern dieselbe Katze, so ähnlich es geht: rot-weiß getigerte Hauskatze (junge
Erwachsene) mit weißer Brust, weißem Maul, vier weißen Pfoten und bernsteinfarbenen Augen – diese Merkmale stehen
seit der Neuerzeugung wörtlich in jedem Prompt. Malik zeigt sich nur mit Füßen, Hand oder Arm (dunkle Haut).

**Quadratisch neu erzeugt** (Christian 2026-11-15: „Bild links, Text rechts. Bilder quadratisch generieren.“): alle
acht Bilder 1024 × 1024 mit `--basis foto`, Motiv mittig; WebP mit `cwebp -q 82`. Die Prompts stehen in
`bilder/herkunft.json`, die früheren Querformat-Bilder (1536 × 1024) und ihre Prompts in der Git-Geschichte.

| Bild | Satz | geprüft | was stimmt | Versuche |
|---|---|---|---|---|
| 01 | Am Morgen läuft Mia zu Malik. Ihr Schwanz steht hoch. | ja | Katze läuft mittig auf die nackten Füße des Kindes zu (Pyjamahose am unteren Rand), Schwanz senkrecht mit gebogener Spitze (Begrüßung), zwei Ohren nach vorn, vier Beine, Morgenlicht im Wohnzimmer; keine Schrift. | 1 |
| 02 | Malik füllt den Napf mit Katzenfutter. | ja | Kinderhand im geblümten Ärmel löffelt Nassfutter (Fleischstücke) in einen schlichten weißen Napf ohne Muster, Katze sitzt ruhig dahinter und schaut, Schwanz um die Pfoten; keine Verpackung, keine Schrift. | 1 |
| 03 | Mia hat Durst. Was glaubst du: Was trinkt Mia? | ja | Katze sitzt mittig in heller Küche, schaut nach oben, leckt sich die Nase, leerer Napf daneben; keine Flüssigkeit zu sehen, verrät die Antwort nicht. | 1 |
| 04 | Mia trinkt frisches Wasser. Milch vertragen viele Katzen nicht. | ja | Katze trinkt klares Wasser aus einer flachen Schale, Zunge im Wasser, Ringe auf der Oberfläche; keine Milch, kein Futter im Bild. | 1 |
| 05 | Mia wetzt ihre Krallen am Kratzbaum. | ja | Katze steht auf den Hinterbeinen, beide Vorderpfoten am Sisalstamm eines stabilen Kratzbaums mit Liegebrett und Höhle; ganze Katze zu sehen, Körper lang gestreckt (typische Kratzhaltung), Krallen nur angedeutet. | 1 |
| 06 | Mittags liegt Mia in der Sonne. Katzen schlafen viele Stunden am Tag. | ja | Katze schläft eingerollt auf einer Decke auf der Fensterbank im Sonnenlicht, Augen zu, Schwanz um den Körper; sehr ruhig. | 1 |
| 07 | Am Nachmittag besucht Mia die Tierärztin. Sie hört Mias Herz ab. | ja | Tierärztin im hellblauen Kittel (Gesicht nicht im Bild) hält das Stethoskop an die Brust der ruhig sitzenden Katze, Kinderhand auf ihrem Rücken, Transportbox im Hintergrund; keine Spritzen, keine Schrift (nur Pfotenmuster auf einem Kissen). | 1 |
| 08 | Am Abend liegt Mia bei Malik. Sie schnurrt leise. | ja | Katze liegt entspannt mit halb geschlossenen Augen auf dem Sofa, Kinderhand im Strickärmel liegt auf ihrem Rücken, warmes Lampenlicht, trotzdem hell; keine Schrift. | 1 |

Berechnet für die quadratischen Bilder: 8 Bilder, keins verworfen, 0,51 € laut `kosten.json` (Einträge mit „quadratisch“).
Zusammen mit der ersten Fassung im Querformat (9 Bilder, 0,45 €): 17 Bilder, 0,97 €.

Hinweis für den Baustein: Erzeugte Bilder tragen den Hinweis „Bild erzeugt“ (`docs/geschichten.md` §2) – das zeigt die
Seite, nicht das Bild.
