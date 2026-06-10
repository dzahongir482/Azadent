<?php
header("Content-Type: application/json; charset=UTF-8");
$pdo = new PDO("mysql:host=localhost;dbname=dzahon18_azadent;charset=utf8mb4", "dzahon18_azadent", "QcHpvMiNiQKt");

$stmt = $pdo->query("SELECT name, phone FROM AzaDent ORDER BY id DESC");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));