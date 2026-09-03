import { PLAYER_EVENTS } from './PlayerEvents';

export type InnerAudioPlayerInterface = HTMLAudioElement;

/**
 * HTMLAudioElement.playbackRate accepts continuous values.
 * Browser support is typically within ~0.25–4.0.
 */
const MIN_PLAYBACK_RATE = 0.25;
const MAX_PLAYBACK_RATE = 4;

const dispatchOnPlayingHandlers = Symbol();
const dispatchOnFinishHandlers = Symbol();
const dispatchOnErrorHandlers = Symbol();

export class HtmlAudioPlayer {
  private currentTime: number;
  private isRunning: boolean;
  private volume: number = 50; // between 0 and 100
  private innerPlayer: InnerAudioPlayerInterface;
  private [dispatchOnPlayingHandlers]: (() => void)[];
  private [dispatchOnFinishHandlers]: (() => void)[];
  private [dispatchOnErrorHandlers]: ((error?: any) => void)[];

  constructor(innerPlayer: InnerAudioPlayerInterface) {
    this[dispatchOnFinishHandlers] = [];
    this[dispatchOnPlayingHandlers] = [];
    this[dispatchOnErrorHandlers] = [];

    this.currentTime = 0;
    this.isRunning = false;
    this.innerPlayer = innerPlayer;

    this.innerPlayer.addEventListener('playing', () => {
      this.isRunning = true;
      this.dispatch(HtmlAudioPlayer.EVENTS.PLAYING);
    });

    this.innerPlayer.addEventListener('ended', () => {
      this.isRunning = false;
      this.currentTime = 0;
      this.dispatch(HtmlAudioPlayer.EVENTS.FINISH);
    });

    this.innerPlayer.addEventListener('pause', () => {
      this.isRunning = false;
      this.currentTime = this.innerPlayer.currentTime;
      this.dispatch(HtmlAudioPlayer.EVENTS.PAUSED);
    });

    this.innerPlayer.addEventListener('error', () => {
      this.isRunning = false;
      this.dispatch(HtmlAudioPlayer.EVENTS.ERROR, {
        message: 'Audio playback error',
      });
    });
  }

  static get EVENTS() {
    return PLAYER_EVENTS;
  }

  getInnerPlayer() {
    return this.innerPlayer;
  }

  play() {
    void this.innerPlayer.play();
  }

  pause() {
    this.innerPlayer.pause();
  }

  stop() {
    this.isRunning = false;
    this.innerPlayer.pause();
    this.seekTo(0);
  }

  seekTo(seconds: number) {
    this.currentTime = seconds;
    this.innerPlayer.currentTime = seconds;

    if (this.isRunning) {
      this.play();
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.innerPlayer.volume = volume / 100;
  }

  getVolume() {
    return this.volume;
  }

  getCurrentTime() {
    return this.isRunning ? this.innerPlayer.currentTime : this.currentTime;
  }

  getDuration() {
    if (this.isAvailable()) {
      return this.innerPlayer.duration;
    }
  }

  /**
   * Returns an empty array to signal that HTML audio supports continuous playback
   * rates (any value between {@link MIN_PLAYBACK_RATE} and {@link MAX_PLAYBACK_RATE}),
   * unlike YouTube which only allows a discrete set.
   */
  getAvailablePlaybackRates() {
    return [] as number[];
  }

  setPlaybackRate(playbackRate: number) {
    if (
      !Number.isFinite(playbackRate) ||
      playbackRate < MIN_PLAYBACK_RATE ||
      playbackRate > MAX_PLAYBACK_RATE
    ) {
      throw new Error(
        `The HtmlAudioPlayer doesn't support a playbackRate with value ${playbackRate}. ` +
          `Expected a number between ${MIN_PLAYBACK_RATE} and ${MAX_PLAYBACK_RATE}.`,
      );
    }
    this.innerPlayer.playbackRate = playbackRate;
  }

  isAvailable() {
    return this.innerPlayer !== null;
  }

  on(
    eventName: keyof typeof HtmlAudioPlayer.EVENTS,
    handler: (error?: any) => void,
  ) {
    switch (eventName) {
      case HtmlAudioPlayer.EVENTS.PLAYING:
        return this[dispatchOnPlayingHandlers].push(handler);
      case HtmlAudioPlayer.EVENTS.FINISH:
        return this[dispatchOnFinishHandlers].push(handler);
      case HtmlAudioPlayer.EVENTS.ERROR:
        return this[dispatchOnErrorHandlers].push(handler);
      default:
        break;
    }
  }

  dispatch(eventName: keyof typeof HtmlAudioPlayer.EVENTS, error?: any) {
    let handler: (error?: any) => void;
    let i: number;
    let len: number;
    let ref: ((error?: any) => void)[] = [];

    switch (eventName) {
      case HtmlAudioPlayer.EVENTS.PLAYING:
        ref = this[dispatchOnPlayingHandlers];
        break;
      case HtmlAudioPlayer.EVENTS.FINISH:
        ref = this[dispatchOnFinishHandlers];
        break;
      case HtmlAudioPlayer.EVENTS.ERROR:
        ref = this[dispatchOnErrorHandlers];
        break;
      default:
        break;
    }

    for (i = 0, len = ref.length; i < len; i++) {
      handler = ref[i];
      setTimeout(() => handler(error), 0);
    }
  }
}

/** @deprecated Use {@link HtmlAudioPlayer} */
export const Mp3Player = HtmlAudioPlayer;

/** @deprecated Use {@link InnerAudioPlayerInterface} */
export type InnerMp3PlayerInterface = InnerAudioPlayerInterface;
