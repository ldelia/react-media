import React from 'react';
import { InnerYouTubePlayerInterface } from '../models/Player/YouTubePlayer';
import ReactPlayer from 'react-player/lazy';

interface Props {
  videoId: string;
  onReady: (event: { target: InnerYouTubePlayerInterface }) => void;
}
export const YouTubeInnerPlayer = ({ videoId, onReady }: Props) => {
  return (
    <ReactPlayer url={`https://www.youtube.com/watch?v=${videoId}`} onReady={(event) => onReady({ target: event.getInternalPlayer() as InnerYouTubePlayerInterface })} />
  );
};
