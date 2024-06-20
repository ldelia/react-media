import React from 'react';
import { createRoot } from 'react-dom/client';
import { Timeline, TimelineProps } from '../../timeline';

describe('Timeline', () => {
  let props: TimelineProps;

  beforeEach(() => {
    props = {
      duration: 300,
      value: 15,
      onChange: jest.fn(),
      onRangeChange: jest.fn(),
      zoomLevel: 0,
    };
  });

  describe('render()', () => {
    it('renders a timeline', () => {
      const rootElement = document.createElement('div');

      const root = createRoot(rootElement);
      root.render(<Timeline {...props} />);
    });
  });
});
