import React, { useEffect, useState } from 'react';
import YouTube, { YouTubePlayer as InnerYouTubePlayer } from 'react-youtube';

interface Props {
  videoId: string;
  onReady: (event: { target: InnerYouTubePlayer }) => void;
}
export const YouTubeInnerPlayer = ({ videoId, onReady }: Props) => {
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.href);
    }
  }, []);

  const opts = {
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      controls: 0,
      showinfo: 0,
      enablejsapi: 1,
      origin: origin,
    },
  };

  if (origin === null) {
    return null;
  }

  return (
    <YouTube
      id={'YT-' + videoId}
      className='youtube-player'
      videoId={videoId}
      opts={opts}
      onReady={(event) => {
        console.log("on ready");
        onReady(event);
      }}
    />
  );
};
