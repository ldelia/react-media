import React, { useCallback, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Reproduction, ReproductionWidget, ReproductionWidgetProps } from '../components/reproduction-widget';

export default {
  title: 'ReproductionWidget',
  component: ReproductionWidget,
  argTypes: {
    onInit: { action: 'initiated' },
  },
} as Meta;

const Template: StoryFn<ReproductionWidgetProps> = (args: ReproductionWidgetProps) => {
  const [reproduction, setReproduction] = useState<Reproduction | null>(null);
  const [reproductionTimestamp, setReproductionTimestamp] = useState(0);

  // Handle initialization of reproduction
  const handleInit = useCallback((reproductionInstance: Reproduction) => {
    const refreshEvent =(args: any) => { setReproductionTimestamp(new Date().getTime()); };

    setReproduction(reproductionInstance);
    reproductionInstance.on('COUNTING_IN', (args: any) => { console.log("counting in", args) });
    reproductionInstance.on('PLAYING', refreshEvent);
    reproductionInstance.on('PAUSED', refreshEvent);
    reproductionInstance.on('FINISH', refreshEvent);
    reproductionInstance.start();
  }, []);

  const handleStop = () => {
    if (reproduction) {
      reproduction.stop();
    }
  };

  const handlePause = () => {
    if (reproduction) {
      reproduction.pause();
    }
  };

  const handleResume = () => {
    if (reproduction) {
      reproduction.play();
    }
  };

  return (
    <div>
      <ReproductionWidget
        {...args}
        onInit={handleInit}
      />
      <div>
        <button onClick={handleStop} disabled={!reproduction || reproduction.isStopped()}>
          Stop
        </button>
        <button onClick={handlePause} disabled={!reproduction || !reproduction.isPlaying()}>
          Pause
        </button>
        <button onClick={handleResume} disabled={!reproduction || reproduction.isPlaying()}>
          Resume
        </button>
        {reproduction && (
          <div>Current time: {reproduction?.getCurrentTime()}</div>
        )}
      </div>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  trainingMode: true,
  videoId: 'jFI-RBqXzhU',
  songTempo: 180,
};

export const PlayAlong = Template.bind({});
PlayAlong.args = {
  trainingMode: false,
  songTempo: 180,
  duration: 220,
};

export const InvalidVideo = Template.bind({});
InvalidVideo.args = {
  trainingMode: true,
  videoId: 'Y8jDVJrOHvo',
  songTempo: 180,
  onVideoUnavailable: () => console.error('Video unavailable'),
};