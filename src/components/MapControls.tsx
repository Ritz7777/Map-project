import React from 'react';
import { Layers, Square, Trash2 } from 'lucide-react';
import { useDataContext } from '../context/DataContext';

export const MapControls: React.FC = () => {
  const { 
    isDrawingMode, 
    setIsDrawingMode, 
    polygons, 
    onPolygonDelete 
  } = useDataContext();

  return (
    <div className="polygon-tools">
      <button
        className={`tool-button ${isDrawingMode ? 'active' : ''}`}
        onClick={() => setIsDrawingMode(!isDrawingMode)}
        title={isDrawingMode ? 'Exit Drawing Mode' : 'Enter Drawing Mode'}
      >
        <Square size={16} />
      </button>
      
      <button
        className="tool-button"
        title="Toggle Layers"
      >
        <Layers size={16} />
      </button>
      
      {polygons.length > 0 && (
        <button
          className="tool-button"
          onClick={() => {
            if (polygons.length > 0) {
              onPolygonDelete(polygons[polygons.length - 1].id);
            }
          }}
          title="Delete Last Polygon"
        >
          <Trash2 size={16} />
        </button>
      )}
      
      <div style={{ 
        fontSize: '10px', 
        color: '#94a3b8', 
        textAlign: 'center', 
        marginTop: '8px',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        {isDrawingMode ? 'Click to draw' : `${polygons.length} polygons`}
      </div>
    </div>
  );
};
