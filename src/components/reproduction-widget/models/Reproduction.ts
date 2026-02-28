import { PLAYER_EVENTS } from './Player/PlayerEvents';
import { ReproductionBuilder } from './ReproductionBuilder';
import { PlayAlongPlayer } from './Player/PlayAlongPlayer';
import { YouTubePlayer } from './Player/YouTubePlayer';

type Player = PlayAlongPlayer | YouTubePlayer;

export const REPRODUCTION_STATES = {
  STOPPED: 0,
  COUNTING_IN: 1,
  PLAYING: 2,
  PAUSED: 3,
};

type ReproductionState =
  (typeof REPRODUCTION_STATES)[keyof typeof REPRODUCTION_STATES];

const EVENTS = {
  START: 'START',
  COUNTING_IN: 'COUNTING_IN',
  PLAY: 'PLAY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  FINISH: 'FINISH',
  ERROR: 'ERROR',
} as const;

type Handler = (args: object) => void;

const dispatchOnSongStartHandlers = Symbol();
const dispatchOnCountingInHandlers = Symbol();
const dispatchOnPlayHandlers = Symbol();
const dispatchOnPlayingHandlers = Symbol();
const dispatchOnPausedHandlers = Symbol();
const dispatchOnFinishHandlers = Symbol();
const dispatchOnErrorHandlers = Symbol();

export class Reproduction {
  private readonly player: Player;
  private readonly requiresCountingIn: boolean;
  private readonly songTempo: number;

  private state: ReproductionState;
  private interval: ReturnType<typeof setInterval> | null;
  private loopInterval: ReturnType<typeof setInterval> | null;
  private loopRange: { from: number; to: number } | null;
  private countingInCounter: number;

  private [dispatchOnSongStartHandlers]: Handler[];
  private [dispatchOnCountingInHandlers]: Handler[];
  private [dispatchOnPlayHandlers]: Handler[];
  private [dispatchOnPlayingHandlers]: Handler[];
  private [dispatchOnPausedHandlers]: Handler[];
  private [dispatchOnFinishHandlers]: Handler[];
  private [dispatchOnErrorHandlers]: Handler[];

  constructor(
    player: Player,
    requiresCountingIn: boolean,
    songTempo: number,
    volume: number,
  ) {
    this[dispatchOnSongStartHandlers] = [];
    this[dispatchOnCountingInHandlers] = [];
    this[dispatchOnPlayHandlers] = [];
    this[dispatchOnPlayingHandlers] = [];
    this[dispatchOnPausedHandlers] = [];
    this[dispatchOnFinishHandlers] = [];
    this[dispatchOnErrorHandlers] = [];

    this.songTempo = songTempo;
    this.player = player;

    this.state = Reproduction.STATES.STOPPED;
    this.interval = null;
    this.loopInterval = null;
    this.loopRange = null;

    this.requiresCountingIn = requiresCountingIn;
    this.countingInCounter = 0;

    this.player.setVolume(volume);

    this.player.on(PLAYER_EVENTS.PLAYING, () => {
      this.state = Reproduction.STATES.PLAYING;
      this.dispatch(Reproduction.EVENTS.PLAY);
    });
    this.player.on(PLAYER_EVENTS.FINISH, () => {
      this.state = Reproduction.STATES.STOPPED;
      clearInterval(this.interval as NodeJS.Timeout);
      clearInterval(this.loopInterval as NodeJS.Timeout);
      this.loopInterval = null;
      this.loopRange = null;
      this.dispatch(Reproduction.EVENTS.FINISH);
    });
    this.player.on(PLAYER_EVENTS.ERROR, (error: any) => {
      this.dispatch(Reproduction.EVENTS.ERROR, { error });
    });
  }

  static get EVENTS() {
    return EVENTS;
  }

  static get STATES() {
    return REPRODUCTION_STATES;
  }

  static newBuilder() {
    return new ReproductionBuilder();
  }

  on(
    eventName: keyof typeof Reproduction.EVENTS,
    handler: Handler,
  ): () => void {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    switch (eventName) {
      case Reproduction.EVENTS.START:
        this[dispatchOnSongStartHandlers].push(handler);
        break;
      case Reproduction.EVENTS.COUNTING_IN:
        this[dispatchOnCountingInHandlers].push(handler);
        break;
      case Reproduction.EVENTS.PLAY:
        this[dispatchOnPlayHandlers].push(handler);
        break;
      case Reproduction.EVENTS.PLAYING:
        this[dispatchOnPlayingHandlers].push(handler);
        break;
      case Reproduction.EVENTS.PAUSED:
        this[dispatchOnPausedHandlers].push(handler);
        break;
      case Reproduction.EVENTS.FINISH:
        this[dispatchOnFinishHandlers].push(handler);
        break;
      case Reproduction.EVENTS.ERROR:
        this[dispatchOnErrorHandlers].push(handler);
        break;
      default:
        throw new Error(`Unknown event: ${eventName}`);
    }

    return () => this.off(eventName, handler);
  }

