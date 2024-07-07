import React, { useEffect, useMemo, useRef } from 'react';
import TimelineCanvas from './TimelineCanvas/TimelineCanvas';
import RangeSelectorCanvas from './RangeSelectorCanvas/RangeSelectorCanvas';
import { zoomLevelConfigurations } from './constants';
import styled from 'styled-components';
import { TimelineValue } from './TimelineValue/TimelineValue';
import { ZoomContext, ZoomContextType } from './ZoomContext/ZoomContext';

const TimelineContainer = styled.div`
  background-color: #f0f0f0;
  border: 1px solid #c9c9c9;
  height: 80px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  position: relative;
  display: flex;
`;
const TimelineWrapper = styled.div`
  position: absolute;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export interface TimelineProps {
  duration: number; // duration in seconds
  value: number; // value in seconds
  zoomLevel?: number; //0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  className?: string;
  selectedRange?: number[];
  withTimeBlocks?: boolean;
  onChange?: (value: number) => void;
  onRangeChange?: (value: number[]) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  value,
  zoomLevel = 0,
  selectedRange = [],
  withTimeBlocks = true,
  onChange = () => {},
  onRangeChange = () => {},
  className = '',
}) => {
  const timeLineContainerRef = useRef(null);
  const canvasRef = useRef(null);

  let zoomLevelValue = zoomLevel ? zoomLevel : 0;
  if (zoomLevelValue < 0 || zoomLevelValue >= zoomLevelConfigurations.length) {
    console.warn('Invalid value for property zoomLevel.');
    zoomLevelValue = 0;
  }

  if (value < 0 || value > duration) {
    console.warn('Invalid value.');
  }

  if (!(selectedRange.length === 0 || selectedRange.length === 2)) {
    selectedRange = [];
    console.warn('The selected range must contain only two values.');
  }

  if (
    selectedRange.length === 2 &&
    !(
      0 <= selectedRange[0] &&
      selectedRange[0] < selectedRange[1] &&
      selectedRange[1] <= duration
    )
  ) {
    selectedRange = [];
    console.warn('The selected range is inconsistent.');
  }

  const zoomContextValue = useMemo<ZoomContextType>(() => {
    return {
      blockOffset: zoomLevelConfigurations[zoomLevelValue][0],
      pixelsInSecond: zoomLevelConfigurations[zoomLevelValue][1],
      //secondsPerPixel: 1 / zoomLevelConfigurations[zoomLevelValue][1],
    };
  }, [zoomLevelValue]);

  useEffect(() => {
    const timeLineWrapper: HTMLElement = timeLineContainerRef.current!;
    const scrollPosition: number =
      value * zoomContextValue.pixelsInSecond - 300;
    timeLineWrapper.scrollLeft = Math.max(0, scrollPosition);
  }, [value, zoomContextValue]);

  return (
    <TimelineContainer ref={timeLineContainerRef} className={className}>
      <TimelineWrapper
        style={{ width: duration * zoomContextValue.pixelsInSecond + 'px' }}
      >
        <ZoomContext.Provider value={zoomContextValue}>
          <TimelineCanvas
            ref={canvasRef}
            duration={duration}
            withTimeBlocks={withTimeBlocks}
          />
          <TimelineValue value={value} canvasRef={canvasRef} />
          <RangeSelectorCanvas
            selectedRange={selectedRange}
            onChange={onChange}
            onRangeChange={onRangeChange}
          />
        </ZoomContext.Provider>
      </TimelineWrapper>
    </TimelineContainer>
  );
};
