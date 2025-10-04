import React from 'react';
import { YouTubeInnerPlayer } from './inner-players/YouTubeInnerPlayer';
import { PlayAlongInnerPlayer } from './inner-players/PlayAlongInnerPlayer';
import { Reproduction } from './models/Reproduction';
import { InnerYouTubePlayerInterface } from './models/Player/YouTubePlayer';

interface BaseProps {
  trainingMode: boolean;
  withCountingIn?: boolean;
  songTempo?: number;
  onInit: (reproduction: Reproduction) => void;
}

interface TrainingProps extends BaseProps {
  trainingMode: true;
  duration?: never;
  videoId: string;
  initialVolume?: number; // between 0 and 100
  onVideoUnavailable: () => void;
}

interface NonTrainingProps extends BaseProps {
  trainingMode: false;
  duration: number;
  videoId?: never;
  initialVolume?: never;
  onVideoUnavailable?: never;
}

export type ReproductionWidgetProps = TrainingProps | NonTrainingProps;

export const ReproductionWidget = ({
  trainingMode,
  duration,
  videoId,
  initialVolume = 50,
  withCountingIn = true,
  songTempo = 0,
  onInit,
  onVideoUnavailable,
}: ReproductionWidgetProps) => {

  function onPlayAlongInnerPlayerReadyHandler(event: { target: string }) {
    let newReproduction = Reproduction.newBuilder()
      .withTrainingMode(false)
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
    let newReproduction = Reproduction.newBuilder()
      .withTrainingMode(true)
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
        <YouTubeInnerPlayer
          videoId={videoId}
          onReady={onYouTubeInnerPlayerReadyHandler}
          onVideoUnavailable={onVideoUnavailable}
        />
      ) : (
        <PlayAlongInnerPlayer onReady={onPlayAlongInnerPlayerReadyHandler} />
      )}
    </>
  );
};
