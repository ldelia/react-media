import React, { useEffect, useRef } from 'react';
import { InnerYouTubePlayerInterface } from '../models/Player/YouTubePlayer';
import ReactPlayer from 'react-player/lazy';
import {
  extractYouTubeErrorCode,
  isYouTubeUnavailableError,
} from './youtubeUnavailableErrors';

interface Props {
  videoId: string;
  onReady: (event: { target: InnerYouTubePlayerInterface }) => void;
  /** Called with the YouTube IFrame API error code when the video cannot be played. */
  onVideoUnavailable: (errorCode?: number) => void;
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
        console.warn('YouTubeInnerPlayer onReady suppressed due to error');
      }
    }, 300);
  };

  const handleError = (error: unknown, data?: unknown) => {
    hasErrorRef.current = true;
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }

    const errorCode = extractYouTubeErrorCode(error, data);
    if (errorCode !== undefined && isYouTubeUnavailableError(errorCode)) {
      onVideoUnavailable(errorCode);
    } else {
      console.warn('Unhandled YouTube error:', error, data);
      // Still notify consumers — the video did not become playable.
      onVideoUnavailable(errorCode);
    }
  };

  // Reset refs when videoId changes; also clear pending timeout on unmount
  useEffect(() => {
    hasErrorRef.current = false;
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }

    return () => {
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <ReactPlayer
      url={`https://www.youtube.com/watch?v=${videoId}`}
      onReady={handleReady}
      onError={handleError}
    />
  );
};
