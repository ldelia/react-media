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

vitest.mock('../../reproduction-widget/inner-players/Mp3InnerPlayer', () => ({
  Mp3InnerPlayer: ({ mp3File }: { mp3File: string }) => (
    <div data-testid="mp3-inner-player">{mp3File}</div>
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
    expect(queryByTestId('mp3-inner-player')).toBeNull();
    expect(queryByTestId('playalong-inner-player')).toBeNull();
  });

  it('renders Mp3InnerPlayer when trainingMode is true and mp3File is provided', () => {
    const { getByTestId, queryByTestId } = render(
      <ReproductionWidget
        trainingMode={true}
        mp3File="https://example.com/song.mp3"
        onInit={vitest.fn()}
        onMp3Unavailable={vitest.fn()}
      />,
    );

    expect(getByTestId('mp3-inner-player').textContent).toBe(
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
    expect(queryByTestId('mp3-inner-player')).toBeNull();
  });
});
