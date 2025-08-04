import { DataPoint, Dataset, PolygonData } from '../types';

export const generateMockData = () => {
  const datasets: Dataset[] = [
    {
      id: 'temperature',
      name: 'Temperature',
      color: '#ef4444',
      unit: '°C',
      min: -10,
      max: 40,
    },
    {
      id: 'humidity',
      name: 'Humidity',
      color: '#3b82f6',
      unit: '%',
      min: 0,
      max: 100,
    },
    {
      id: 'pressure',
      name: 'Pressure',
      color: '#10b981',
      unit: 'hPa',
      min: 980,
      max: 1040,
    },
    {
      id: 'windSpeed',
      name: 'Wind Speed',
      color: '#f59e0b',
      unit: 'm/s',
      min: 0,
      max: 25,
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      color: '#8b5cf6',
      unit: 'mm',
      min: 0,
      max: 50,
    },
  ];

  // Generate data points across a geographic area (roughly covering a city)
  const dataPoints: DataPoint[] = [];
  const baseLatitude = 40.7128; // New York City area
  const baseLongitude = -74.0060;
  
  for (let i = 0; i < 500; i++) {
    const lat = baseLatitude + (Math.random() - 0.5) * 0.2; // ~10km radius
    const lng = baseLongitude + (Math.random() - 0.5) * 0.2;
    const timestamp = Math.floor(Math.random() * 100); // 0-100 time units
    
    const datasets_data: Record<string, number> = {};
    datasets.forEach(dataset => {
      // Generate realistic data with some correlation to location and time
      const locationFactor = Math.sin(lat * 10) * Math.cos(lng * 10);
      const timeFactor = Math.sin(timestamp * 0.1);
      const randomFactor = (Math.random() - 0.5) * 0.5;
      
      const normalizedValue = (locationFactor + timeFactor + randomFactor + 2) / 4;
      const value = dataset.min + normalizedValue * (dataset.max - dataset.min);
      datasets_data[dataset.id] = Math.round(value * 100) / 100;
    });

    dataPoints.push({
      id: `point-${i}`,
      latitude: lat,
      longitude: lng,
      timestamp,
      datasets: datasets_data,
    });
  }

  // Generate some sample polygons
  const polygons: PolygonData[] = [
    {
      id: 'zone-1',
      name: 'High Temperature Zone',
      coordinates: [
        [baseLatitude + 0.05, baseLongitude + 0.05],
        [baseLatitude + 0.05, baseLongitude + 0.1],
        [baseLatitude + 0.1, baseLongitude + 0.1],
        [baseLatitude + 0.1, baseLongitude + 0.05],
      ],
      color: '#ef4444',
      opacity: 0.3,
      metadata: { type: 'temperature_zone', threshold: 30 },
    },
    {
      id: 'zone-2',
      name: 'Low Pressure Area',
      coordinates: [
        [baseLatitude - 0.05, baseLongitude - 0.05],
        [baseLatitude - 0.05, baseLongitude],
        [baseLatitude, baseLongitude],
        [baseLatitude, baseLongitude - 0.05],
      ],
      color: '#10b981',
      opacity: 0.3,
      metadata: { type: 'pressure_zone', threshold: 1000 },
    },
  ];

  return { datasets, dataPoints, polygons };
};
