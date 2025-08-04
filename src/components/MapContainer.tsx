import React, { useCallback, useRef, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, CircleMarker, Polygon, Popup } from 'react-leaflet';
import { Map as LeafletMap, LatLngExpression } from 'leaflet';
import { useDataContext } from '../context/DataContext';
import { PolygonDrawer } from './PolygonDrawer';
import { MapControls } from './MapControls';

export const MapContainer: React.FC = () => {
  const { 
    dataPoints, 
    selectedDataset, 
    datasets, 
    polygons, 
    isDrawingMode 
  } = useDataContext();
  
  const mapRef = useRef<LeafletMap | null>(null);
  const currentDataset = datasets.find(d => d.id === selectedDataset);

  // Calculate color based on data value
  const getPointColor = useCallback((value: number, dataset: typeof currentDataset) => {
    if (!dataset) return '#94a3b8';
    
    const normalized = (value - dataset.min) / (dataset.max - dataset.min);
    const intensity = Math.max(0, Math.min(1, normalized));
    
    // Create color gradient from light to intense based on dataset color
    const baseColor = dataset.color;
    const opacity = 0.3 + (intensity * 0.7);
    
    return `${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
  }, []);

  const getPointRadius = useCallback((value: number, dataset: typeof currentDataset) => {
    if (!dataset) return 5;
    
    const normalized = (value - dataset.min) / (dataset.max - dataset.min);
    return 3 + (normalized * 7); // Radius between 3 and 10
  }, []);

  // Center map on data points
  const center: LatLngExpression = dataPoints.length > 0 
    ? [
        dataPoints.reduce((sum, p) => sum + p.latitude, 0) / dataPoints.length,
        dataPoints.reduce((sum, p) => sum + p.longitude, 0) / dataPoints.length
      ]
    : [40.7128, -74.0060]; // Default to NYC

  return (
    <div className="map-container">
      <MapControls />
      
      <LeafletMapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render data points */}
        {currentDataset && dataPoints.map(point => {
          const value = point.datasets[selectedDataset];
          if (value === undefined) return null;
          
          return (
            <CircleMarker
              key={point.id}
              center={[point.latitude, point.longitude]}
              radius={getPointRadius(value, currentDataset)}
              fillColor={currentDataset.color}
              color={currentDataset.color}
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <strong>Data Point</strong><br/>
                  <strong>{currentDataset.name}:</strong> {value.toFixed(2)} {currentDataset.unit}<br/>
                  <strong>Location:</strong> {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}<br/>
                  <strong>Time:</strong> {point.timestamp}
                  <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    <strong>All Values:</strong><br/>
                    {Object.entries(point.datasets).map(([key, val]) => {
                      const ds = datasets.find(d => d.id === key);
                      return ds ? (
                        <div key={key}>
                          {ds.name}: {val.toFixed(1)} {ds.unit}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        
        {/* Render polygons */}
        {polygons.map(polygon => (
          <Polygon
            key={polygon.id}
            positions={polygon.coordinates}
            color={polygon.color}
            fillColor={polygon.color}
            fillOpacity={polygon.opacity}
            weight={2}
          >
            <Popup>
              <div>
                <strong>{polygon.name}</strong><br/>
                <strong>Type:</strong> {polygon.metadata?.type || 'Custom'}<br/>
                {polygon.metadata?.threshold && (
                  <>
                    <strong>Threshold:</strong> {polygon.metadata.threshold}<br/>
                  </>
                )}
                <strong>Points:</strong> {polygon.coordinates.length}
              </div>
            </Popup>
          </Polygon>
        ))}
        
        {/* Polygon drawing component */}
        {isDrawingMode && <PolygonDrawer />}
      </LeafletMapContainer>
    </div>
  );
};
