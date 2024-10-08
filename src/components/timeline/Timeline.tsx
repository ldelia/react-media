import React, { useEffect, useRef, useState } from 'react';
import TimelineCanvas from './TimelineCanvas/TimelineCanvas';
import RangeSelectorCanvas from './RangeSelectorCanvas/RangeSelectorCanvas';
import { zoomLevelConfigurations } from './constants';
import styled from 'styled-components';
import { TimelineValue } from './TimelineValue/TimelineValue';
import { ZoomContext, ZoomContextType } from './ZoomContext/ZoomContext';
import {
  getBlockOffsetForZoomLevel,
  getTimelineWrapperWidth,
  numberToPxString,
} from './utils/utils';
import { TimelineMarkers } from './TimelineMarkers/TimelineMarkers';

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
  overflow: hidden;
`;

export interface TimelineProps {
  duration: number; // duration in seconds
  value: number; // value in seconds
  zoomLevel?: number; //0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  className?: string;
  selectedRange?: number[];
  withTimeBlocks?: boolean;
  markers?: number[];
  onChange?: (value: number) => void;
  onRangeChange?: (value: number[]) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  value,
  zoomLevel = 0,
  selectedRange = [],
  markers = [],
  withTimeBlocks = true,
  onChange = () => {},
  onRangeChange = () => {},
  className = '',
}) => {
  const timeLineContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef(null);

  const [zoomContextValue, setZoomContextValue] = useState<ZoomContextType>({
    blockOffset: 0,
    pixelsInSecond: 0,
    timelineWrapperWidth: 0,
  });

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

  useEffect(() => {
    if (!timeLineContainerRef.current) return;

    const timelineWrapperWidth = getTimelineWrapperWidth(
      timeLineContainerRef.current.offsetWidth,
      zoomLevelValue,
    );

    setZoomContextValue({
      blockOffset: getBlockOffsetForZoomLevel(
        zoomLevelValue,
        duration,
        timelineWrapperWidth,
      ),
      pixelsInSecond: timelineWrapperWidth / duration,
      timelineWrapperWidth: timelineWrapperWidth,
    });
  }, [timeLineContainerRef.current, zoomLevelValue, duration]);

  useEffect(() => {
    const timeLineWrapper: HTMLElement = timeLineContainerRef.current!;
    const scrollPosition: number =
      value * zoomContextValue.pixelsInSecond - 300;
    timeLineWrapper.scrollLeft = Math.max(0, scrollPosition);
  }, [duration, value, zoomContextValue]);

  return (
    <TimelineContainer ref={timeLineContainerRef} className={className}>
      <TimelineWrapper
        style={{
          width: numberToPxString(zoomContextValue.timelineWrapperWidth),
        }}
      >
        <ZoomContext.Provider value={zoomContextValue}>
          <TimelineCanvas
            ref={canvasRef}
            duration={duration}
            withTimeBlocks={withTimeBlocks}
          />
          <TimelineValue value={value} canvasRef={canvasRef} />
          <TimelineMarkers markers={markers} />
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
