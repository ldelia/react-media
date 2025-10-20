import { PlayAlongPlayer } from './PlayAlongPlayer';
import { PLAYER_EVENTS } from './PlayerEvents';

export type InnerYouTubePlayerInterface = YT.Player;

const dispatchOnReadyHandlers = Symbol();
const dispatchOnFinishHandlers = Symbol();
const dispatchOnErrorHandlers = Symbol();

export class YouTubePlayer {
  private currentTime: number;
  private isRunning: boolean;
  private volume: number = 50; // between 0 and 100
  private innerPlayer: InnerYouTubePlayerInterface;
  private [dispatchOnReadyHandlers]: (() => void)[];
  private [dispatchOnFinishHandlers]: (() => void)[];
  private [dispatchOnErrorHandlers]: ((error: any) => void)[];

  constructor(innerPlayer: InnerYouTubePlayerInterface) {
    this[dispatchOnFinishHandlers] = [];
    this[dispatchOnReadyHandlers] = [];
    this[dispatchOnErrorHandlers] = [];

    this.currentTime = 0;
    this.isRunning = false;

    this.innerPlayer = innerPlayer;

    // This is necessary for avoiding the state video cued.
    // When a video is in this state, when the user seeks to X, the song is played
    this.innerPlayer.playVideo();
    this.innerPlayer.pauseVideo();

    this.innerPlayer.addEventListener('onError', (event: YT.OnErrorEvent) => {
      this.isRunning = false;
      this.dispatch(YouTubePlayer.EVENTS.ERROR, {
        code: event.data,
        message: this.getErrorMessage(event.data)
      });
    });

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

  static get EVENTS() {
    return PLAYER_EVENTS;
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
     * There's an issue when calling getDuration on the video after resuming a paused song (it always returns 0)
     * To prevent losing this information and having to reload it, we simulate a stop by pausing and seeking to the start
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

  setVolume(volume: number) {
    this.volume = volume;
    this.getInnerPlayer().setVolume(volume);
  }

  getVolume() {
    return this.volume;
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

  on(eventName: keyof typeof PlayAlongPlayer.EVENTS, handler: (error?: any) => void) {
    switch (eventName) {
      case PlayAlongPlayer.EVENTS.FINISH:
        return this[dispatchOnFinishHandlers].push(handler);
      case PlayAlongPlayer.EVENTS.ERROR:
        return this[dispatchOnErrorHandlers].push(handler);
      default:
        break;
    }
  }

  dispatch(eventName: keyof typeof PlayAlongPlayer.EVENTS, error?: any) {
    let handler: ((error?: any) => void);
    let i: number;
    let len: number;
    let ref: ((error?: any) => void)[] = [];

    switch (eventName) {
      case YouTubePlayer.EVENTS.FINISH:
        ref = this[dispatchOnFinishHandlers];
        break;
      case YouTubePlayer.EVENTS.ERROR:
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

  countingStarted() {
    /**
     * iOS browsers enforce strict autoplay policies that require video playback
     * to begin synchronously within a user interaction event (e.g., a tap or click).
     * When we implemented the counting-in feature (1, 2, 1, 2, 3, go...),
     * the asynchronous delays between counts caused iOS to lose the user interaction context,
     * blocking video playback after the countdown completed.
     * The video would work fine on web and Android, but fail to start on iOS Safari.
     * To resolve this, we adopted a muted-first approach:
     * the video begins playing immediately when the user initiates playback,
     * but remains muted during the countdown sequence.
     * Once the countdown completes, we unmute the video and restore the desired volume.
     * This strategy satisfies iOS's autoplay requirements (muted videos can autoplay)
     * while preserving the musical countdown experience.
     * The user never notices the video is playing during the countdown
     * since it's both muted and visually obscured by the countdown overlay.
    * */
    this.getInnerPlayer().setVolume(0);
    this.getInnerPlayer().playVideo();
  }

  countingFinished() {
    this.getInnerPlayer().pauseVideo();
    this.getInnerPlayer().seekTo(0, true)
    this.setVolume(this.volume);
  }

  private getErrorMessage(errorCode: number): string {
    switch (errorCode) {
      case YT.PlayerError.InvalidParam:
        return 'Invalid parameter value';
      case YT.PlayerError.Html5Error:
        return 'HTML5 player error';
      case YT.PlayerError.VideoNotFound:
        return 'Video not found';
      case YT.PlayerError.EmbeddingNotAllowed:
      case YT.PlayerError.EmbeddingNotAllowed2:
        return 'Video cannot be played in embedded players';
      default:
        return `Unknown error (code: ${errorCode})`;
    }
  }
}
