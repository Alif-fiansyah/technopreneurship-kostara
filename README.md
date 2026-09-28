# 🏢 KOSTARA — Platform Digital Operasional & Maintenance Kost Modern

![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-REST%20API-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Design System](https://img.shields.io/badge/Design-Neubrutalism-FFE600?style=for-the-badge&logoColor=black)

**Kostara** adalah platform web terpadu untuk digitalisasi operasional kost, pengelolaan pemeliharaan fasilitas dua arah (*two-way maintenance verification*), serta monitoring pembayaran sewa bulanan berbasis WhatsApp. 

Dibangun dengan pendekatan desain **Studio-Grade Neubrutalism** (kontras tinggi, garis tebal berbayang solid, dan layout blueprint taktis) yang responsif di seluruh perangkat (desktop, tablet, dan smartphone).

---

## ✨ Fitur Utama

### 1. 🌐 Landing Page & Katalog Sewa Publik
* **Informasi Hunian Komprehensif**: Menampilkan foto unit, sisa ketersediaan kamar, tarif sewa, serta daftar fasilitas kamar & bersama.
* **Akses Strategis**: Jarak tempuh riil ke titik kampus (UNDIP), minimarket, kuliner, dan fasilitas umum.
* **Integrasi Booking Cepat**: Tautan otomatis ke WhatsApp pengelola untuk survei kamar.
* **Gerbang Autentikasi Mandiri**: Modal login terpisah untuk Pengelola dan Penghuni kost dilengkapi fitur bypass akun demo.

### 2. 🔑 Portal Penghuni (Tenant Experience)
* **Status Sewa & Informasi Kamar**: Memantau nomor kamar aktif, fasilitas terpasang, tagihan sewa, dan batas jatuh tempo.
* **Pembayaran Sewa Terpadu**: Modal rekening bank (BCA, Mandiri) dengan tombol salin nomor rekening instan dan konfirmasi transfer via WhatsApp.
* **Formulir Lapor Kerusakan Interaktif**:
  * Pilihan kategori fasilitas & tingkat urgensi komplain.
  * **Slot Waktu Kunjungan Teknisi**: Penghuni dapat menentukan jam izin teknisi masuk kamar (Pagi, Siang/Pulang Kuliah, Sore, atau Bebas Didampingi Penjaga).
  * **Upload Bukti Foto Nyata**: Mengambil foto langsung dari kamera/galeri dengan live thumbnail preview.
* **Sistem Verifikasi Dua Arah (Two-Way Handover)**:
  * Penghuni dapat membandingkan foto saat rusak (*before*) dengan foto hasil kerja tukang (*after*).
  * Tombol validasi: **Sudah Bagus & Berfungsi Normal** (memberi rating bintang) atau **Masih Rusak / Komplain Ulang** (memanggil kembali teknisi).
* **Riwayat Arsip Tuntas**: Laporan yang telah diverifikasi otomatis dipindahkan ke wadah arsip bawah agar tampilan beranda tetap rapi (*zero clutter*).

### 3. 🛠️ Dashboard Pengelola (Owner / Landlord Operations)
* **Kartu Metrik Real-Time**:
  * Okupansi kamar (rasio keterisian unit).
  * Tiket kerusakan aktif yang membutuhkan tindakan.
  * Akumulasi nominal tagihan sewa tertunda secara dinamis.
* **Papan Maintenance Fasilitas (3-Tier Kanban Flow)**:
  * `1. Laporan Masuk`: Tiket baru dari penghuni lengkap dengan foto dan izin jam kunjungan.
  * `2. Sedang Dikerjakan`: Penugasan teknisi dan modal **Upload Bukti Pengerjaan Beres** beserta catatan perbaikan.
  * `3. Riwayat Tuntas`: Tiket yang telah diverifikasi tuntas oleh anak kost.
* **Monitoring Tagihan Sewa & Billing Reminder**:
  * Kirim template pesan WhatsApp penagihan sewa otomatis hanya dengan 1 klik.
  * Tombol **Tandai Lunas** untuk mengonfirmasi penerimaan sewa yang otomatis memperbarui arus kas di metrik utama.
* **Tombol Reset Demo**: Kemudahan reset data tiket dan tagihan ke status semula untuk keperluan demonstrasi atau pengujian.

---

## 🛠️ Tech Stack & Arsitektur

* **Frontend**: React 18, Vite 6+, Tailwind CSS v4, Lucide React (Icons).
* **Backend**: PHP Built-in REST API (`/api`).
* **Database**: MySQL (`kostara.sql`).
* **Data Persistence**: Dual-layer sync (LocalStorage browser + REST API backend fallback).

---

## 🚀 Panduan Instalasi Lokal

### 1. Prasyarat
Pastikan komputer kamu sudah terpasang:
* [Node.js](https://nodejs.org/) (versi 18+)
* [PHP](https://www.php.net/) (versi 8+)
* [MySQL](https://www.mysql.com/)

### 2. Clone Repositori
```bash
git clone https://github.com/USERNAME/kostara.git
cd kostara
```

### 3. Install Dependensi Frontend
```bash
npm install
```

### 4. Setup Database MySQL
1. Buka MySQL client atau phpMyAdmin kamu.
2. Buat database baru bernama `kostara`:
   ```sql
   CREATE DATABASE kostara;
   ```
3. Import file `kostara.sql` yang tersedia di root proyek.

### 5. Menjalankan Server Backend (PHP)
Jalankan built-in server PHP di folder proyek pada port 8000:
```bash
php -S localhost:8000
```

### 6. Menjalankan Frontend (Vite)
Buka terminal baru dan jalankan server pengembangan:
```bash
npm run dev
```
Buka tautan lokal yang muncul (biasanya `http://localhost:5173` atau `http://localhost:5189`) di browser Anda.

---

## 📁 Struktur Direktori

```text
kostara/
├── api/                  # REST API endpoints (PHP)
│   ├── config.php        # Konfigurasi koneksi database MySQL
│   ├── tickets.php       # Endpoint CRUD tiket perbaikan fasilitas
│   └── billing.php       # Endpoint data tagihan sewa
├── public/               # Asset publik statis
├── src/
│   ├── App.jsx           # Komponen inti aplikasi & state controller
│   ├── main.jsx          # Titik masuk render React
│   └── index.css         # Styling global Tailwind & komponen Neubrutalism
├── .gitignore            # Filter berkas yang dikecualikan dari Git
├── kostara.sql           # Skema dan data awal database MySQL
├── package.json          # Pustaka & dependensi proyek
└── vite.config.js        # Konfigurasi bundler Vite
```

---

## 📱 Responsivitas Perangkat

Platform ini dioptimalkan dengan prinsip *Mobile-First Neubrutalism*:
* **Mobile (360px - 480px)**: Modal auto-scroll, bottom navigation nyaman disentuh, preview gambar proporsional.
* **Tablet (768px - 1024px)**: Grid 2 kolom adaptif dengan tabel geser halus.
* **Desktop (1200px+)**: Multi-kolom Kanban penuh, ornamen floating stickers, dan siluet tata kota.

---

## 📄 Lisensi

Proyek ini dikembangkan untuk tujuan penugasan mata kuliah Technopreneurship
