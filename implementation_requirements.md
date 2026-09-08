# Implementation Requirements

## Web Dashboard Analisis PiBal (Pilot Balon)

**Dokumen:** `implementation_requirements.md`  
**Status:** Draft Technical Specification  
**Sumber Data Utama:** `8 Agustus 2026(1).zip`  
**Domain:** Meteorologi, Analisis Profil Angin, Hodograph, Pilot Balon

---

## 1. Tujuan Proyek

Proyek ini bertujuan membangun Web Dashboard Analisis PiBal (Pilot Balon) yang dapat mengambil data pengamatan dari dokumen PDF, mengubahnya menjadi dataset terstruktur, melakukan validasi dan analisis, menampilkan visualisasi meteorologi interaktif, serta menghasilkan interpretasi dan konklusi berbasis data.

Dashboard harus memiliki dua fungsi utama:

1. **Analytical Dashboard**, untuk eksplorasi data, perhitungan parameter, visualisasi profil angin, dan hodograph.
2. **Educational Dashboard**, untuk menjelaskan PiBal, hodograph, metode analisis, interpretasi, dan keterbatasan hasil.

Prinsip utama implementasi adalah **data-driven, traceable, reproducible, scientifically defensible, maintainable, dan tidak mengarang data**.

---

## 2. Data Source

### 2.1 Sumber Data Utama

Gunakan file berikut sebagai sumber data utama:

```text
8 Agustus 2026(1).zip
```

Hasil inspeksi awal menunjukkan ZIP berisi **21 file PDF PiBal**. File berada pada folder internal `8 Agustus 2026/`.

Contoh nama file yang tersedia:

```text
2026080106_pibal.pdf
2026080206_pibal.pdf
2026080306_pibal.pdf
2026080406_pibal.pdf
2026080506_pibal.pdf
2026080606_pibal.pdf
2026080906_pibaL.pdf
2026081006_pibal.pdf
2026081206_pibal.pdf
2026081406_pibal.pdf
2026081506_pibal.pdf
2026081606_pibal.pdf
2026081706_pibal.pdf
2026081806_pibal.pdf
2026082006_pibal.pdf
2026082106_pibal.pdf
2026082206_pibal.pdf
2026082306_pibal.pdf
2026082406_pibal.pdf
2026082506_pibal.pdf
2026082606_pibal.pdf
```

Nama file harus diperlakukan secara **case-insensitive**, karena terdapat variasi seperti `pibal` dan `pibaL`.

> Jumlah 21 file merupakan kondisi dataset yang tersedia saat requirement ini disusun. Implementasi harus tetap dinamis agar dapat memproses jumlah file yang berbeda pada dataset berikutnya.

### 2.2 Karakteristik Dataset yang Telah Diverifikasi

Inspeksi beberapa PDF menunjukkan format dokumen yang konsisten secara umum dan memuat:

- Identitas UPT/stasiun.
- MSL.
- Tanggal pengamatan.
- Waktu pengamatan, pada dataset ini 06 UTC.
- Observer.
- Alasan/status observasi tertentu.
- Record pengamatan PiBal.
- Kode PPAA.
- Kode PPBB.
- Tabel `LAPORAN HODOGRAPH`.
- Height.
- Wind Direction atau `Arah`.
- Wind Speed atau `Kec.`.
- Komponen `U`.
- Komponen `V`.
- `V/B`, yang pada data contoh berisi informasi perubahan arah seperti `veering` atau `backing`.
- Informasi `Adveksi`, misalnya `Adveksi Dingin` atau `Adveksi Hangat`.

Contoh metadata yang ditemukan pada dokumen:

```text
UPT     : Stamet Tunggul Wulung Cilacap
MSL     : 6 M
Tanggal : 15 Agu 2026 06 UTC
```

Contoh tabel hodograph yang ditemukan:

```text
No. Height   Arah   Kec.      U       V       V/B        Adveksi
0      0      140    08     -5.14    6.13
1   1000      140    11     -7.07    8.43    backing    Adveksi Hangat
2   2000      120    09     -7.79    4.50    backing    Adveksi Hangat
...
```

Contoh tersebut hanya digunakan untuk mendokumentasikan struktur yang telah ditemukan. Parser tetap harus membaca struktur aktual setiap file dan tidak boleh menganggap semua file selalu identik.

---

## 3. Dataset Inspection Requirement

Sebelum implementasi parser final, sistem atau developer harus melakukan inspeksi terhadap **seluruh PDF** yang berada di dalam ZIP.

