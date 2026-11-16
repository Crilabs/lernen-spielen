# Prüfung – Mia, die kleine Wildkatze (Sachbuch)

Stand 2026-11-15. Ersetzt „Mia zieht ein“: Christian fand sie zu kurz („wie ein Kinderbuch für 3-Jährige“) und mit zu
wenig Wissenswertem über Katzen. Neu nach `docs/geschichten.md` §2a: erst Lerninhalte, dann Form, dann Text.

## 1. Inhalte und Form

- Lerninhalte in `inhalte.md` (Lehrplan Bayern HSU 1/2: „gehen mit Haustieren verantwortungsvoll um, auch zu ihrem
  eigenen Schutz“; Kindersachbücher und Kinderseiten als Maßstab; 44 Quellen; Mythen verworfen).
- **Prüfer A** (frisch) zu `inhalte.md`: frühe Stopp-Zeichen beim Streicheln ergänzt (Kinder werden beim Streicheln
  gekratzt, nicht bei einer fauchenden Katze), fremde Katzen, Kratzer zeigen, nie mit Händen spielen, Fäden wegräumen,
  weichere Formulierungen (Milch, Gras, Impfen), sechs Kapitel. Alles eingearbeitet.
- **Form: Sachbuch**, weil die Inhalte keine natürliche Handlung haben; Mia (Maliks Katze) ist das durchgehende Beispiel,
  an dem jede Tatsache sichtbar wird. 6 Kapitel, 32 Seiten, 2.472 Wörter, drei Fragen (Kap. 2, 4, 5).

## 2. Prüfer B (frisch, gegen `inhalte.md`)

Kein [muss]. Umgesetzt: Zähne/Verwandtschaft genauer (auch Hunde haben Eckzähne), Herkunft „warme, trockene Länder“
statt „Afrika“, Schnurren im Hals statt Bauch, „lauern“ an die richtige Stelle, offenere Frage („Was macht Mia in der
Luft?“ statt „Rücken oder Pfoten“, die den Mythos halb bestätigte), fehlende Umgangsregeln (Schwanz, Augen/Ohren/Maul,
Ecke), Listen als Szenen (Morgen mit Mia, Einzug, Kratzer-Erlebnis), Mia im Kapitel Katzenkinder, Kinn bleibt trocken,
Ball, Haare würgen. Gestrichen, weil ohne Quelle: „springen das letzte Stück“, „passen in eine Hand“, „kann schon ein
Kätzchen“. Stärkste Stellen laut Prüfer: Schneespur „wie Perlen an einer Schnur“, Wassertürmchen, Rascheln mit Papier,
„riecht nach Familie“, Stopp-Zeichen als Szene.

## 3. Bilder

Je Seite die Kernaussage; jedes Bild mit dem Read-Werkzeug angesehen. Mias Steckbrief wörtlich in jedem Prompt
(rot-weiß getigert, weiße Brust, weißes Maul, vier weiße Pfoten, bernsteinfarbene Augen); Malik nur Hände, Arme, Beine
(dunkle Haut). 1024 × 1024 `--basis foto`, WebP q 82; Prompts in `bilder/herkunft.json`.

| Seite | Kernaussage | Herkunft | geprüft |
|---|---|---|---|
| 1-1 | gähnt, Eckzähne sichtbar | neu | Maul weit offen, vier Eckzähne, lustig, nicht bedrohlich |
| 1-2 | Falbkatze am Kornspeicher | neu | sandgraue Wildkatze, Tonkrüge, Korn, keine Maus |
| 1-3 | lauert flach im Gras | neu | geduckt, Blick nach vorn, nichts Gejagtes im Bild |
| 1-4 | schläft eingerollt in der Sonne | übernommen (Ein Tag mit Mia 06) | ✓ |
| 1-5 | drinnen am Fenster, draußen junger Vogel | neu | Fenster zu, Jungvogel im blühenden Busch |
| 2-1 | Pfotenspur hintereinander im Schnee | neu | gerade Reihe, Mia läuft weg |
| 2-2 | klettert rückwärts den Baum hinunter | neu | Kopf oben, Schwanz unten, Krallen in der Rinde, Kinderhand am Stamm |
| 2-3 | Kratzbaum | übernommen (Ein Tag mit Mia 05) | ✓ |
| 2-4 | balanciert auf der Stuhllehne, Schwanz seitlich (Frage) | neu | verrät die Antwort nicht |
| 2-5 | landet auf den Pfoten | neu, 2 Versuche | erster Versuch stand nur; jetzt Vorderpfoten auf dem Teppich, Hinterbeine in der Luft |
| 2-6 | Zunge beim Trinken | übernommen (Ein Tag mit Mia 04) | ✓ |
| 3-1 | große runde Pupillen im Lampenlicht | neu | warm, freundlich, nicht dunkel |
| 3-2 | Ohren in zwei Richtungen | übernommen (Mia zieht ein 04) | ✓ |
| 3-3 | Schnurrhaare berühren die Wände | übernommen (Mia zieht ein 06) | ✓ |
| 3-4 | Flehmen: Maul leicht offen | neu | schnuppert am Gras, Maul offen |
| 4-1 | Neugeborene, Augen zu, an der Mutter (Frage) | neu | winzige Kätzchen, verrät „Nase“ nicht |
| 4-2 | trinken und treteln | neu | Pfoten am Bauch |
| 4-3 | Mutter trägt Junges am Nacken | neu | Kätzchen hängt ruhig |
| 4-4 | Mutter mit Jungen, Kind schaut mit Abstand | neu | Kind sitzt, Hände im Schoß |
| 4-5 | Kätzchen balgen sich | neu | ✓ |
| 5-1 | Schwanz hoch zur Begrüßung | übernommen (Mia zieht ein 08) | ✓ |
| 5-2 | langsames Blinzeln | übernommen (Mia zieht ein 09) | ✓ |
| 5-3 | schnurrt neben Malik | übernommen (Mia zieht ein 14) | ✓ |
| 5-4 | Streicheln, Schwanz gehoben (Frage) | neu | Stopp-Zeichen nur angedeutet – schwächstes Bild, Text trägt |
| 5-5 | Hand geht ruhig weg, Mia entspannt | neu | ✓ |
| 5-6 | zeigt den Bauch, niemand fasst an | neu | ✓ (bewusst keine fauchende Katze im Bild) |
| 6-1 | Hand ruhig hingehalten, Mia schnuppert | neu | ✓ |
| 6-2 | spielt mit der Katzenangel | neu | Feder an der Schnur, Kinderhand am Stab |
| 6-3 | fremde Katze auf der Mauer, Kind bleibt stehen | neu | schwarz-weiße Katze, Kinderbeine mit Abstand |
| 6-4 | Mias Ecke: Napf, Wasser, Klo, Kratzbaum, Bett | neu | keine Marken, keine Schrift |
| 6-5 | knabbert Katzengras | neu | keine Milch im Bild |
| 6-6 | schaut aus der Kiste (Einzug) | übernommen (Mia zieht ein 12) | ✓ |

24 Bilder erzeugt (23 Seiten + 1 Neuversuch), 9 übernommen; Kosten in `kosten.json`.

## 4. Titelbild

`bilder/05-03.webp`, Ausschnitt `50% 50%` (gewählt von einem frischen Agenten, 2026-11-16): Mia liegt entspannt auf dem Sofa, eine Kinderhand streichelt sie. Das fasst die Hauskatze und das Freundwerden zusammen, und der liegende Körper passt mit Ohren, Gesicht und Pfoten in den Streifen.
