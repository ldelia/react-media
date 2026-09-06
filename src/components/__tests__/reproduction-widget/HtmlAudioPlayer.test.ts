import { HtmlAudioPlayer } from '../../reproduction-widget/models/Player/HtmlAudioPlayer';
import { PLAYER_EVENTS } from '../../reproduction-widget/models/Player/PlayerEvents';

type Listener = EventListenerOrEventListenerObject;

function createFakeAudioElement(
  overrides: Partial<HTMLAudioElement> = {},
): HTMLAudioElement {
  const listeners: Record<string, Listener[]> = {};

  const fake = {
    currentTime: 0,
    duration: 120,
    volume: 0.5,
    playbackRate: 1,
    play: vitest.fn().mockResolvedValue(undefined),
    pause: vitest.fn(),
    addEventListener: vitest.fn((event: string, listener: Listener) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(listener);
    }),
    removeEventListener: vitest.fn(),
    ...overrides,
  } as unknown as HTMLAudioElement;

  (fake as any).__emit = (event: string) => {
    (listeners[event] || []).forEach((listener) => {
      if (typeof listener === 'function') {
        listener(new Event(event));
      } else {
        listener.handleEvent(new Event(event));
      }
    });
  };

  return fake;
}

describe('HtmlAudioPlayer', () => {
  it('plays and pauses the inner audio element', () => {
    const audio = createFakeAudioElement();
    const player = new HtmlAudioPlayer(audio);

    player.play();
    expect(audio.play).toHaveBeenCalled();

    player.pause();
    expect(audio.pause).toHaveBeenCalled();
  });

  it('stops by pausing and seeking to the start', () => {
    const audio = createFakeAudioElement({ currentTime: 30 });
    const player = new HtmlAudioPlayer(audio);

    player.stop();

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
    expect(player.getCurrentTime()).toBe(0);
  });

  it('seeks to a given time', () => {
    const audio = createFakeAudioElement();
    const player = new HtmlAudioPlayer(audio);

    player.seekTo(45);

    expect(audio.currentTime).toBe(45);
    expect(player.getCurrentTime()).toBe(45);
  });

  it('converts volume from 0-100 to 0-1 on the audio element', () => {
    const audio = createFakeAudioElement();
    const player = new HtmlAudioPlayer(audio);

    player.setVolume(75);

    expect(player.getVolume()).toBe(75);
    expect(audio.volume).toBe(0.75);
  });

  it('returns duration from the audio element when available', () => {
    const audio = createFakeAudioElement({ duration: 200 });
    const player = new HtmlAudioPlayer(audio);

    expect(player.getDuration()).toBe(200);
    expect(player.isAvailable()).toBe(true);
  });

  it('supports continuous playback rates within 0.25–4', () => {
    const audio = createFakeAudioElement();
    const player = new HtmlAudioPlayer(audio);

    expect(player.getAvailablePlaybackRates()).toEqual([]);

    player.setPlaybackRate(0.85);
    expect(audio.playbackRate).toBe(0.85);

    player.setPlaybackRate(1.5);
    expect(audio.playbackRate).toBe(1.5);

    expect(() => player.setPlaybackRate(0.1)).toThrow(
      /doesn't support a playbackRate with value 0.1/,
    );
    expect(() => player.setPlaybackRate(5)).toThrow(
      /doesn't support a playbackRate with value 5/,
    );
  });

  it('dispatches PLAYING, FINISH and ERROR events from native audio events', async () => {
    const audio = createFakeAudioElement();
    const player = new HtmlAudioPlayer(audio);

    const onPlaying = vitest.fn();
    const onFinish = vitest.fn();
    const onError = vitest.fn();

    player.on(PLAYER_EVENTS.PLAYING, onPlaying);
    player.on(PLAYER_EVENTS.FINISH, onFinish);
    player.on(PLAYER_EVENTS.ERROR, onError);

    (audio as any).__emit('playing');
    (audio as any).__emit('ended');
    (audio as any).__emit('error');

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onPlaying).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
