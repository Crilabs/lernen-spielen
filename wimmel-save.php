<?php
// Speichert den Lernstand des Wimmelbild-Detektivs in wimmel.json (gleicher Ordner).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$file = __DIR__ . '/wimmel.json';
$cur = ['woerter' => new stdClass(), 'bilder' => new stdClass(), 'letztes' => ''];
if (is_file($file)) { $j = json_decode((string)file_get_contents($file)); if (is_object($j) && isset($j->woerter)) $cur = $j; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = (string)file_get_contents('php://input');
    $b = strlen($raw) <= 60000 ? json_decode($raw) : null;
    if (is_object($b) && isset($b->woerter) && is_object($b->woerter) && isset($b->bilder) && is_object($b->bilder)) {
        $cur = ['woerter' => $b->woerter, 'bilder' => $b->bilder,
                'letztes' => (isset($b->letztes) && is_string($b->letztes)) ? $b->letztes : '',
                'pause' => (isset($b->pause) && is_string($b->pause)) ? $b->pause : ''];
        file_put_contents($file, json_encode($cur, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
}
echo json_encode($cur, JSON_UNESCAPED_UNICODE);
