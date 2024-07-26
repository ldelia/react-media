import { YouTubePlayer } from './Player/YouTubePlayer';
import { PlayAlongPlayer } from './Player/PlayAlongPlayer';
import { Reproduction } from './Reproduction';
import { YouTubePlayer as InnerYouTubePlayer } from 'react-youtube';

export class ReproductionBuilder {
  private trainingMode: boolean;
  private requiresCountingIn: boolean;
  private songDuration: number | null;
  private songTempo: number | null;
  private innerPlayer: InnerYouTubePlayer | string;

  constructor() {
    this.trainingMode = false;
    this.requiresCountingIn = false;
    this.songDuration = null;
    this.songTempo = null;
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

  withInnerPlayer(innerPlayer: InnerYouTubePlayer | string) {
    this.innerPlayer = innerPlayer;
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
      player = new YouTubePlayer(this.innerPlayer);
    } else {
      if (this.songDuration === null) {
        throw new Error('The song duration is mandatory');
      }
      player = new PlayAlongPlayer(this.songDuration, this.innerPlayer);
    }
    return new Reproduction(
      player,
      this.requiresCountingIn,
      this.songTempo || 0
    );
  }
}