  off(eventName: keyof typeof Reproduction.EVENTS, handler: Handler): void {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    let handlers: Handler[];

    switch (eventName) {
      case Reproduction.EVENTS.START:
        handlers = this[dispatchOnSongStartHandlers];
        break;
      case Reproduction.EVENTS.COUNTING_IN:
        handlers = this[dispatchOnCountingInHandlers];
        break;
      case Reproduction.EVENTS.PLAY:
        handlers = this[dispatchOnPlayHandlers];
        break;
      case Reproduction.EVENTS.PLAYING:
        handlers = this[dispatchOnPlayingHandlers];
        break;
      case Reproduction.EVENTS.PAUSED:
        handlers = this[dispatchOnPausedHandlers];
        break;
      case Reproduction.EVENTS.FINISH:
        handlers = this[dispatchOnFinishHandlers];
        break;
      case Reproduction.EVENTS.ERROR:
        handlers = this[dispatchOnErrorHandlers];
        break;
      default:
        throw new Error(`Unknown event: ${eventName}`);
    }

    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  dispatch(eventName: keyof typeof Reproduction.EVENTS, args = {}) {
    let handler, i, len;

    let ref: Handler[] = [];

    switch (eventName) {
      case Reproduction.EVENTS.START:
        ref = this[dispatchOnSongStartHandlers];
        break;
      case Reproduction.EVENTS.COUNTING_IN:
        ref = this[dispatchOnCountingInHandlers];
        break;
      case Reproduction.EVENTS.PLAY:
        ref = this[dispatchOnPlayHandlers];
        break;
      case Reproduction.EVENTS.PLAYING:
        ref = this[dispatchOnPlayingHandlers];
        break;
      case Reproduction.EVENTS.PAUSED:
        ref = this[dispatchOnPausedHandlers];
        break;
      case Reproduction.EVENTS.FINISH:
        ref = this[dispatchOnFinishHandlers];
        break;
      case Reproduction.EVENTS.ERROR:
        ref = this[dispatchOnErrorHandlers];
        break;
      default:
        break;
    }

    for (i = 0, len = ref.length; i < len; i++) {
      handler = ref[i];
      handler(args);
    }
  }

  start() {
    this.seekTo(0);
    if (this.state === Reproduction.STATES.STOPPED) {
      this.dispatch(Reproduction.EVENTS.START);
    }

    if (this.requiresCountingIn && this.getCurrentTime() === 0) {
      this.state = Reproduction.STATES.COUNTING_IN;
      this.countInAndPlay(this.getBPMInterval() * 2, 3);
    } else {
      this.play();
    }
  }

  play() {
    clearInterval(this.interval as NodeJS.Timeout);

    this.player.play();

    const bpmInterval = this.getBPMInterval();
    const tickInterval = Math.min(bpmInterval / 4, 50);

    this.interval = setInterval(() => {
      if (this.isPlaying()) {
        this.dispatch(Reproduction.EVENTS.PLAYING);
      }
    }, tickInterval);
  }

  playLoop(from: number, to: number) {
    if (!this.setLoopRange(from, to)) {
      return;
    }

    clearInterval(this.loopInterval as NodeJS.Timeout);
    this.loopInterval = null;

    this.seekTo(from);
    this.play();

    const loopCheckInterval = 100;

    this.loopInterval = setInterval(() => {
      if (!this.isPlaying() || !this.loopRange) {
        return;
      }

      const currentTime = this.getCurrentTime();
      if (currentTime >= this.loopRange.to) {
        this.seekTo(this.loopRange.from);
      }
    }, loopCheckInterval);
  }

  pause() {
    this.state = Reproduction.STATES.PAUSED;
    this.player.pause();
    clearInterval(this.interval as NodeJS.Timeout);
    clearInterval(this.loopInterval as NodeJS.Timeout);
    this.loopInterval = null;
    this.loopRange = null;

    this.dispatch(Reproduction.EVENTS.PAUSED);
  }

  stop() {
    this.state = Reproduction.STATES.STOPPED;
    this.player.stop();
    clearInterval(this.interval as NodeJS.Timeout);
    clearInterval(this.loopInterval as NodeJS.Timeout);
    this.loopInterval = null;
    this.loopRange = null;
    this.dispatch(Reproduction.EVENTS.FINISH);
  }

  isPlaying() {
    return this.state === Reproduction.STATES.PLAYING;
  }

  isStopped() {
    return this.state === Reproduction.STATES.STOPPED;
  }

  isPaused() {
    return this.state === Reproduction.STATES.PAUSED;
  }

  isCountingIn() {
    return this.state === Reproduction.STATES.COUNTING_IN;
  }

  getState(): ReproductionState {
    return this.state;
  }

  getPlayer() {
    return this.player;
  }

  getTempo() {
    return this.songTempo;
  }

  getCurrentTime() {
    // in seconds with milliseconds.
    return this.player.getCurrentTime();
  }

  getDuration() {
    return this.player.getDuration();
  }

  seekTo(seconds: number) {
    this.player.seekTo(seconds);
  }

  getVolume() {
    return this.player.getVolume();
  }

  setVolume(volume: number) {
    if (volume < 0) {
      volume = 0;
    } else if (volume > 100) {
      volume = 100;
    }
    this.player.setVolume(volume);
  }

  setLoopRange(from: number, to: number): boolean {
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) {
      return false;
    }

    this.loopRange = { from, to };
    return true;
  }

  getAvailablePlaybackRates() {
    return this.player.getAvailablePlaybackRates();
  }

  setPlaybackRate(playbackRate: number) {
    this.player.setPlaybackRate(playbackRate);
  }

  isAvailable() {
    return this.player.isAvailable();
  }

  getBPMInterval() {
    return 60000 / this.getTempo();
  }

  private countInAndPlay(timeout: number, limit: number) {
    // the initial count starts instantly, no need to wait
    this.countingInCounter++;
    this.dispatch(Reproduction.EVENTS.COUNTING_IN, {
      countingInCounter: this.countingInCounter,
    });

    const interval = setInterval(() => {
      this.countingInCounter++;
      if (this.countingInCounter === limit) {
        clearInterval(interval);
        this.countingInCounter = 0;
        if (limit !== 5) {
          this.countInAndPlay(this.getBPMInterval(), 5);
        } else {
          this.play();
        }
      } else {
        this.dispatch(Reproduction.EVENTS.COUNTING_IN, {
          countingInCounter: this.countingInCounter,
        });
      }
    }, timeout);
  }
}
