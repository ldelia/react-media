import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ZoomContext, ZoomContextType } from '../ZoomContext/ZoomContext';
import { pixelToSeconds, secondsToPixel } from '../utils/utils';

const OverlayCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: cadetblue;
  cursor: pointer;
`;

interface Selection {
  start: number | null;
  end: number | null;
}

export interface RangeSelectorCanvasProps {
  selectedRange: number[];
  onChange: (value: number) => void;
  onRangeChange: (value: number[]) => void;
}

const RangeSelectorCanvas: React.FC<RangeSelectorCanvasProps> = ({
  selectedRange,
  onChange,
  onRangeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomContextValue: ZoomContextType = useContext(ZoomContext);

  const [selection, setSelection] = useState<Selection>({ start: null, end: null });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  let selectedRangeInPixels: number[] = useMemo(() => [], []);
  if (selectedRange.length === 2) {
    selectedRangeInPixels = [
      secondsToPixel(zoomContextValue, selectedRange[0]),
      secondsToPixel(zoomContextValue, selectedRange[1]),
    ];
  }

  const getMousePointerPixelPosition = (e: { clientX: number }) => {
    const canvas: HTMLCanvasElement = canvasRef.current!;
    let rect = canvas.getBoundingClientRect();
    return e.clientX - rect.left;
  };

  const drawRect = (pixelX0: number, pixelX1: number) => {
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

    context.globalAlpha = 0.3;
    context.fillStyle = window
      .getComputedStyle(canvas)
      .getPropertyValue('color');
    context.fillRect(pixelX0, 0, pixelX1 - pixelX0, context.canvas.height);
    context.globalAlpha = 1.0;
  };

  // Handle mouse down (start of selection)
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixel = getMousePointerPixelPosition(event);
    const second = pixelToSeconds(zoomContextValue, pixel);

    setSelection({ start: second, end: null });
    setIsDragging(true);
  };

  // Handle mouse up (end of selection or single click)
  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixel = getMousePointerPixelPosition(event);
    const second = pixelToSeconds(zoomContextValue, pixel);

    if (isDragging) {
      setSelection(prevSelection => {
        if (prevSelection.start === second) {
          onChange(second);
        } else {
          onRangeChange([prevSelection.start!, second]);
        }

        return {
          start: prevSelection.start,
          end: second,
        }
      });
    }
    setIsDragging(false);
  };

  // Handle mouse move (for dragging)
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixel = getMousePointerPixelPosition(event);
    const second = pixelToSeconds(zoomContextValue, pixel);

    setSelection(prevSelection => ({
      start: prevSelection.start,
      end: second,
    }));
  };

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!;

    // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (selectedRangeInPixels.length === 0) return;
    drawRect(selectedRangeInPixels[0], selectedRangeInPixels[1]);
  }, [selectedRangeInPixels]);

  return (
    <OverlayCanvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={'media-timeline-range-selector-canvas'}
    />
  );
};
export default React.memo(RangeSelectorCanvas);
