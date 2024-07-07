import React from 'react';
import styled from 'styled-components';
import TickTime from './TickTime';
import { ZoomContext } from '../ZoomContext/ZoomContext';

export interface TickTimeCollectionDisplayProps {
  tickTimes: number[];
}

const TickTimeCollectionDisplayContainer = styled.div`
  position: absolute;
  display: flex;
  align-self: flex-end;
  height: 100%;
`;

const TickTimeCollectionDisplay: React.FC<TickTimeCollectionDisplayProps> = ({
  tickTimes = [],
}) => {
  return (
    <ZoomContext.Consumer>
      {(value) => {
        return (
          <TickTimeCollectionDisplayContainer>
            {tickTimes.map((tickTimeValue, index) => {
              const leftPosition: string =
                tickTimeValue * value.pixelsInSecond + 'px';
              return (
                <TickTime
                  key={index}
                  start={tickTimeValue}
                  leftPosition={leftPosition}
                />
              );
            })}
          </TickTimeCollectionDisplayContainer>
        );
      }}
    </ZoomContext.Consumer>
  );
};
export default TickTimeCollectionDisplay;
