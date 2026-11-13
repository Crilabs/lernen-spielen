<?php
// Speichert den Lernstand des Großbuchstaben-Zauberers in zauber.json (gleicher Ordner).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$file = __DIR__ . '/zauber.json';
$cur = ['woerter' => new stdClass(), 'letzte' => [], 'pause' => ''];
if (is_file($file)) { $j = json_decode((string)file_get_contents($file)); if (is_object($j) && isset($j->woerter)) $cur = $j; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = (string)file_get_contents('php://input');
    $b = strlen($raw) <= 120000 ? json_decode($raw) : null;
    if (is_object($b) && isset($b->woerter) && is_object($b->woerter)) {
        $letzte = (isset($b->letzte) && is_array($b->letzte)) ? array_values(array_filter($b->letzte, 'is_string')) : [];
        $cur = ['woerter' => $b->woerter,
                'letzte' => array_slice($letzte, -40),
                'pause' => (isset($b->pause) && is_string($b->pause)) ? $b->pause : ''];
        file_put_contents($file, json_encode($cur, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
}
echo json_encode($cur, JSON_UNESCAPED_UNICODE);
