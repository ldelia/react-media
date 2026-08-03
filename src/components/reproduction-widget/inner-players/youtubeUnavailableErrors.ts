/**
 * YouTube IFrame Player API error codes that mean the video cannot be played.
 * @see https://developers.google.com/youtube/iframe_api_reference#onError
 */
export const YOUTUBE_UNAVAILABLE_ERROR_CODES = [2, 5, 100, 101, 150] as const;

export type YouTubeUnavailableErrorCode = (typeof YOUTUBE_UNAVAILABLE_ERROR_CODES)[number];

export function isYouTubeUnavailableError(error: unknown): error is YouTubeUnavailableErrorCode {
  return (
    typeof error === 'number' &&
    (YOUTUBE_UNAVAILABLE_ERROR_CODES as readonly number[]).includes(error)
  );
}

/**
 * Normalize the value passed by react-player / the YouTube IFrame API into a numeric code.
 */
export function extractYouTubeErrorCode(error: unknown, data?: unknown): number | undefined {
  if (typeof error === 'number') {
    return error;
  }
  if (typeof data === 'number') {
    return data;
  }
  if (data && typeof data === 'object' && 'data' in data && typeof (data as { data: unknown }).data === 'number') {
    return (data as { data: number }).data;
  }
  return undefined;
}
