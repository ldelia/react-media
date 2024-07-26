import { PLAYER_EVENTS } from './Player/PlayerEvents';
import { ReproductionBuilder } from './ReproductionBuilder';
import { PlayAlongPlayer } from './Player/PlayAlongPlayer';
import { YouTubePlayer } from './Player/YouTubePlayer';

type Player = PlayAlongPlayer | YouTubePlayer;

const STATES = {
  STOPPED: 0,
  COUNTING_IN: 1,
  PLAYING: 2,
  PAUSED: 3,
};

const EVENTS = {
  READY: 'READY',
  START: 'START',
  COUNTING_IN: 'COUNTING_IN',
  PLAY: 'PLAY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  FINISH: 'FINISH',
} as const;

const dispatchOnReadyHandlers = Symbol();
const dispatchOnSongStartHandlers = Symbol();
const dispatchOnCountingInHandlers = Symbol();
const dispatchOnPlayHandlers = Symbol();
const dispatchOnPlayingHandlers = Symbol();
const dispatchOnPausedHandlers = Symbol();
const dispatchOnFinishHandlers = Symbol();

export class Reproduction {
  private player: Player;
  private requiresCountingIn: boolean;

  private songTempo: number;
  private state: number;
  private ready: boolean;
  private interval: ReturnType<typeof setInterval> | null;
  private countingInCounter: number;
  private [dispatchOnReadyHandlers]: (() => void)[];
  private [dispatchOnSongStartHandlers]: (() => void)[];
  private [dispatchOnCountingInHandlers]: (() => void)[];
  private [dispatchOnPlayHandlers]: (() => void)[];
  private [dispatchOnPlayingHandlers]: (() => void)[];
  private [dispatchOnPausedHandlers]: (() => void)[];
  private [dispatchOnFinishHandlers]: (() => void)[];

  static get EVENTS() {
    return EVENTS;
  }

  static get STATES() {
    return STATES;
  }

  constructor(player: Player, requiresCountingIn: boolean, songTempo: number) {
    this[dispatchOnReadyHandlers] = [];
    this[dispatchOnSongStartHandlers] = [];
    this[dispatchOnCountingInHandlers] = [];
    this[dispatchOnPlayHandlers] = [];
    this[dispatchOnPlayingHandlers] = [];
    this[dispatchOnPausedHandlers] = [];
    this[dispatchOnFinishHandlers] = [];

    this.songTempo = songTempo;
    this.player = player;
    this.ready = false;

    this.state = Reproduction.STATES.STOPPED;
    this.interval = null;

    this.requiresCountingIn = requiresCountingIn;
    this.countingInCounter = 0;

    this.player.on(PLAYER_EVENTS.READY, () => {
      this.ready = true;
      this.dispatch(Reproduction.EVENTS.READY);
    });

    this.player.on(PLAYER_EVENTS.FINISH, () => {
      this.state = Reproduction.STATES.STOPPED;
      clearInterval(this.interval as NodeJS.Timeout);
      this.dispatch(Reproduction.EVENTS.FINISH);
    });
  }

  on(eventName: keyof typeof Reproduction.EVENTS, handler: () => void) {
    switch (eventName) {
      case Reproduction.EVENTS.READY:
        return this[dispatchOnReadyHandlers].push(handler);
      case Reproduction.EVENTS.START:
        return this[dispatchOnSongStartHandlers].push(handler);
      case Reproduction.EVENTS.COUNTING_IN:
        return this[dispatchOnCountingInHandlers].push(handler);
      case Reproduction.EVENTS.PLAY:
        return this[dispatchOnPlayHandlers].push(handler);
      case Reproduction.EVENTS.PLAYING:
        return this[dispatchOnPlayingHandlers].push(handler);
      case Reproduction.EVENTS.PAUSED:
        return this[dispatchOnPausedHandlers].push(handler);
      case Reproduction.EVENTS.FINISH:
        return this[dispatchOnFinishHandlers].push(handler);
      default:
        break;
    }
  }

  dispatch(eventName: keyof typeof Reproduction.EVENTS) {
    let handler, i, len;

    let ref: (() => void)[] = [];

    switch (eventName) {
      case Reproduction.EVENTS.READY:
        ref = this[dispatchOnReadyHandlers];
        break;
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
      default:
        break;
    }

    for (i = 0, len = ref.length; i < len; i++) {
      handler = ref[i];
      handler();
      // setTimeout(handler, 0);
    }
  }

  private countIn(timeout: number, limit: number) {
    // the initial count starts instantly, no waiting
    this.countingInCounter++;
    this.dispatch(Reproduction.EVENTS.COUNTING_IN);

    const interval = setInterval(() => {
      this.countingInCounter++;
      if (this.countingInCounter === limit) {
        clearInterval(interval);
        this.countingInCounter = 0;
        if (limit !== 5) {
          this.countIn(this.getBPMInterval(), 5);
        } else {
          this.play();
        }
      } else {
        this.dispatch(Reproduction.EVENTS.COUNTING_IN);
      }
    }, timeout);
  }

  start() {
    if (this.state === Reproduction.STATES.STOPPED) {
      this.dispatch(Reproduction.EVENTS.START);
    }

    if (this.requiresCountingIn && this.getCurrentTime() === 0) {
      this.state = Reproduction.STATES.COUNTING_IN;
      this.countIn(this.getBPMInterval() * 2, 3);
    } else {
      this.play();
    }
  }

  play() {
    this.state = Reproduction.STATES.PLAYING;
    this.dispatch(Reproduction.EVENTS.PLAY);
    this.player.play();

    const intervalTimeout = 200;

    this.interval = setInterval(() => {
      if (this.isPlaying()) {
        this.dispatch(Reproduction.EVENTS.PLAYING);
      }
    }, intervalTimeout);
  }

  pause() {
    this.state = Reproduction.STATES.PAUSED;
    this.player.pause();
    clearInterval(this.interval as NodeJS.Timeout);

    this.dispatch(Reproduction.EVENTS.PAUSED);
  }

  stop() {
    this.state = Reproduction.STATES.STOPPED;
    this.player.stop();
    clearInterval(this.interval as NodeJS.Timeout);
    this.dispatch(Reproduction.EVENTS.FINISH);
  }

  isReady() {
    // It's necessary to avoid play the reproduction-widget when the player is not ready
    return this.ready;
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

  static newBuilder() {
    return new ReproductionBuilder();
  }
}