Inspeksi minimal harus menemukan:

- Jumlah file.
- Nama file.
- Ukuran file.
- Status file dapat dibaca atau tidak.
- Stasiun/UPT.
- Tanggal.
- Waktu observasi.
- Observer.
- Struktur record PiBal.
- Struktur tabel hodograph.
- Nama kolom.
- Satuan.
- Nilai missing.
- Format numeric.
- Format arah angin.
- Format kecepatan angin.
- Format altitude.
- Kode PPAA/PPBB jika akan digunakan.
- Informasi `V/B`.
- Informasi adveksi.

Output inspeksi harus disimpan dalam bentuk metadata dataset sehingga proses ekstraksi dapat diaudit.

---

## 4. Pipeline Data

Gunakan alur berikut sebagai arsitektur data utama:

```text
ZIP
 ↓
PDF Discovery
 ↓
PDF Parsing
 ↓
Data Extraction
 ↓
Raw Dataset
 ↓
Validation
 ↓
Cleaning
 ↓
Normalization
 ↓
Processed Dataset
 ↓
Analysis Engine
 ↓
Visualization
 ↓
Interpretation Engine
 ↓
Conclusion Engine
 ↓
Web Dashboard
```

Setiap tahap harus terpisah secara modular dan dapat diuji secara independen.

---

## 5. PDF Extraction

### 5.1 ZIP Processing

Sistem harus:

- Membuka ZIP.
- Menemukan seluruh file PDF secara rekursif.
- Tidak bergantung pada jumlah file tertentu.
- Mengabaikan file non-PDF yang tidak relevan.
- Menyimpan daftar file yang ditemukan.
- Mencatat file yang gagal diproses.
- Mempertahankan path dan nama file sumber.

### 5.2 PDF Parsing

Gunakan pendekatan extraction berbasis teks atau tabel terlebih dahulu.

OCR hanya digunakan sebagai fallback apabila data tidak dapat diperoleh secara terstruktur.

Parser harus mampu menangani:

- Header PDF.
- Metadata pengamatan.
- Record PiBal.
- Section `LAPORAN HODOGRAPH`.
- Baris data altitude dan angin.
- Pemisahan nilai numerik dari label teks.
- Baris lanjutan seperti `Adveksi Hangat` atau `Adveksi Dingin`.
- PDF yang memiliki perbedaan kecil dalam format.

### 5.3 Parser Output

Setiap file harus menghasilkan object terstruktur minimal:

```text
source
metadata
observations
hodograph_rows
quality
parsing_status
```

---

## 6. Raw Dataset, Processed Dataset, dan Analysis Dataset

Gunakan tiga lapisan dataset.

### 6.1 Raw Dataset

Menyimpan hasil ekstraksi sedekat mungkin dengan dokumen sumber.

### 6.2 Processed Dataset

Digunakan untuk:

- cleaning,
- normalization,
- unit conversion,
- sorting,
- duplicate handling,
- validation.

### 6.3 Analysis Dataset

Digunakan oleh engine analisis untuk:

- U/V component,
- hodograph,
- vertical profile,
- statistics,
- wind shear,
- interpretation,
- conclusion.

Data raw tidak boleh ditimpa oleh hasil preprocessing.

---

## 7. Source Traceability

Source traceability adalah requirement wajib.

Setiap hasil harus dapat ditelusuri melalui rantai:

```text
PDF Source
 ↓
Source ID
 ↓
Extracted Record
 ↓
Processed Record
 ↓
Analysis Input
 ↓
Analysis Result
 ↓
Chart / Hodograph Point
 ↓
Finding
 ↓
Interpretation
 ↓
Conclusion
```

### 7.1 Metadata Sumber Minimal

Setiap record minimal mempunyai:

```text
source_file
source_path
source_id
observation_date
observation_time
station
record_id
```

Apabila tersedia, tambahkan:

```text
page_number
table_name
row_number
```

### 7.2 User-facing Traceability

Ketika pengguna membuka data atau grafik, dashboard harus menyediakan informasi sumber.

Contoh:

```text
Source File: 2026081506_pibal.pdf
Station: Stamet Tunggul Wulung Cilacap
Observation: 15 Agu 2026 06 UTC
Altitude: 2000 m
Wind Direction: 120°
Wind Speed: 09
U: -7.79
V: 4.50
```

Untuk hasil analisis agregat, tampilkan daftar file/observasi yang menjadi input.

---

## 8. Data Model

Buat model data dengan struktur konseptual:

