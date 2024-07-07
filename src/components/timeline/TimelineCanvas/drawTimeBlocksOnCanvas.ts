import { secondsToPixel } from '../utils/utils';
import { ZoomContextType } from '../ZoomContext/ZoomContext';

export const drawTimeBlocksOnCanvas = (
  canvas: HTMLCanvasElement,
  blockStartingTimes: number[],
  zoomContextValue: ZoomContextType,
): void => {
  const blockHeight = 20;
  const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

  for (const blockStartingTime of blockStartingTimes) {
    const x0Pixel = secondsToPixel(zoomContextValue, blockStartingTime);
    const x1Pixel = secondsToPixel(
      zoomContextValue,
      blockStartingTime + zoomContextValue.blockOffset,
    );

    context.beginPath();
    context.moveTo(x0Pixel, canvas.height);
    context.lineTo(x0Pixel, canvas.height - blockHeight);
    context.lineTo(x1Pixel, canvas.height - blockHeight);
    context.lineTo(x1Pixel, canvas.height);

    context.strokeStyle = window
      .getComputedStyle(canvas)
      .getPropertyValue('color');
    context.stroke();
  }
};
