import React, { useEffect, useRef } from 'react';
import { InnerYouTubePlayerInterface } from '../models/Player/YouTubePlayer';
import ReactPlayer from 'react-player/lazy';

interface Props {
  videoId: string;
  onReady: (event: { target: InnerYouTubePlayerInterface }) => void;
  onVideoUnavailable: () => void;
}
export const YouTubeInnerPlayer = ({ videoId, onReady, onVideoUnavailable }: Props) => {
  const hasErrorRef = useRef(false);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * When the video is unavailable, the player will throw both, the onError and onReady events.
   * We delay calling onReady to give time for onError to potentially fire.
   */

  const handleReady = (event: any) => {
    const internalPlayer = event.getInternalPlayer();
    const iframe = internalPlayer.getIframe?.();
    if (iframe) iframe.tabIndex = -1;

    readyTimeoutRef.current = setTimeout(() => {
      if (!hasErrorRef.current) {
        onReady({ target: internalPlayer as InnerYouTubePlayerInterface });
      } else {
        console.warn("YouTubeInnerPlayer onReady suppressed due to error");
      }
    }, 300);
  };

  const handleError = (error: any, data: any) => {
    hasErrorRef.current = true;
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }
    if (error === 150) {
      onVideoUnavailable();
    } else {
      console.warn('Unhandled YouTube error:', error);
    }
  };

  // Reset refs when videoId changes
  useEffect(() => {
    hasErrorRef.current = false;
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }
  }, [videoId]);

  return (
    <ReactPlayer
      url={`https://www.youtube.com/watch?v=${videoId}`}
      onReady={handleReady}
      onError={handleError}
    />
  );
};