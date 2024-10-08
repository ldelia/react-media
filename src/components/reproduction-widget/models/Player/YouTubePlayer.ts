import { PlayAlongPlayer } from './PlayAlongPlayer';
import { PLAYER_EVENTS } from './PlayerEvents';

export type InnerYouTubePlayerInterface = YT.Player;

const dispatchOnReadyHandlers = Symbol();
const dispatchOnFinishHandlers = Symbol();

export class YouTubePlayer {
  private currentTime: number;
  private isRunning: boolean;
  private innerPlayer: InnerYouTubePlayerInterface;
  private [dispatchOnReadyHandlers]: (() => void)[];
  private [dispatchOnFinishHandlers]: (() => void)[];

  static get EVENTS() {
    return PLAYER_EVENTS;
  }

  constructor(innerPlayer: InnerYouTubePlayerInterface) {
    this[dispatchOnFinishHandlers] = [];
    this[dispatchOnReadyHandlers] = [];

    this.currentTime = 0;
    this.isRunning = false;

    this.innerPlayer = innerPlayer;
    this.innerPlayer = innerPlayer;
    this.dispatch(YouTubePlayer.EVENTS.READY);

    // this is necessary for avoiding the state video cued.
    // When a video is in this state, when user seek to X, the song is played
    this.innerPlayer.playVideo();
    this.innerPlayer.pauseVideo();

    this.innerPlayer.addEventListener(
      'onStateChange',
      (videoState: YT. OnStateChangeEvent) => {
        switch (videoState.data) {
          case YT. PlayerState.ENDED:
            this.dispatch(YouTubePlayer.EVENTS.FINISH);
            this.isRunning = false;
            this.currentTime = 0;
            break;
          default:
            break;
        }
      }
    );
  }

  getInnerPlayer() {
    return this.innerPlayer;
  }

  play() {
    const videoPlayer = this.getInnerPlayer();
    videoPlayer.playVideo();

    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;

    this.getInnerPlayer().pauseVideo();

    this.currentTime = this.getInnerPlayer().getCurrentTime();
  }

  stop() {
    this.isRunning = false;

    /**
     * Hay un issue al llamar a getDuration del video luego de reanudar una canción pausada (devuelve siempre 0)
     * Para evitar que se pierda la información y tener que cargarla de nuevo, se simula un stop pausando y llevando al comienzo
     *  videoPlayer.stopVideo();
     */
    this.getInnerPlayer().pauseVideo();

    this.seekTo(0);
  }

  seekTo(seconds: number) {
    const videoPlayer = this.getInnerPlayer();
    this.currentTime = seconds;

    videoPlayer.seekTo(this.currentTime, true);

    if (this.isRunning) {
      this.play();
    }
  }

  getCurrentTime() {
    return this.isRunning
      ? this.getInnerPlayer().getCurrentTime()
      : this.currentTime;
  }

  getDuration() {
    if (this.isAvailable()) {
      return this.getInnerPlayer().getDuration();
    }
  }

  getAvailablePlaybackRates() {
    return this.getInnerPlayer().getAvailablePlaybackRates();
  }

  setPlaybackRate(playbackRate: number) {
    if (!this.getAvailablePlaybackRates().includes(playbackRate)) {
      throw new Error(
        `The PlayAlongPlayer doesn't support a playbackRate with value ${playbackRate}`
      );
    }
    this.getInnerPlayer().setPlaybackRate(playbackRate);
  }

  isAvailable() {
    return this.getInnerPlayer() !== null;
  }

  on(eventName: keyof typeof PlayAlongPlayer.EVENTS, handler: () => void) {
    switch (eventName) {
      case PlayAlongPlayer.EVENTS.READY:
        return this[dispatchOnReadyHandlers].push(handler);
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
      case YouTubePlayer.EVENTS.READY:
        ref = this[dispatchOnReadyHandlers];
        break;
      case YouTubePlayer.EVENTS.FINISH:
        ref = this[dispatchOnFinishHandlers];
        break;
      default:
        break;
    }

    for (i = 0, len = ref.length; i < len; i++) {
      handler = ref[i];
      setTimeout(handler, 0);
    }
  }
}
