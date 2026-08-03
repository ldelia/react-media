import {
  extractYouTubeErrorCode,
  isYouTubeUnavailableError,
  YOUTUBE_UNAVAILABLE_ERROR_CODES,
} from '../../reproduction-widget/inner-players/youtubeUnavailableErrors';

describe('youtubeUnavailableErrors', () => {
  it('recognizes known unavailable error codes', () => {
    for (const code of YOUTUBE_UNAVAILABLE_ERROR_CODES) {
      expect(isYouTubeUnavailableError(code)).toBe(true);
    }
  });

  it('rejects unknown values', () => {
    expect(isYouTubeUnavailableError(999)).toBe(false);
    expect(isYouTubeUnavailableError('100')).toBe(false);
    expect(isYouTubeUnavailableError(undefined)).toBe(false);
  });

  it('extracts numeric codes from react-player / IFrame shapes', () => {
    expect(extractYouTubeErrorCode(150)).toBe(150);
    expect(extractYouTubeErrorCode(undefined, 100)).toBe(100);
    expect(extractYouTubeErrorCode(undefined, { data: 101 })).toBe(101);
    expect(extractYouTubeErrorCode('x', { data: 'nope' })).toBeUndefined();
  });
});
