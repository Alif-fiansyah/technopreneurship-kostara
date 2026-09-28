CREATE DATABASE IF NOT EXISTS `kostara_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kostara_db`;

CREATE TABLE IF NOT EXISTS `rooms` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `room_number` VARCHAR(20) NOT NULL UNIQUE,
    `floor` INT NOT NULL DEFAULT 1,
    `price_per_month` DECIMAL(12, 2) NOT NULL,
    `status` ENUM("terisi", "kosong") DEFAULT "kosong",
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `tenants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `room_id` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `maintenance_tickets` (
    `id` VARCHAR(20) PRIMARY KEY,
    `room_number` VARCHAR(20) NOT NULL,
    `tenant_name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `issue` TEXT NOT NULL,
    `priority` ENUM("Rendah", "Sedang", "Tinggi") DEFAULT "Sedang",
    `status` ENUM("diajukan", "diproses", "selesai") DEFAULT "diajukan",
    `photo_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `billings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` INT NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `due_date` DATE NOT NULL,
    `status` ENUM("Menunggu", "Lunas", "Terlambat") DEFAULT "Menunggu",
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO `rooms` (`room_number`, `floor`, `price_per_month`, `status`) VALUES
("Kamar A-01", 1, 1450000, "terisi"),
("Kamar A-02", 1, 1450000, "kosong"),
("Kamar A-03", 1, 1450000, "terisi"),
("Kamar B-07", 2, 1600000, "terisi")
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

INSERT INTO `tenants` (`id`, `name`, `phone`, `room_id`) VALUES
(1, "Rian Pratama", "6281311223344", 1),
(2, "Budi Santoso", "6281234567890", 3),
(3, "Annisa Putri", "6281298765432", 4)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `maintenance_tickets` (`id`, `room_number`, `tenant_name`, `category`, `issue`, `priority`, `status`, `photo_url`, `created_at`) VALUES
("TK-101", "Kamar A-03", "Budi Santoso", "Pipa / Saluran Air", "Kran wastafel bocor dan merembes ke lantai bawah.", "Tinggi", "diajukan", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80", "2026-09-28 09:15:00"),
("TK-102", "Kamar B-07", "Annisa Putri", "Kelistrikan & AC", "AC kamar mati mendadak dan keluar dengungan.", "Sedang", "diproses", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80", "2026-09-27 14:30:00"),
("TK-103", "Kamar A-01", "Rian Pratama", "Pintu & Kunci", "Gagang pintu longgar dan anak kunci macet.", "Rendah", "selesai", "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80", "2026-09-25 11:00:00")
ON DUPLICATE KEY UPDATE `status`=VALUES(`status`);

INSERT INTO `billings` (`tenant_id`, `amount`, `due_date`, `status`) VALUES
(2, 1450000, "2026-10-01", "Menunggu"),
(3, 1600000, "2026-10-02", "Menunggu"),
(1, 1450000, "2026-09-25", "Lunas");