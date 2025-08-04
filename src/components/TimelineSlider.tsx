import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useDataContext } from '../context/DataContext';

interface TimelineSliderProps {
  mode?: 'single' | 'range';
  onModeChange?: (mode: 'single' | 'range') => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({ 
  mode = 'single',
  onModeChange 
}) => {
  const { timeRange, setTimeRange } = useDataContext();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'single' | null>(null);
  const [currentMode, setCurrentMode] = useState<'single' | 'range'>(mode);

  // Calculate 30-day window (15 days before and after today)
  const now = new Date('2025-08-04T17:19:56+05:30');
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 15);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 15);

  // Generate hourly timestamps for the 30-day window
  const timelineHours = useMemo(() => {
    const hours = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    
    while (current <= endDate) {
      hours.push({
        timestamp: Math.floor(current.getTime() / 1000),
        date: new Date(current),
        hour: current.getHours(),
        isToday: current.toDateString() === now.toDateString()
      });
      current.setHours(current.getHours() + 1);
    }
    return hours;
  }, []);

  const totalHours = timelineHours.length;
  const minTimestamp = timelineHours[0]?.timestamp || 0;
  const maxTimestamp = timelineHours[totalHours - 1]?.timestamp || 100;

  // Convert timestamp to slider position (0-100%)
  const timestampToPosition = useCallback((timestamp: number) => {
    return ((timestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;
  }, [minTimestamp, maxTimestamp]);

  // Convert slider position to timestamp
  const positionToTimestamp = useCallback((position: number) => {
    const ratio = position / 100;
    const hourIndex = Math.round(ratio * (totalHours - 1));
    return timelineHours[hourIndex]?.timestamp || minTimestamp;
  }, [totalHours, timelineHours, minTimestamp]);

  // Get current positions
  const startPosition = timestampToPosition(timeRange.start);
  const endPosition = timestampToPosition(timeRange.end);
  const singlePosition = currentMode === 'single' ? startPosition : (startPosition + endPosition) / 2;

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: 'start' | 'end' | 'single') => {
    e.preventDefault();
    setIsDragging(handle);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newTimestamp = positionToTimestamp(position);

    if (currentMode === 'single' || isDragging === 'single') {
      setTimeRange({ start: newTimestamp, end: newTimestamp });
    } else if (isDragging === 'start') {
      setTimeRange({ start: Math.min(newTimestamp, timeRange.end), end: timeRange.end });
    } else if (isDragging === 'end') {
      setTimeRange({ start: timeRange.start, end: Math.max(newTimestamp, timeRange.start) });
    }
  }, [isDragging, currentMode, positionToTimestamp, timeRange, setTimeRange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleSliderClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;

    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;

    const position = ((e.clientX - rect.left) / rect.width) * 100;
    const newTimestamp = positionToTimestamp(position);

    if (currentMode === 'single') {
      setTimeRange({ start: newTimestamp, end: newTimestamp });
    } else {
      // For range mode, determine which handle to move based on proximity
      const distanceToStart = Math.abs(position - startPosition);
      const distanceToEnd = Math.abs(position - endPosition);
      
      if (distanceToStart < distanceToEnd) {
        setTimeRange({ start: Math.min(newTimestamp, timeRange.end), end: timeRange.end });
      } else {
        setTimeRange({ start: timeRange.start, end: Math.max(newTimestamp, timeRange.start) });
      }
    }
  }, [isDragging, currentMode, positionToTimestamp, startPosition, endPosition, timeRange, setTimeRange]);

  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
  }, []);

  const handleModeToggle = useCallback(() => {
    const newMode = currentMode === 'single' ? 'range' : 'single';
    setCurrentMode(newMode);
    onModeChange?.(newMode);
    
    if (newMode === 'single') {
      // When switching to single mode, use the start time
      setTimeRange({ start: timeRange.start, end: timeRange.start });
    }
  }, [currentMode, onModeChange, timeRange.start, setTimeRange]);

  // Add event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const startFormat = formatTimestamp(timeRange.start);
  const endFormat = formatTimestamp(timeRange.end);

  return (
    <div className="timeline-slider-container">
      <div className="timeline-slider-header">
        <h3>Timeline Control</h3>
        <div className="timeline-controls">
          <button 
            className={`mode-toggle ${currentMode === 'single' ? 'active' : ''}`}
            onClick={handleModeToggle}
          >
            {currentMode === 'single' ? 'Single Point' : 'Time Range'}
          </button>
        </div>
      </div>

      <div className="timeline-info">
        {currentMode === 'single' ? (
          <div className="time-display">
            <span className="time-label">Selected Time:</span>
            <span className="time-value">{startFormat.date} {startFormat.time}</span>
          </div>
        ) : (
          <div className="time-display">
            <div>
              <span className="time-label">From:</span>
              <span className="time-value">{startFormat.date} {startFormat.time}</span>
            </div>
            <div>
              <span className="time-label">To:</span>
              <span className="time-value">{endFormat.date} {endFormat.time}</span>
            </div>
          </div>
        )}
      </div>

      <div 
        ref={sliderRef}
        className="timeline-slider-track"
        onClick={handleSliderClick}
      >
        {/* Hour markers */}
        <div className="timeline-markers">
          {timelineHours.filter((_, index) => index % 24 === 0).map((hour) => (
            <div 
              key={hour.timestamp}
              className={`timeline-marker ${hour.isToday ? 'today' : ''}`}
              style={{ left: `${timestampToPosition(hour.timestamp)}%` }}
            >
              <div className="marker-line" />
              <div className="marker-label">
                {hour.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected range background */}
        {currentMode === 'range' && (
          <div 
            className="timeline-selected-range"
            style={{
              left: `${Math.min(startPosition, endPosition)}%`,
              width: `${Math.abs(endPosition - startPosition)}%`
            }}
          />
        )}

        {/* Handles */}
        {currentMode === 'single' ? (
          <div
            className={`timeline-handle single ${isDragging === 'single' ? 'dragging' : ''}`}
            style={{ left: `${singlePosition}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'single')}
          />
        ) : (
          <>
            <div
              className={`timeline-handle start ${isDragging === 'start' ? 'dragging' : ''}`}
              style={{ left: `${startPosition}%` }}
              onMouseDown={(e) => handleMouseDown(e, 'start')}
            />
            <div
              className={`timeline-handle end ${isDragging === 'end' ? 'dragging' : ''}`}
              style={{ left: `${endPosition}%` }}
              onMouseDown={(e) => handleMouseDown(e, 'end')}
            />
          </>
        )}

        {/* Today indicator */}
        <div 
          className="timeline-today-indicator"
          style={{ left: `${timestampToPosition(Math.floor(now.getTime() / 1000))}%` }}
        >
          <div className="today-line" />
          <div className="today-label">Now</div>
        </div>
      </div>
    </div>
  );
};