```text
Observation
├── Metadata
├── Wind
├── AtmosphericParameters
├── Quality
└── Source
```

### 8.1 Observation Metadata

| Field | Type | Required | Description |
|---|---|---:|---|
| observation_id | string | Yes | Identifier unik observasi |
| source_id | string | Yes | Identifier sumber |
| source_file | string | Yes | Nama PDF sumber |
| observation_date | date | Yes | Tanggal observasi |
| observation_time | time | Yes | Waktu observasi |
| station | string | Yes | Nama stasiun/UPT |
| observer | string | No | Nama observer jika tersedia |
| msl | number | No | MSL dari dokumen |

### 8.2 Wind Data

| Field | Type | Required | Description |
|---|---|---:|---|
| altitude | number | Yes | Ketinggian observasi |
| wind_direction | number | Yes* | Arah angin |
| wind_speed | number | Yes* | Kecepatan angin |
| u_component | number | No* | Komponen U |
| v_component | number | No* | Komponen V |
| vb | string | No | Veering/Backing jika tersedia |
| advection | string | No | Informasi adveksi jika tersedia |

`Yes*` berarti wajib apabila field tersebut tersedia pada sumber dan diperlukan oleh analisis terkait.

### 8.3 Quality Information

| Field | Type | Description |
|---|---|---|
| quality_status | enum | valid, invalid, missing, suspicious |
| validation_notes | string | Catatan validasi |
| parsing_status | enum | success, partial, failed |

---

## 9. Data Validation

Validasi wajib dilakukan sebelum data dipakai untuk analisis.

Validasi meliputi:

- tipe data,
- altitude numeric,
- wind direction dalam rentang yang valid,
- wind speed numeric,
- konsistensi unit,
- missing value,
- duplicate record,
- urutan altitude,
- konsistensi source metadata,
- konsistensi U/V terhadap arah dan kecepatan apabila U/V tersedia.

Status data:

```text
VALID
INVALID
MISSING
SUSPICIOUS
```

Data suspicious tidak boleh langsung dihapus.

---

## 10. Data Normalization

Normalisasi harus meliputi:

- format tanggal,
- format waktu,
- numeric parsing,
- whitespace,
- pemisah desimal,
- unit,
- arah angin,
- kecepatan angin,
- altitude,
- label `veering/backing`,
- label adveksi.

Jika dilakukan konversi unit, catat:

```text
original_value
original_unit
normalized_value
normalized_unit
conversion_formula
```

---

## 11. Handling Missing dan Invalid Data

Sistem harus membedakan:

```text
NULL / missing
Invalid
Not available
Not applicable
Unparsed
```

Jika data tidak cukup untuk analisis tertentu, tampilkan status seperti:

```text
Insufficient Data
```

Jangan menghasilkan nilai fiktif.

---

## 12. Dashboard Overview

Dashboard utama harus menampilkan ringkasan dataset.

Minimal:

- jumlah file PDF,
- jumlah observasi,
- rentang tanggal,
- waktu pengamatan,
- station/UPT,
- altitude minimum,
- altitude maksimum,
- wind speed minimum,
- wind speed maksimum,
- wind speed rata-rata,
- jumlah record valid,
- jumlah record invalid,
- missing values,
- jumlah file berhasil diproses,
- jumlah file gagal diproses.

Tambahkan summary hasil analisis.

---

## 13. Dataset Explorer

Sediakan halaman eksplorasi dataset.

### Fitur

- Table view.
- Search.
- Sorting.
- Pagination.
- Filter tanggal.
- Filter waktu.
- Filter station.
- Filter altitude.
- Filter source file.
- Filter quality status.
- Detail record.

Setiap record harus dapat membuka informasi sumbernya.

---

## 14. Hodograph Analysis

Modul utama dashboard adalah **Hodograph Analysis**.

Hodograph harus menampilkan perubahan vektor angin berdasarkan ketinggian pada bidang U-V.

### 14.1 Elemen Visual

- U axis.
- V axis.
- Grid.
- Zero reference.
- Marker per level.
- Connecting line antar-level.
- Label altitude.
- Tooltip.
- Legend.
- Zoom.
- Pan.
- Reset view.

### 14.2 Tooltip

Tooltip minimal menampilkan:

```text
Altitude
Wind Direction
Wind Speed
U
V
Observation Time
Source File
```

### 14.3 Multi-observation

Apabila filter memungkinkan beberapa observasi, sediakan mode untuk:

- single observation,
- comparison antar tanggal,
- overlay beberapa hodograph.

