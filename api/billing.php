<?php
require_once "config.php";

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT b.id, t.name, r.room_number as room, t.phone, 
                   DATE_FORMAT(b.due_date, "%d %b %Y") as dueDate, 
                   CONCAT("Rp ", FORMAT(b.amount, 0, "id_ID")) as amount, 
                   b.status 
            FROM billings b
            JOIN tenants t ON b.tenant_id = t.id
            JOIN rooms r ON t.room_id = r.id
            ORDER BY b.due_date ASC";
    $stmt = $pdo->query($sql);
    echo json_encode(["status" => "success", "data" => $stmt->fetchAll()]);
    exit();
}
