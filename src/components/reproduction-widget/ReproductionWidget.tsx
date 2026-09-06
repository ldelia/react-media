import React from 'react';
import { YouTubeInnerPlayer } from './inner-players/YouTubeInnerPlayer';
import { PlayAlongInnerPlayer } from './inner-players/PlayAlongInnerPlayer';
import { AudioInnerPlayer } from './inner-players/AudioInnerPlayer';
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
  audioFile?: never;
  initialVolume?: number; // between 0 and 100
  onVideoUnavailable: (errorCode?: number) => void;
  onAudioUnavailable?: never;
}

interface TrainingAudioProps extends BaseProps {
  trainingMode: true;
  duration?: never;
  videoId?: never;
  /** HTML audio URL (any format playable by the browser). */
  audioFile: string;
  initialVolume?: number; // between 0 and 100
  onVideoUnavailable?: never;
  /** Fired when the audio file fails to load or is unavailable. */
  onAudioUnavailable: () => void;
}

interface NonTrainingProps extends BaseProps {
  trainingMode: false;
  duration: number;
  videoId?: never;
  audioFile?: never;
  initialVolume?: never;
  onVideoUnavailable?: never;
  onAudioUnavailable?: never;
}

export type ReproductionWidgetProps =
  | TrainingYouTubeProps
  | TrainingAudioProps
  | NonTrainingProps;

export const ReproductionWidget = ({
  trainingMode,
  duration,
  videoId,
  audioFile,
  initialVolume = 50,
  withCountingIn = true,
  songTempo = 0,
  onInit,
  onVideoUnavailable,
  onAudioUnavailable,
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

  function onAudioInnerPlayerReadyHandler(event: { target: HTMLAudioElement }) {
    const newReproduction = Reproduction.newBuilder()
      .withMediaType('audio')
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
        audioFile ? (
          <AudioInnerPlayer
            audioFile={audioFile}
            onReady={onAudioInnerPlayerReadyHandler}
            onAudioUnavailable={onAudioUnavailable}
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
