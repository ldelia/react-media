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
