import React from 'react';
import { render } from '@testing-library/react';
import { Timeline, TimelineProps } from '../../timeline';
import { getComputedElementWidth } from '../../timeline/utils/utils';

describe('Timeline', () => {
  let props: TimelineProps;
  let offsetWidthSpy: ReturnType<typeof vitest.spyOn> | undefined;

  beforeEach(() => {
    props = {
      duration: 300,
      value: 15,
      onChange: vitest.fn(),
      onRangeChange: vitest.fn(),
      zoomLevel: 0,
    };
  });

  afterEach(() => {
    offsetWidthSpy?.mockRestore();
    offsetWidthSpy = undefined;
  });

  const mockContainerWidth = (width: number) => {
    offsetWidthSpy = vitest
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockImplementation(function (this: HTMLElement) {
        // Keep the 1px playhead width realistic; only the timeline container needs layout width.
        if (this.classList.contains('media-timeline-value-line')) {
          return 1;
        }
        if (
          this.classList.contains('media-timeline-pre-value-line') ||
          this.classList.contains('media-timeline-post-value-line')
        ) {
          return 0;
        }
        return width;
      });
  };

  describe('render()', () => {
    it('renders a timeline', () => {
      mockContainerWidth(800);

      const { container, unmount } = render(<Timeline {...props} />);

      expect(
        container.querySelector('.media-timeline-value-line'),
      ).toBeTruthy();
      unmount();
    });
  });

  describe('playhead position', () => {
    it('advances the playhead left as value increases when duration and container width are valid', () => {
      mockContainerWidth(800);

      const { container, rerender } = render(
        <Timeline duration={100} value={0} zoomLevel={0} />,
      );

      const valueLine = container.querySelector(
        '.media-timeline-value-line',
      ) as HTMLElement;

      expect(parseFloat(valueLine.style.left)).toBe(0);

      rerender(<Timeline duration={100} value={25} zoomLevel={0} />);
      const leftAt25 = parseFloat(valueLine.style.left);
      expect(leftAt25).toBeGreaterThan(0);

      rerender(<Timeline duration={100} value={50} zoomLevel={0} />);
      const leftAt50 = parseFloat(valueLine.style.left);
      expect(leftAt50).toBeGreaterThan(leftAt25);
      expect(Number.isFinite(leftAt50)).toBe(true);
    });

    it('keeps playhead at 0 when container width is not yet measurable', () => {
      mockContainerWidth(0);

      const { container } = render(
        <Timeline duration={100} value={40} zoomLevel={0} />,
      );

      const valueLine = container.querySelector(
        '.media-timeline-value-line',
      ) as HTMLElement;

      expect(valueLine.style.left).toBe('0px');
    });

    it('keeps playhead at 0 when duration is 0', () => {
      mockContainerWidth(800);

      const { container } = render(
        <Timeline duration={0} value={0} zoomLevel={0} />,
      );

      const valueLine = container.querySelector(
        '.media-timeline-value-line',
      ) as HTMLElement;

      expect(valueLine.style.left).toBe('0px');
      expect(valueLine.style.left).not.toBe('Infinitypx');
      expect(valueLine.style.left).not.toBe('NaNpx');
    });
  });
});

describe('getComputedElementWidth', () => {
  it('prefers offsetWidth when available', () => {
    const element = document.createElement('div');
    vitest.spyOn(element, 'offsetWidth', 'get').mockReturnValue(12);

    expect(getComputedElementWidth(element)).toBe(12);
  });

  it('falls back to parseFloat of computed style and treats non-numeric widths as 0', () => {
    const element = document.createElement('div');
    vitest.spyOn(element, 'offsetWidth', 'get').mockReturnValue(0);
    vitest.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => 'auto',
    } as CSSStyleDeclaration);

    expect(getComputedElementWidth(element)).toBe(0);
  });
});
