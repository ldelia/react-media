import React from 'react';
import { YouTubeInnerPlayer } from './inner-players/YouTubeInnerPlayer';
import { PlayAlongInnerPlayer } from './inner-players/PlayAlongInnerPlayer';
import { Reproduction } from './models/Reproduction';
import { InnerYouTubePlayerInterface } from './models/Player/YouTubePlayer';

interface BaseProps {
  trainingMode: boolean;
  songTempo?: number;
  onInit: (reproduction: Reproduction) => void;
}

interface TrainingProps extends BaseProps {
  trainingMode: true;
  duration?: never;
  videoId: string;
}

interface NonTrainingProps extends BaseProps {
  trainingMode: false;
  duration: number;
  videoId?: never;
}

export type ReproductionWidgetProps = TrainingProps | NonTrainingProps;

export const ReproductionWidget = ({
  trainingMode,
  duration,
  videoId,
  songTempo = 0,
  onInit,
}: ReproductionWidgetProps) => {

  function onPlayAlongInnerPlayerReadyHandler(event: { target: string }) {
    let newReproduction = Reproduction.newBuilder()
      .withTrainingMode(false)
      .withSongDuration(duration!)
      .withSongTempo(songTempo)
      .withCountingIn(songTempo > 0)
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
      .withCountingIn(songTempo > 0)
      .withInnerPlayer(event.target)
      .createReproduction();
    onInit(newReproduction);
  }

  return (
    <>
      {trainingMode ? (
        <YouTubeInnerPlayer
          videoId={videoId}
          onReady={onYouTubeInnerPlayerReadyHandler}
        />
      ) : (
        <PlayAlongInnerPlayer onReady={onPlayAlongInnerPlayerReadyHandler} />
      )}
    </>
  );
};
