import { Meta, StoryFn } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import {
  Reproduction,
  ReproductionWidget,
  ReproductionWidgetProps,
} from '../components/reproduction-widget';

export default {
  title: 'ReproductionWidget',
  component: ReproductionWidget,
  argTypes: {
    onInit: { action: 'initiated' },
  },
} as Meta;

const Template: StoryFn<ReproductionWidgetProps> = (
  args: ReproductionWidgetProps,
) => {
  const [reproduction, setReproduction] = useState<Reproduction | null>(null);
  const [reproductionTimestamp, setReproductionTimestamp] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Handle initialization of reproduction
  const handleInit = useCallback((reproductionInstance: Reproduction) => {
    const refreshEvent = (args: any) => {
      setReproductionTimestamp(new Date().getTime());
    };

    setReproduction(reproductionInstance);
    setPlaybackRate(1);
    reproductionInstance.on('COUNTING_IN', (args: any) => {
      console.log('counting in', args);
    });
    reproductionInstance.on('PLAYING', refreshEvent);
    reproductionInstance.on('PAUSED', refreshEvent);
    reproductionInstance.on('FINISH', refreshEvent);
    reproductionInstance.on('ERROR', (args: any) => {
      console.error('Reproduction error', args);
    });
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

  const handleStart = () => {
    if (reproduction) {
      reproduction.start();
    }
  };

  const handleLoop = () => {
    if (reproduction) {
      reproduction.playLoop(10, 20);
    }
  };

  const handlePlaybackRateChange = (playbackRate: number) => {
    if (reproduction) {
      reproduction.setPlaybackRate(playbackRate);
      setPlaybackRate(playbackRate);
      setReproductionTimestamp(new Date().getTime());
    }
  };

  const availablePlaybackRates =
    reproduction?.getAvailablePlaybackRates() ?? [];

  return (
    <div>
      <ReproductionWidget {...args} onInit={handleInit} />
      <div>
        <button
          onClick={handleStop}
          disabled={!reproduction || reproduction.isStopped()}
        >
          Stop
        </button>
        <button
          onClick={handlePause}
          disabled={!reproduction || !reproduction.isPlaying()}
        >
          Pause
        </button>
        <button
          onClick={handleResume}
          disabled={
            !reproduction ||
            reproduction.isPlaying() ||
            reproduction.getCurrentTime() === 0
          }
        >
          Resume
        </button>
        <button
          onClick={handleStart}
          disabled={!reproduction || reproduction.isPlaying()}
        >
          Start
        </button>
        <button onClick={handleLoop} disabled={!reproduction}>
          Loop 10-20
        </button>
        {reproduction && (
          <div>Current time: {reproduction?.getCurrentTime()}</div>
        )}
        {reproduction && <div>Volume: {reproduction?.getVolume()}</div>}
        <button
          onClick={() => reproduction?.setVolume(reproduction.getVolume() - 10)}
          disabled={!reproduction || reproduction.getVolume() <= 10}
        >
          Volume -10
        </button>
        <button
          onClick={() => reproduction?.setVolume(reproduction.getVolume() + 10)}
          disabled={!reproduction || reproduction.getVolume() >= 100}
        >
          Volume +10
        </button>
        {reproduction && availablePlaybackRates.length > 0 && (
          <div>
            <div>Playback rate: {playbackRate}x</div>
            {availablePlaybackRates.map((rate) => (
              <button
                key={rate}
                onClick={() => handlePlaybackRateChange(rate)}
                disabled={playbackRate === rate}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}
        {reproduction && availablePlaybackRates.length === 0 && (
          <div>
            <label>
              Playback rate:{' '}
              <input
                type="number"
                min={0.25}
                max={4}
                step={0.05}
                value={playbackRate}
                onChange={(event) => {
                  const nextRate = Number(event.target.value);
                  if (Number.isFinite(nextRate)) {
                    handlePlaybackRateChange(nextRate);
                  }
                }}
              />
              x
            </label>
            <div>
              <button onClick={() => handlePlaybackRateChange(0.85)}>
                0.85x
              </button>
              <button onClick={() => handlePlaybackRateChange(1)}>1x</button>
              <button onClick={() => handlePlaybackRateChange(1.15)}>
                1.15x
              </button>
            </div>
          </div>
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

export const WhisperingVideo = Template.bind({});
WhisperingVideo.args = {
  trainingMode: true,
  videoId: 'jFI-RBqXzhU',
  songTempo: 180,
  initialVolume: 10,
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

export const Audio = Template.bind({});
Audio.args = {
  trainingMode: true,
  audioFile: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  songTempo: 180,
  onAudioUnavailable: () => console.error('Audio unavailable'),
};

export const InvalidAudio = Template.bind({});
InvalidAudio.args = {
  trainingMode: true,
  audioFile: 'https://example.com/invalid-audio-file.mp3',
  songTempo: 180,
  onAudioUnavailable: () => console.error('Audio unavailable'),
};

export const M4a = Template.bind({});
M4a.args = {
  trainingMode: true,
  audioFile:
    'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.m4a',
  songTempo: 180,
  onAudioUnavailable: () => console.error('Audio unavailable'),
};
