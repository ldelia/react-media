import React from 'react';
import { render } from '@testing-library/react';
import { ReproductionWidget } from '../../reproduction-widget/ReproductionWidget';

vitest.mock('../../reproduction-widget/inner-players/YouTubeInnerPlayer', () => ({
  YouTubeInnerPlayer: ({ videoId }: { videoId: string }) => (
    <div data-testid="youtube-inner-player">{videoId}</div>
  ),
}));

vitest.mock('../../reproduction-widget/inner-players/PlayAlongInnerPlayer', () => ({
  PlayAlongInnerPlayer: () => <div data-testid="playalong-inner-player" />,
}));

vitest.mock('../../reproduction-widget/inner-players/AudioInnerPlayer', () => ({
  AudioInnerPlayer: ({ audioFile }: { audioFile: string }) => (
    <div data-testid="audio-inner-player">{audioFile}</div>
  ),
}));

describe('ReproductionWidget', () => {
  it('renders YouTubeInnerPlayer when trainingMode is true and videoId is provided', () => {
    const { getByTestId, queryByTestId } = render(
      <ReproductionWidget
        trainingMode={true}
        videoId="jFI-RBqXzhU"
        onInit={vitest.fn()}
        onVideoUnavailable={vitest.fn()}
      />,
    );

    expect(getByTestId('youtube-inner-player').textContent).toBe('jFI-RBqXzhU');
    expect(queryByTestId('audio-inner-player')).toBeNull();
    expect(queryByTestId('playalong-inner-player')).toBeNull();
  });

  it('renders AudioInnerPlayer when trainingMode is true and audioFile is provided', () => {
    const { getByTestId, queryByTestId } = render(
      <ReproductionWidget
        trainingMode={true}
        audioFile="https://example.com/song.mp3"
        onInit={vitest.fn()}
        onAudioUnavailable={vitest.fn()}
      />,
    );

    expect(getByTestId('audio-inner-player').textContent).toBe(
      'https://example.com/song.mp3',
    );
    expect(queryByTestId('youtube-inner-player')).toBeNull();
    expect(queryByTestId('playalong-inner-player')).toBeNull();
  });

  it('renders PlayAlongInnerPlayer when trainingMode is false', () => {
    const { getByTestId, queryByTestId } = render(
      <ReproductionWidget
        trainingMode={false}
        duration={220}
        onInit={vitest.fn()}
      />,
    );

    expect(getByTestId('playalong-inner-player')).not.toBeNull();
    expect(queryByTestId('youtube-inner-player')).toBeNull();
    expect(queryByTestId('audio-inner-player')).toBeNull();
  });
});
