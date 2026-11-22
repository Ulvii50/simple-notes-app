<?php

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   01  |  CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

header('Content-Type: application/json; charset=UTF-8');
date_default_timezone_set('Asia/Baku');

$file = __DIR__ . "/../data/notes.json";

$method = $_SERVER['REQUEST_METHOD'];


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   02  |  HELPER FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function readNotes($file)
{
    if (!file_exists($file)) {
        return [];
    }

    $data = trim(file_get_contents($file));
    if ($data === '') return [];

    $notes = json_decode($data, true);
    return is_array($notes) ? $notes : [];
}

function saveNotes($file, $data)
{
    file_put_contents(
        $file,
        json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

function sendJson($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function readInput()
{
    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        sendJson(['error' => 'Yanlış JSON göndərilib.'], 400);
    }

    return $input;
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   03  |  GET  (hamısını və ya tək qeydi oxu)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

if ($method === 'GET') {
    $notes = readNotes($file);
    $id = trim($_GET['id'] ?? '');

    if ($id !== '') {
        foreach ($notes as $note) {
            if ($note['id'] === $id) {
                sendJson($note);
            }
        }
        sendJson(['error' => 'Qeyd tapılmadı'], 404);
    }

    sendJson($notes);
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   04  |  POST  (yeni qeyd yarat)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

if ($method === 'POST') {
    $input = readInput();

    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');

    if (!$title) {
        sendJson(['error' => 'Zəhmət olmasa başlığı daxil edin!'], 422);
    }

    $notes = readNotes($file);

    $newNote = [
        'id' => bin2hex(random_bytes(8)),
        'title' => $title,
        'content' => $content,
        'date' => date('d-m-Y | H:i'),
        'createdAt' => (int) round(microtime(true) * 1000),
    ];

    $notes[] = $newNote;
    saveNotes($file, $notes);
    sendJson($newNote, 201);
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   05  |  PUT  (qeydi yenilə)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

if ($method === 'PUT') {
    $id = trim($_GET['id'] ?? '');

    if ($id === '') {
        sendJson(['error' => 'Qeydin id-si göndərilməyib.'], 400);
    }

    $input = readInput();
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');

    if (!$title) {
        sendJson(['error' => 'Zəhmət olmasa başlığı daxil edin!'], 422);
    }

    $notes = readNotes($file);

    foreach ($notes as $index => $note) {
        if ($note['id'] === $id) {
            $notes[$index]['title'] = $title;
            $notes[$index]['content'] = $content;

            saveNotes($file, $notes);
            sendJson($notes[$index]);
        }
    }

    sendJson(['error' => 'Qeyd tapılmadı'], 404);
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   06  |  DELETE  (qeydi sil)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

if ($method === 'DELETE') {
    $id = trim($_GET['id'] ?? '');

    if ($id === '') {
        sendJson(['error' => 'Qeydin id-si göndərilməyib.'], 400);
    }

    $notes = readNotes($file);

    foreach ($notes as $index => $note) {
        if ($note['id'] === $id) {
            array_splice($notes, $index, 1);
            saveNotes($file, $notes);
            sendJson(['message' => 'Qeyd uğurla silindi.']);
        }
    }

    sendJson(['error' => 'Silinmək istənən qeyd tapılmadı.'], 404);
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   07  |  UNSUPPORTED METHOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

sendJson(['error' => 'Metod dəstəklənmir.'], 405);
