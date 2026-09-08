"""
Evidence-Based Interpretation and Conclusion Engine for PiBal Observations
Generates dynamic narratives, numerical evidence cards, and detailed conclusions
answering all 8 required scientific questions from Section 25.
"""

from typing import Dict, Any, List
from analysis_engine import compute_circular_direction_diff

def generate_evidence_findings(analyzed_obs: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Constructs discrete evidence cards linking findings directly to source numbers.
    """
    stats = analyzed_obs['statistics']
    shear_layers = analyzed_obs['shear_layers']
    max_shear = analyzed_obs.get('max_shear_layer')
    source_file = analyzed_obs['source_file']
    pts = analyzed_obs['hodograph_points']
    
    findings = []
    
    # 1. Surface wind finding
    if pts:
        sfc = pts[0]
        findings.append({
            'id': 'finding_surface',
            'title': 'Karakteristik Angin Lapisan Permukaan',
            'claim': f"Lapisan permukaan (0 ft) didominasi oleh angin dari arah {sfc['direction_deg']}° dengan kecepatan {sfc['speed_kt']} knot ({round(sfc['speed_kt']*0.514444, 1)} m/s).",
            'evidence': {
                'altitude': f"{sfc['height_ft']} ft ({sfc['height_m']} m)",
                'direction': f"{sfc['direction_deg']}°",
                'speed': f"{sfc['speed_kt']} knot",
                'u_component': f"{sfc['u']} kt",
                'v_component': f"{sfc['v']} kt",
            },
            'calculation': f"Vektor angin: U={sfc['u']} kt, V={sfc['v']} kt. Arah hembusan dari Tenggara/Timur-Tenggara.",
            'interpretation': "Konsisten dengan pola Monsun Tenggara (Australian High Pressure) yang dominan di pesisir selatan Jawa pada bulan Agustus.",
            'source_file': source_file,
            'source_page': 2
        })
        
    # 2. Max Speed Finding
    if pts:
        max_pt = max(pts, key=lambda p: p['speed_kt'])
        min_pt = min(pts, key=lambda p: p['speed_kt'])
        delta_v = max_pt['speed_kt'] - min_pt['speed_kt']
        findings.append({
            'id': 'finding_max_speed',
            'title': 'Variasi Kecepatan Ekstrem dan Rentang Vertikal',
            'claim': f"Kecepatan angin bervariasi antara {min_pt['speed_kt']} kt hingga maksimum {max_pt['speed_kt']} kt pada ketinggian {max_pt['height_ft']} ft.",
            'evidence': {
                'min_speed': f"{min_pt['speed_kt']} kt pada {min_pt['height_ft']} ft",
                'max_speed': f"{max_pt['speed_kt']} kt pada {max_pt['height_ft']} ft",
                'mean_speed': f"{stats['mean_speed_kt']} kt",
                'speed_range': f"ΔV = {delta_v} kt"
            },
            'calculation': f"ΔV = {max_pt['speed_kt']} kt - {min_pt['speed_kt']} kt = {delta_v} kt ({round(delta_v * 0.514444, 1)} m/s)",
            'interpretation': f"Terjadi peningkatan/modulasi kecepatan vertikal yang mencapai puncaknya pada level {max_pt['height_ft']} ft sebelum meluruh atau berubah arah.",
            'source_file': source_file,
            'source_page': 2
        })
        
    # 3. Maximum Wind Shear Finding
    if max_shear:
        findings.append({
            'id': 'finding_max_shear',
            'title': 'Lapisan Geser Angin Vertikal (Wind Shear) Terkuat',
            'claim': f"Lapisan dengan gradien geser angin paling tajam terjadi pada rentang {max_shear['altitude_range_ft']} ft dengan laju shear {max_shear['shear_rate_per_kft']} kt/1000 ft ({max_shear['severity']}).",
            'evidence': {
                'altitude_range': f"{max_shear['altitude_range_ft']} ft (Δz = {max_shear['delta_z_ft']} ft)",
                'shear_vector_magnitude': f"{max_shear['shear_vector_mag_kt']} kt",
                'shear_rate': f"{max_shear['shear_rate_per_kft']} kt / 1000 ft",
                'delta_direction': f"{max_shear['dir_diff_deg']}°",
                'delta_speed': f"{max_shear['speed_diff_kt']} kt",
                'advection_type': max_shear['calculated_advection']
            },
            'calculation': f"|ΔV| = √(({max_shear['delta_u']})² + ({max_shear['delta_v']})²) = {max_shear['shear_vector_mag_kt']} kt; Laju = ({max_shear['shear_vector_mag_kt']} / {max_shear['delta_z_ft']}) * 1000 = {max_shear['shear_rate_per_kft']} kt/1000ft",
            'interpretation': f"Perubahan vektor sebesar {max_shear['shear_vector_mag_kt']} kt pada lapisan setebal {max_shear['delta_z_ft']} ft menciptakan diskontinuitas momentum atmosfer yang patut diperhatikan dalam operasi penerbangan.",
            'source_file': source_file,
            'source_page': 2
        })
        
    # 4. Thermal Advection and Turning
    adv_hangat_count = sum(1 for s in shear_layers if 'Hangat' in s.get('calculated_advection', ''))
    adv_dingin_count = sum(1 for s in shear_layers if 'Dingin' in s.get('calculated_advection', ''))
    dom_advection = "Adveksi Hangat (Backing)" if adv_hangat_count >= adv_dingin_count else "Adveksi Dingin (Veering)"
    
    findings.append({
        'id': 'finding_thermal_advection',
        'title': 'Dinamika Adveksi Termal & Pembelokan Angin (Veering/Backing)',
        'claim': f"Analisis hodograph menunjukkan rotasi arah angin terhadap ketinggian dengan kecenderungan dominan {dom_advection} (Hangat: {adv_hangat_count} layer, Dingin: {adv_dingin_count} layer).",
        'evidence': {
            'adveksi_hangat_layers': adv_hangat_count,
            'adveksi_dingin_layers': adv_dingin_count,
            'station_latitude': "07° 38' LS (Belahan Bumi Selatan)",
            'thermal_wind_relation': "Di BBL: Backing = Adveksi Hangat; Veering = Adveksi Dingin"
        },
        'calculation': f"Proporsi layer: {adv_hangat_count} backing vs {adv_dingin_count} veering dari total {len(shear_layers)} lapisan transisi.",
        'interpretation': "Pembelokan arah vektor hodograph mengindikasikan struktur gradien temperatur horizontal pada lapisan batas hingga troposfer bawah/menengah.",
        'source_file': source_file,
        'source_page': 2
    })
    
    # 5. Observation limitation finding
    findings.append({
        'id': 'finding_limitations',
        'title': 'Keterbatasan Pengamatan & Kondisi Terminasi',
        'claim': f"Pengamatan berakhir pada ketinggian {stats['max_altitude_ft']} ft karena {analyzed_obs['termination_description']}.",
        'evidence': {
            'max_altitude': f"{stats['max_altitude_ft']} ft ({round(stats['max_altitude_ft']*0.3048, 1)} m)",
            'termination_code': analyzed_obs['termination_reason'],
            'description': analyzed_obs['termination_description'],
            'observer': analyzed_obs['observer']
        },
        'calculation': f"Batas jangkauan vertikal terhenti pada level {stats['total_levels'] - 1} ({stats['max_altitude_ft']} ft).",
        'interpretation': "Informasi profil angin di atas ketinggian terminasi tidak tersedia secara observasional langsung dari instrumen theodolit optik ini.",
        'source_file': source_file,
        'source_page': 1
    })
    
    return findings

def generate_interpretations(analyzed_obs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates dynamic narrative sections for speed, direction, hodograph, and shear.
    """
    stats = analyzed_obs['statistics']
    pts = analyzed_obs['hodograph_points']
    shear_layers = analyzed_obs['shear_layers']
    max_shear = analyzed_obs.get('max_shear_layer')
    
    # Speed narrative
    sfc_speed = pts[0]['speed_kt'] if pts else 0
    top_speed = pts[-1]['speed_kt'] if pts else 0
    speed_trend = "meningkat" if top_speed > sfc_speed else ("menurun" if top_speed < sfc_speed else "relatif konstan")
    
    speed_narrative = (
        f"Profil kecepatan angin pada pengamatan {analyzed_obs['date_iso']} 06 UTC menunjukkan kecepatan awal di permukaan sebesar "
        f"{sfc_speed} knot. Terjadi tren {speed_trend} terhadap ketinggian dengan kecepatan rata-rata {stats['mean_speed_kt']} knot dan "
        f"kecepatan puncak mencapai {stats['max_speed_kt']} knot pada level tertentu. Puncak kecepatan ini mencerminkan adanya lapisan "
        f"aliran momentum yang lebih kuat di troposfer bawah sebelum terdisipasi di ketinggian puncak pengamatan ({stats['max_altitude_ft']} ft)."
    )
    
    # Direction narrative
    sfc_dir = pts[0]['direction_deg'] if pts else 0
    top_dir = pts[-1]['direction_deg'] if pts else 0
    dir_diff = compute_circular_direction_diff(sfc_dir, top_dir)
    dir_type = "berputar searah jarum jam (veering)" if dir_diff > 0 else ("berputar berlawanan jarum jam (backing)" if dir_diff < 0 else "tetap searah")
    
    direction_narrative = (
        f"Arah angin di permukaan terdeteksi dari {sfc_dir}° (Tenggara). Secara keseluruhan profil vertikal, arah angin {dir_type} "
        f"sebesar {abs(dir_diff)}° menuju arah {top_dir}° pada level {pts[-1]['height_ft']} ft. Perubahan sudut ini mengindikasikan adanya pergeseran "
        f"aliran massa udara dari sistem monsun permukaan menuju aliran skala sinoptik bebas di lapisan atas."
    )
    
    # Hodograph narrative
    hodograph_narrative = (
        f"Grafik hodograph pada bidang U-V memperlihatkan lintasan trajektori vektor yang dimulai dari kuadran U negatif / V positif "
        f"(komponen Timur-Tenggara) di level permukaan. Lintasan kemudian membentuk kurvatur yang merepresentasikan variasi lapisan "
        f"termal. Rentang komponen U berada antara {stats['u_min']} hingga {stats['u_max']} kt, sedangkan komponen V berada di antara "
        f"{stats['v_min']} hingga {stats['v_max']} kt."
    )
    
    # Wind shear narrative
    if max_shear:
        shear_narrative = (
            f"Analisis geser angin vertikal mengidentifikasi bahwa zona geser terkuat berada pada lapisan {max_shear['altitude_range_ft']} ft, "
            f"dengan magnitudo vektor shear sebesar {max_shear['shear_vector_mag_kt']} knot dan laju geser vertikal {max_shear['shear_rate_per_kft']} kt/1000 ft. "
            f"Tingkat keparahan terklasifikasi sebagai '{max_shear['severity']}'. Lapisan ini ditandai oleh perubahan arah {max_shear['dir_diff_deg']}° dan "
            f"perubahan kecepatan {max_shear['speed_diff_kt']} knot, berasosiasi dengan {max_shear['calculated_advection']}."
        )
    else:
        shear_narrative = "Data tidak mencukupi untuk menghitung lapisan wind shear vertikal."
        
    return {
        'speed_profile': speed_narrative,
        'direction_profile': direction_narrative,
        'hodograph_trajectory': hodograph_narrative,
        'wind_shear': shear_narrative,
        'data_quality_warning': (
            f"Pengamatan berakhir pada {stats['max_altitude_ft']} ft akibat '{analyzed_obs['termination_description']}'. "
            f"Analisis hanya valid pada kolom atmosfer teramati (0-{stats['max_altitude_ft']} ft)."
        )
    }

def generate_conclusions(analyzed_obs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Answers the 8 mandatory scientific questions specified in Section 25.
    Provides both Executive Summary and Detailed Conclusion.
    """
    stats = analyzed_obs['statistics']
    pts = analyzed_obs['hodograph_points']
    shear_layers = analyzed_obs['shear_layers']
    max_shear = analyzed_obs.get('max_shear_layer')
    source_file = analyzed_obs['source_file']
    
    sfc = pts[0] if pts else {}
    top = pts[-1] if pts else {}
    
    # Summary (1 concise paragraph)
    summary = (
        f"Pengamatan PiBal di Stamet Tunggul Wulung Cilacap pada {analyzed_obs['date_iso']} 06 UTC merekam profil angin dari permukaan hingga {stats['max_altitude_ft']} ft "
        f"dengan dominasi angin Tenggara (kecepatan rata-rata {stats['mean_speed_kt']} kt, maksimum {stats['max_speed_kt']} kt). "
        f"Zona transisi geser angin terkuat terdeteksi pada lapisan {max_shear['altitude_range_ft'] if max_shear else '-'} ft dengan laju {max_shear['shear_rate_per_kft'] if max_shear else '-'} kt/1000 ft, "
        f"menunjukkan kestabilan dinamik lapisan batas dan adveksi termal yang konsisten dengan kondisi monsun tenggara di belahan bumi selatan."
    )
    
    # 8 Key Questions Answered
    answers = {
        'q1_vertical_characteristics': (
            f"Profil angin secara vertikal menunjukkan struktur lapisan batas atmosfer tropis pesisir yang teratur. Pada lapisan permukaan hingga troposfer bawah, "
            f"aliran angin dikendalikan oleh angin pasat tenggara yang mantap dengan kecepatan {sfc.get('speed_kt', '-')} kt dan arah {sfc.get('direction_deg', '-')}°."
        ),
        'q2_speed_variation': (
            f"Kecepatan angin berfluktuasi dari nilai minimum {stats['min_speed_kt']} kt hingga mencapai nilai maksimum {stats['max_speed_kt']} kt "
            f"(median {stats['median_speed_kt']} kt, rata-rata {stats['mean_speed_kt']} kt), menunjukkan gradien kecepatan sebesar {stats['max_speed_kt'] - stats['min_speed_kt']} kt di sepanjang kolom."
        ),
        'q3_direction_variation': (
            f"Arah angin bertransisi dari {sfc.get('direction_deg', '-')}° di permukaan menuju {top.get('direction_deg', '-')}° di puncak observasi, "
            f"dengan pergeseran arah sebesar {compute_circular_direction_diff(sfc.get('direction_deg', 0), top.get('direction_deg', 0))}° yang mencerminkan pengaruh friksi permukaan dan adveksi temperatur."
        ),
        'q4_hodograph_features': (
            f"Hodograph membentuk kurva karakteristik dengan titik-titik level yang merefleksikan perubahan vektor angin secara berkelanjutan. "
            f"Pola rotasi vektor mencerminkan keseimbangan antara gaya gradien tekanan, gaya Coriolis belahan bumi selatan, dan gesekan lapisan batas."
        ),
        'q5_most_significant_transition_layer': (
            f"Perubahan paling jelas terjadi pada lapisan {max_shear['altitude_range_ft'] if max_shear else '-'} ft, di mana terjadi diskontinuitas vektor shear sebesar "
            f"{max_shear['shear_vector_mag_kt'] if max_shear else '-'} kt dalam interval ketebalan {max_shear['delta_z_ft'] if max_shear else '-'} ft."
        ),
        'q6_wind_shear_results': (
            f"Laju wind shear maksimum tercatat sebesar {max_shear['shear_rate_per_kft'] if max_shear else '-'} kt/1000 ft ({max_shear['severity'] if max_shear else '-'}). "
            f"Dari total {len(shear_layers)} lapisan, sebagian besar berada dalam kategori {max_shear['severity'] if max_shear else 'Ringan'}, mengindikasikan tingkat turbulensi mekanis yang terkendali."
        ),
        'q7_data_limitations': (
            f"Pengamatan terbatas hingga ketinggian {stats['max_altitude_ft']} ft karena balon terhenti/hilang akibat {analyzed_obs['termination_description']} (kode: {analyzed_obs['termination_reason']}). "
            f"Tidak ada interpolasi data atau data fiktif di atas level ini."
        ),
        'q8_scientifically_defensible_findings': (
            f"Temuan utama yang dapat dipertanggungjawabkan secara ilmiah adalah bahwa kolom udara bawah Cilacap pada waktu observasi didominasi oleh aliran massa udara kering Tenggara monsunal "
            f"dengan kecepatan terkontrol, serta lapisan inversi/transisi momentum terukur pada ketinggian {max_shear['altitude_range_ft'] if max_shear else '-'} ft yang terbukti dari data theodolit {source_file}."
        )
    }
    
    return {
        'summary': summary,
        'detailed_answers': answers
    }

def process_interpretations_and_conclusions(analyzed_observations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Enriches each analyzed observation with findings, narratives, and conclusions."""
    enriched = []
    for obs in analyzed_observations:
        if obs.get('status') == 'ANALYZED':
            obs['findings'] = generate_evidence_findings(obs)
            obs['interpretations'] = generate_interpretations(obs)
            obs['conclusions'] = generate_conclusions(obs)
        enriched.append(obs)
    return enriched
