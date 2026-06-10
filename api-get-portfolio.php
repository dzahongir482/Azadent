<?php
header("Content-Type: application/json; charset=UTF-8");
$pdo = new PDO("mysql:host=localhost;dbname=dzahon18_azadent;charset=utf8mb4", "dzahon18_azadent", "QcHpvMiNiQKt");

$doctor_id = $_GET['doctor_id'] ?? '';

if (!$doctor_id) {
    echo json_encode([]);
    exit;
}

$stmt = $pdo->prepare("SELECT description, image_before_url, image_after_url FROM portfolio WHERE doctor_id = ? ORDER BY id DESC");
$stmt->execute([$doctor_id]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));