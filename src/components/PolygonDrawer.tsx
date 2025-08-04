import React, { useState, useCallback } from 'react';
import { useMapEvents, Polyline, CircleMarker } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { useDataContext } from '../context/DataContext';
import { PolygonData } from '../types';

export const PolygonDrawer: React.FC = () => {
  const [currentPoints, setCurrentPoints] = useState<LatLng[]>([]);
  const { onPolygonCreate, setIsDrawingMode } = useDataContext();

  const map = useMapEvents({
    click: useCallback((e: any) => {
      const newPoint = e.latlng;
      setCurrentPoints(prev => [...prev, newPoint]);
    }, []),
    
    dblclick: useCallback(() => {
      if (currentPoints.length >= 3) {
        // Create polygon
        const polygon: PolygonData = {
          id: `polygon-${Date.now()}`,
          name: `Polygon ${Date.now()}`,
          coordinates: currentPoints.map(point => [point.lat, point.lng] as [number, number]),
          color: '#3b82f6',
          opacity: 0.3,
          metadata: {
            type: 'user_drawn',
            created: new Date().toISOString(),
          },
        };
        
        onPolygonCreate(polygon);
        setCurrentPoints([]);
        setIsDrawingMode(false);
      }
    }, [currentPoints, onPolygonCreate, setIsDrawingMode]),
  });

  return (
    <>
      {/* Show current drawing points */}
      {currentPoints.map((point, index) => (
        <CircleMarker
          key={index}
          center={point}
          radius={4}
          color="#3b82f6"
          fillColor="#3b82f6"
          fillOpacity={0.8}
        />
      ))}
      
      {/* Show current drawing line */}
      {currentPoints.length > 1 && (
        <Polyline
          positions={currentPoints}
          color="#3b82f6"
          weight={2}
          opacity={0.8}
          dashArray="5, 5"
        />
      )}
      
      {/* Show closing line when we have enough points */}
      {currentPoints.length >= 3 && (
        <Polyline
          positions={[currentPoints[currentPoints.length - 1], currentPoints[0]]}
          color="#3b82f6"
          weight={2}
          opacity={0.5}
          dashArray="10, 5"
        />
      )}
    </>
  );
};
