# Prüfung – Mia zieht ein

Geprüft am 2026-11-15. Ersetzt „Ein Tag mit Mia, der Katze“: Christian fand sie wie ein Lernbuch („Katzen fressen vor
allem Fleisch“), ohne Gefühl und spannende Details. Neu erzählt nach `docs/geschichten.md` §2 (Schreibverfahren).

## 1. Recherche

Die ersten Tage einer Katze im neuen Zuhause; alle Tatsachen mit Quelle in `quellen`. Verworfen bzw. abgeschwächt:
„Schnurrhaare messen, ob der Körper durchpasst“ (nicht belegt, eher Mythos → „berühren die Wände, so findet sie den
Weg“); „Katzen lieben Kartons“ (umgangssprachlich → „in einer engen Kiste fühlt sie sich wohl“, Vinke 2014);
„Katze erkundet nachts“ (nicht wörtlich belegt → Dämmerung, Katzen sind dämmerungsaktiv).

## 2. Urteil des frischen Prüfers (Zusammenfassung)

- **Geschichte, kein Sachtext**: Bogen Ankunft → Verstecken → vorsichtig erkunden → erstes Hallo → Verschwinden →
  Finden → Nähe; Malik mit Wunsch (streicheln), eingelöst auf der letzten Seite.
- **Umgesetzte Befunde**: Zeitablauf war 1,5 Tage, die Eingewöhnung dauert Wochen → „Nach ein paar Tagen“, „Viele Tage
  später“. Lernbuch-Sätze ersetzt (S. 7 Duft, S. 8 „X ist Y“, S. 12, S. 13 mit Malik). Malik zeigt Gefühl (S. 10 „Sein
  Herz klopft“). S. 5 ohne „leuchtende Augen im Dunkeln“ (Angst-Auslöser „glühende Augen“).
- **Wissen, das am meisten trägt**: Schwanz hoch (S. 8) und langsames Blinzeln (S. 9) – kann das Kind an echten Katzen
  ausprobieren; Karton (S. 10–12) durch die Vorhersage.
- **Spannung**: „Mia ist verschwunden“ passt zur Stufe Sanft (kleine Komplikation zu Hause, sofort gelöst); auf dem
  Foto von S. 10 sieht man schon die Schwanzspitze im Karton (Wissensvorsprung).
- **Fassungen**: `ruhig` nötig (S. 5 Halbdunkel und S. 10 Verschwinden widersprechen „keine Komplikation, kein
  Dunkel“) → `haustiere-ruhig`. `abenteuer` nicht nötig (Stufe für 8–10 Jahre, Stoff für Kl. 1; Nutzen ohne Bildkosten
  nicht gegeben).

## 3. Bilder

Jedes Bild mit dem Read-Werkzeug angesehen. Maßstab: zeigt die Kernaussage des Abschnitts, Körperbau stimmt, Mia
überall dieselbe Katze (rot-weiß getigert, weiße Brust, weißes Maul, vier weiße Pfoten, bernsteinfarbene Augen – steht
wörtlich in jedem Prompt), Malik nur mit Händen, Armen, Beinen (dunkle Haut), ruhig, hell, keine Schrift.
1024 × 1024 `--basis foto`, WebP `cwebp -q 82`; Prompts in `bilder/herkunft.json`.

| Bild | Kernaussage | was stimmt | Herkunft |
|---|---|---|---|
| 01 | offene Box in ruhiger Ecke, Mia bleibt drin | Transportbox, Tür offen, Mia sitzt hinten auf der Decke, wach | neu, 1 Versuch |
| 02 | Mia unter dem Sofa, nur Kopf und Pfoten | geduckt unter dem Sofa, große Augen, hell | neu, 1 |
| 03 | Malik wartet still auf Abstand | Kind sitzt, Hände gefaltet, Mia schaut unter dem Sofa hervor | neu, 1 |
| 04 | Ohren in verschiedene Richtungen | ein Ohr nach vorn, eins seitlich gedreht | neu, 1 |
| 05 | Mia läuft sicher im Lampenlicht | Abend, eine Lampe, Mia läuft ruhig auf die Kamera zu; Text an das Bild angepasst (kein „Augen leuchten“) | neu, 1 |
| 06 | Schnurrhaare berühren die Wände im Spalt | Mia zwischen Schrank und Wand, Schnurrhaare an der Wand | neu, 1 |
| 07 | Wange am Tischbein | Wange am Holzbein, Augen zu, Schwanz hoch | neu, 1 |
| 08 | Schwanz hoch, Mia kommt zu Malik | Schwanz senkrecht, läuft auf Kinderfüße zu | **übernommen** (früher 01, Kernaussage gleich) |
| 09 | langsames Blinzeln | halb geschlossene Augen, Blick zur Kamera | neu, 1 |
| 10 | Malik sucht, unter dem Sofa leer | Hand hebt die Sofadecke, leer; hinten Karton mit Schwanzspitze | neu, 1 |
| 11 | Karton im Flur (Frage) | offener Karton von der Seite, keine Katze zu sehen | neu, 1 |
| 12 | Mia im Karton, entspannt | Kopf und Ohren über dem Rand | neu, 1 |
| 13 | Putzen mit rauer Zunge | Zunge sichtbar an der Pfote, Augen halb zu | neu, 1 |
| 14 | Mia bei Malik, er streichelt sie | liegt entspannt auf dem Sofa, seine Hand auf ihrem Rücken | **übernommen** (früher 08) |

Die übrigen sechs alten Bilder (Futter, Wasser, Kratzbaum, Sonne, Tierärztin, Frage-Durst) passen zu keinem Abschnitt
mehr und sind ersetzt (Git-Geschichte). Kosten in `kosten.json`.

## Nachtrag 2026-11-15

Die Fassung `haustiere-ruhig` ist entfernt: Christian hat entschieden, dass es je Geschichte nur eine Fassung gibt und keine Stufen (`grundsaetze.md` 9.3). Kleine Schwierigkeiten halten Grundschulkinder aus.
