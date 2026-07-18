import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import RangeSelectorCanvas from '../../timeline/RangeSelectorCanvas/RangeSelectorCanvas';
import { ZoomContext, ZoomContextType } from '../../timeline/ZoomContext/ZoomContext';

const zoomContextValue: ZoomContextType = {
  blockOffset: 10,
  pixelsInSecond: 10, // 1 second = 10px → easy math in tests
  timelineWrapperWidth: 3000,
};

const renderRangeSelector = (
  props: Partial<React.ComponentProps<typeof RangeSelectorCanvas>> = {},
) => {
  const onChange = vitest.fn();
  const onRangeChange = vitest.fn();

  const result = render(
    <ZoomContext.Provider value={zoomContextValue}>
      <RangeSelectorCanvas
        selectedRange={[]}
        onChange={onChange}
        onRangeChange={onRangeChange}
        {...props}
      />
    </ZoomContext.Provider>,
  );

  const canvas = result.container.querySelector(
    '.media-timeline-range-selector-canvas',
  ) as HTMLCanvasElement;

  // Deterministic geometry for clientX → pixel conversion
  vitest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: 3000,
    bottom: 80,
    width: 3000,
    height: 80,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  canvas.setPointerCapture = vitest.fn();
  canvas.releasePointerCapture = vitest.fn();
  canvas.hasPointerCapture = vitest.fn().mockReturnValue(true);

  return { ...result, canvas, onChange, onRangeChange };
};

const pointerEventInit = (
  clientX: number,
  pointerType: 'mouse' | 'touch' | 'pen' = 'touch',
): Partial<PointerEvent> => ({
  clientX,
  clientY: 40,
  pointerId: 1,
  pointerType,
  isPrimary: true,
  button: 0,
  buttons: 1,
});

describe('RangeSelectorCanvas', () => {
  describe('pointer events (touch regression)', () => {
    it('creates a range via touch pointer drag and calls onRangeChange', () => {
      const { canvas, onRangeChange, onChange } = renderRangeSelector();

      // Drag from 10s (100px) to 30s (300px)
      fireEvent.pointerDown(canvas, pointerEventInit(100, 'touch'));
      fireEvent.pointerMove(canvas, pointerEventInit(300, 'touch'));
      fireEvent.pointerUp(canvas, pointerEventInit(300, 'touch'));

      expect(onRangeChange).toHaveBeenCalledTimes(1);
      expect(onRangeChange).toHaveBeenCalledWith([10, 30]);
      expect(onChange).not.toHaveBeenCalled();
      expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
    });

    it('treats a touch tap (no drag) as a seek via onChange', () => {
      const { canvas, onChange, onRangeChange } = renderRangeSelector();

      fireEvent.pointerDown(canvas, pointerEventInit(150, 'touch'));
      fireEvent.pointerUp(canvas, pointerEventInit(150, 'touch'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(15);
      expect(onRangeChange).not.toHaveBeenCalled();
    });

    it('resizes the selected range start edge via touch pointer drag', () => {
      const { canvas, onRangeChange } = renderRangeSelector({
        selectedRange: [10, 40],
      });

      // Start handle is at 100px; drag it left to 50px (5s)
      fireEvent.pointerDown(canvas, pointerEventInit(100, 'touch'));
      fireEvent.pointerMove(canvas, pointerEventInit(50, 'touch'));
      fireEvent.pointerUp(canvas, pointerEventInit(50, 'touch'));

      expect(onRangeChange).toHaveBeenCalledTimes(1);
      expect(onRangeChange).toHaveBeenCalledWith([5, 40]);
    });

    it('resizes the selected range end edge via touch pointer drag', () => {
      const { canvas, onRangeChange } = renderRangeSelector({
        selectedRange: [10, 40],
      });

      // End handle is at 400px; drag it right to 500px (50s)
      fireEvent.pointerDown(canvas, pointerEventInit(400, 'touch'));
      fireEvent.pointerMove(canvas, pointerEventInit(500, 'touch'));
      fireEvent.pointerUp(canvas, pointerEventInit(500, 'touch'));

      expect(onRangeChange).toHaveBeenCalledTimes(1);
      expect(onRangeChange).toHaveBeenCalledWith([10, 50]);
    });

    it('completes an in-progress touch selection on pointercancel', () => {
      const { canvas, onRangeChange } = renderRangeSelector();

      fireEvent.pointerDown(canvas, pointerEventInit(100, 'touch'));
      fireEvent.pointerMove(canvas, pointerEventInit(250, 'touch'));
      fireEvent.pointerCancel(canvas, pointerEventInit(250, 'touch'));

      expect(onRangeChange).toHaveBeenCalledTimes(1);
      expect(onRangeChange).toHaveBeenCalledWith([10, 25]);
    });
  });

  describe('pointer events (mouse regression)', () => {
    it('still creates a range via mouse pointer drag', () => {
      const { canvas, onRangeChange } = renderRangeSelector();

      fireEvent.pointerDown(canvas, pointerEventInit(200, 'mouse'));
      fireEvent.pointerMove(canvas, pointerEventInit(400, 'mouse'));
      fireEvent.pointerUp(canvas, pointerEventInit(400, 'mouse'));

      expect(onRangeChange).toHaveBeenCalledWith([20, 40]);
    });
  });

  describe('touch-action', () => {
    it('disables native touch gestures on the overlay canvas', () => {
      const { canvas } = renderRangeSelector();

      expect(canvas.style.touchAction).toBe('none');
    });
  });
});
