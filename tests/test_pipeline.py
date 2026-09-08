"""
Unit & Integration Tests for PiBal Processing Pipeline
Validates parser correctness, trigonometric U/V formulas,
wind shear math, validation rules, and schema consistency.
"""

import os
import sys
import unittest
import math

# Add pipeline directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BASE_DIR, "pipeline"))

from normalizer_validator import calculate_meteorological_uv, validate_and_normalize_observation
from analysis_engine import compute_circular_direction_diff, classify_wind_shear_severity, analyze_observation
from interpretation_conclusion import generate_evidence_findings, generate_conclusions
from pdf_parser import discover_and_parse_all

class TestPiBalPipeline(unittest.TestCase):

    def test_trigonometric_known_values(self):
        """Tests meteorological U and V with textbook cardinal directions."""
        # 0° (Wind from North, blows South): U=0, V=-10
        u, v = calculate_meteorological_uv(10, 0)
        self.assertAlmostEqual(u, 0.0, places=1)
        self.assertAlmostEqual(v, -10.0, places=1)

        # 90° (Wind from East, blows West): U=-10, V=0
        u, v = calculate_meteorological_uv(10, 90)
        self.assertAlmostEqual(u, -10.0, places=1)
        self.assertAlmostEqual(v, 0.0, places=1)

        # 180° (Wind from South, blows North): U=0, V=+10
        u, v = calculate_meteorological_uv(10, 180)
        self.assertAlmostEqual(u, 0.0, places=1)
        self.assertAlmostEqual(v, 10.0, places=1)

        # 270° (Wind from West, blows East): U=+10, V=0
        u, v = calculate_meteorological_uv(10, 270)
        self.assertAlmostEqual(u, 10.0, places=1)
        self.assertAlmostEqual(v, 0.0, places=1)

        # 135° (Wind from Southeast, speed 10*sqrt(2)): U=-10, V=+10
        spd = 10 * math.sqrt(2)
        u, v = calculate_meteorological_uv(spd, 135)
        self.assertAlmostEqual(u, -10.0, places=1)
        self.assertAlmostEqual(v, 10.0, places=1)

    def test_circular_direction_difference(self):
        """Tests angular turning with 360 wrap-around."""
        # 120 to 140 -> veering (+20)
        self.assertEqual(compute_circular_direction_diff(120, 140), 20.0)
        # 140 to 120 -> backing (-20)
        self.assertEqual(compute_circular_direction_diff(140, 120), -20.0)
        # 350 to 10 across 0° -> veering (+20)
        self.assertEqual(compute_circular_direction_diff(350, 10), 20.0)
        # 10 to 350 across 0° -> backing (-20)
        self.assertEqual(compute_circular_direction_diff(10, 350), -20.0)

    def test_wind_shear_classification(self):
        """Tests wind shear severity thresholds."""
        self.assertEqual(classify_wind_shear_severity(2.5), "Ringan (Light)")
        self.assertEqual(classify_wind_shear_severity(5.5), "Sedang (Moderate)")
        self.assertEqual(classify_wind_shear_severity(9.2), "Kuat (Severe)")

    def test_validation_quality_flags(self):
        """Tests that invalid rows are flagged accurately."""
        fake_raw = {
            'observation_id': 'TEST_OBS',
            'source_file': 'test.pdf',
            'source_path': '/dummy/test.pdf',
            'source_size_bytes': 1000,
            'metadata': {'observation_date_iso': '2026-08-01', 'observation_time': '06 UTC', 'station': 'Test'},
            'codes': {},
            'theodolite_records': [],
            'hodograph_rows': [
                {'level_index': 0, 'height_ft': 0, 'direction_deg': 120, 'speed_kt': 10, 'source_u': -8.66, 'source_v': 5.0},
                {'level_index': 1, 'height_ft': 1000, 'direction_deg': 450, 'speed_kt': 15, 'source_u': 0, 'source_v': 0}, # Invalid direction 450
            ]
        }
        proc = validate_and_normalize_observation(fake_raw)
        self.assertEqual(proc['levels'][0]['quality_status'], 'VALID')
        self.assertEqual(proc['levels'][1]['quality_status'], 'INVALID')
        self.assertEqual(proc['quality']['status'], 'INVALID')

    def test_full_dataset_discovery_and_consistency(self):
        """Integration test: Parses all 21 PDFs and checks 100% data consistency."""
        raw_list = discover_and_parse_all(BASE_DIR)
        self.assertEqual(len(raw_list), 21, "Must discover exactly 21 PDF files")
        
        total_levels = 0
        for raw in raw_list:
            proc = validate_and_normalize_observation(raw)
            self.assertEqual(proc['quality']['invalid_levels'], 0, f"No invalid levels in {raw['source_file']}")
            self.assertEqual(proc['quality']['suspicious_levels'], 0, f"No suspicious levels in {raw['source_file']}")
            
            an = analyze_observation(proc)
            self.assertEqual(an['status'], 'ANALYZED')
            self.assertGreater(len(an['shear_layers']), 0)
            
            findings = generate_evidence_findings(an)
            self.assertGreaterEqual(len(findings), 4)
            
            conc = generate_conclusions(an)
            self.assertIn('q1_vertical_characteristics', conc['detailed_answers'])
            self.assertIn('q8_scientifically_defensible_findings', conc['detailed_answers'])
            
            total_levels += len(proc['levels'])
            
        self.assertEqual(total_levels, 172, "Total level count across 21 files must equal 172")

if __name__ == "__main__":
    unittest.main()
