<?php
// Speichert den Spielstand in spielstand.json (gleicher Ordner). index.html kann jederzeit ersetzt werden, die Datei bleibt.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$file = __DIR__ . '/spielstand.json';
$default = ['stars' => 0, 'best' => 0, 'rounds' => 0, 'companion' => 0];

$cur = $default;
if (is_file($file)) {
    $j = json_decode((string)file_get_contents($file), true);
    if (is_array($j)) $cur = array_merge($default, $j);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $b = json_decode((string)file_get_contents('php://input'), true);
    if (is_array($b)) {
        foreach ($default as $k => $_) {
            if (isset($b[$k]) && is_int($b[$k]) && $b[$k] >= 0) $cur[$k] = $b[$k];
        }
        file_put_contents($file, json_encode($cur, JSON_PRETTY_PRINT), LOCK_EX);
    }
}
echo json_encode($cur);
