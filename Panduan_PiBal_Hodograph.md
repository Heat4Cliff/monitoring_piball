---
title: "Buku Panduan Komprehensif: Dashboard Analisis PiBal & Upper Air Wind"
author: "Stasiun Meteorologi Tunggul Wulung Cilacap"
date: "Agustus 2026"
---

# BUKU PANDUAN LENGKAP: DASHBOARD ANALISIS PIBAL & HODOGRAPH

## BAB 1: PENGENALAN SISTEM DASHBOARD
Dashboard Analisis PiBal (Pilot Balloon) ini adalah platform berbasis web modern yang dirancang khusus untuk menganalisis data angin permukaan hingga lapisan atas (Upper Air) di Stasiun Meteorologi Tunggul Wulung Cilacap.

### 1.1 Tujuan Pembuatan
1. **Digitalisasi & Visualisasi:** Mengubah data tabel mentah dari observasi PiBal menjadi visualisasi interaktif (2D & 3D).
2. **Monitoring Keselamatan Penerbangan:** Mendeteksi ancaman cuaca signifikan seperti Low-Level Wind Shear (LLWS) secara instan.
3. **Edukasi & Pelatihan:** Menjadi sarana bagi observer/meteorolog baru untuk memahami dinamika atmosfer melalui modul interaktif dan kuis.

### 1.2 Fitur-Fitur Utama
- **Dashboard Utama (Overview):** Menampilkan ringkasan statistik kecepatan puncak angin harian.
- **Visualisasi 3D Trajektori:** Memodelkan jalur terbang balon di ruang tiga dimensi sesungguhnya untuk melihat arah pergerakan angin secara spasial.
- **Analisis Hodograph:** Grafik polar cerdas yang secara otomatis menyimpulkan adanya Veering (adveksi hangat) atau Backing (adveksi dingin).
- **Kontur Hovmöller:** Diagram pemetaan waktu vs ketinggian untuk memonitor anomali profil angin selama satu bulan penuh.
- **Ekspor Data & Traceability:** Menyediakan riwayat transparansi data (QA/QC) dan kemampuan unduh ke CSV.

---

## BAB 2: TEORI DASAR PIBAL (PILOT BALLOON)

### 2.1 Apa itu PiBal?
Pilot Balloon (PiBal) adalah metode observasi cuaca udara atas konvensional. Sebuah balon karet berukuran kecil yang diisi gas (hidrogen/helium) dilepaskan ke udara, kemudian pergerakannya dilacak menggunakan instrumen optik bernama **Theodolit**.

### 2.2 Prinsip Kerja
1. Balon dilepaskan dan diasumsikan naik dengan kecepatan konstan (misal: 150 meter/menit).
2. Observer membaca sudut **Azimuth** (arah horisontal kompas) dan **Elevasi** (ketinggian sudut dari horizon) pada theodolit setiap menit (atau setengah menit).
3. Menggunakan prinsip trigonometri, posisi balon pada setiap menit dihitung menjadi komponen vektor **U (Zonal/Timur-Barat)** dan **V (Meridional/Utara-Selatan)**.
4. Hasil turunan data tersebut menghasilkan Kecepatan Angin (Knot) dan Arah Angin (Derajat) di berbagai lapisan ketinggian (kaki/meter).

### 2.3 Kegunaan untuk Keselamatan Penerbangan
Data PiBal sangat esensial bagi Air Traffic Controller (ATC). Pesawat terbang membutuhkan informasi angin muka (headwind), angin buritan (tailwind), dan angin silang (crosswind) saat fase kritis lepas landas (take-off) dan mendarat (landing).

---

## BAB 3: PEMAHAMAN HODOGRAPH & DINAMIKA ATMOSFER

