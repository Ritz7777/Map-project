export interface DataPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  datasets: Record<string, number>;
}

export interface Dataset {
  id: string;
  name: string;
  color: string;
  unit: string;
  min: number;
  max: number;
}

export interface PolygonData {
  id: string;
  name: string;
  coordinates: [number, number][];
  color: string;
  opacity: number;
  metadata?: Record<string, any>;
}

export interface TimelineData {
  timestamp: number;
  value: number;
  dataset: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface DataContextType {
  selectedDataset: string;
  setSelectedDataset: (dataset: string) => void;
  datasets: Dataset[];
  dataPoints: DataPoint[];
  polygons: PolygonData[];
  timeRange: { start: number; end: number };
  setTimeRange: (range: { start: number; end: number }) => void;
  isDrawingMode: boolean;
  setIsDrawingMode: (drawing: boolean) => void;
  onPolygonCreate: (polygon: PolygonData) => void;
  onPolygonDelete: (id: string) => void;
}
