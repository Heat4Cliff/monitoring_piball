export interface PibalLevel {
  level_index: number;
  height_ft: number;
  height_m: number;
  direction_deg: number;
  speed_kt: number;
  speed_ms: number;
  source_u: number;
  source_v: number;
  calculated_u: number;
  calculated_v: number;
  diff_u: number;
  diff_v: number;
  uv_status: string;
  vb_source?: string;
  advection_source?: string;
  quality_status: 'VALID' | 'SUSPICIOUS' | 'INVALID' | 'MISSING';
  validation_notes: string;
  source_file: string;
  source_page: number;
}

export interface TheodoliteRecord {
  minute: number;
  azimuth: number | null;
  elevation: number | null;
  derived_dir: number | null;
  derived_speed: number | null;
}

export interface ObservationMetadata {
  station: string;
  msl_raw: string;
  msl_m: number;
  observation_date_raw: string;
  observation_date_iso: string;
  observation_time: string;
  observer: string;
  termination_reason: string;
  termination_description: string;
  num_pages: number;
}

export interface ProcessedObservation {
  observation_id: string;
  source_file: string;
  source_path: string;
  source_size_bytes: number;
  metadata: ObservationMetadata;
  codes: {
    ppaa?: string;
    ppbb?: string;
  };
  theodolite_records: TheodoliteRecord[];
  levels: PibalLevel[];
  extracted_image?: string;
  quality: {
    status: 'VALID' | 'SUSPICIOUS' | 'INVALID';
    total_levels: number;
    valid_levels: number;
    suspicious_levels: number;
    invalid_levels: number;
    summary: string;
    issues: string[];
  };
}

export interface ShearLayer {
  layer_index: number;
  bottom_level: number;
  top_level: number;
  altitude_range_ft: string;
  bottom_height_ft: number;
  top_height_ft: number;
  delta_z_ft: number;
  delta_u: number;
  delta_v: number;
  shear_vector_mag_kt: number;
  shear_rate_per_kft: number;
  shear_rate_si: number;
  speed_diff_kt: number;
  dir_diff_deg: number;
  calculated_vb: string;
  calculated_advection: string;
  source_vb?: string;
  source_advection?: string;
  severity: string;
}

export interface HodographPoint {
  height_ft: number;
  height_m: number;
  u: number;
  v: number;
  speed_kt: number;
  direction_deg: number;
  level_index: number;
  vb?: string;
  advection?: string;
}

export interface EvidenceFinding {
  id: string;
  title: string;
  claim: string;
  evidence: Record<string, string | number>;
  calculation: string;
  interpretation: string;
  source_file: string;
  source_page: number;
}

export interface DetailedConclusions {
  q1_vertical_characteristics: string;
  q2_speed_variation: string;
  q3_direction_variation: string;
  q4_hodograph_features: string;
  q5_most_significant_transition_layer: string;
  q6_wind_shear_results: string;
  q7_data_limitations: string;
  q8_scientifically_defensible_findings: string;
}

export interface AnalysisObservation {
  observation_id: string;
  source_file: string;
  date_iso: string;
  time_utc: string;
  station: string;
  observer: string;
  termination_reason: string;
  termination_description: string;
  statistics: {
    total_levels: number;
    min_altitude_ft: number;
    max_altitude_ft: number;
    min_speed_kt: number;
    max_speed_kt: number;
    mean_speed_kt: number;
    median_speed_kt: number;
    u_min: number;
    u_max: number;
    u_mean: number;
    v_min: number;
    v_max: number;
    v_mean: number;
  };
  shear_layers: ShearLayer[];
  max_shear_layer?: ShearLayer;
  hodograph_points: HodographPoint[];
  findings: EvidenceFinding[];
  interpretations: {
    speed_profile: string;
    direction_profile: string;
    hodograph_trajectory: string;
    wind_shear: string;
    data_quality_warning: string;
  };
  conclusions: {
    summary: string;
    detailed_answers: DetailedConclusions;
  };
  status: string;
}

export interface InventoryItem {
  file_name: string;
  file_size_bytes: number;
  sha256: string;
  station: string;
  date_raw: string;
  date_iso: string;
  time: string;
  observer: string;
  termination_reason: string;
  total_levels: number;
  parsing_status: string;
  has_extracted_image: boolean;
}

export interface AggregateStats {
  total_observations: number;
  date_range: {
    start: string;
    end: string;
  };
  station: string;
  total_levels_analyzed: number;
  altitude: {
    min_ft: number;
    max_ft: number;
    avg_top_altitude_ft: number;
  };
  wind_speed_kt: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
  wind_shear_per_kft: {
    min: number;
    max: number;
    mean: number;
  };
  observer_breakdown: Record<string, number>;
  termination_reason_breakdown: Record<string, number>;
}

export interface PibalBundle {
  generated_at: string;
  inventory: InventoryItem[];
  aggregate_stats: AggregateStats;
  processed_observations: ProcessedObservation[];
  analysis_observations: AnalysisObservation[];
}
