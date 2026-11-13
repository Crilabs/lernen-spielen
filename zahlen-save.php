<?php
// Speichert den Lernstand des Zahlenzaubers in zahlen.json (gleicher Ordner).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$file = __DIR__ . '/zahlen.json';
$zahlen = ['stufe', 'einhoerner', 'wiese', 'runden', 'letzterBesuch', 'anleitung'];
$cur = ['fakten' => new stdClass(), 'verlauf' => []];
if (is_file($file)) { $j = json_decode((string)file_get_contents($file)); if (is_object($j) && isset($j->fakten)) $cur = $j; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = (string)file_get_contents('php://input');
    $b = strlen($raw) <= 200000 ? json_decode($raw) : null;
    if (is_object($b) && isset($b->fakten) && is_object($b->fakten) && isset($b->verlauf) && is_array($b->verlauf)) {
        $neu = ['fakten' => $b->fakten, 'verlauf' => array_slice($b->verlauf, -300)];
        foreach ($zahlen as $k) $neu[$k] = (isset($b->$k) && is_int($b->$k) && $b->$k >= 0) ? $b->$k : 0;
        $cur = $neu;
        file_put_contents($file, json_encode($cur, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
}
echo json_encode($cur, JSON_UNESCAPED_UNICODE);