Overlay harus tetap menjaga kejelasan visual dan identitas masing-masing observasi.

---

## 15. U/V Component Calculation

Apabila data U dan V tersedia dalam PDF, nilai sumber harus disimpan dan dapat dibandingkan dengan hasil kalkulasi internal.

Jika U/V tidak tersedia atau perlu dihitung ulang, gunakan konvensi meteorologi yang benar untuk transformasi wind speed dan meteorological wind direction menjadi komponen U dan V.

Dokumentasi formula wajib menjelaskan:

- definisi arah angin meteorologi,
- referensi utara,
- fungsi trigonometri yang digunakan,
- tanda positif/negatif,
- satuan,
- pembulatan.

Perhitungan harus diuji dengan known-value test.

### 15.1 Consistency Check

Jika sumber memiliki U/V dan aplikasi menghitung ulang U/V, buat pemeriksaan:

```text
source_U vs calculated_U
source_V vs calculated_V
```

Jika perbedaan melebihi toleransi yang ditetapkan, beri status warning dan jangan diam-diam mengganti nilai sumber.

---

## 16. Vertical Wind Profile

Sediakan minimal empat visualisasi.

### 16.1 Wind Speed vs Altitude

- X: Wind Speed.
- Y: Altitude.
- Satuan ditampilkan.

### 16.2 Wind Direction vs Altitude

- X: Wind Direction.
- Y: Altitude.

### 16.3 U vs Altitude

- X: U.
- Y: Altitude.

### 16.4 V vs Altitude

- X: V.
- Y: Altitude.

Semua grafik harus menggunakan data aktual hasil processing.

---

## 17. Statistical Analysis

Hitung statistik sesuai ketersediaan data.

Minimal:

- jumlah level,
- minimum altitude,
- maksimum altitude,
- minimum wind speed,
- maksimum wind speed,
- mean wind speed,
- median wind speed,
- perubahan wind direction,
- perubahan wind speed,
- perubahan U,
- perubahan V.

Bila tersedia secara valid, tambahkan metrik wind shear.

Setiap statistik harus mempunyai definisi formula dan sumber input.

---

## 18. Wind Shear Analysis

Sediakan analisis perubahan angin secara vertikal.

Dokumentasikan:

- definisi wind shear,
- metode perhitungan,
- interval ketinggian,
- input U/V,
- satuan,
- metode agregasi,
- interpretasi.

Jangan menganggap satu threshold sebagai kebenaran universal. Threshold yang digunakan harus memiliki sumber ilmiah atau dinyatakan sebagai parameter analisis internal.

Jika data tidak cukup, tampilkan `Insufficient Data`.

---

## 19. Analisis Veering dan Backing

Karena PDF aktual memuat field `V/B`, dashboard harus menyediakan opsi untuk menampilkan informasi:

- `veering`,
- `backing`,
- atau status lain yang memang muncul pada sumber.

Jangan menghitung ulang label tersebut tanpa mendokumentasikan metodenya.

Jika label berasal langsung dari PDF, tandai sebagai **source-derived value**.

Jika label dihitung dari data, tandai sebagai **derived value**.

---

## 20. Analisis Adveksi

Jika informasi adveksi tersedia pada data sumber, simpan dan tampilkan.

Contoh yang telah ditemukan:

```text
Adveksi Hangat
Adveksi Dingin
```

Dashboard harus membedakan antara:

```text
Source-derived Advection
Calculated/derived Advection
```

Jangan menghasilkan kesimpulan adveksi baru tanpa metode yang terdokumentasi.

---

## 21. Educational Section: Apa Itu PiBal?

Sediakan halaman edukasi yang menjelaskan:

- definisi PiBal/Pilot Balon,
- tujuan pengamatan,
- gambaran proses observasi,
- bagaimana informasi angin diperoleh,
- data apa yang dihasilkan,
- hubungan PiBal dengan profil vertikal atmosfer,
- kegunaan data PiBal dalam analisis meteorologi.

Penjelasan harus ilmiah tetapi mudah dipahami.

---

## 22. Educational Section: Apa Itu Hodograph?

Sediakan halaman khusus **Apa Itu Hodograph?**.

Jelaskan:

- definisi hodograph,
- sejarah/penggunaan secara singkat,
- tujuan penggunaan,
- hubungan dengan sounding dan PiBal,
- U component,
- V component,
- wind speed,
- wind direction,
- arti titik,
- arti lintasan,
- arti altitude,
- perubahan arah terhadap ketinggian,
- perubahan kecepatan terhadap ketinggian,
- wind shear,
- veering,
- backing,
- cara membaca hodograph,
- contoh interpretasi,
- keterbatasan.

