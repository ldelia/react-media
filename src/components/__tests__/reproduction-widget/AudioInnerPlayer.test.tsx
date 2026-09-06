import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { AudioInnerPlayer } from '../../reproduction-widget/inner-players/AudioInnerPlayer';

describe('AudioInnerPlayer', () => {
  beforeEach(() => {
    vitest.useFakeTimers();
  });

  afterEach(() => {
    vitest.useRealTimers();
  });

  it('calls onReady with the audio element after loadedmetadata', () => {
    const onReady = vitest.fn();
    const onAudioUnavailable = vitest.fn();

    const { container } = render(
      <AudioInnerPlayer
        audioFile="https://example.com/song.mp3"
        onReady={onReady}
        onAudioUnavailable={onAudioUnavailable}
      />,
    );

    const audio = container.querySelector('audio') as HTMLAudioElement;
    const source = container.querySelector('source') as HTMLSourceElement;
    expect(audio).not.toBeNull();
    expect(source).not.toBeNull();
    expect(source.getAttribute('src')).toBe('https://example.com/song.mp3');
    expect(source.getAttribute('type')).toBe('audio/mpeg');

    fireEvent.loadedMetadata(audio);
    vitest.advanceTimersByTime(300);

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledWith({ target: audio });
    expect(onAudioUnavailable).not.toHaveBeenCalled();
  });

  it('sets audio/mp4 type for m4a URLs', () => {
    const onReady = vitest.fn();
    const onAudioUnavailable = vitest.fn();

    const { container } = render(
      <AudioInnerPlayer
        audioFile="https://example.com/song.m4a"
        onReady={onReady}
        onAudioUnavailable={onAudioUnavailable}
      />,
    );

    const audio = container.querySelector('audio') as HTMLAudioElement;
    const source = container.querySelector('source') as HTMLSourceElement;
    expect(audio).not.toBeNull();
    expect(source).not.toBeNull();
    expect(source.getAttribute('src')).toBe('https://example.com/song.m4a');
    expect(source.getAttribute('type')).toBe('audio/mp4');
  });

  it('omits type for unknown extensions', () => {
    const { container } = render(
      <AudioInnerPlayer
        audioFile="https://example.com/song"
        onReady={vitest.fn()}
        onAudioUnavailable={vitest.fn()}
      />,
    );

    const source = container.querySelector('source') as HTMLSourceElement;
    expect(source.getAttribute('type')).toBeNull();
  });

  it('calls onAudioUnavailable on error and suppresses onReady', () => {
    const onReady = vitest.fn();
    const onAudioUnavailable = vitest.fn();

    const { container } = render(
      <AudioInnerPlayer
        audioFile="https://example.com/missing.mp3"
        onReady={onReady}
        onAudioUnavailable={onAudioUnavailable}
      />,
    );

    const audio = container.querySelector('audio') as HTMLAudioElement;

    fireEvent.error(audio);
    fireEvent.loadedMetadata(audio);
    vitest.advanceTimersByTime(300);

    expect(onAudioUnavailable).toHaveBeenCalledTimes(1);
    expect(onReady).not.toHaveBeenCalled();
  });

  it('does not call onReady after unmount while the ready timeout is pending', () => {
    const onReady = vitest.fn();
    const onAudioUnavailable = vitest.fn();

    const { container, unmount } = render(
      <AudioInnerPlayer
        audioFile="https://example.com/song.mp3"
        onReady={onReady}
        onAudioUnavailable={onAudioUnavailable}
      />,
    );

    const audio = container.querySelector('audio') as HTMLAudioElement;
    fireEvent.loadedMetadata(audio);
    unmount();
    vitest.advanceTimersByTime(300);

    expect(onReady).not.toHaveBeenCalled();
  });
});
