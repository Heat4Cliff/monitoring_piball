"""
Meteorological Analysis Engine for PiBal Observations
Computes vertical wind profile parameters, hodograph geometry,
layer-by-layer wind shear vectors, statistical summaries,
and thermal advection verification for the Southern Hemisphere.
"""

import math
from typing import Dict, Any, List, Optional

def compute_circular_direction_diff(dir1: float, dir2: float) -> float:
    """
    Computes angular difference from dir1 to dir2 in degrees [-180, +180].
    Positive = clockwise (veering).
    Negative = counter-clockwise (backing).
    """
    diff = (dir2 - dir1 + 180) % 360 - 180
    return round(diff, 1)

def classify_wind_shear_severity(shear_rate_per_kft: float) -> str:
    """Classifies wind shear severity in kt / 1000 ft."""
    if shear_rate_per_kft < 4.0:
        return "Ringan (Light)"
    elif shear_rate_per_kft <= 8.0:
        return "Sedang (Moderate)"
    else:
        return "Kuat (Severe)"

def analyze_observation(processed_obs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs comprehensive meteorological analysis on a single processed observation.
    """
    levels = [l for l in processed_obs['levels'] if l['quality_status'] == 'VALID']
    if not levels:
        return {
            'observation_id': processed_obs['observation_id'],
            'status': 'INSUFFICIENT_DATA',
            'message': 'No valid levels available for analysis'
        }
        
    speeds = [l['speed_kt'] for l in levels]
    heights = [l['height_ft'] for l in levels]
    dirs = [l['direction_deg'] for l in levels]
    us = [l['source_u'] for l in levels]
    vs = [l['source_v'] for l in levels]
    
    # Statistical analysis
    speeds_sorted = sorted(speeds)
    n = len(speeds)
    median_speed = speeds_sorted[n // 2] if n % 2 != 0 else (speeds_sorted[n // 2 - 1] + speeds_sorted[n // 2]) / 2.0
    
    stats = {
        'total_levels': n,
        'min_altitude_ft': min(heights),
        'max_altitude_ft': max(heights),
        'min_speed_kt': min(speeds),
        'max_speed_kt': max(speeds),
        'mean_speed_kt': round(sum(speeds) / n, 2),
        'median_speed_kt': round(median_speed, 2),
        'u_min': round(min(us), 2),
        'u_max': round(max(us), 2),
        'u_mean': round(sum(us) / n, 2),
        'v_min': round(min(vs), 2),
        'v_max': round(max(vs), 2),
        'v_mean': round(sum(vs) / n, 2),
    }
    
    # Layer-by-layer Wind Shear Analysis
    shear_layers = []
    max_shear_layer = None
    max_shear_val = -1.0
    
    for i in range(len(levels) - 1):
        l1 = levels[i]
        l2 = levels[i + 1]
        
        dz = l2['height_ft'] - l1['height_ft']
        if dz <= 0:
            continue
            
        du = l2['source_u'] - l1['source_u']
        dv = l2['source_v'] - l1['source_v']
        vector_shear_mag = math.sqrt(du**2 + dv**2)
        
        shear_rate_per_kft = (vector_shear_mag / dz) * 1000.0
        shear_rate_si = (vector_shear_mag * 0.514444) / (dz * 0.3048) # s^-1
        
        # Directional change
        delta_dir = compute_circular_direction_diff(l1['direction_deg'], l2['direction_deg'])
        speed_diff = l2['speed_kt'] - l1['speed_kt']
        
        # Calculated VB and Advection (Southern Hemisphere convention)
        if delta_dir > 0:
            calc_vb = "veering"
            calc_advection = "Adveksi Dingin" # In SH, veering with height = cold advection
        elif delta_dir < 0:
            calc_vb = "backing"
            calc_advection = "Adveksi Hangat" # In SH, backing with height = warm advection
        else:
            calc_vb = "unidirectional"
            calc_advection = "Netral / Tidak Ada Perubahan Arah"
            
        severity = classify_wind_shear_severity(shear_rate_per_kft)
        
        layer_dict = {
            'layer_index': i + 1,
            'bottom_level': l1['level_index'],
            'top_level': l2['level_index'],
            'altitude_range_ft': f"{l1['height_ft']} - {l2['height_ft']}",
            'bottom_height_ft': l1['height_ft'],
            'top_height_ft': l2['height_ft'],
            'delta_z_ft': dz,
            'delta_u': round(du, 2),
            'delta_v': round(dv, 2),
            'shear_vector_mag_kt': round(vector_shear_mag, 2),
            'shear_rate_per_kft': round(shear_rate_per_kft, 2),
            'shear_rate_si': round(shear_rate_si, 5),
            'speed_diff_kt': speed_diff,
            'dir_diff_deg': delta_dir,
            'calculated_vb': calc_vb,
            'calculated_advection': calc_advection,
            'source_vb': l2.get('vb_source'),
            'source_advection': l2.get('advection_source'),
            'severity': severity
        }
        shear_layers.append(layer_dict)
        
        if shear_rate_per_kft > max_shear_val:
            max_shear_val = shear_rate_per_kft
            max_shear_layer = layer_dict
            
    # Hodograph Points for UI
    hodograph_points = []
    for l in levels:
        hodograph_points.append({
            'height_ft': l['height_ft'],
            'height_m': l['height_m'],
            'u': l['source_u'],
            'v': l['source_v'],
            'speed_kt': l['speed_kt'],
            'direction_deg': l['direction_deg'],
            'level_index': l['level_index'],
            'vb': l['vb_source'],
            'advection': l['advection_source']
        })
        
    return {
        'observation_id': processed_obs['observation_id'],
        'source_file': processed_obs['source_file'],
        'date_iso': processed_obs['metadata']['observation_date_iso'],
        'time_utc': processed_obs['metadata']['observation_time'],
        'station': processed_obs['metadata']['station'],
        'observer': processed_obs['metadata']['observer'],
        'termination_reason': processed_obs['metadata']['termination_reason'],
        'termination_description': processed_obs['metadata']['termination_description'],
        'statistics': stats,
        'shear_layers': shear_layers,
        'max_shear_layer': max_shear_layer,
        'hodograph_points': hodograph_points,
        'status': 'ANALYZED'
    }

def analyze_aggregate_dataset(analyzed_observations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes aggregated statistics across the entire 21-day observation dataset.
    """
    valid_obs = [o for o in analyzed_observations if o.get('status') == 'ANALYZED']
    if not valid_obs:
        return {}
        
    all_speeds = []
    all_shear_rates = []
    max_altitudes = []
    observer_counts = {}
    reason_counts = {}
    dates = []
    
    for o in valid_obs:
        dates.append(o['date_iso'])
        obs_name = o['observer']
        observer_counts[obs_name] = observer_counts.get(obs_name, 0) + 1
        
        reason = o['termination_reason']
        reason_counts[reason] = reason_counts.get(reason, 0) + 1
        
        max_altitudes.append(o['statistics']['max_altitude_ft'])
        
        for layer in o['shear_layers']:
            all_shear_rates.append(layer['shear_rate_per_kft'])
            
        for pt in o['hodograph_points']:
            all_speeds.append(pt['speed_kt'])
            
    dates.sort()
    return {
        'total_observations': len(valid_obs),
        'date_range': {
            'start': dates[0],
            'end': dates[-1]
        },
        'station': valid_obs[0]['station'],
        'total_levels_analyzed': len(all_speeds),
        'altitude': {
            'min_ft': 0,
            'max_ft': max(max_altitudes),
            'avg_top_altitude_ft': round(sum(max_altitudes) / len(max_altitudes), 0)
        },
        'wind_speed_kt': {
            'min': min(all_speeds),
            'max': max(all_speeds),
            'mean': round(sum(all_speeds) / len(all_speeds), 2),
            'median': sorted(all_speeds)[len(all_speeds) // 2]
        },
        'wind_shear_per_kft': {
            'min': min(all_shear_rates) if all_shear_rates else 0,
            'max': max(all_shear_rates) if all_shear_rates else 0,
            'mean': round(sum(all_shear_rates) / len(all_shear_rates), 2) if all_shear_rates else 0
        },
        'observer_breakdown': observer_counts,
        'termination_reason_breakdown': reason_counts
    }
