import React, { useEffect, useRef, useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { Timeline, TimelineProps } from '../components/timeline';

import './timeline.stories.custom.css';

const StyledTimeline = styled(Timeline)`
  .media-timeline-value-line {
    background-color: red;
    width: 5px;
  }
`;

export default {
  title: 'Timeline',
  component: Timeline,
  argTypes: {
    onChange: { action: 'changed' },
    onRangeChange: { action: 'range changed' },
  },
} as Meta;

const Template: StoryFn<TimelineProps> = (args: TimelineProps) => (
  <StyledTimeline {...args} />
);

const PlaybackSimulation: StoryFn<TimelineProps> = (args: TimelineProps) => {
  const [currentValue, setCurrentValue] = useState(args.value || 0);
  const [selectedRange, setSelectedRange] = useState<number[] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && currentValue < args.duration) {
      intervalRef.current = setInterval(() => {
        setCurrentValue((prev) => {
          const next = prev + 0.05; // Advance 50ms (0.05 seconds)
          return next >= args.duration ? args.duration : next;
        });
      }, 50); // Update every 50ms
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentValue, args.duration]);

  const handlePlayPause = () => {
    if (currentValue >= args.duration) {
      setCurrentValue(0); // Reset to beginning if we reached the end
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentValue(0);
  };

  const onRangeChangeHandler = (values: number[]) => {
    setSelectedRange(values);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handlePlayPause} style={{ marginRight: '10px' }}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleReset}>Reset</button>
        <span style={{ marginLeft: '20px' }}>
          Time: {currentValue.toFixed(2)}s / {args.duration}s
        </span>
        <span style={{ marginLeft: '20px' }}>
          Selected range:{' '}
          {selectedRange ? `${selectedRange[0]}-${selectedRange[1]}` : 'N/A'}
        </span>
      </div>
      <StyledTimeline
        {...args}
        value={currentValue}
        onChange={(value) => {
          setCurrentValue(value);
          args.onChange?.(value);
        }}
        onRangeChange={onRangeChangeHandler}
      />
    </div>
  );
};
export const Default = Template.bind({});
Default.args = {
  duration: 305,
  value: 301,
  zoomLevel: 0,
};

export const WithSelectedRange = Template.bind({});
WithSelectedRange.args = {
  duration: 305,
  value: 31,
  zoomLevel: 0,
  selectedRange: [20, 30],
};

export const WithCustomClassName = Template.bind({});
WithCustomClassName.args = {
  duration: 305,
  value: 31,
  zoomLevel: 0,
  className: 'this-class-redefines-styles',
};

export const WithoutTimeBlocks = Template.bind({});
WithoutTimeBlocks.args = {
  duration: 305,
  value: 31,
  zoomLevel: 0,
  withTimeBlocks: false,
};

export const Minimalist = Template.bind({});
Minimalist.args = {
  duration: 305,
  value: 31,
  zoomLevel: 0,
  withTimeBlocks: false,
  className: 'minimalist',
  markers: [],
};

export const WithSelectedRangeAndMarkers = Template.bind({});
WithSelectedRangeAndMarkers.args = {
  duration: 305,
  value: 31,
  zoomLevel: 0,
  selectedRange: [20, 30],
  markers: [90, 108],
};

export const MediaPlaybackSimulation = PlaybackSimulation.bind({});
MediaPlaybackSimulation.args = {
  duration: 120, // 2 minutes
  value: 0,
  zoomLevel: 0,
  selectedRange: [30, 45], // Show a selected range
  markers: [15, 60, 90], // Add some markers
};
