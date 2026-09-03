import { HtmlAudioPlayer } from '../../reproduction-widget/models/Player/HtmlAudioPlayer';
import { Reproduction } from '../../reproduction-widget/models/Reproduction';

function createFakeAudioElement(): HTMLAudioElement {
  return {
    currentTime: 0,
    duration: 120,
    volume: 0.5,
    playbackRate: 1,
    play: vitest.fn().mockResolvedValue(undefined),
    pause: vitest.fn(),
    addEventListener: vitest.fn(),
    removeEventListener: vitest.fn(),
  } as unknown as HTMLAudioElement;
}

describe('ReproductionBuilder', () => {
  it('creates an HtmlAudioPlayer for the audio media type', () => {
    const audio = createFakeAudioElement();

    const reproduction = Reproduction.newBuilder()
      .withMediaType('audio')
      .withInnerPlayer(audio)
      .createReproduction();

    expect(reproduction.getPlayer()).toBeInstanceOf(HtmlAudioPlayer);
  });
});
