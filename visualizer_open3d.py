"""
Open3D Native Desktop Visualizer Runner
Run interactive 3D visualizations of PiBal observations using the Open3D library.

Usage Examples:
    # 1. Buka visualisasi 3D Hodograph Spiral (default 12 Agustus 2026):
    python visualizer_open3d.py

    # 2. Buka visualisasi trajektori fisik terbang balon 3D:
    python visualizer_open3d.py --mode trajectory --date 2026-08-12

    # 3. Buka visualisasi overlay seluruh 21 hari di ruang 3D:
    python visualizer_open3d.py --mode overlay

    # 4. Ekspor model 3D PLY untuk seluruh pengamatan:
    python visualizer_open3d.py --export
"""

import os
import sys
import json
import argparse

# Ensure pipeline path is available
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, "pipeline"))

try:
    import open3d as o3d
    from open3d_visualizer import (
        visualize_interactive,
        build_open3d_hodograph_spiral,
        build_open3d_balloon_trajectory,
        build_open3d_overlay_all
    )
except ImportError:
    print("[!] Library 'open3d' belum terdeteksi pada interpreter Python ini.")
    print("    Silakan jalankan menggunakan Python di virtual environment:")
    print("    .venv\\Scripts\\python.exe visualizer_open3d.py")
    sys.exit(1)

def export_all_ply(bundle_path: str, output_dir: str):
    """Exports 3D models of all 21 observations into PLY format (Spiral and Trajectory)."""
    os.makedirs(output_dir, exist_ok=True)
    with open(bundle_path, 'r', encoding='utf-8') as f:
        bundle = json.load(f)

    print("=" * 70)
    print("  MENGEKSPOR MODEL 3D KE FORMAT PLY MENGGUNAKAN OPEN3D")
    print(f"  Folder Output: {output_dir}")
    print("=" * 70)

    count_spiral = 0
    count_traj = 0
    for obs in bundle['analysis_observations']:
        obs_id = obs['observation_id']
        geoms = build_open3d_hodograph_spiral(obs)

        # Combine triangle meshes for spiral
        combined_mesh = o3d.geometry.TriangleMesh()
        for g in geoms:
            if isinstance(g, o3d.geometry.TriangleMesh):
                combined_mesh += g

        if len(combined_mesh.vertices) > 0:
            ply_path = os.path.join(output_dir, f"{obs_id}_spiral.ply")
            o3d.io.write_triangle_mesh(ply_path, combined_mesh)
            count_spiral += 1

        # Trajectory
        proc_obs = next((p for p in bundle.get('processed_observations', []) if p['observation_id'] == obs_id), None)
        if proc_obs:
            geoms_traj = build_open3d_balloon_trajectory(obs, proc_obs)
            traj_mesh = o3d.geometry.TriangleMesh()
            for g in geoms_traj:
                if isinstance(g, o3d.geometry.TriangleMesh):
                    traj_mesh += g
            if len(traj_mesh.vertices) > 0:
                traj_path = os.path.join(output_dir, f"{obs_id}_trajectory.ply")
                o3d.io.write_triangle_mesh(traj_path, traj_mesh)
                count_traj += 1

        print(f"  [OK] Diekspor: {obs_id} (Spiral & Trajektori)")

    print(f"\n[Selesai] {count_spiral} model Spiral dan {count_traj} model Trajektori PLY berhasil diekspor ke {output_dir}.")

def main():
    parser = argparse.ArgumentParser(description="Open3D Atmospheric Visualizer untuk Data PiBal BMKG Cilacap")
    parser.add_argument("--mode", choices=["spiral", "trajectory", "overlay"], default="spiral",
                        help="Mode visualisasi: spiral (U-V-Altitude), trajectory (drift balon fisik), atau overlay (21 hari)")
    parser.add_argument("--date", type=str, default="2026-08-12",
                        help="Tanggal pengamatan (format YYYY-MM-DD, contoh: 2026-08-12)")
    parser.add_argument("--export", action="store_true",
                        help="Ekspor seluruh model 3D ke format PLY")
    parser.add_argument("--list", action="store_true",
                        help="Tampilkan daftar 21 tanggal pengamatan yang tersedia")

    args = parser.parse_args()

    data_bundle_path = os.path.join(BASE_DIR, "data", "pibal_complete_bundle.json")
    if not os.path.exists(data_bundle_path):
        print(f"[!] File bundle data tidak ditemukan: {data_bundle_path}")
        print("    Jalankan pipeline terlebih dahulu: python pipeline/run_pipeline.py")
        sys.exit(1)

    with open(data_bundle_path, 'r', encoding='utf-8') as f:
        bundle = json.load(f)

    if args.list:
        print("=" * 60)
        print("DAFTAR 21 OBSERVASI PIBAL CILACAP (AGUSTUS 2026):")
        print("=" * 60)
        for idx, obs in enumerate(bundle['analysis_observations']):
            print(f"  [{idx+1:02d}] {obs['date_iso']} | Ketinggian Puncak: {obs['statistics']['max_altitude_ft']:>5} ft | Obs: {obs['observer']}")
        return

    if args.export:
        export_dir = os.path.join(BASE_DIR, "data", "exports_3d")
        export_all_ply(data_bundle_path, export_dir)
        return

    # Find observation by date
    target_date = args.date
    matched_obs = next((o for o in bundle['analysis_observations'] if o['date_iso'] == target_date), None)
    if not matched_obs and args.mode != "overlay":
        print(f"[!] Tanggal {target_date} tidak ditemukan. Menggunakan observasi puncak 2026-08-12 (35.000 ft).")
        target_obs_id = "PIBAL_20260812_06UTC"
    else:
        target_obs_id = matched_obs['observation_id'] if matched_obs else bundle['analysis_observations'][0]['observation_id']

    visualize_interactive(
        observation_id=target_obs_id,
        data_bundle_path=data_bundle_path,
        mode=args.mode
    )

if __name__ == "__main__":
    main()
