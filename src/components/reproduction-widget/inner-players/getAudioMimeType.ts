/**
 * Derives an audio MIME type hint from a URL extension.
 * Returns undefined when the extension is unknown so the browser can sniff.
 */
export function getAudioMimeTypeFromUrl(url: string): string | undefined {
  const withoutQuery = url.split('?')[0].split('#')[0];
  const extension = withoutQuery.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'm4a':
    case 'mp4':
      return 'audio/mp4';
    case 'mp3':
      return 'audio/mpeg';
    default:
      return undefined;
  }
}
