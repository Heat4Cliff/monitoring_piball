"""
PDF Parser Module for PiBal (Pilot Balloon) Observations
Extracts raw data, metadata, minute-by-minute theodolite records,
hodograph table rows, WMO codes (PPAA/PPBB), and Page 3 hodograph chart images.
"""

import os
import re
import glob
from typing import List, Dict, Any, Optional
import pymupdf

MONTH_MAP = {
    'jan': '01', 'peb': '02', 'feb': '02', 'mar': '03', 'apr': '04',
    'mei': '05', 'may': '05', 'jun': '06', 'jul': '07', 'agu': '08',
    'aug': '08', 'sep': '09', 'okt': '10', 'oct': '10', 'nop': '11',
    'nov': '11', 'des': '12', 'dec': '12'
}

def parse_date_to_iso(date_str: str) -> Optional[str]:
    """Parse string like '01 Agu 2026 06 UTC' or '01/08/2026' into '2026-08-01'."""
    if not date_str:
        return None
    # match '01 Agu 2026'
    m = re.search(r'(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})', date_str)
    if m:
        day = m.group(1).zfill(2)
        month_str = m.group(2).lower()
        year = m.group(3)
        month = MONTH_MAP.get(month_str, '08')
        return f"{year}-{month}-{day}"
    
    # match '01/08/2026'
    m2 = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})', date_str)
    if m2:
        day = m2.group(1).zfill(2)
        month = m2.group(2).zfill(2)
        year = m2.group(3)
        return f"{year}-{month}-{day}"
    return None

