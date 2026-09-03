import { getAudioMimeTypeFromUrl } from '../../reproduction-widget/inner-players/getAudioMimeType';

describe('getAudioMimeTypeFromUrl', () => {
  it('returns audio/mpeg for .mp3 URLs', () => {
    expect(getAudioMimeTypeFromUrl('https://example.com/song.mp3')).toBe(
      'audio/mpeg',
    );
    expect(
      getAudioMimeTypeFromUrl('https://example.com/song.MP3?token=abc'),
    ).toBe('audio/mpeg');
  });

  it('returns audio/mp4 for .m4a and .mp4 URLs', () => {
    expect(getAudioMimeTypeFromUrl('https://example.com/song.m4a')).toBe(
      'audio/mp4',
    );
    expect(getAudioMimeTypeFromUrl('https://example.com/song.M4A')).toBe(
      'audio/mp4',
    );
    expect(getAudioMimeTypeFromUrl('https://example.com/track.mp4')).toBe(
      'audio/mp4',
    );
  });

  it('returns undefined for unknown extensions', () => {
    expect(getAudioMimeTypeFromUrl('https://example.com/song.wav')).toBe(
      undefined,
    );
    expect(getAudioMimeTypeFromUrl('https://example.com/no-extension')).toBe(
      undefined,
    );
  });
});
