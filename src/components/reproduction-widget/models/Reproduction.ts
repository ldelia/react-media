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

type Handler = (args: object) => void;

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
  private volume: number = 50; // between 0 and 100
  private [dispatchOnReadyHandlers]: Handler[];
  private [dispatchOnSongStartHandlers]: Handler[];
  private [dispatchOnCountingInHandlers]: Handler[];
  private [dispatchOnPlayHandlers]: Handler[];
  private [dispatchOnPlayingHandlers]: Handler[];
  private [dispatchOnPausedHandlers]: Handler[];
  private [dispatchOnFinishHandlers]: Handler[];

  constructor(player: Player, requiresCountingIn: boolean, songTempo: number, volume: number) {
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

    this.setVolume(volume);

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

  static get EVENTS() {
    return EVENTS;
  }

  static get STATES() {
    return STATES;
  }

  static newBuilder() {
    return new ReproductionBuilder();
  }

  on(eventName: keyof typeof Reproduction.EVENTS, handler: Handler) {
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

  dispatch(eventName: keyof typeof Reproduction.EVENTS, args = {}) {
    let handler, i, len;

    let ref: Handler[] = [];

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
      handler(args);
      // setTimeout(handler, 0);
    }
  }

  start() {
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

  getVolume() {
    return this.volume;
  }

  setVolume(volume: number) {
    if (volume < 0) {
      volume = 0;
    } else if (volume > 100) {
      volume = 100;
    }
    this.volume = volume;
    this.player.setVolume(volume);
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
    this.dispatch(Reproduction.EVENTS.COUNTING_IN, {countingInCounter: this.countingInCounter});

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
        this.dispatch(Reproduction.EVENTS.COUNTING_IN, {countingInCounter: this.countingInCounter});
      }
    }, timeout);
  }
}
