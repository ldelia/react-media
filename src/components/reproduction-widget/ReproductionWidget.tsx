import React from 'react';
import { YouTubeInnerPlayer } from './inner-players/YouTubeInnerPlayer';
import { PlayAlongInnerPlayer } from './inner-players/PlayAlongInnerPlayer';
import { Mp3InnerPlayer } from './inner-players/Mp3InnerPlayer';
import { Reproduction } from './models/Reproduction';
import { InnerYouTubePlayerInterface } from './models/Player/YouTubePlayer';

interface BaseProps {
  trainingMode: boolean;
  withCountingIn?: boolean;
  songTempo?: number;
  onInit: (reproduction: Reproduction) => void;
}

interface TrainingYouTubeProps extends BaseProps {
  trainingMode: true;
  duration?: never;
  videoId: string;
  mp3File?: never;
  initialVolume?: number; // between 0 and 100
  onVideoUnavailable: () => void;
  onMp3Unavailable?: never;
}

interface TrainingMp3Props extends BaseProps {
  trainingMode: true;
  duration?: never;
  videoId?: never;
  mp3File: string;
  initialVolume?: number; // between 0 and 100
  onVideoUnavailable?: never;
  onMp3Unavailable: () => void;
}

interface NonTrainingProps extends BaseProps {
  trainingMode: false;
  duration: number;
  videoId?: never;
  mp3File?: never;
  initialVolume?: never;
  onVideoUnavailable?: never;
  onMp3Unavailable?: never;
}

export type ReproductionWidgetProps =
  | TrainingYouTubeProps
  | TrainingMp3Props
  | NonTrainingProps;

export const ReproductionWidget = ({
  trainingMode,
  duration,
  videoId,
  mp3File,
  initialVolume = 50,
  withCountingIn = true,
  songTempo = 0,
  onInit,
  onVideoUnavailable,
  onMp3Unavailable,
}: ReproductionWidgetProps) => {
  function onPlayAlongInnerPlayerReadyHandler(event: { target: string }) {
    const newReproduction = Reproduction.newBuilder()
      .withMediaType('playAlong')
      .withSongDuration(duration!)
      .withSongTempo(songTempo)
      .withCountingIn(withCountingIn && songTempo > 0)
      .withInnerPlayer(event.target)
      .createReproduction();
    onInit(newReproduction);
  }

  function onYouTubeInnerPlayerReadyHandler(event: {
    target: InnerYouTubePlayerInterface;
  }) {
    const newReproduction = Reproduction.newBuilder()
      .withMediaType('youtube')
      .withSongTempo(songTempo)
      .withCountingIn(withCountingIn && songTempo > 0)
      .withInnerPlayer(event.target)
      .withVolume(initialVolume)
      .createReproduction();
    onInit(newReproduction);
  }

  function onMp3InnerPlayerReadyHandler(event: { target: HTMLAudioElement }) {
    const newReproduction = Reproduction.newBuilder()
      .withMediaType('mp3')
      .withSongTempo(songTempo)
      .withCountingIn(withCountingIn && songTempo > 0)
      .withInnerPlayer(event.target)
      .withVolume(initialVolume)
      .createReproduction();
    onInit(newReproduction);
  }

  return (
    <>
      {trainingMode ? (
        mp3File ? (
          <Mp3InnerPlayer
            mp3File={mp3File}
            onReady={onMp3InnerPlayerReadyHandler}
            onMp3Unavailable={onMp3Unavailable}
          />
        ) : (
          <YouTubeInnerPlayer
            videoId={videoId!}
            onReady={onYouTubeInnerPlayerReadyHandler}
            onVideoUnavailable={onVideoUnavailable!}
          />
        )
      ) : (
        <PlayAlongInnerPlayer onReady={onPlayAlongInnerPlayerReadyHandler} />
      )}
    </>
  );
};
