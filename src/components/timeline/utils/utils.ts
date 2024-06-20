import { ZoomContextType } from '../index';

export const secondsToPixel = (
  zoomContextValue: ZoomContextType,
  seconds: number,
) => {
  return zoomContextValue.pixelsInSecond * seconds;
};

export const pixelToSeconds = (
  zoomContextValue: ZoomContextType,
  pixel: number,
) => {
  const seconds = pixel / zoomContextValue.pixelsInSecond;
  return Math.round((seconds + Number.EPSILON) * 100) / 100;
};
