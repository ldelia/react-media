import {
  InnerYouTubePlayerInterface,
  YouTubePlayer,
} from './Player/YouTubePlayer';
import {
  HtmlAudioPlayer,
  InnerAudioPlayerInterface,
} from './Player/HtmlAudioPlayer';
import { PlayAlongPlayer } from './Player/PlayAlongPlayer';
import { Reproduction } from './Reproduction';

export type MediaType = 'youtube' | 'audio' | 'playAlong';

export class ReproductionBuilder {
  private mediaType: MediaType;
  private requiresCountingIn: boolean;
  private songDuration: number | null;
  private songTempo: number | null;
  private volume: number; // between 0 and 100
  private innerPlayer:
    | InnerYouTubePlayerInterface
    | InnerAudioPlayerInterface
    | string
    | null;

  constructor() {
    this.mediaType = 'playAlong';
    this.requiresCountingIn = false;
    this.songDuration = null;
    this.songTempo = null;
    this.volume = 50;
    this.innerPlayer = null;
  }

  withSongDuration(songDuration: number) {
    this.songDuration = songDuration;
    return this;
  }

  withSongTempo(songTempo: number) {
    this.songTempo = songTempo;
    return this;
  }

  withMediaType(mediaType: MediaType) {
    this.mediaType = mediaType;
    return this;
  }

  withCountingIn(requiresCountingIn: boolean) {
    this.requiresCountingIn = requiresCountingIn;
    return this;
  }

  withInnerPlayer(
    innerPlayer:
      | InnerYouTubePlayerInterface
      | InnerAudioPlayerInterface
      | string,
  ) {
    this.innerPlayer = innerPlayer;
    return this;
  }

  withVolume(volume: number) {
    this.volume = volume;
    return this;
  }

  createReproduction() {
    if (this.requiresCountingIn && this.songTempo === null) {
      throw new Error('The song tempo is mandatory');
    }

    if (this.innerPlayer === null) {
      throw new Error('The inner player was not provided.');
    }

    let player;
    switch (this.mediaType) {
      case 'youtube':
        player = new YouTubePlayer(
          this.innerPlayer as InnerYouTubePlayerInterface,
        );
        break;
      case 'audio':
        player = new HtmlAudioPlayer(
          this.innerPlayer as InnerAudioPlayerInterface,
        );
        break;
      case 'playAlong':
        if (this.songDuration === null) {
          throw new Error('The song duration is mandatory');
        }
        player = new PlayAlongPlayer(
          this.songDuration,
          this.innerPlayer as string,
        );
        break;
      default:
        throw new Error(`Unknown media type: ${this.mediaType}`);
    }

    return new Reproduction(
      player,
      this.requiresCountingIn,
      this.songTempo || 0,
      this.volume,
    );
  }
}
