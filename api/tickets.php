<?php
require_once "config.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $stmt = $pdo->query("SELECT id, room_number as room, tenant_name as tenant, category, issue, priority, status, photo_url as photoUrl, DATE_FORMAT(created_at, "%d %b %Y") as date FROM maintenance_tickets ORDER BY created_at DESC");
    echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
    exit();
}

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = "TK-" . rand(100, 999);
    $room = $data["room"] ?? "Kamar A-03";
    $tenant = $data["tenant"] ?? "Budi Santoso";
    $category = $data["category"] ?? "Pipa / Saluran Air";
    $issue = $data["issue"] ?? "";
    $priority = $data["priority"] ?? "Sedang";
    $status = "diajukan";
    $photoUrl = $data["photoUrl"] ?? "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80";

    if (empty($issue)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Deskripsi wajib diisi"]);
        exit();
    }

    $stmt = $pdo->prepare("INSERT INTO maintenance_tickets (id, room_number, tenant_name, category, issue, priority, status, photo_url) VALUES (:id, :room, :tenant, :category, :issue, :priority, :status, :photo_url)");
    $stmt->execute([
        ":id" => $id, ":room" => $room, ":tenant" => $tenant, 
        ":category" => $category, ":issue" => $issue, 
        ":priority" => $priority, ":status" => $status, ":photo_url" => $photoUrl
    ]);

    echo json_encode([
        "status" => "success",
        "data" => [
            "id" => $id, "room" => $room, "tenant" => $tenant, 
            "category" => $category, "issue" => $issue, 
            "priority" => $priority, "status" => $status, 
            "photoUrl" => $photoUrl, "date" => date("d M Y")
        ]
    ]);
    exit();
}

if ($method === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("UPDATE maintenance_tickets SET status = :status WHERE id = :id");
    $stmt->execute([":status" => $data["status"], ":id" => $data["id"]]);
    echo json_encode(["status" => "success"]);
    exit();
}
