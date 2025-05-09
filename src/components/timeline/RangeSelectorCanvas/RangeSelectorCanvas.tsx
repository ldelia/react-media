import React, { useContext, useEffect, useRef, useState } from 'react';
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
  z-index: 2; // Ensure this canvas is on top of the TimeLineValue, otherwise, we won't be able to change the range until the current TimelineValue position
`;

interface Selection {
  start: number | null;
  end: number | null;
}

enum DragMode {
  NONE,
  CREATE,
  RESIZE_START,
  RESIZE_END,
}

export interface RangeSelectorCanvasProps {
  selectedRange: number[];
  onChange: (value: number) => void;
  onRangeChange: (value: number[]) => void;
}

const RESIZE_HANDLE_WIDTH = 10; // Width in pixels for the resize handle detection zone

const RangeSelectorCanvas: React.FC<RangeSelectorCanvasProps> = ({
  selectedRange,
  onChange,
  onRangeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomContextValue: ZoomContextType = useContext(ZoomContext);

  const [selection, setSelection] = useState<Selection>({
    start: null,
    end: null,
  });
  const [dragMode, setDragMode] = useState<DragMode>(DragMode.NONE);
  const [cursorStyle, setCursorStyle] = useState<string>('pointer');

  const getMousePointerPixelPosition = (e: { clientX: number }) => {
    const canvas: HTMLCanvasElement = canvasRef.current!;
    let rect = canvas.getBoundingClientRect();
    return e.clientX - rect.left;
  };

  const drawRect = (pixelX0: number, pixelX1: number) => {
    const canvas: HTMLCanvasElement = canvasRef.current!;
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.globalAlpha = 0.3;
    context.fillStyle = window
      .getComputedStyle(canvas)
      .getPropertyValue('color');
    context.fillRect(pixelX0, 0, pixelX1 - pixelX0, context.canvas.height);
    context.globalAlpha = 1.0;
  };

  // Check if mouse is near the start or end edge of the selection
  const isNearSelectionEdge = (
    pixel: number,
  ): { isNear: boolean; edge: 'start' | 'end' | null } => {
    if (selectedRange.length !== 2) return { isNear: false, edge: null };

    const startPixel = secondsToPixel(zoomContextValue, selectedRange[0]);
    const endPixel = secondsToPixel(zoomContextValue, selectedRange[1]);

    if (Math.abs(pixel - startPixel) <= RESIZE_HANDLE_WIDTH) {
      return { isNear: true, edge: 'start' };
    } else if (Math.abs(pixel - endPixel) <= RESIZE_HANDLE_WIDTH) {
      return { isNear: true, edge: 'end' };
    }

    return { isNear: false, edge: null };
  };

  // Handle mouse move for cursor style when not dragging
  const handleMouseOver = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const pixel = getMousePointerPixelPosition(event);
    const { isNear } = isNearSelectionEdge(pixel);

    if (isNear) {
      setCursorStyle('col-resize');
    } else {
      setCursorStyle('pointer');
    }
  };

  // Handle mouse down (start of selection or resize)
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixel = getMousePointerPixelPosition(event);
    const second = pixelToSeconds(zoomContextValue, pixel);
    const { isNear, edge } = isNearSelectionEdge(pixel);

    if (isNear && edge === 'start') {
      setDragMode(DragMode.RESIZE_START);
      setSelection({ start: selectedRange[0], end: selectedRange[1] });
    } else if (isNear && edge === 'end') {
      setDragMode(DragMode.RESIZE_END);
      setSelection({ start: selectedRange[0], end: selectedRange[1] });
    } else {
      setDragMode(DragMode.CREATE);
      setSelection({ start: second, end: null });
    }
  };

  // Handle mouse up (end of selection/resize or single click)
  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixel = getMousePointerPixelPosition(event);
    const seconds = pixelToSeconds(zoomContextValue, pixel);

    if (dragMode === DragMode.CREATE) {
      if (selection.start === seconds) {
        // Single click
        onChange(seconds);
        setSelection({ start: null, end: null });
      } else {
        // Created a new selection
        const curatedSelection =
          seconds < selection.start!
            ? [seconds, selection.start!]
            : [selection.start!, seconds];

        onRangeChange(curatedSelection);
        setSelection({
          start: curatedSelection[0],
          end: curatedSelection[1],
        });
      }
    } else if (
      dragMode === DragMode.RESIZE_START ||
      dragMode === DragMode.RESIZE_END
    ) {
      // Resizing completed
      if (selection.start !== null && selection.end !== null) {
        const curatedSelection = [
          Math.min(selection.start, selection.end),
          Math.max(selection.start, selection.end),
        ];
        onRangeChange(curatedSelection);
      }
    }

    setDragMode(DragMode.NONE);
  };

  // Handle mouse move (for dragging)
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // Update cursor first (always check this regardless of drag state)
    handleMouseOver(event);

    if (dragMode === DragMode.NONE) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixel = getMousePointerPixelPosition(event);
    const seconds = pixelToSeconds(zoomContextValue, pixel);

    if (dragMode === DragMode.CREATE) {
      setSelection((prevSelection) => ({
        start: prevSelection.start,
        end: seconds,
      }));
    } else if (dragMode === DragMode.RESIZE_START) {
      setSelection((prevSelection) => ({
        start: seconds,
        end: prevSelection.end,
      }));
    } else if (dragMode === DragMode.RESIZE_END) {
      setSelection((prevSelection) => ({
        start: prevSelection.start,
        end: seconds,
      }));
    }
  };

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!;

    // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (
      selectedRange.length !== 2 ||
      zoomContextValue.timelineWrapperWidth === 0
    )
      return;
    drawRect(
      secondsToPixel(zoomContextValue, selectedRange[0]),
      secondsToPixel(zoomContextValue, selectedRange[1]),
    );
  }, [selectedRange, zoomContextValue]);

  useEffect(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!;

    // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    if (selection.start === null || selection.end === null) return;

    drawRect(
      secondsToPixel(zoomContextValue, selection.start),
      secondsToPixel(zoomContextValue, selection.end),
    );
  }, [selection, zoomContextValue]);

  return (
    <OverlayCanvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: cursorStyle }}
      className={'media-timeline-range-selector-canvas'}
    />
  );
};

export default React.memo(RangeSelectorCanvas);
