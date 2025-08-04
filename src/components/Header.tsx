import React from 'react';
import { useDataContext } from '../context/DataContext';

export const Header: React.FC = () => {
  const { dataPoints, selectedDataset, datasets } = useDataContext();
  
  const currentDataset = datasets.find(d => d.id === selectedDataset);
  const activePoints = dataPoints.length;

  return (
    <header className="header">
      <div>
        <h1>Dashboard Interface</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', color: '#94a3b8' }}>
        <div>
          Dataset: <span style={{ color: currentDataset?.color || '#3b82f6', fontWeight: '500' }}>
            {currentDataset?.name || 'None'}
          </span>
        </div>
        <div>
          Active Points: <span style={{ color: '#10b981', fontWeight: '500' }}>{activePoints}</span>
        </div>
        <div>
          Status: <span style={{ color: '#10b981', fontWeight: '500' }}>Live</span>
        </div>
      </div>
    </header>
  );
};
