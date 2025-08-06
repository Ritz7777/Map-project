import  { useState, useCallback, useEffect } from 'react';
import { MapContainer } from './components/MapContainer';
import { Timeline } from './components/Timeline';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DataProvider } from './context/DataContext';
import { generateMockData } from './utils/mockData';
import { DataPoint, Dataset, PolygonData } from './types';

function App() {
  const [selectedDataset, setSelectedDataset] = useState<string>('temperature');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [timeRange, setTimeRange] = useState({ start: 0, end: 100 });
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Initialize mock data
  useEffect(() => {
    const mockData = generateMockData();
    setDatasets(mockData.datasets);
    setDataPoints(mockData.dataPoints);
    setPolygons(mockData.polygons);
  }, []);

  // Filter data points based on selected dataset and time range
  const filteredDataPoints = dataPoints.filter(point => {
    const timeInRange = point.timestamp >= timeRange.start && point.timestamp <= timeRange.end;
    return timeInRange && point.datasets[selectedDataset] !== undefined;
  });

  const handlePolygonCreate = useCallback((polygon: PolygonData) => {
    setPolygons(prev => [...prev, polygon]);
  }, []);

  const handlePolygonDelete = useCallback((id: string) => {
    setPolygons(prev => prev.filter(p => p.id !== id));
  }, []);

  const contextValue = {
    selectedDataset,
    setSelectedDataset,
    datasets,
    dataPoints: filteredDataPoints,
    polygons,
    timeRange,
    setTimeRange,
    isDrawingMode,
    setIsDrawingMode,
    onPolygonCreate: handlePolygonCreate,
    onPolygonDelete: handlePolygonDelete,
  };

  return (
    <DataProvider value={contextValue}>
      <div className="dashboard">
        <Header />
        <Sidebar />
        <MapContainer />
        <Timeline />
      </div>
    </DataProvider>
  );
}

export default App;
