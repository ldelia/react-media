import React from 'react';
import styled from 'styled-components';

import { ZoomContext, ZoomContextType } from './index';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { secondsToPixel } from './utils/utils';

export interface VaLueLineCanvasProps {
  blockStartingTimes: number[];
  value: number;
}

const OverlayCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #c9c9c9;
`;
const ValueLine = styled.span`
  position: absolute;
  width: 1px;
  height: 100%;
  background-color: #575757;
`;

const VaLueLineCanvas: React.FC<VaLueLineCanvasProps> = ({
  blockStartingTimes = [],
  value,
}) => {
  const canvasRef = useRef(null);
  const valueLineRef = useRef(null);
  const zoomContextValue: ZoomContextType = useContext(ZoomContext);

  const showBlocks = useCallback(
    (canvas: HTMLCanvasElement) => {
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
    },
    [blockStartingTimes, zoomContextValue],
  );

  const showValueLine = useCallback(() => {
    const linePosition: number = secondsToPixel(zoomContextValue, value);

    const valueLineElement: HTMLElement = valueLineRef.current!;
    const elementWidthCSSProperty: string = window
      .getComputedStyle(valueLineElement)
      .getPropertyValue('width')
      .replace(/[^-\d]/g, '');
    const elementWidth: number = parseInt(elementWidthCSSProperty);
    const linePositionAtValueLineMiddle: number =
      linePosition - elementWidth / 2;
    valueLineElement.style.left = linePositionAtValueLineMiddle + 'px';
  }, [value, zoomContextValue]);

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!;

    // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    showBlocks(canvas);
    showValueLine();
  }, [showBlocks, showValueLine]);

  return (
    <>
      <OverlayCanvas
        ref={canvasRef}
        className={'media-timeline-value-line-canvas'}
      />
      <ValueLine
        ref={valueLineRef}
        className={'media-timeline-value-line'}
      ></ValueLine>
    </>
  );
};
export default VaLueLineCanvas;