Gunakan terminologi meteorologi yang tepat dan konsisten.

---

## 23. Automatic Interpretation Engine

Sistem harus menghasilkan narasi yang berasal dari hasil analisis aktual.

Interpretasi minimal mencakup:

### 23.1 Profil Kecepatan Angin

Jelaskan bagaimana kecepatan angin berubah terhadap ketinggian.

### 23.2 Profil Arah Angin

Jelaskan perubahan arah angin terhadap ketinggian.

### 23.3 Hodograph

Jelaskan pola lintasan hodograph dan perubahan komponen U/V.

### 23.4 Wind Shear

Jelaskan perubahan vektor angin terhadap interval ketinggian yang dianalisis.

### 23.5 Data Quality

Sertakan peringatan jika data memiliki keterbatasan.

Narasi harus bersifat dynamic dan data-driven. Jangan memakai paragraf statis yang menghasilkan kesimpulan identik untuk setiap dataset.

---

## 24. Evidence-Based Interpretation

Setiap finding utama harus dapat dikaitkan dengan evidence numerik.

Gunakan pola:

```text
Finding
 ↓
Supporting Data
 ↓
Calculation
 ↓
Interpretation
```

Contoh struktur UI:

```text
Finding
Kecepatan angin meningkat pada rentang ketinggian tertentu.

Evidence
Altitude A : X m/s
Altitude B : Y m/s

Difference
ΔV = Y - X

Interpretation
...

Source
source_file.pdf
```

Tujuannya agar pengguna dapat memahami alasan di balik setiap kesimpulan.

---

## 25. Conclusion Engine

Buat modul **Konklusi Analisis PiBal**.

Input:

```text
Dataset
Statistics
Wind Profile
Hodograph
Wind Shear
Veering/Backing
Advection
Data Quality
```

Konklusi harus menjawab:

1. Bagaimana karakteristik angin secara vertikal?
2. Bagaimana perubahan kecepatan angin?
3. Bagaimana perubahan arah angin?
4. Apa yang terlihat pada hodograph?
5. Di mana perubahan paling jelas terjadi?
6. Apa hasil analisis wind shear?
7. Apakah terdapat keterbatasan data?
8. Apa temuan utama yang paling dapat dipertanggungjawabkan?

### 25.1 Format Konklusi

Sediakan dua mode:

- **Summary**, satu paragraf ringkas.
- **Detailed Conclusion**, beberapa paragraf dengan evidence numerik.

Konklusi harus menyatakan batasan analisis.

---

## 26. Scientific Constraints

Requirement ilmiah berikut bersifat wajib:

- Jangan mengarang data.
- Jangan mengubah nilai sumber tanpa jejak transformasi.
- Jangan menghilangkan data tanpa alasan.
- Jangan menggunakan parameter yang tidak tersedia sebagai fakta observasi.
- Jangan menghasilkan kesimpulan tanpa evidence.
- Pisahkan source-derived values dan derived values.
- Cantumkan satuan.
- Gunakan konvensi meteorologi yang benar.
- Dokumentasikan formula.
- Dokumentasikan asumsi.
- Dokumentasikan keterbatasan.
- Jika data tidak cukup, tampilkan status keterbatasan.
- Jangan mengubah interpretasi menjadi klaim fenomena yang tidak didukung data.

---

## 27. UI/UX Requirements

Dashboard harus:

- responsive,
- clean,
- readable,
- konsisten,
- dapat digunakan pada desktop/laptop,
- memiliki hierarchy informasi yang jelas,
- memiliki tooltip informatif,
- menggunakan terminology dan unit yang konsisten.

### 27.1 Struktur Navigasi

```text
Overview
Data PiBal
Hodograph Analysis
Wind Profile
Statistics
Interpretation
Hodograph Guide
Conclusion
Data Quality
Dataset Information
```

---

## 28. Filtering dan Interaction

Pengguna harus dapat:

- memilih tanggal,
- memilih waktu,
- memilih station,
- memilih source file,
- memilih rentang altitude,
- memilih parameter,
- memilih satu observasi,
- membandingkan observasi jika dataset memungkinkan,
- reset filter,
- zoom grafik,
- pan grafik,
- hover marker,
- membuka detail record.

Semua grafik yang relevan harus bereaksi terhadap filter.

---

## 29. Dashboard State

State filter minimal:

