<?php
// Speichert den Lernstand von Einhorn-Steine in steine.json (gleicher Ordner).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$file = __DIR__ . '/steine.json';
$cur = ['saetze' => new stdClass(), 'paare' => new stdClass(), 'tage' => new stdClass(), 'runden' => [], 'stufe' => 1, 'pause' => ''];
if (is_file($file)) { $j = json_decode((string)file_get_contents($file)); if (is_object($j) && isset($j->saetze)) $cur = $j; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = (string)file_get_contents('php://input');
    $b = strlen($raw) <= 60000 ? json_decode($raw) : null;
    if (is_object($b) && isset($b->saetze, $b->paare, $b->tage, $b->runden)
        && is_object($b->saetze) && is_object($b->paare) && is_object($b->tage) && is_array($b->runden)) {
        $cur = ['saetze' => $b->saetze, 'paare' => $b->paare, 'tage' => $b->tage, 'runden' => $b->runden,
                'stufe' => (isset($b->stufe) && is_int($b->stufe)) ? max(1, min(3, $b->stufe)) : 1,
                'pause' => (isset($b->pause) && is_string($b->pause)) ? $b->pause : ''];
        file_put_contents($file, json_encode($cur, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
}
echo json_encode($cur, JSON_UNESCAPED_UNICODE);
