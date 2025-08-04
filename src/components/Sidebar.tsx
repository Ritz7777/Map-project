import React from 'react';
import { useDataContext } from '../context/DataContext';

export const Sidebar: React.FC = () => {
  const { 
    datasets, 
    selectedDataset, 
    setSelectedDataset, 
    dataPoints, 
    timeRange, 
    setTimeRange,
    isDrawingMode,
    setIsDrawingMode,
    polygons 
  } = useDataContext();

  const currentDataset = datasets.find(d => d.id === selectedDataset);
  
  // Calculate statistics for current dataset
  const currentValues = dataPoints
    .map(point => point.datasets[selectedDataset])
    .filter(val => val !== undefined);
  
  const stats = {
    count: currentValues.length,
    avg: currentValues.length > 0 ? currentValues.reduce((a, b) => a + b, 0) / currentValues.length : 0,
    min: currentValues.length > 0 ? Math.min(...currentValues) : 0,
    max: currentValues.length > 0 ? Math.max(...currentValues) : 0,
  };

  return (
    <aside className="sidebar">
      <div className="control-panel">
        <h2>Dataset Selection</h2>
        <div className="dataset-grid">
          {datasets.map(dataset => (
            <div
              key={dataset.id}
              className={`dataset-item ${selectedDataset === dataset.id ? 'selected' : ''}`}
              onClick={() => setSelectedDataset(dataset.id)}
            >
              <div 
                className="color-indicator" 
                style={{ backgroundColor: dataset.color }}
              />
              <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                {dataset.name}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                {dataset.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="control-panel">
        <h3>Time Range</h3>
        <div className="control-group">
          <label className="control-label">Start Time</label>
          <input
            type="range"
            min="0"
            max="100"
            value={timeRange.start}
            onChange={(e) => setTimeRange({ ...timeRange, start: Number(e.target.value) })}
            className="control-input"
          />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{timeRange.start}</span>
        </div>
        <div className="control-group">
          <label className="control-label">End Time</label>
          <input
            type="range"
            min="0"
            max="100"
            value={timeRange.end}
            onChange={(e) => setTimeRange({ ...timeRange, end: Number(e.target.value) })}
            className="control-input"
          />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{timeRange.end}</span>
        </div>
      </div>

      <div className="control-panel">
        <h3>Map Tools</h3>
        <button
          className={`button ${isDrawingMode ? 'active' : 'secondary'}`}
          onClick={() => setIsDrawingMode(!isDrawingMode)}
        >
          {isDrawingMode ? 'Exit Drawing' : 'Draw Polygon'}
        </button>
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
          Polygons: {polygons.length}
        </div>
      </div>

      {currentDataset && (
        <div className="control-panel">
          <h3>Statistics</h3>
          <div style={{ fontSize: '12px', color: currentDataset.color, marginBottom: '12px' }}>
            {currentDataset.name} ({currentDataset.unit})
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.count}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.avg.toFixed(1)}</div>
              <div className="stat-label">Average</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.min.toFixed(1)}</div>
              <div className="stat-label">Minimum</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.max.toFixed(1)}</div>
              <div className="stat-label">Maximum</div>
            </div>
          </div>
        </div>
      )}

      <div className="control-panel">
        <h3>Legend</h3>
        <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
          • Click datasets to switch visualization<br/>
          • Use time sliders to filter data<br/>
          • Draw polygons to define regions<br/>
          • Colors represent data intensity
        </div>
      </div>
    </aside>
  );
};