```text
selectedDate
selectedObservation
selectedStation
selectedSource
altitudeRange
selectedParameters
comparisonMode
```

State harus konsisten antara:

- table,
- hodograph,
- vertical profile,
- statistics,
- interpretation,
- conclusion.

---

## 30. Technical Architecture

Gunakan architecture modular.

```text
Frontend
    ↓
Application/API Layer
    ↓
Analysis Layer
    ↓
Processing Layer
    ↓
PDF Extraction Layer
    ↓
Data Storage
```

Pisahkan logic:

```text
pdf-parser
metadata-parser
table-parser
normalizer
validator
u-v-calculator
hodograph-engine
wind-profile-engine
statistics-engine
wind-shear-engine
interpretation-engine
conclusion-engine
```

Jangan menaruh seluruh business logic di UI component.

---

## 31. API Requirements

Jika menggunakan backend/API, minimal pertimbangkan:

```text
GET /sources
GET /observations
GET /observations/{id}
GET /statistics
GET /hodograph
GET /wind-profile
GET /analysis
GET /interpretation
GET /conclusion
GET /data-quality
```

Setiap endpoint harus mendokumentasikan:

- purpose,
- method,
- query parameter,
- response schema,
- HTTP status,
- error schema.

---

## 32. Data Processing Service

Data processing service bertanggung jawab atas:

1. PDF discovery.
2. Text extraction.
3. Table extraction.
4. Field mapping.
5. Date/time parsing.
6. Numeric parsing.
7. Unit normalization.
8. Validation.
9. Quality classification.
10. Deduplication.
11. Sorting altitude.
12. Persistence.

Service harus dapat dijalankan tanpa frontend untuk kebutuhan testing.

---

## 33. Analysis Service

Analysis service harus menyediakan fungsi terpisah untuk:

```text
calculateUV()
calculateStatistics()
calculateWindShear()
buildHodograph()
buildVerticalProfile()
identifyWindChanges()
generateInterpretation()
generateConclusion()
```

Setiap fungsi harus memiliki unit test.

---

## 34. Reproducibility

Hasil analisis harus reproducible.

Dengan input dan filter yang sama, sistem harus menghasilkan hasil analisis yang konsisten.

Catat:

```text
input dataset
processing version
analysis method
parameters
formula/version
output timestamp
```

---

## 35. Error Handling

Tangani minimal:

- ZIP tidak ditemukan.
- ZIP corrupt.
- PDF corrupt.
- PDF kosong.
- PDF tidak memiliki data.
- Table extraction gagal.
- Kolom tidak ditemukan.
- Data invalid.
- Data kosong setelah filter.
- Perhitungan gagal.
- API error.
- Chart rendering error.

Error harus informatif.

Contoh:

```text
File 2026080906_pibaL.pdf berhasil ditemukan, tetapi sebagian data tidak dapat diparsing.
Silakan periksa status parsing dan data quality untuk detail.
```

---

## 36. Security Requirements

Walaupun dataset dapat berasal dari lingkungan internal, implementasi harus menerapkan:

- file type validation,
- file size validation,
- safe extraction dari ZIP,
- path traversal protection,
- safe PDF processing,
- input validation,
- sanitization,
- API security,
- access control bila diperlukan,
- logging.

Jangan mengeksekusi file hasil upload sebagai executable.

---

## 37. Export dan Reporting

Sediakan requirement untuk:

- Export CSV.
- Export processed dataset.
- Export chart.
- Export analysis summary.
- Print report.
- PDF report.

### 37.1 Isi Report

```text
Observation Metadata
Dataset Summary
Data Quality
Wind Profile
Hodograph
Statistics
Wind Shear
Veering/Backing
Advection
Interpretation
Conclusion
Source Information
```

Laporan harus tetap menyertakan source traceability.

---

## 38. Testing Requirements

### 38.1 Unit Test

Uji:

- PDF parser.
- Metadata parser.
- Table parser.
- Numeric parser.
- Validation.
- Normalization.
- U/V calculation.
- Statistics.
- Wind shear.
- Interpretation.
- Conclusion.

### 38.2 Integration Test

Uji alur lengkap:

```text
ZIP
→ PDF Discovery
→ PDF Extraction
→ Raw Dataset
→ Validation
→ Processed Dataset
→ Analysis
→ Visualization
→ Interpretation
→ Conclusion
```

### 38.3 Visualization Test

Pastikan:

- altitude benar,
- marker benar,
- U/V benar,
- tooltip benar,
- axis benar,
- source benar,
- filtering benar.