def extract_pdf_data(pdf_path: str, image_output_dir: Optional[str] = None) -> Dict[str, Any]:
    """
    Extracts all raw data from a single PiBal PDF file.
    """
    file_name = os.path.basename(pdf_path)
    file_size = os.path.getsize(pdf_path)
    
    doc = pymupdf.open(pdf_path)
    num_pages = len(doc)
    
    p1_text = doc[0].get_text() if num_pages > 0 else ""
    p2_text = doc[1].get_text() if num_pages > 1 else ""
    p3_text = doc[2].get_text() if num_pages > 2 else ""
    
    # Extract metadata from Page 1
    upt_m = re.search(r'UPT\s*:\s*([^\r\n]+)', p1_text)
    msl_m = re.search(r'MSL\s*:\s*([^\r\n]+)', p1_text)
    tgl_m = re.search(r'Tanggal\s*:\s*([^\r\n]+)', p1_text)
    obs_m = re.search(r'Observer\s*:\s*([^\s\r\n]+)', p1_text)
    alasan_m = re.search(r'Alasan\s*:\s*([^\r\n]+)', p1_text)
    
    # Extract PPAA and PPBB
    ppaa_m = re.search(r'(PPAA\s+\d+[\s\S]+?)(?=PPBB|\Z)', p1_text)
    ppbb_m = re.search(r'(PPBB\s+\d+[\s\S]+?)(?=\Z|Observer|--)', p1_text)
    
    upt = upt_m.group(1).strip() if upt_m else "Stamet Tunggul Wulung Cilacap"
    msl_raw = msl_m.group(1).strip() if msl_m else "6 M"
    tanggal_raw = tgl_m.group(1).strip() if tgl_m else ""
    observer = obs_m.group(1).strip() if obs_m else "Tidak Diketahui"
    alasan = alasan_m.group(1).strip() if alasan_m else "-"
    
    # Standardize reason for balloon termination
    alasan_upper = alasan.upper()
    alasan_desc_map = {
        'LL': 'Lost Sight / Lepas Penglihatan (Jarak Jauh)',
        'LIC': 'Lost In Cloud (Masuk Awan)',
        'LC': 'Lost in Cloud (Masuk Awan)',
        'HZ': 'Haze (Kabut Udara / Terhalang Haze)',
        'BB': 'Balon Pecah / Behind Building (Terhalang Bangunan)'
    }
    alasan_deskripsi = alasan_desc_map.get(alasan_upper, f'Alasan Observasi Berhenti: {alasan}')
    
    tanggal_iso = parse_date_to_iso(tanggal_raw)
    if not tanggal_iso:
        # Fallback from filename like '2026080106_pibal.pdf'
        m_fn = re.match(r'(\d{4})(\d{2})(\d{2})', file_name)
        if m_fn:
            tanggal_iso = f"{m_fn.group(1)}-{m_fn.group(2)}-{m_fn.group(3)}"
            
    obs_id = f"PIBAL_{tanggal_iso.replace('-', '')}_06UTC" if tanggal_iso else file_name.replace('.pdf', '')
    
    # Extract minute-by-minute theodolite records (Page 1)
    minute_records = []
    p1_lines = p1_text.splitlines()
    in_record = False
    for line in p1_lines:
        line_s = line.strip()
        if 'Record' in line_s:
            in_record = True
            continue
        if in_record and ('Observer' in line_s or 'PPAA' in line_s):
            in_record = False
            break
        if in_record:
            m_rec = re.match(r'^(\d+)\s+([-\d\.]+)\s+([-\d\.]+)(?:\s*->\s*(\d{2,3})/(\d{1,2}))?', line_s)
            if m_rec:
                minute_records.append({
                    'minute': int(m_rec.group(1)),
                    'azimuth': float(m_rec.group(2)) if m_rec.group(2) != '-' else None,
                    'elevation': float(m_rec.group(3)) if m_rec.group(3) != '-' else None,
                    'derived_dir': int(m_rec.group(4)) if m_rec.group(4) else None,
                    'derived_speed': int(m_rec.group(5)) if m_rec.group(5) else None,
                })
            else:
                m_zero = re.match(r'^0\s+-\s+-\s*->\s*(\d{2,3})/(\d{1,2})', line_s)
                if m_zero:
                    minute_records.append({
                        'minute': 0,
                        'azimuth': None,
                        'elevation': None,
                        'derived_dir': int(m_zero.group(1)),
                        'derived_speed': int(m_zero.group(2)),
                    })
                    
    # Extract Hodograph table rows (Page 2)
    p2_lines = [l.strip() for l in p2_text.splitlines() if l.strip()]
    hodograph_rows = []
    i = 0
    while i < len(p2_lines):
        line = p2_lines[i]
        m_row = re.match(r'^(\d+)\s+(\d+)\s+(\d{1,3})\s+(\d{1,2})\s+([-\d\.]+)\s+([-\d\.]+)(.*)', line)
        if m_row:
            no = int(m_row.group(1))
            height_ft = int(m_row.group(2))
            direction = int(m_row.group(3))
            speed = int(m_row.group(4))
            src_u = float(m_row.group(5))
            src_v = float(m_row.group(6))
            rest = m_row.group(7).strip()
            
            vb = None
            if 'backing' in rest.lower():
                vb = 'backing'
            elif 'veering' in rest.lower():
                vb = 'veering'
                
            full_adv_candidate = rest
            if i + 1 < len(p2_lines) and not re.match(r'^\d+\s+\d+', p2_lines[i+1]) and not p2_lines[i+1].startswith('----'):
                full_adv_candidate += ' ' + p2_lines[i+1]
                if i + 2 < len(p2_lines) and not re.match(r'^\d+\s+\d+', p2_lines[i+2]) and not p2_lines[i+2].startswith('----'):
                    full_adv_candidate += ' ' + p2_lines[i+2]
                    
            advection = None
            if 'hangat' in full_adv_candidate.lower():
                advection = 'Adveksi Hangat'
            elif 'dingin' in full_adv_candidate.lower():
                advection = 'Adveksi Dingin'
                
            hodograph_rows.append({
                'level_index': no,
                'height_ft': height_ft,
                'height_m': round(height_ft * 0.3048, 1),
                'direction_deg': direction,
                'speed_kt': speed,
                'speed_ms': round(speed * 0.514444, 2),
                'source_u': src_u,
                'source_v': src_v,
                'vb_source': vb,
                'advection_source': advection,
                'source_file': file_name,
                'source_page': 2,
                'raw_line': line
            })
        i += 1
        
    # Extract Page 3 Hodograph Image
    extracted_image_filename = None
    if image_output_dir and num_pages >= 3:
        os.makedirs(image_output_dir, exist_ok=True)
        p3 = doc[2]
        images = p3.get_images()
        largest_img = None
        max_dim = 0
        for img_info in images:
            xref = img_info[0]
            base_img = doc.extract_image(xref)
            dim = base_img['width'] * base_img['height']
            if dim > max_dim:
                max_dim = dim
                largest_img = base_img
                
        if largest_img:
            img_filename = f"{obs_id}_chart.{largest_img['ext']}"
            img_path = os.path.join(image_output_dir, img_filename)
            with open(img_path, 'wb') as f_img:
                f_img.write(largest_img['image'])
            extracted_image_filename = img_filename

    return {
        'source_file': file_name,
        'source_path': pdf_path,
        'source_size_bytes': file_size,
        'observation_id': obs_id,
        'metadata': {
            'station': upt,
            'msl_raw': msl_raw,
            'msl_m': 6.0,
            'observation_date_raw': tanggal_raw,
            'observation_date_iso': tanggal_iso,
            'observation_time': "06 UTC",
            'observer': observer,
            'termination_reason': alasan,
            'termination_description': alasan_deskripsi,
            'num_pages': num_pages
        },
        'codes': {
            'ppaa': ppaa_m.group(1).strip() if ppaa_m else None,
            'ppbb': ppbb_m.group(1).strip() if ppbb_m else None,
        },
        'theodolite_records': minute_records,
        'hodograph_rows': hodograph_rows,
        'extracted_image': extracted_image_filename,
        'parsing_status': 'success' if len(hodograph_rows) > 0 else 'partial'
    }

def discover_and_parse_all(directory_path: str, image_output_dir: Optional[str] = None) -> List[Dict[str, Any]]:
    """Discovers all PDFs in directory (case-insensitive) and parses them."""
    all_files = os.listdir(directory_path)
    pdf_files = [f for f in all_files if f.lower().endswith('.pdf')]
    pdf_files.sort()
    
    results = []
    for f in pdf_files:
        full_path = os.path.join(directory_path, f)
        parsed = extract_pdf_data(full_path, image_output_dir=image_output_dir)
        results.append(parsed)
        
    return results
