"""
Open3D Atmospheric Visualizer for PiBal (Pilot Balloon) Observations
Provides native 3D rendering using the Open3D library for:
1. 3D Hodograph Spiral (U, V, Altitude)
2. 3D Balloon Flight Spatial Drift Trajectory (X, Y, Z)
3. 21-Day Multi-Observation Overlay in 3D Space
4. PLY / 3D Model Export Capabilities
"""

import os
import math
import json
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import open3d as o3d

def get_altitude_color_rgb(height_ft: float) -> List[float]:
    """Returns normalized RGB color based on altitude level."""
    if height_ft == 0:
        return [0.22, 0.74, 0.97] # Cyan / Sky Blue (Surface)
    elif height_ft <= 2000:
        return [0.20, 0.83, 0.60] # Emerald (Low troposphere)
    elif height_ft <= 5000:
        return [0.98, 0.75, 0.14] # Amber (Mid-low)
    elif height_ft <= 10000:
        return [0.98, 0.45, 0.09] # Orange (Mid)
    elif height_ft <= 20000:
        return [0.93, 0.28, 0.60] # Pink (Mid-high)
    else:
        return [0.66, 0.33, 0.97] # Purple (Upper troposphere)

def create_circle_lineset(radius: float, z: float = 0.0, num_segments: int = 64, color: List[float] = [0.3, 0.4, 0.5]) -> o3d.geometry.LineSet:
    """Creates a circular speed reference ring on the XY plane at given Z altitude."""
    theta = np.linspace(0, 2 * np.pi, num_segments, endpoint=False)
    pts = np.zeros((num_segments, 3), dtype=np.float64)
    pts[:, 0] = radius * np.cos(theta)
    pts[:, 1] = radius * np.sin(theta)
    pts[:, 2] = z

    lines = np.zeros((num_segments, 2), dtype=np.int32)
    for i in range(num_segments):
        lines[i] = [i, (i + 1) % num_segments]

    colors = np.tile(color, (num_segments, 1))

    ring = o3d.geometry.LineSet()
    ring.points = o3d.utility.Vector3dVector(pts)
    ring.lines = o3d.utility.Vector2iVector(lines)
    ring.colors = o3d.utility.Vector3dVector(colors)
    return ring

def create_arrow_mesh(start_pt: np.ndarray, end_pt: np.ndarray, color: List[float], radius: float = 0.2) -> Optional[o3d.geometry.TriangleMesh]:
    """Creates a 3D arrow mesh pointing from start_pt to end_pt."""
    vec = end_pt - start_pt
    length = np.linalg.norm(vec)
    if length < 0.01:
        return None

    cylinder_radius = radius
    cone_radius = radius * 2.0
    cone_height = min(length * 0.3, 1.2)
    cylinder_height = length - cone_height

    if cylinder_height <= 0:
        return None

    arrow = o3d.geometry.TriangleMesh.create_arrow(
        cylinder_radius=cylinder_radius,
        cone_radius=cone_radius,
        cylinder_height=cylinder_height,
        cone_height=cone_height,
        resolution=16,
        cylinder_split=4,
        cone_split=1
    )
    arrow.paint_uniform_color(color)

    # Default arrow in Open3D points along +Z axis [0, 0, 1]
    default_dir = np.array([0, 0, 1], dtype=np.float64)
    target_dir = vec / length

    # Rotation matrix from default_dir to target_dir
    axis = np.cross(default_dir, target_dir)
    axis_norm = np.linalg.norm(axis)
    if axis_norm > 1e-6:
        axis = axis / axis_norm
        angle = np.arccos(np.clip(np.dot(default_dir, target_dir), -1.0, 1.0))
        # Rodrigues rotation
        k = np.array([
            [0, -axis[2], axis[1]],
            [axis[2], 0, -axis[0]],
            [-axis[1], axis[0], 0]
        ])
        rot = np.eye(3) + np.sin(angle) * k + (1 - np.cos(angle)) * (k @ k)
        arrow.rotate(rot, center=np.array([0, 0, 0]))
    elif np.dot(default_dir, target_dir) < 0:
        # 180 flip
        arrow.rotate(np.diag([1, -1, -1]), center=np.array([0, 0, 0]))

    arrow.translate(start_pt)
    return arrow