### 38.4 Edge Cases

Uji:

- missing altitude,
- missing wind speed,
- missing direction,
- zero wind speed,
- satu level data,
- duplicate altitude,
- duplicate record,
- PDF corrupt,
- PDF kosong,
- struktur PDF berbeda,
- file gagal diekstraksi.

---

## 39. Acceptance Criteria

Aplikasi dianggap memenuhi requirement utama apabila:

### Data

- Semua PDF valid di dalam ZIP dapat ditemukan.
- File dengan variasi kapitalisasi nama tetap diproses.
- File yang gagal diproses tercatat.
- Data hasil ekstraksi tersimpan secara terstruktur.
- Source file tercatat pada setiap record.

### Processing

- Raw dan processed dataset terpisah.
- Validation berjalan.
- Missing dan invalid data teridentifikasi.
- Data altitude dapat diurutkan.

### Analysis

- U/V dapat digunakan secara konsisten.
- Hodograph dapat dibuat.
- Wind profile dapat dibuat.
- Statistik dapat dihitung.
- Wind shear dapat dianalisis jika data memadai.

### Interpretation

- Interpretasi menggunakan data aktual.
- Finding memiliki evidence.
- Conclusion menggunakan hasil analisis.
- Insufficient data ditampilkan apabila diperlukan.

### Traceability

- Pengguna dapat mengetahui PDF sumber.
- Hasil analisis dapat ditelusuri ke input.
- Transformasi data dapat ditelusuri.

---

## 40. Implementation Phases

### Phase 1 - Dataset Inspection

**Output:** Dataset inventory dan mapping awal.

### Phase 2 - ZIP & PDF Processing

**Output:** Parser dan extraction pipeline.

### Phase 3 - Raw Dataset

**Output:** Structured raw dataset.

### Phase 4 - Validation & Normalization

**Output:** Processed dataset.

### Phase 5 - Data Storage

**Output:** Persistent dataset layer.

### Phase 6 - Analysis Engine

**Output:** Statistics, U/V, wind shear, profile.

### Phase 7 - Hodograph Engine

**Output:** Interactive hodograph.

### Phase 8 - Dashboard UI

**Output:** Data Explorer dan Dashboard.

### Phase 9 - Educational Module

**Output:** PiBal Guide dan Hodograph Guide.

### Phase 10 - Interpretation & Conclusion

**Output:** Evidence-based interpretation dan conclusion engine.

### Phase 11 - Export & Reporting

**Output:** CSV/PNG/PDF report.

### Phase 12 - Testing

**Output:** Automated tests dan validation report.

### Phase 13 - Deployment

**Output:** Production-ready application.

Setiap fase harus memiliki:

```text
Objective
Tasks
Dependencies
Deliverables
Definition of Done
```

---

## 41. Recommended Project Structure

Struktur berikut menjadi baseline dan dapat disesuaikan dengan framework.

```text
project-root/
├── docs/
│   └── implementation_requirements.md
├── data/
│   ├── raw/
│   ├── processed/
│   └── exports/
├── src/
│   ├── components/
│   ├── pages/
│   ├── features/
│   │   ├── observations/
│   │   ├── hodograph/
│   │   ├── wind-profile/
│   │   ├── statistics/
│   │   ├── interpretation/
│   │   └── conclusion/
│   ├── services/
│   │   ├── pdf-parser/
│   │   ├── data-processing/
│   │   ├── analysis/
│   │   └── api/
│   ├── lib/
│   ├── types/
│   └── utils/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── README.md
```

---

## 42. Visualization Requirements

Gunakan visualisasi yang relevan dan tidak berlebihan.

Setiap grafik wajib mempunyai:

- title,
- axis label,
- unit,
- tooltip,
- source context,
- legend jika diperlukan,
- clear zero/reference line jika relevan.

Visualisasi utama:

1. Hodograph.
2. Wind Speed vs Altitude.
3. Wind Direction vs Altitude.
4. U vs Altitude.
5. V vs Altitude.
6. Summary statistics.
7. Data quality summary.

---

## 43. Accessibility

Dashboard harus mempertimbangkan:

- keyboard navigation,
- readable typography,
- sufficient contrast,
- tooltip alternatif untuk data penting,
- tabel sebagai alternatif data grafik,
- semantic labels,
- focus state.

Informasi penting tidak boleh hanya dibedakan berdasarkan warna.

---

## 44. Performance Requirements

