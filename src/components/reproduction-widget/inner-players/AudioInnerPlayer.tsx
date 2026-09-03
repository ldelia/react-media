import React, { useEffect, useRef } from 'react';
import { getAudioMimeTypeFromUrl } from './getAudioMimeType';

interface Props {
  audioFile: string;
  onReady: (event: { target: HTMLAudioElement }) => void;
  onAudioUnavailable: () => void;
}

export const AudioInnerPlayer = ({
  audioFile,
  onReady,
  onAudioUnavailable,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasErrorRef = useRef(false);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioMimeType = getAudioMimeTypeFromUrl(audioFile);

  /**
   * When the audio is unavailable, the player may throw both the onError and
   * onLoadedMetadata events. We delay calling onReady to give time for onError
   * to potentially fire.
   */
  const handleLoadedMetadata = () => {
    readyTimeoutRef.current = setTimeout(() => {
      if (!hasErrorRef.current && audioRef.current) {
        onReady({ target: audioRef.current });
      } else {
        console.warn('AudioInnerPlayer onReady suppressed due to error');
      }
    }, 300);
  };

  const handleError = () => {
    hasErrorRef.current = true;
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }
    onAudioUnavailable();
  };

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
  }, [audioFile]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      style={{ display: 'none' }}
      onLoadedMetadata={handleLoadedMetadata}
      onError={handleError}
    >
      <source src={audioFile} type={audioMimeType} />
    </audio>
  );
};
