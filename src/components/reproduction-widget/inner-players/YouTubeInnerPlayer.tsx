import React from 'react';
import { InnerYouTubePlayerInterface } from '../models/Player/YouTubePlayer';
import ReactPlayer from 'react-player/lazy';

interface Props {
  videoId: string;
  onReady: (event: { target: InnerYouTubePlayerInterface }) => void;
}
export const YouTubeInnerPlayer = ({ videoId, onReady }: Props) => {
  return (
    <ReactPlayer
      url={`https://www.youtube.com/watch?v=${videoId}`} onReady={(event) => {
      // Remove focus from the iframe
      // This is a workaround for a bug in react-player https://github.com/cookpete/react-player/issues/1124
      const internalPlayer = event.getInternalPlayer();
      const iframe = internalPlayer.getIframe();
      iframe.tabIndex = -1;

      // Propagate internal player
      onReady({ target: event.getInternalPlayer() as InnerYouTubePlayerInterface });
    }}  />
  );
};
