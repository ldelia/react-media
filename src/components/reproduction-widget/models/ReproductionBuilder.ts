import { InnerYouTubePlayerInterface, YouTubePlayer } from './Player/YouTubePlayer';
import { PlayAlongPlayer } from './Player/PlayAlongPlayer';
import { Reproduction } from './Reproduction';

export class ReproductionBuilder {
  private trainingMode: boolean;
  private requiresCountingIn: boolean;
  private songDuration: number | null;
  private songTempo: number | null;
  private volume: number; // between 0 and 100
  private innerPlayer: InnerYouTubePlayerInterface | string | null;

  constructor() {
    this.trainingMode = false;
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

  withTrainingMode(trainingMode: boolean) {
    this.trainingMode = trainingMode;
    return this;
  }

  withCountingIn(requiresCountingIn: boolean) {
    this.requiresCountingIn = requiresCountingIn;
    return this;
  }

  withInnerPlayer(innerPlayer: InnerYouTubePlayerInterface | string) {
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
    if (this.trainingMode) {
      player = new YouTubePlayer(this.innerPlayer as InnerYouTubePlayerInterface);
    } else {
      if (this.songDuration === null) {
        throw new Error('The song duration is mandatory');
      }
      player = new PlayAlongPlayer(this.songDuration, this.innerPlayer as string);
    }
    return new Reproduction(
      player,
      this.requiresCountingIn,
      this.songTempo || 0,
      this.volume
    );
  }
}
