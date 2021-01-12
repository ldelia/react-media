import * as React from 'react';
import styled from 'styled-components';
import {useEffect, useMemo, useRef} from "react";
import TickTimeCollectionDisplay from "./tickTimeCollectionDisplay";
import VaLueLineCanvas from "./vaLueLineCanvas";
import RangeSelectorCanvas from "./rangeSelectorCanvas";

const zoomLevelConfigurations =  [
    //[blockOffset, pixelsInSecond] when zoomLevel === 0, each block has an offset of 15 seconds, and each second has a width of 7px.
    [20, 7],
    [10, 10],
    [10, 15],
    [5, 20],
    [5, 25],
    [2, 35],
    [2, 50],
    [1, 60],
    [1, 75],
    [1, 90],
];

const TimeLineContainer = styled.div`
  background-color: #f0f0f0;
  border: 1px solid #c9c9c9;
  height: 80px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  position: relative;
  display: flex;
`;
const TimeLineWrapper = styled.div`
  position: absolute;
  height: 100%;
`;

export interface TimeLineProps {
    duration: number;
    value: number;
    zoomLevel?: number;//0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    className?: string;
    selectedRange?: number[];
    onChange?: (value: number) => void;
    onRangeChange?: (value: number[]) => void;
}

export type ZoomContextType = {
    blockOffset: number;
    pixelsInSecond: number;
};
export const ZoomContext = React.createContext<ZoomContextType>({
    blockOffset: 0,
    pixelsInSecond: 0
});

const TimeLine: React.FC<TimeLineProps> = ({
                                                duration,
                                                value,
                                                zoomLevel= 0,
                                                selectedRange = [],
                                                onChange = () => {},
                                                onRangeChange = () => {},
                                                className= ''
                                        }) => {

    const timeLineContainerRef = useRef(null);

    let zoomLevelValue = zoomLevel ? zoomLevel : 0;
    if (zoomLevelValue < 0 || zoomLevelValue >= zoomLevelConfigurations.length ) {
        console.warn("Invalid value for property zoomLevel.");
        zoomLevelValue = 0;
    }

    if (value < 0 || value > duration) {
        console.warn("Invalid value.");
    }

    if (! (selectedRange.length === 0 || selectedRange.length === 2)) {
        selectedRange = [];
        console.warn('The selected range must contain only two values.');
    }

    if ((selectedRange.length === 2) && (! ( 0 <= selectedRange[0] && selectedRange[0] < selectedRange[1] && selectedRange[1] <= duration ))) {
        selectedRange = [];
        console.warn('The selected range is inconsistent.');
    }

    const zoomParams = useMemo( () => {
        return {
            blockOffset: zoomLevelConfigurations[zoomLevelValue][0],
            pixelsInSecond: zoomLevelConfigurations[zoomLevelValue][1]
        }
    }, [zoomLevelValue] );

    let blockStartingTimes = [0];
    const blockCounts: number = Math.ceil(duration / zoomParams.blockOffset);
    for (let i:number = 1; i < blockCounts; i++) {
        blockStartingTimes.push(blockStartingTimes[blockStartingTimes.length-1] + zoomParams.blockOffset);
    }

    useEffect(() => {
        const timeLineWrapper: HTMLElement = timeLineContainerRef.current!;
        const scrollPosition: number = value * zoomParams.pixelsInSecond - 300;
        timeLineWrapper.scrollLeft = Math.max(0, scrollPosition);
    }, [value, zoomParams]);

    return (
        <TimeLineContainer ref={timeLineContainerRef} className={className}>
            <TimeLineWrapper style={{ width: (duration * zoomParams.pixelsInSecond) + 'px' }}>
                <ZoomContext.Provider value={zoomParams}>
                    <VaLueLineCanvas
                        blockStartingTimes={blockStartingTimes}
                        value={value}
                    />
                    <RangeSelectorCanvas
                        selectedRange={selectedRange}
                        onChange={onChange}
                        onRangeChange={onRangeChange}
                    />
                    <TickTimeCollectionDisplay
                        tickTimes={blockStartingTimes}
                    />
                </ZoomContext.Provider>
            </TimeLineWrapper>
        </TimeLineContainer>
    );
};

export default TimeLine;
