import { Reproduction } from '../../reproduction-widget/models/Reproduction';
import { PLAYER_EVENTS } from '../../reproduction-widget/models/Player/PlayerEvents';

type LoopInternals = {
  loopRange: { from: number; to: number } | null;
  loopInterval: ReturnType<typeof setInterval> | null;
};

function createFakePlayer(initialTime = 0) {
  const playingHandlers: Array<() => void> = [];
  const finishHandlers: Array<() => void> = [];
  const errorHandlers: Array<(error?: unknown) => void> = [];

  const player = {
    currentTime: initialTime,
    play: vitest.fn(() => {
      playingHandlers.forEach((handler) => handler());
    }),
    pause: vitest.fn(),
    stop: vitest.fn(),
    seekTo: vitest.fn((seconds: number) => {
      player.currentTime = seconds;
    }),
    getCurrentTime: vitest.fn(() => player.currentTime),
    getDuration: vitest.fn(() => 120),
    getVolume: vitest.fn(() => 50),
    setVolume: vitest.fn(),
    getAvailablePlaybackRates: vitest.fn(() => [1]),
    setPlaybackRate: vitest.fn(),
    isAvailable: vitest.fn(() => true),
    on: vitest.fn((eventName: string, handler: (error?: unknown) => void) => {
      if (eventName === PLAYER_EVENTS.PLAYING) {
        playingHandlers.push(handler as () => void);
      } else if (eventName === PLAYER_EVENTS.FINISH) {
        finishHandlers.push(handler as () => void);
      } else if (eventName === PLAYER_EVENTS.ERROR) {
        errorHandlers.push(handler);
      }
    }),
  };

  return player;
}

function createReproduction(initialTime = 0) {
  const player = createFakePlayer(initialTime);
  const reproduction = new Reproduction(player as never, false, 120, 50);
  return { reproduction, player };
}

function getLoopInternals(reproduction: Reproduction): LoopInternals {
  return reproduction as unknown as LoopInternals;
}

function startPlayingAt(
  reproduction: Reproduction,
  player: ReturnType<typeof createFakePlayer>,
  time: number,
) {
  player.currentTime = time;
  reproduction.play();
  expect(reproduction.isPlaying()).toBe(true);
}

describe('Reproduction.playLoop', () => {
  beforeEach(() => {
    vitest.useFakeTimers();
  });

  afterEach(() => {
    vitest.useRealTimers();
  });

  it('does not seek when expanding an active loop while the playhead is inside the new range', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 30);
    reproduction.playLoop(20, 50);
    player.seekTo.mockClear();

    reproduction.playLoop(20, 60);

    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.currentTime).toBe(30);
    expect(getLoopInternals(reproduction).loopRange).toEqual({
      from: 20,
      to: 60,
    });

    player.currentTime = 60;
    vitest.advanceTimersByTime(100);

    expect(player.seekTo).toHaveBeenCalledWith(20);
    expect(player.currentTime).toBe(20);

    reproduction.stop();
  });

  it('seeks to from when shrinking the range so the playhead is past to', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 45);
    reproduction.playLoop(20, 50);
    player.seekTo.mockClear();

    reproduction.playLoop(20, 40);

    expect(player.seekTo).toHaveBeenCalledWith(20);
    expect(player.currentTime).toBe(20);

    reproduction.stop();
  });

  it('seeks to from when the new window moves past the playhead', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 30);
    reproduction.playLoop(20, 50);
    player.seekTo.mockClear();

    reproduction.playLoop(40, 70);

    expect(player.seekTo).toHaveBeenCalledWith(40);
    expect(player.currentTime).toBe(40);

    reproduction.stop();
  });

  it('does not seek on first playLoop when already playing inside the range, and installs the loop interval', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 30);
    player.seekTo.mockClear();

    reproduction.playLoop(20, 50);

    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.currentTime).toBe(30);
    expect(getLoopInternals(reproduction).loopRange).toEqual({
      from: 20,
      to: 50,
    });
    expect(getLoopInternals(reproduction).loopInterval).not.toBeNull();

    reproduction.stop();
  });

  it('seeks to from on first playLoop when already playing outside the range', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 30);
    player.seekTo.mockClear();

    reproduction.playLoop(40, 60);

    expect(player.seekTo).toHaveBeenCalledWith(40);
    expect(player.currentTime).toBe(40);
    expect(getLoopInternals(reproduction).loopInterval).not.toBeNull();

    reproduction.stop();
  });

  it('seeks to from when playLoop starts from time 0', () => {
    const { reproduction, player } = createReproduction(0);

    reproduction.playLoop(20, 50);

    expect(player.seekTo).toHaveBeenCalledWith(20);
    expect(player.currentTime).toBe(20);
    expect(reproduction.isPlaying()).toBe(true);
    expect(getLoopInternals(reproduction).loopInterval).not.toBeNull();

    reproduction.stop();
  });

  it('does not seek or start looping for inverted or non-finite ranges', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 30);
    const playCallsBefore = player.play.mock.calls.length;
    player.seekTo.mockClear();

    reproduction.playLoop(50, 20);
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.play).toHaveBeenCalledTimes(playCallsBefore);
    expect(getLoopInternals(reproduction).loopRange).toBeNull();
    expect(getLoopInternals(reproduction).loopInterval).toBeNull();

    reproduction.playLoop(Number.NaN, 50);
    reproduction.playLoop(20, Number.NaN);
    reproduction.playLoop(20, 20);

    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.play).toHaveBeenCalledTimes(playCallsBefore);
    expect(getLoopInternals(reproduction).loopRange).toBeNull();
    expect(getLoopInternals(reproduction).loopInterval).toBeNull();

    reproduction.stop();
  });

  it('resumes from the current position after pause then playLoop inside the same range', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 30);
    reproduction.playLoop(20, 50);
    reproduction.pause();
    expect(getLoopInternals(reproduction).loopInterval).toBeNull();
    player.seekTo.mockClear();

    reproduction.playLoop(20, 50);

    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.currentTime).toBe(30);
    expect(getLoopInternals(reproduction).loopInterval).not.toBeNull();

    reproduction.stop();
  });
});

describe('Reproduction.setLoopRange', () => {
  beforeEach(() => {
    vitest.useFakeTimers();
  });

  afterEach(() => {
    vitest.useRealTimers();
  });

  it('seeks only when an active loop is playing and the playhead is outside the new range', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 30);
    reproduction.playLoop(20, 50);
    player.seekTo.mockClear();

    expect(reproduction.setLoopRange(20, 60)).toBe(true);
    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.currentTime).toBe(30);
    expect(getLoopInternals(reproduction).loopRange).toEqual({
      from: 20,
      to: 60,
    });

    player.currentTime = 45;
    expect(reproduction.setLoopRange(20, 40)).toBe(true);
    expect(player.seekTo).toHaveBeenCalledWith(20);
    expect(player.currentTime).toBe(20);

    reproduction.stop();
  });

  it('does not seek or install a loop interval when no loop is running', () => {
    const { reproduction, player } = createReproduction();
    startPlayingAt(reproduction, player, 30);
    player.seekTo.mockClear();

    expect(reproduction.setLoopRange(40, 60)).toBe(true);

    expect(player.seekTo).not.toHaveBeenCalled();
    expect(player.currentTime).toBe(30);
    expect(getLoopInternals(reproduction).loopRange).toEqual({
      from: 40,
      to: 60,
    });
    expect(getLoopInternals(reproduction).loopInterval).toBeNull();

    reproduction.stop();
  });
});
