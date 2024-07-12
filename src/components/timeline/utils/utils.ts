import { ZoomContextType } from '../ZoomContext/ZoomContext';

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

export const getComputedElementWidth = (element: HTMLElement): number => {
  const elementWidthCSSProperty: string = window
    .getComputedStyle(element)
    .getPropertyValue('width')
    .replace(/[^-\d]/g, '');
  return parseInt(elementWidthCSSProperty);
};

export const numberToPxString = (number: number): string => {
  return `${number}px`;
};

export const getTimelineWrapperWidth = (
  timeLineContainerWidth: number,
  zoomLevel: number,
): number => {
  return timeLineContainerWidth * Math.pow(1.25, zoomLevel) - 2; //-2px to account for the border
};

export function getBlockOffsetForZoomLevel(
  zoomLevel: number,
  duration: number,
  timelineWrapperWidth: number,
): number {
  const offsets = [10, 5, 5, 5, 2, 2, 2, 2, 2, 1];

  let optimalOffset = offsets[zoomLevel];
  while ((duration / optimalOffset) * 40 > timelineWrapperWidth) {
    optimalOffset = optimalOffset * 1.25;
  }
  return Math.ceil(optimalOffset);
}
