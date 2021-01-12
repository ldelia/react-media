import React from 'react';

import TimeLine, {TimeLineProps} from '.';
import {Meta, Story} from "@storybook/react/types-6-0";

export default {
    title: 'TimeLine',
    component: TimeLine,
    argTypes: {
        onChange: { action: 'changed' },
        onRangeChange: { action: 'range changed' },
    }
} as Meta;

const Template: Story<TimeLineProps> = (args) => <TimeLine {...args} />;
export const Default = Template.bind({});
Default.args = {
    duration: 305,
    value: 301,
    zoomLevel: 0,
};
export const WithSelectedRange = Template.bind({});
WithSelectedRange.args = {
    duration: 305,
    value: 31,
    zoomLevel: 0,
    selectedRange: [20, 30]
};
