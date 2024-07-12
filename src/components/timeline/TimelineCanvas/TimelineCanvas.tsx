import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import styled from 'styled-components';
import { ZoomContext, ZoomContextType } from '../ZoomContext/ZoomContext';
import TickTimeCollectionDisplay from './TickTimeCollectionDisplay';
import { drawTimeBlocksOnCanvas } from './drawTimeBlocksOnCanvas';

const OverlayCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #c9c9c9;
`;

export interface VaLueLineCanvasProps {
  duration: number;
  withTimeBlocks: boolean;
}

const TimelineCanvas = forwardRef<HTMLCanvasElement, VaLueLineCanvasProps>(
  ({ duration, withTimeBlocks }, ref) => {
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);

    const zoomContextValue: ZoomContextType = useContext(ZoomContext);

    const blockStartingTimes = (() => {
      if (!withTimeBlocks || !zoomContextValue.blockOffset) return [];

      let blockStartingTimes = [0];
      let secondsToCover = duration;
      while (secondsToCover > 0) {
        blockStartingTimes.push(
          blockStartingTimes[blockStartingTimes.length - 1] +
            zoomContextValue.blockOffset,
        );
        secondsToCover = secondsToCover - zoomContextValue.blockOffset;
      }
      blockStartingTimes.splice(-1);
      return blockStartingTimes;
    })();

    // Pass the internal ref's current value directly to the forwarded ref
    useImperativeHandle(
      ref,
      () => internalCanvasRef.current as HTMLCanvasElement,
    );

    useEffect(() => {
      const canvas: HTMLCanvasElement = internalCanvasRef.current!;

      // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      if (withTimeBlocks)
        drawTimeBlocksOnCanvas(canvas, blockStartingTimes, zoomContextValue);
    }, [blockStartingTimes, withTimeBlocks, zoomContextValue]);

    return (
      <>
        <OverlayCanvas
          ref={internalCanvasRef}
          className={'media-timeline-value-line-canvas'}
        />
        {withTimeBlocks && (
          <TickTimeCollectionDisplay tickTimes={blockStartingTimes} />
        )}
      </>
    );
  },
);
export default TimelineCanvas;