def build_open3d_hodograph_spiral(
    analyzed_obs: Dict[str, Any],
    scale_uv: float = 1.0,
    scale_z: float = 0.003
) -> List[o3d.geometry.Geometry]:
    """
    Constructs an Open3D geometry collection for the 3D Hodograph Spiral.
    Axes convention:
    X: U Component (East-West, +X = East, -X = West)
    Y: V Component (North-South, +Y = North, -Y = South)
    Z: Altitude (Vertical, +Z = Upwards)
    """
    pts_data = analyzed_obs.get('hodograph_points', [])
    if not pts_data:
        return []

    geometries = []
    num_pts = len(pts_data)
    points_3d = np.zeros((num_pts, 3), dtype=np.float64)
    line_colors = np.zeros((num_pts - 1, 3), dtype=np.float64)
    lines = np.zeros((num_pts - 1, 2), dtype=np.int32)

    max_z = pts_data[-1]['height_ft'] * scale_z

    for i, p in enumerate(pts_data):
        x = p['u'] * scale_uv
        y = p['v'] * scale_uv
        z = p['height_ft'] * scale_z
        points_3d[i] = [x, y, z]

        col = get_altitude_color_rgb(p['height_ft'])

        # Level sphere marker
        sphere = o3d.geometry.TriangleMesh.create_sphere(radius=0.55 if i == 0 else 0.42, resolution=16)
        sphere.paint_uniform_color(col)
        sphere.translate([x, y, z])
        sphere.compute_vertex_normals()
        geometries.append(sphere)

        # Vector arrow from vertical spine (0, 0, z) to (x, y, z)
        spine_pt = np.array([0, 0, z], dtype=np.float64)
        end_pt = np.array([x, y, z], dtype=np.float64)
        arrow = create_arrow_mesh(spine_pt, end_pt, col, radius=0.10)
        if arrow:
            arrow.compute_vertex_normals()
            geometries.append(arrow)

        if i > 0:
            lines[i - 1] = [i - 1, i]
            line_colors[i - 1] = col

    # Trajectory LineSet connecting all levels
    trajectory_lineset = o3d.geometry.LineSet()
    trajectory_lineset.points = o3d.utility.Vector3dVector(points_3d)
    trajectory_lineset.lines = o3d.utility.Vector2iVector(lines)
    trajectory_lineset.colors = o3d.utility.Vector3dVector(line_colors)
    geometries.append(trajectory_lineset)

    # Central Vertical Z-Spine Axis (Spine from 0 to max_z + 2)
    spine_len = max_z + 3.0
    spine = o3d.geometry.TriangleMesh.create_cylinder(radius=0.15, height=spine_len, resolution=16)
    spine.paint_uniform_color([0.4, 0.45, 0.5])
    spine.translate([0, 0, spine_len / 2.0])
    spine.compute_vertex_normals()
    geometries.append(spine)

    # Concentric speed rings on floor (5, 10, 15, 20, 25, 30 kt)
    for spd in [5, 10, 15, 20, 25, 30]:
        r = spd * scale_uv
        color = [0.95, 0.6, 0.1] if spd == 20 else [0.2, 0.5, 0.7]
        ring = create_circle_lineset(r, z=0.0, num_segments=64, color=color)
        geometries.append(ring)

    # Coordinate Axis Frame at origin (X=Red/East, Y=Green/North, Z=Blue/Up)
    coord_frame = o3d.geometry.TriangleMesh.create_coordinate_frame(size=6.0, origin=[0, 0, 0])
    geometries.append(coord_frame)

    return geometries

def build_open3d_balloon_trajectory(
    analyzed_obs: Dict[str, Any],
    processed_obs: Dict[str, Any],
    scale_horiz: float = 0.003,
    scale_z: float = 0.003
) -> List[o3d.geometry.Geometry]:
    """
    Constructs an Open3D geometry collection for the physical 3D balloon flight drift path.
    X: East displacement
    Y: North displacement
    Z: Height altitude
    """
    theodolite_records = processed_obs.get('theodolite_records', [])
    records = [r for r in theodolite_records if r.get('elevation') and r['elevation'] > 0 and r.get('azimuth') is not None]

    if not records:
        return build_open3d_hodograph_spiral(analyzed_obs)

    ascent_rate_ft_per_min = 600.0
    geometries = []
    num_pts = len(records)
    pts_3d = np.zeros((num_pts, 3), dtype=np.float64)
    lines = np.zeros((num_pts - 1, 2), dtype=np.int32)
    line_colors = np.zeros((num_pts - 1, 3), dtype=np.float64)

    for i, r in enumerate(records):
        z_ft = r['minute'] * ascent_rate_ft_per_min
        el_rad = math.radians(r['elevation'])
        az_rad = math.radians(r['azimuth'])

        horiz_dist_ft = z_ft / math.tan(el_rad)
        x = horiz_dist_ft * math.sin(az_rad) * scale_horiz
        y = horiz_dist_ft * math.cos(az_rad) * scale_horiz
        z = z_ft * scale_z

        pts_3d[i] = [x, y, z]
        col = get_altitude_color_rgb(z_ft)

        # Waypoint marker
        is_last = (i == num_pts - 1)
        sphere = o3d.geometry.TriangleMesh.create_sphere(radius=0.6 if (i == 0 or is_last) else 0.35, resolution=16)
        sphere.paint_uniform_color([0.9, 0.2, 0.3] if is_last else ([0.2, 0.8, 0.4] if i == 0 else col))
        sphere.translate([x, y, z])
        sphere.compute_vertex_normals()
        geometries.append(sphere)

        if i > 0:
            lines[i - 1] = [i - 1, i]
            line_colors[i - 1] = [0.2, 0.85, 0.4] # Glowing green flight path

    # Trajectory LineSet
    flight_lines = o3d.geometry.LineSet()
    flight_lines.points = o3d.utility.Vector3dVector(pts_3d)
    flight_lines.lines = o3d.utility.Vector2iVector(lines)
    flight_lines.colors = o3d.utility.Vector3dVector(line_colors)
    geometries.append(flight_lines)

    # Launch station pad model at (0, 0, 0)
    station_dome = o3d.geometry.TriangleMesh.create_sphere(radius=1.2, resolution=20)
    station_dome.paint_uniform_color([0.15, 0.55, 0.85])
    station_dome.compute_vertex_normals()
    geometries.append(station_dome)

    # Coordinate frame
    coord = o3d.geometry.TriangleMesh.create_coordinate_frame(size=8.0, origin=[0, 0, 0])
    geometries.append(coord)

    return geometries

