import React, { useEffect, useRef } from 'react';

interface Props {
  mp3File: string;
  onReady: (event: { target: HTMLAudioElement }) => void;
  onMp3Unavailable: () => void;
}

export const Mp3InnerPlayer = ({
  mp3File,
  onReady,
  onMp3Unavailable,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasErrorRef = useRef(false);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        console.warn('Mp3InnerPlayer onReady suppressed due to error');
      }
    }, 300);
  };

  const handleError = () => {
    hasErrorRef.current = true;
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
      readyTimeoutRef.current = null;
    }
    onMp3Unavailable();
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
  }, [mp3File]);

  return (
    <audio
      ref={audioRef}
      src={mp3File}
      preload="auto"
      style={{ display: 'none' }}
      onLoadedMetadata={handleLoadedMetadata}
      onError={handleError}
    />
  );
};
