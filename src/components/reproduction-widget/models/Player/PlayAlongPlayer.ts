import { PLAYER_EVENTS } from './PlayerEvents';

const dispatchOnReadyHandlers = Symbol();
const dispatchOnFinishHandlers = Symbol();

export class PlayAlongPlayer {
  private readonly duration: number;
  private currentTime: number;
  private isRunning: boolean;
  private currentPlaybackRate: number;
  private innerPlayer: string | null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private [dispatchOnReadyHandlers]: (() => void)[];
  private [dispatchOnFinishHandlers]: (() => void)[];

  constructor(duration: number, innerPlayer: string) {
    this.interval = null;
    this.currentTime = 0;
    this.isRunning = false;
    this.duration = duration;
    this.currentPlaybackRate = 1;
    this.innerPlayer = null;

    this[dispatchOnFinishHandlers] = [];
    this[dispatchOnReadyHandlers] = [];

    this.setInnerPlayer(innerPlayer);
  }

  static get EVENTS() {
    return PLAYER_EVENTS;
  }

  play() {
    this.isRunning = true;

    const intervalTimeout = 1000;

    this.interval = setInterval(() => {
      if (this.isRunning) {
        this.currentTime++;
        if (this.currentTime >= this.getDuration()) {
          this.stop();
          this.dispatch(PlayAlongPlayer.EVENTS.FINISH);
        }
      }
    }, intervalTimeout);
  }

  pause() {
    this.isRunning = false;
  }

  stop() {
    this.currentTime = 0;
    this.isRunning = false;

    if (this.interval !== null) {
      clearInterval(this.interval as NodeJS.Timeout);
      this.interval = null;
    }
  }

  seekTo(seconds: number) {
    this.currentTime = seconds;
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getDuration() {
    return this.duration;
  }

  isAvailable() {
    return true;
  }

  getAvailablePlaybackRates() {
    return [1];
  }

  setPlaybackRate(playbackRate: number) {
    if (!this.getAvailablePlaybackRates().includes(playbackRate)) {
      throw new Error(
        `The PlayAlongPlayer doesn't support a playbackRate with value ${playbackRate}`
      );
    }
    this.currentPlaybackRate = playbackRate;
  }

  on(eventName: keyof typeof PlayAlongPlayer.EVENTS, handler: () => void) {
    switch (eventName) {
      case PlayAlongPlayer.EVENTS.FINISH:
        return this[dispatchOnFinishHandlers].push(handler);
      default:
        break;
    }
  }

  dispatch(eventName: keyof typeof PlayAlongPlayer.EVENTS) {
    let handler, i, len;
    let ref: (() => void)[] = [];

    switch (eventName) {
      case PlayAlongPlayer.EVENTS.FINISH:
        ref = this[dispatchOnFinishHandlers];
        break;
      default:
        break;
    }

    for (i = 0, len = ref.length; i < len; i++) {
      handler = ref[i];
      handler();
    }
  }

  countingStarted() {}

  countingFinished() {}

  setVolume(volume: number) {}

  getVolume() { return 0 }

  private setInnerPlayer(innerPlayer: string) {
    this.innerPlayer = innerPlayer;
  }
}
