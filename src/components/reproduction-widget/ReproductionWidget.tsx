import React from 'react';
import { YouTubeInnerPlayer } from './inner-players/YouTubeInnerPlayer';
import { PlayAlongInnerPlayer } from './inner-players/PlayAlongInnerPlayer';
import { Reproduction } from './models/Reproduction';
import { YouTubePlayer as InnerYouTubePlayer } from 'react-youtube';

interface BaseProps {
  trainingMode: boolean;
  songTempo?: number;
  onInit: (reproduction: Reproduction) => void;
}

interface TrainingProps extends BaseProps {
  trainingMode: true;
  videoId: string;
}

interface NonTrainingProps extends BaseProps {
  trainingMode: false;
  videoId?: never;
}

export type ReproductionWidgetProps = TrainingProps | NonTrainingProps;

export const ReproductionWidget = ({
  trainingMode,
  videoId,
  songTempo = 0,
  onInit,
}: ReproductionWidgetProps) => {
  const DURATION_TO_TEST = 30;

  function onPlayAlongInnerPlayerReadyHandler(event: { target: string }) {
    let newReproduction = Reproduction.newBuilder()
      .withTrainingMode(false)
      .withSongDuration(DURATION_TO_TEST)
      .withSongTempo(songTempo)
      .withCountingIn(songTempo > 0)
      .withInnerPlayer(event.target)
      .createReproduction();
    onInit(newReproduction);
  }

  function onYouTubeInnerPlayerReadyHandler(event: {
    target: InnerYouTubePlayer;
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
