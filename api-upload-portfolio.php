<?php
header("Content-Type: application/json; charset=UTF-8");

$host = 'localhost';
$db   = 'dzahon18_azadent'; // Имя твоей базы с последнего скрина
$user = 'dzahon18_azadent'; 
$pass = 'QcHpvMiNiQKt';     // Пароль из твоего sftp.json

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (\PDOException $e) {
    echo json_encode(["success" => false, "error" => "Ошибка БД"]);
    exit;
}

// Создаем папку для картинок, если её нет
$uploadDir = 'uploads/portfolio/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$doctor_id = $_POST['doctor_id'] ?? '';
$description = $_POST['description'] ?? '';

if (!$doctor_id || !$description || empty($_FILES['before']) || empty($_FILES['after'])) {
    echo json_encode(["success" => false, "error" => "Заполнены не все поля"]);
    exit;
}

// Функция для безопасного сохранения файла
function saveUploadedFile($file, $dir) {
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $newName = uniqid('img_', true) . '.' . $ext;
    $targetPath = $dir . $newName;
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return $targetPath;
    }
    return false;
}

$beforeUrl = saveUploadedFile($_FILES['before'], $uploadDir);
$afterUrl = saveUploadedFile($_FILES['after'], $uploadDir);

if (!$beforeUrl || !$afterUrl) {
    echo json_encode(["success" => false, "error" => "Ошибка при сохранении файлов на сервер"]);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO portfolio (doctor_id, description, image_before_url, image_after_url) VALUES (?, ?, ?, ?)");
    $stmt->execute([$doctor_id, $description, $beforeUrl, $afterUrl]);
    echo json_encode(["success" => true]);
} catch (\PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}