<?php
// Speichert den Lernstand der Perlenbrücke in bruecke.json (gleicher Ordner).
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$file = __DIR__ . '/bruecke.json';
$cur = ['reise' => 0, 'pairs' => new stdClass()];
if (is_file($file)) { $j = json_decode((string)file_get_contents($file)); if (is_object($j) && isset($j->pairs)) $cur = $j; }
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = (string)file_get_contents('php://input');
    $b = strlen($raw) <= 60000 ? json_decode($raw) : null;
    if (is_object($b) && isset($b->pairs) && is_object($b->pairs) && isset($b->reise) && is_int($b->reise) && $b->reise >= 0) {
        $cur = ['reise' => $b->reise, 'pairs' => $b->pairs, 'nextEvent' => (isset($b->nextEvent) && is_int($b->nextEvent)) ? $b->nextEvent : 0];
        file_put_contents($file, json_encode($cur, JSON_PRETTY_PRINT), LOCK_EX);
    }
}
echo json_encode($cur);
