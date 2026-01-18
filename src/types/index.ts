export interface SummaryStatistics {
  total_accidents: number;
  date_range: {
    start: string;
    end: string;
  };
  severity_distribution: {
    Fatal: number;
    Serious: number;
    Slight: number;
  };
  model_performance: {
    best_model: string;
    accuracy: number;
    f1_score: number;
  };
  encoding_info?: {
    note: string;
    original_codes: string;
  };
}

export interface GridCell {
  lat: number;
  lon: number;
  total_accidents: number;
  avg_severity: number;
  fatal_count: number;
  serious_count: number;
  slight_count: number;
  risk_score: number;
}

export interface Accident {
  latitude: number;
  longitude: number;
  severity_label: 'Fatal' | 'Serious' | 'Slight';
  collision_severity: number;
}

export type SeverityType = 'Fatal' | 'Serious' | 'Slight' | 'all';

export interface SeverityData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export interface RiskZone {
  location: string;
  risk: string;
  accidents: number;
  fatal: number;
  lat: number;
  lon: number;
  [key: string]: string | number;
}