def build_open3d_overlay_all(analysis_observations: List[Dict[str, Any]]) -> List[o3d.geometry.Geometry]:
    """
    Overlays all 21 daily observations simultaneously in Open3D space.
    """
    geometries = []
    colors_palette = [
        [0.2, 0.7, 1.0], [0.1, 0.9, 0.5], [1.0, 0.8, 0.2], [1.0, 0.4, 0.2],
        [0.9, 0.3, 0.7], [0.7, 0.3, 1.0], [0.3, 1.0, 0.9], [1.0, 0.9, 0.4],
        [0.5, 0.8, 1.0], [0.4, 1.0, 0.6], [1.0, 0.5, 0.5], [0.8, 0.6, 1.0],
        [0.2, 0.9, 0.8], [0.9, 0.7, 0.3], [0.3, 0.6, 1.0], [0.7, 0.9, 0.4],
        [1.0, 0.3, 0.4], [0.6, 0.4, 0.9], [0.4, 0.9, 1.0], [0.8, 1.0, 0.3],
        [1.0, 0.6, 0.8]
    ]

    for idx, obs in enumerate(analysis_observations):
        pts = obs.get('hodograph_points', [])
        if len(pts) < 2:
            continue
        color = colors_palette[idx % len(colors_palette)]
        n = len(pts)
        pts_3d = np.zeros((n, 3), dtype=np.float64)
        lines = np.zeros((n - 1, 2), dtype=np.int32)
        cols = np.tile(color, (n - 1, 1))

        for i, p in enumerate(pts):
            pts_3d[i] = [p['u'], p['v'], p['height_ft'] * 0.003]
            if i > 0:
                lines[i - 1] = [i - 1, i]

        ls = o3d.geometry.LineSet()
        ls.points = o3d.utility.Vector3dVector(pts_3d)
        ls.lines = o3d.utility.Vector2iVector(lines)
        ls.colors = o3d.utility.Vector3dVector(cols)
        geometries.append(ls)

    # Reference rings on floor
    for spd in [10, 20, 30]:
        geometries.append(create_circle_lineset(spd, z=0.0, color=[0.3, 0.4, 0.5]))

    # Coord frame
    geometries.append(o3d.geometry.TriangleMesh.create_coordinate_frame(size=10.0))
    return geometries

def visualize_interactive(
    observation_id: str,
    data_bundle_path: str,
    mode: str = 'spiral'
):
    """
    Opens an interactive Open3D OpenGL rendering window on desktop.
    """
    with open(data_bundle_path, 'r', encoding='utf-8') as f:
        bundle = json.load(f)

    an_obs = next((o for o in bundle['analysis_observations'] if o['observation_id'] == observation_id), bundle['analysis_observations'][0])
    proc_obs = next((o for o in bundle['processed_observations'] if o['observation_id'] == an_obs['observation_id']), bundle['processed_observations'][0])

    if mode == 'spiral':
        window_title = f"Open3D - 3D Hodograph Spiral [{an_obs['date_iso']} 06 UTC] - Stamet Cilacap"
        geometries = build_open3d_hodograph_spiral(an_obs)
    elif mode == 'trajectory':
        window_title = f"Open3D - Trajektori Balon 3D [{an_obs['date_iso']} 06 UTC] - Stamet Cilacap"
        geometries = build_open3d_balloon_trajectory(an_obs, proc_obs)
    elif mode == 'overlay':
        window_title = f"Open3D - Overlay 21 Hari PiBal (Agustus 2026) - Stamet Cilacap"
        geometries = build_open3d_overlay_all(bundle['analysis_observations'])
    else:
        raise ValueError(f"Unknown mode: {mode}")

    print("=" * 70)
    print(f"  MEMBUKA VISUALISASI 3D MENGGUNAKAN LIBRARY OPEN3D")
    print(f"  Judul Window: {window_title}")
    print(f"  Total Objek Geometri: {len(geometries)}")
    print("  Kontrol Interaktif Open3D:")
    print("    - Klik Kiri + Geser   : Rotasi Sudut Pandang 3D (Orbit)")
    print("    - Scroll Roda Mouse   : Zoom In / Zoom Out")
    print("    - Shift + Klik Kiri   : Geser Kanvas (Pan)")
    print("    - Tombol 'H'          : Bantuan Pintasan Keyboard")
    print("    - Tombol 'Q' / ESC    : Keluar dari Jendela 3D")
    print("=" * 70)

    o3d.visualization.draw_geometries(
        geometries,
        window_name=window_title,
        width=1280,
        height=760,
        left=50,
        top=50
    )
