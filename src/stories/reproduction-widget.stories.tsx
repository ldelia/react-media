import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ReproductionWidget, ReproductionWidgetProps } from '../components/reproduction-widget';

export default {
  title: 'ReproductionWidget',
  component: ReproductionWidget,
  argTypes: {
    onInit: { action: 'initiated' },
  },
} as Meta;

const Template: StoryFn<ReproductionWidgetProps> = (args: ReproductionWidgetProps) => (
  <ReproductionWidget
    {...args}
  />
);
export const Default = Template.bind({});
Default.args = {
  trainingMode: true,
  videoId: 'jFI-RBqXzhU',
  songTempo: 180,
  onInit: (reproduction) => {
    console.log("on init")
    reproduction.on('COUNTING_IN', (args) => { console.log("counting in", args) });
    reproduction.start();
  }
};