import React, { useEffect, useRef, useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';
import { Reproduction, Timeline, TimelineProps } from '../components';

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
  const [loopRange, setLoopRangeState] = useState<{ from: number; to: number } | null>(null);
  const reproductionRef = useRef<Reproduction | null>(null);

  useEffect(() => {
    const reproduction = Reproduction.newBuilder()
      .withSongDuration(args.duration)
      .withSongTempo(120)
      .withInnerPlayer('story-player')
      .withCountingIn(false)
      .withVolume(50)
      .createReproduction();

    reproductionRef.current = reproduction;

    const unsubPlay = reproduction.on(Reproduction.EVENTS.PLAY, () => {
      setIsPlaying(true);
    });

    const unsubPlaying = reproduction.on(Reproduction.EVENTS.PLAYING, () => {
      setCurrentValue(reproduction.getCurrentTime());
    });

    const unsubPaused = reproduction.on(Reproduction.EVENTS.PAUSED, () => {
      setIsPlaying(false);
      setLoopRangeState(null);
    });

    const unsubFinish = reproduction.on(Reproduction.EVENTS.FINISH, () => {
      setIsPlaying(false);
      setLoopRangeState(null);
      setCurrentValue(0);
    });

    return () => {
      unsubPlay();
      unsubPlaying();
      unsubPaused();
      unsubFinish();
      reproduction.stop();
    };
  }, [args.duration]);

  const handlePlayPause = () => {
    const reproduction = reproductionRef.current;
    if (!reproduction) return;

    if (isPlaying) {
      reproduction.pause();
    } else if (selectedRange) {
      reproduction.playLoop(selectedRange[0], selectedRange[1]);
      setLoopRangeState({ from: selectedRange[0], to: selectedRange[1] });
    } else {
      if (reproduction.isStopped()) {
        reproduction.start();
      } else {
        reproduction.play();
      }
    }
  };

  const handleReset = () => {
    reproductionRef.current?.stop();
  };

  const onRangeChangeHandler = (values: number[]) => {
    setSelectedRange(values);
  };

  const handleClearRange = () => {
    setSelectedRange(null);
  };

  const handleSetLoopRange0_10 = () => {
    const reproduction = reproductionRef.current;
    if (!reproduction) return;
    reproduction.setLoopRange(0, 10);
    setLoopRangeState({ from: 0, to: 10 });
    setSelectedRange([0, 10]);
  };

  const handleSetLoopRange40_60 = () => {
    const reproduction = reproductionRef.current;
    if (!reproduction) return;
    reproduction.setLoopRange(40, 60);
    setLoopRangeState({ from: 40, to: 60 });
    setSelectedRange([40, 60]);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handlePlayPause} style={{ marginRight: '10px' }}>
          {isPlaying ? 'Pause' : selectedRange ? 'Play Loop' : 'Play'}
        </button>
        <button onClick={handleReset} style={{ marginRight: '10px' }}>Reset</button>
        <button onClick={handleClearRange} style={{ marginRight: '10px' }}>Clear Range</button>
        <button onClick={handleSetLoopRange0_10} style={{ marginRight: '10px' }}>setLoopRange(0, 10)</button>
        <button onClick={handleSetLoopRange40_60} style={{ marginRight: '20px' }}>setLoopRange(40, 60)</button>
        <span style={{ marginLeft: '20px' }}>
          Time: {currentValue.toFixed(2)}s / {args.duration}s
        </span>
        <span style={{ marginLeft: '20px' }}>
          Selected range:{' '}
          {selectedRange ? `${selectedRange[0]}-${selectedRange[1]}` : 'N/A'}
        </span>
        <span style={{ marginLeft: '20px' }}>
          Loop: {loopRange ? `${loopRange.from}-${loopRange.to}` : 'Off'}
        </span>
      </div>
      <StyledTimeline
        {...args}
        value={currentValue}
        selectedRange={selectedRange || []}
        onChange={(value) => {
          setCurrentValue(value);
          reproductionRef.current?.seekTo(value);
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
