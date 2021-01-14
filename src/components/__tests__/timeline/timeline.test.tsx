import React from 'react';
import ReactDOM from 'react-dom';
import Timeline, {TimelineProps} from "../../timeline";


describe('Timeline', () => {
    let props: TimelineProps;

    beforeEach(() => {
        props = {
            duration: 300,
            value: 15,
            onChange: jest.fn(),
            onRangeChange: jest.fn(),
            zoomLevel: 0
        };
    });

    describe('render()', () => {
        it('renders a timeline', () => {
            const div = document.createElement('div');
            ReactDOM.render(<Timeline {...props}/>, div);
        });
    });
});