### 3.1 Konsep Hodograph
Hodograph adalah diagram koordinat polar yang digunakan untuk memvisualisasikan profil angin secara vertikal. Pada hodograph, angin dari setiap lapisan digambar sebagai titik vektor yang dihubungkan dengan sebuah kurva berkelanjutan (dari lapisan paling bawah/permukaan hingga ke atas).
- **Jarak dari pusat (0,0):** Menandakan kecepatan angin (Speed). Semakin jauh dari pusat, angin semakin kencang.
- **Sudut kompas:** Menandakan arah dari mana angin bertiup.

### 3.2 Wind Shear (Pergeseran Angin)
Wind Shear adalah perubahan mendadak kecepatan atau arah angin dalam jarak yang pendek.
- Pada hodograph, panjang garis yang menghubungkan titik level bawah dengan titik di atasnya mewakili besaran **Wind Shear Vector**.
- **LLWS (Low-Level Wind Shear):** Wind shear parah (> 15 knot) pada elevasi di bawah 2.000 kaki. Fenomena ini bisa menyebabkan pesawat kehilangan daya angkat (lift) secara tiba-tiba, sehingga berpotensi menyebabkan kecelakaan saat pendaratan.

### 3.3 Thermal Advection (Veering & Backing)
Sistem web ini mampu mendeteksi profil adveksi termal:
1. **Veering (Adveksi Hangat / Warm Advection):** Arah angin berputar searah jarum jam (clockwise) seiring dengan bertambahnya ketinggian (misal: dari Timur Laut di permukaan berbelok menjadi Selatan di atas). Mengindikasikan udara hangat sedang bergerak masuk, memicu instabilitas atmosfer.
2. **Backing (Adveksi Dingin / Cold Advection):** Arah angin berputar berlawanan arah jarum jam (counter-clockwise) seiring naiknya ketinggian. Mengindikasikan masuknya massa udara dingin, yang cenderung menstabilkan atmosfer atau mengakhiri sistem cuaca buruk.

---

## BAB 4: PANDUAN PENGGUNAAN (USER MANUAL)

1. **Memulai:** Buka localhost:5173 di browser. Anda akan masuk ke halaman "Dashboard".
2. **Memilih Tanggal:** Pada kalender di sebelah kanan, klik tanggal dengan titik merah (menandakan ada data observasi di hari tersebut) untuk memuat data spesifik hari tersebut ke seluruh sistem.
3. **Menganalisis Hodograph:** 
   - Klik tab "Analisis Hodograph".
   - Putar roda mouse (scroll) untuk memperbesar/memperkecil grafik (Zoom In/Out).
   - Lihat "Panel Kesimpulan Profil" di kanan bawah untuk mengetahui status rotasi (Veering/Backing).
4. **Melihat Tren Sebulan (Hovmöller):**
   - Klik tab "Kontur Hovmöller". 
   - Di sini Anda dapat mengubah tampilan ke Kecepatan, U-Wind, atau V-Wind. Warna merah menunjukkan area angin sangat kencang.
5. **Simulasi Angin Secara 3D:**
   - Klik "Visualisasi 3D". Tahan klik kiri mouse untuk merotasi ruang pandang, dan gunakan scroll mouse untuk mendekatkan pandangan ke balon.
6. **Ekspor Data Analisis:**
   - Masuk ke "Data Table", klik "Ekspor CSV" untuk mengunduh data mentah.
   - Atau masuk ke "Ekspor & Laporan" untuk mencetak laporan akhir (Print to PDF).

---

## BAB 5: KESIMPULAN
Sistem Dashboard Analisis PiBal ini merevolusi cara observer dan prakirawan BMKG dalam membedah data cuaca harian. Melalui pendekatan visual yang interaktif (2D ECharts & 3D WebGL) serta kecerdasan analisis otomatis, waktu yang diperlukan untuk mengidentifikasi potensi bahaya penerbangan dipangkas secara drastis, menjamin pelayanan keselamatan udara yang lebih modern, cepat, dan presisi.

---
*Dihasilkan secara otomatis oleh sistem AI Dashboard PiBal (2026).*
