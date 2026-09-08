# Web Dashboard Analisis PiBal (Pilot Balon) & Hodograph

### Stasiun Meteorologi Tunggul Wulung Cilacap (Agustus 2026)
**WMO ID:** 96805 | **ICAO:** WAHL | **Koordinat:** 07°38' LS, 109°01' BT | **Elevasi:** 6 M MSL

Aplikasi Web Dashboard analisis meteorologi interaktif untuk pengamatan Pilot Balon (PiBal), profil angin vertikal, dan diagram hodograph. Dibangun berdasarkan spesifikasi teknis `implementation_requirements.md` dan memproses 21 dokumen PDF pengamatan resmi BMKG Cilacap secara dinamis, akurat, reproducible, dan berbasis bukti (*evidence-based*).

---

## 🌟 Fitur Utama Dashboard

1. **Ringkasan Eksekutif (Overview)**:
   - Metrik utama: 21 observasi harian, 172 level teramati, ketinggian maksimum hingga 35.000 ft, kecepatan puncak 30 kt.
   - Grafik tren harian profil kecepatan dan batas ketinggian balon sepanjang Agustus 2026.
   - Distribusi tugas observer meteorologi (Desi, Agung, Hakim, Suharti, Prawoto, Khamim) dan penyebab terminasi balon (LL, LIC, HZ, BB).
2. **Eksplorasi Data PiBal (Data Explorer)**:
   - Tabel interaktif untuk meninjau 21 dokumen observasi atau 172 baris level ketinggian individual.
   - Filter pencarian teks, pemilihan tanggal, filter observer, dan sorting.
   - Modal detail record yang menampilkan data theodolit menit-ke-menit (azimuth/elevasi), tabel hodograph, serta kode sandi WMO (PPAA & PPBB).
3. **Analisis Hodograph Interaktif (Hodograph Analysis)**:
   - Plot hodograph pada bidang koordinat polar/U-V kartesius.
   - Dilengkapi cincin kecepatan konsentris (range rings 5, 10, 15, 20, 25, 30 kt) dan garis radial arah mata angin.
   - Penanda level dengan kode warna ketinggian dan garis penghubung bertanda panah vektor geser.
   - Tooltip hover dinamis menampilkan detail ketinggian, arah, kecepatan, U, V, V/B, dan adveksi.
   - Mode fleksibel: **Single Observation**, **Dual Observation Comparison**, dan **Multi-Observation Overlay (21 Hari)**.
   - Fitur Zoom In, Zoom Out, dan Reset.
   - **Verifikasi Visual 1:1 Berdampingan (Side-by-Side)** dengan grafik asli dari Halaman 3 dokumen PDF sumber.
