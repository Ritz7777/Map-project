import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import { useDataContext } from '../context/DataContext';

export const Timeline: React.FC = () => {
  const { 
    dataPoints, 
    selectedDataset, 
    datasets, 
    timeRange, 
    setTimeRange 
  } = useDataContext();

  const currentDataset = datasets.find(d => d.id === selectedDataset);

  // Aggregate data by timestamp for timeline
  const timelineData = useMemo(() => {
    if (!currentDataset) return [];

    const aggregated = new Map<number, { timestamp: number; values: number[]; count: number }>();

    dataPoints.forEach(point => {
      const value = point.datasets[selectedDataset];
      if (value !== undefined) {
        const existing = aggregated.get(point.timestamp);
        if (existing) {
          existing.values.push(value);
          existing.count++;
        } else {
          aggregated.set(point.timestamp, {
            timestamp: point.timestamp,
            values: [value],
            count: 1,
          });
        }
      }
    });

    return Array.from(aggregated.values())
      .map(item => ({
        timestamp: item.timestamp,
        value: item.values.reduce((a, b) => a + b, 0) / item.values.length,
        count: item.count,
        min: Math.min(...item.values),
        max: Math.max(...item.values),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [dataPoints, selectedDataset, currentDataset]);

  const handleBrushChange = (brushData: any) => {
    if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
      const startTime = timelineData[brushData.startIndex]?.timestamp || 0;
      const endTime = timelineData[brushData.endIndex]?.timestamp || 100;
      setTimeRange({ start: startTime, end: endTime });
    }
  };

  if (!currentDataset) {
    return (
      <div className="timeline-container">
        <div className="loading">
          Select a dataset to view timeline
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Timeline - {currentDataset.name}</h2>
        <div style={{ fontSize: '14px', color: '#94a3b8' }}>
          Range: {timeRange.start} - {timeRange.end} | 
          Points: {timelineData.length} | 
          Active: {timelineData.filter(d => d.timestamp >= timeRange.start && d.timestamp <= timeRange.end).length}
        </div>
      </div>
      
      <div className="timeline-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => `T${value}`}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(1)}${currentDataset.unit}`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
              formatter={(value: any, name: string) => [
                `${value.toFixed(2)} ${currentDataset.unit}`,
                currentDataset.name
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={currentDataset.color}
              strokeWidth={2}
              dot={{ fill: currentDataset.color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: currentDataset.color, strokeWidth: 2 }}
            />
            <Brush
              dataKey="timestamp"
              height={30}
              stroke={currentDataset.color}
              fill="rgba(59, 130, 246, 0.1)"
              onChange={handleBrushChange}
              startIndex={timelineData.findIndex(d => d.timestamp >= timeRange.start)}
              endIndex={timelineData.findIndex(d => d.timestamp >= timeRange.end) || timelineData.length - 1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '12px',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        <div>
          <strong>Statistics in Range:</strong>
        </div>
        <div>
          Min: {Math.min(...timelineData
            .filter(d => d.timestamp >= timeRange.start && d.timestamp <= timeRange.end)
            .map(d => d.value)
          ).toFixed(2)} {currentDataset.unit}
        </div>
        <div>
          Max: {Math.max(...timelineData
            .filter(d => d.timestamp >= timeRange.start && d.timestamp <= timeRange.end)
            .map(d => d.value)
          ).toFixed(2)} {currentDataset.unit}
        </div>
        <div>
          Avg: {(timelineData
            .filter(d => d.timestamp >= timeRange.start && d.timestamp <= timeRange.end)
            .reduce((sum, d) => sum + d.value, 0) / 
            timelineData.filter(d => d.timestamp >= timeRange.start && d.timestamp <= timeRange.end).length
          ).toFixed(2)} {currentDataset.unit}
        </div>
      </div>
    </div>
  );
};
