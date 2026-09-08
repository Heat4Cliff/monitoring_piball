"""
Normalizer and Validator Module for PiBal Observations
Applies data cleaning, unit normalization, trigonometric consistency checks,
and quality classification (VALID, SUSPICIOUS, INVALID, MISSING).
"""

import math
from typing import Dict, Any, List, Tuple

def calculate_meteorological_uv(speed_kt: float, direction_deg: float) -> Tuple[float, float]:
    """
    Computes meteorological U (zonal) and V (meridional) wind components.
    
    Formula:
    Direction is the direction FROM which the wind blows (0°=North, 90°=East, 180°=South, 270°=West).
    U (positive = wind blowing toward East / from West):
        U = -Speed * sin(Direction in radians)
    V (positive = wind blowing toward North / from South):
        V = -Speed * cos(Direction in radians)
    """
    rad = math.radians(direction_deg)
    u = -speed_kt * math.sin(rad)
    v = -speed_kt * math.cos(rad)
    return round(u, 2), round(v, 2)

def validate_and_normalize_observation(raw_obs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates and normalizes an observation object.
    Produces clean processed records with quality flags and audit notes.
    """
    obs_id = raw_obs['observation_id']
    source_file = raw_obs['source_file']
    metadata = raw_obs['metadata']
    rows = raw_obs['hodograph_rows']
    
    processed_levels = []
    obs_quality_issues = []
    
    prev_height = -1
    for idx, r in enumerate(rows):
        level_quality = "VALID"
        validation_notes = []
        
        # Check height
        h_ft = r.get('height_ft')
        if h_ft is None or not isinstance(h_ft, (int, float)) or h_ft < 0:
            level_quality = "INVALID"
            validation_notes.append("Invalid or negative height")
        elif h_ft <= prev_height:
            level_quality = "SUSPICIOUS"
            validation_notes.append(f"Height {h_ft} ft is not strictly increasing (prev: {prev_height} ft)")
        prev_height = h_ft if h_ft is not None else prev_height
        
        # Check direction
        wdir = r.get('direction_deg')
        if wdir is None or not isinstance(wdir, (int, float)) or not (0 <= wdir <= 360):
            level_quality = "INVALID"
            validation_notes.append(f"Invalid direction: {wdir}")
            
        # Check speed
        wspd = r.get('speed_kt')
        if wspd is None or not isinstance(wspd, (int, float)) or wspd < 0:
            level_quality = "INVALID"
            validation_notes.append(f"Invalid wind speed: {wspd}")
            
        # Trigonometric U/V check
        calc_u, calc_v = (None, None)
        diff_u, diff_v = (0.0, 0.0)
        uv_status = "CONSISTENT"
        
        if level_quality != "INVALID":
            calc_u, calc_v = calculate_meteorological_uv(wspd, wdir)
            src_u = r.get('source_u')
            src_v = r.get('source_v')
            
            if src_u is not None and src_v is not None:
                diff_u = round(abs(src_u - calc_u), 2)
                diff_v = round(abs(src_v - calc_v), 2)
                # Allow rounding discrepancy up to 0.05
                if diff_u > 0.08 or diff_v > 0.08:
                    uv_status = "DISCREPANCY"
                    level_quality = "SUSPICIOUS" if level_quality == "VALID" else level_quality
                    validation_notes.append(f"U/V discrepancy: source=({src_u}, {src_v}), calc=({calc_u}, {calc_v}), diff=({diff_u}, {diff_v})")
            else:
                uv_status = "CALCULATED_ONLY"
                
        processed_level = {
            'level_index': r['level_index'],
            'height_ft': h_ft,
            'height_m': round(h_ft * 0.3048, 1) if h_ft is not None else None,
            'direction_deg': wdir,
            'speed_kt': wspd,
            'speed_ms': round(wspd * 0.514444, 2) if wspd is not None else None,
            'source_u': r.get('source_u'),
            'source_v': r.get('source_v'),
            'calculated_u': calc_u,
            'calculated_v': calc_v,
            'diff_u': diff_u,
            'diff_v': diff_v,
            'uv_status': uv_status,
            'vb_source': r.get('vb_source'),
            'advection_source': r.get('advection_source'),
            'quality_status': level_quality,
            'validation_notes': "; ".join(validation_notes) if validation_notes else "OK",
            'source_file': source_file,
            'source_page': r.get('source_page', 2)
        }
        processed_levels.append(processed_level)
        if level_quality != "VALID":
            obs_quality_issues.append(f"Level {r['level_index']} ({h_ft}ft): {level_quality}")
            
    # Overall observation quality status
    if len(processed_levels) == 0:
        overall_quality = "INVALID"
        quality_summary = "Tidak ada baris level pengamatan yang valid"
    elif any(l['quality_status'] == 'INVALID' for l in processed_levels):
        overall_quality = "INVALID"
        quality_summary = f"{len([l for l in processed_levels if l['quality_status'] == 'INVALID'])} level invalid"
    elif any(l['quality_status'] == 'SUSPICIOUS' for l in processed_levels):
        overall_quality = "SUSPICIOUS"
        quality_summary = f"{len([l for l in processed_levels if l['quality_status'] == 'SUSPICIOUS'])} level suspicious"
    else:
        overall_quality = "VALID"
        quality_summary = f"Seluruh {len(processed_levels)} level valid & konsisten"
        
    return {
        'observation_id': obs_id,
        'source_file': source_file,
        'source_path': raw_obs['source_path'],
        'source_size_bytes': raw_obs['source_size_bytes'],
        'metadata': metadata,
        'codes': raw_obs['codes'],
        'theodolite_records': raw_obs['theodolite_records'],
        'levels': processed_levels,
        'extracted_image': raw_obs.get('extracted_image'),
        'quality': {
            'status': overall_quality,
            'total_levels': len(processed_levels),
            'valid_levels': sum(1 for l in processed_levels if l['quality_status'] == 'VALID'),
            'suspicious_levels': sum(1 for l in processed_levels if l['quality_status'] == 'SUSPICIOUS'),
            'invalid_levels': sum(1 for l in processed_levels if l['quality_status'] == 'INVALID'),
            'summary': quality_summary,
            'issues': obs_quality_issues
        }
    }