4. **Visualisasi 3D Interaktif (D3.js, Three.js WebGL, & Open3D Python Engine)**:
   - **Mesin Grafik 3D D3.js (https://d3js.org/)**: Visualisasi 3D Data-Driven berbasis SVG dengan proyeksi matriks matematis 3D dinamis (*Yaw*, *Pitch*, *Zoom*), gestur interaktif D3 Drag & Zoom, interpolasi warna spektral `d3.interpolateTurbo`, kurva spline `d3.curveCatmullRom`, *depth sorting* (algoritma Painter), serta pemutar simulasi terbang balon.
   - **Mode 3D Hodograph Spiral (U - V - Ketinggian)**: Menggambarkan vektor angin yang naik ke atmosfer secara 3 dimensi membentuk spiral atmosfer vertikal.
   - **Mode 3D Trajektori Terbang Balon**: Rekonstruksi fisik pergerakan balon yang hanyut (*drift*) di atas wilayah Cilacap berdasarkan pembacaan azimuth dan elevasi theodolit menit-ke-menit.
   - **Mesin WebGL Three.js**: Rendering grafis 3D berbasis GPU dengan pencahayaan dinamis, kabut atmosferik, dan kontrol orbit kamera.
   - **Mesin Grafik Open3D (Python Native Desktop & Ekspor PLY)**: Menggunakan library grafis 3D canggih `open3d` untuk visualisasi native OpenGL desktop, panah vektor 3D dengan kalkulasi matriks Rodrigues, cincin kecepatan isotach, serta ekspor model 3D `.ply` untuk seluruh 21 observasi.
   - Dilengkapi pemutar animasi terbang (Play / Pause, slider waktu scrub, kecepatan 1x, 2x, 4x), HUD ketinggian real-time, rotasi 360°, dan sudut pandang preset (Isometrik, Tampak Atas 2D, Depan, Samping, Posisi Observer Tanah).
5. **Visualisasi Bulu Angin (Wind Barbs) & Panduan WMO**:
   - **Profil Vertikal Kolom Sounding**: Visualisasi kolom atmosferik dari permukaan hingga 35.000 ft dengan simbol bulu angin presisi SVG (batang poros, pennant 50 kt, full barb 10 kt, half barb 5 kt, dan lingkaran tenang/calm).
   - **Matriks Waktu-Ketinggian (Time-Height Curtain)**: Matriks synoptic 21 hari x level standar yang memperlihatkan dominasi angin pasat tenggara Monsun Australia di lapisan bawah.
   - **Simulator & Dekomposer Interaktif**: Slider arah dan kecepatan angin dengan dekomposisi otomatis jumlah pennant, bulu panjang, bulu pendek, dan komponen vektor U/V.
   - **Panduan Teori Standar WMO (No. 9 / No. 306)**: Penjelasan anatomi simbol, orientasi asal arah angin (*where wind comes from*), dan kaidah belahan bumi (BBS Cilacap 07°38' LS di sisi kiri batang vs BBU di sisi kanan batang).
6. **Profil Angin Vertikal (Wind Profile)**:
   - 4 grafik vertikal interaktif:
     1. Kecepatan Angin vs Ketinggian
     2. Arah Angin vs Ketinggian
     3. Komponen Zonal U vs Ketinggian
     4. Komponen Meridional V vs Ketinggian
   - Dukungan komparasi antar dua tanggal pengamatan dan toggle satuan (Knot/Feet vs m/s / Meter).
5. **Statistik & Wind Shear**:
   - Metrik statistik lengkap (min, max, mean, median, rentang U dan V).
   - Kartu sorotan lapisan wind shear vertikal paling ekstrem.
   - Tabel analisis shear per lapisan ketebalan ($\Delta z$, $\Delta U$, $\Delta V$, magnitudo vektor shear, laju shear per 1.000 ft, klasifikasi keparahan ICAO, dan adveksi).
6. **Interpretasi Otomatis Berbasis Bukti (Evidence-Based Interpretation)**:
   - Narasi dinamis data-driven untuk profil kecepatan, arah, hodograph, wind shear, dan batasan kualitas data.
   - Kartu temuan (*Evidence Cards*) dengan alur transparan: Klaim $\rightarrow$ Bukti Numerik Terukur $\rightarrow$ Formula & Kalkulasi $\rightarrow$ Interpretasi $\rightarrow$ Dokumen Sumber PDF.
7. **Modul Konklusi Analisis**:
   - Mode 1: Ringkasan Eksekutif ringkas.
   - Mode 2: Kesimpulan mendalam yang menjawab 8 pertanyaan ilmiah wajib dari Bab 25 *implementation requirements*.
8. **Modul Edukasi Meteorologi**:
   - **Panduan PiBal**: Definisi, theodolit, laju kenaikan vertikal balon, formula trigonometri, bedah sandi WMO PPAA & PPBB, dan keterbatasan observasi optik.
   - **Panduan Hodograph**: Konsep koordinat U-V, hukum angin termal (*Thermal Wind Law*), dan penjelasan khusus dinamika Belahan Bumi Selatan (BBS) di mana **Backing = Adveksi Hangat** dan **Veering = Adveksi Dingin**.
9. **Kualitas Data & Audit Keterlacakan (Traceability)**:
   - Audit inventaris 21 file PDF lengkap dengan ukuran file dan hash kriptografi SHA-256.
   - Audit verifikasi konsistensi matematis trigonometri $U$ dan $V$ sumber vs hitungan internal (100% konsisten dengan selisih $\le 0.05$ knot).
10. **Pusat Ekspor & Pelaporan**:
    - Ekspor seluruh dataset olahan ke format CSV (172 records) dan JSON bundle.
    - Generator lembar laporan analisis resmi siap cetak / simpan ke PDF berformat formal BMKG.

---

## 🏗️ Struktur Proyek

```text
├── data/
│   ├── raw/
│   │   └── raw_dataset.json           # Layer 1: Data mentah ekstraksi teks PDF
│   ├── processed/
│   │   └── processed_dataset.json     # Layer 2: Data ternormalisasi & tervalidasi
│   ├── analysis/
│   │   └── analysis_dataset.json      # Layer 3: Data analisis, shear, findings & konklusi
│   ├── extracted_images/              # 21 gambar grafik hodograph asli dari Hal 3 PDF
│   ├── dataset_inventory.json         # Log audit SHA-256 dan metadata 21 file
│   └── pibal_complete_bundle.json     # Bundle data terpadu untuk frontend
├── pipeline/
│   ├── pdf_parser.py                  # Parser PDF modular dinamis & case-insensitive
│   ├── normalizer_validator.py        # Normalisasi satuan, validasi, & audit konsistensi U/V
│   ├── analysis_engine.py             # Engine statistik vertikal & wind shear
│   ├── interpretation_conclusion.py   # Engine narasi bukti numerik & 8 jawaban konklusi
│   └── run_pipeline.py                # Runner eksekusi pipeline data
├── tests/
│   └── test_pipeline.py               # Unit & integration test suite
├── dashboard/                         # Web Dashboard Interaktif (React 18, Vite, Tailwind CSS)
│   ├── src/
│   │   ├── components/                # MetricCard, SourceBadge, dsb.
│   │   ├── views/                     # 10 Tampilan modul analisis
│   │   ├── types/                     # TypeScript interfaces data PiBal
│   │   └── App.tsx                    # Shell navigasi utama
│   └── dist/                          # Production static build
├── run_dashboard.py                   # Script praktis untuk menjalankan web dashboard
├── implementation_requirements.md     # Dokumen spesifikasi teknis acuan
└── README.md
```

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Web Dashboard (Paling Praktis)
Cukup jalankan script Python berikut dari folder proyek:
```bash
python run_dashboard.py
```
*Script ini akan otomatis melayani static bundle dashboard dan membuka browser di `http://localhost:5173`.*

Atau menjalankan dev server Vite langsung:
```bash
cd dashboard
npm run dev
```

### 2. Menjalankan Ulang Pipeline Ekstraksi Data
Apabila Anda menambahkan file PDF baru atau ingin memproses ulang seluruh data:
```bash
python pipeline/run_pipeline.py
```
*Pipeline akan membaca seluruh PDF, melakukan audit trigonometri, menghitung shear, menyusun interpretasi, dan memperbarui file di folder `data/`.*

### 3. Menjalankan Rangkaian Pengujian Otomatis (Tests)
```bash
python -m unittest discover -s tests -p "test_*.py"
```
*Memverifikasi nilai uji trigonometri U/V, arah angular, klasifikasi keparahan wind shear, dan integritas 21 file.*

### 4. Menjalankan Visualisasi 3D Interaktif dengan Open3D
Aplikasi desktop interaktif 3D dengan akselerasi perangkat keras berbasis library `open3d`:
```bash
# 1. Tampilkan jendela 3D Hodograph Spiral (contoh tanggal 12 Agustus 2026):
.venv\Scripts\python.exe visualizer_open3d.py --mode spiral --date 2026-08-12

# 2. Tampilkan trajektori fisik terbang balon 3D (dari azimuth & elevasi theodolit):
.venv\Scripts\python.exe visualizer_open3d.py --mode trajectory --date 2026-08-12

# 3. Tampilkan multi-day overlay (tumpukan 21 hari dalam 1 ruang 3D):
.venv\Scripts\python.exe visualizer_open3d.py --mode overlay

# 4. Ekspor seluruh model 3D PLY (42 file: 21 spiral + 21 trajektori):
.venv\Scripts\python.exe visualizer_open3d.py --export

# 5. Lihat daftar 21 tanggal observasi yang tersedia:
.venv\Scripts\python.exe visualizer_open3d.py --list
```
*Kontrol mouse pada jendela Open3D: Klik Kiri + Geser untuk rotasi kamera 3D, Klik Kanan + Geser untuk pan/geser kanvas, Scroll roda mouse untuk zoom in/out, Tombol `R` untuk reset view, Tombol `W` untuk toggle wireframe.*

---

## 📐 Landasan Ilmiah & Formula Meteorologi

### 1. Komponen Angin Zonal ($U$) dan Meridional ($V$)
Arah angin meteorologi $\theta$ adalah arah *datangnya* angin (0° = Utara, 90° = Timur, 180° = Selatan, 270° = Barat):
$$U = -V_{\text{speed}} \cdot \sin\left(\frac{\theta \cdot \pi}{180}\right)$$
$$V = -V_{\text{speed}} \cdot \cos\left(\frac{\theta \cdot \pi}{180}\right)$$

### 2. Magnitudo Vektor Wind Shear & Laju Geser Vertikal
Antara dua level ketinggian $z_1$ dan $z_2$ ($\Delta z = z_2 - z_1$):
$$|\Delta \vec{V}| = \sqrt{(U_2 - U_1)^2 + (V_2 - V_1)^2} \quad (\text{knot})$$
$$\text{Shear Rate} = \frac{|\Delta \vec{V}|}{\Delta z} \times 1000 \quad (\text{knot per 1.000 ft})$$

Kategori Keparahan:
- **Ringan (Light):** $< 4.0$ kt / 1.000 ft
- **Sedang (Moderate):** $4.0 - 8.0$ kt / 1.000 ft
- **Kuat (Severe):** $> 8.0$ kt / 1.000 ft

### 3. Dinamika Angin Termal di Belahan Bumi Selatan (Cilacap 07°38' LS)
Karena parameter Coriolis $f = 2\Omega \sin(\phi) < 0$:
- **Backing (Rotasi berlawanan arah jarum jam):** $\Delta \theta < 0 \rightarrow$ **Adveksi Hangat (Warm Advection)**
- **Veering (Rotasi searah jarum jam):** $\Delta \theta > 0 \rightarrow$ **Adveksi Dingin (Cold Advection)**
Hal ini memvalidasi 100% konsistensi penamaan adveksi pada laporan resmi BMKG Tunggul Wulung Cilacap.