Untuk dataset 21 PDF seperti kondisi sumber awal, aplikasi harus dapat memuat data dashboard tanpa pemrosesan ulang PDF setiap kali halaman dibuka.

Gunakan strategi:

```text
PDF
 ↓
Preprocess Once
 ↓
Structured Dataset
 ↓
Cache/Storage
 ↓
Dashboard Reads Structured Data
```

Re-processing hanya dilakukan ketika:

- source dataset berubah,
- user menjalankan ingestion ulang,
- parser version berubah,
- atau developer melakukan reprocessing.

---

## 45. Dataset Versioning

Simpan metadata versi dataset:

```text
dataset_id
dataset_version
source_archive
created_at
parser_version
analysis_version
record_count
file_count
```

Dengan demikian hasil analisis lama tetap dapat direproduksi.

---

## 46. Documentation Requirements

Dokumentasikan:

- sumber data,
- daftar file,
- struktur PDF,
- parser,
- data mapping,
- preprocessing,
- normalization,
- U/V formula,
- hodograph methodology,
- statistics,
- wind shear,
- interpretation rules,
- conclusion rules,
- assumptions,
- limitations.

---

## 47. Final Data Flow

```text
8 Agustus 2026(1).zip
        ↓
Discover 21 PDF PiBal
        ↓
PDF Parser
        ↓
Raw PiBal Dataset
        ↓
Validation
        ↓
Normalization
        ↓
Processed Dataset
        ↓
       ┌─────────────────────┐
       │ Analysis Engine     │
       └──────────┬──────────┘
                  ↓
       ┌──────────┴──────────┐
       ↓                     ↓
Wind Profile           Hodograph
       ↓                     ↓
       └──────────┬──────────┘
                  ↓
         Statistics & Shear
                  ↓
       Evidence-Based Findings
                  ↓
        Interpretation Engine
                  ↓
         Conclusion Engine
                  ↓
           Web Dashboard
```

---

## 48. Final Source Traceability Flow

```text
PDF Source
   ↓
Source ID
   ↓
Observation Record
   ↓
Processed Record
   ↓
Analysis Input
   ↓
Analysis Output
   ↓
Visualization Point / Chart
   ↓
Finding
   ↓
Interpretation
   ↓
Conclusion
```

Tidak boleh ada hasil analisis yang tidak memiliki hubungan yang jelas dengan data input.

---

## 49. Recommended Technical Decisions

Dokumen implementasi harus memilih stack berdasarkan kebutuhan aplikasi, tetapi setiap keputusan harus mempertimbangkan:

- kemudahan parsing PDF,
- kebutuhan visualisasi interaktif,
- maintainability,
- kemampuan testing,
- performance,
- keamanan,
- kemudahan deployment.

Stack dapat menggunakan frontend modern seperti React/Next.js dan library chart yang mendukung plotting U-V secara interaktif. Backend/data processing dapat menggunakan runtime yang paling sesuai dengan parser PDF dan kebutuhan deployment.

Pemilihan teknologi harus ditulis bersama alasan dan trade-off-nya.

---

## 50. Definition of Done

Implementation dianggap selesai ketika:

- Dataset ZIP dapat diproses end-to-end.
- 21 PDF sumber awal dapat di-ingest tanpa kehilangan file secara diam-diam.
- Data PiBal dapat diekstraksi.
- Data validasi berjalan.
- Source traceability tersedia.
- Hodograph dapat ditampilkan.
- Wind profile tersedia.
- Statistik tersedia.
- Interpretation engine bekerja menggunakan data aktual.
- Conclusion engine bekerja menggunakan evidence.
- Educational content tersedia.
- Export/reporting tersedia sesuai scope.
- Unit dan integration test tersedia.
- Error handling tersedia.
- Security requirement diterapkan.
- Dokumentasi implementasi lengkap.

---

## 51. Output Akhir Implementasi

Aplikasi yang dibangun berdasarkan dokumen ini harus menghasilkan dashboard yang dapat menjawab secara jelas:

> **Apa yang ditunjukkan data PiBal?**

> **Bagaimana profil angin berubah terhadap ketinggian?**

> **Bagaimana pola tersebut terlihat pada hodograph?**

> **Apa evidence numerik yang mendukung hasil analisis?**

> **Apa konklusi yang dapat dipertanggungjawabkan dari data tersebut?**

> **Dari PDF mana setiap hasil analisis berasal?**

Jawaban atas pertanyaan tersebut harus berasal dari **data aktual dalam `8 Agustus 2026(1).zip`**, bukan dari data contoh atau asumsi.
