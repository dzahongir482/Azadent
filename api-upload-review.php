<?php
header("Content-Type: application/json; charset=UTF-8");
$pdo = new PDO("mysql:host=localhost;dbname=dzahon18_azadent;charset=utf8mb4", "dzahon18_azadent", "QcHpvMiNiQKt");

$uploadDir = 'uploads/reviews/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

$doctor_id = $_POST['doctor_id'] ?? '';
$author_name = $_POST['author_name'] ?? '';
$review_text = $_POST['review_text'] ?? ''; // Текст отзыва, если будет

if (!$doctor_id || !$author_name || empty($_FILES['review_image'])) {
    echo json_encode(["success" => false, "error" => "Недостаточно данных"]);
    exit;
}

$ext = pathinfo($_FILES['review_image']['name'], PATHINFO_EXTENSION);
$newName = uniqid('rev_', true) . '.' . $ext;
$targetPath = $uploadDir . $newName;

if (move_uploaded_file($_FILES['review_image']['tmp_name'], $targetPath)) {
    $stmt = $pdo->prepare("INSERT INTO reviews (doctor_id, author_name, review_text, review_image_url) VALUES (?, ?, ?, ?)");
    $stmt->execute([$doctor_id, $author_name, $review_text, $targetPath]);
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Не удалось сохранить изображение"]);
}