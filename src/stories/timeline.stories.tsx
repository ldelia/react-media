import React from 'react';

import { Timeline, TimelineProps } from '../components/timeline';
import { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';

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
  className: 'this-class-redefines-values',
};

export const WithOutTimeBlocks = Template.bind({});
WithOutTimeBlocks.args = {
  duration: 305,
  value: 31,
  zoomLevel: 0,
  withTimeBlocks: false,
};
