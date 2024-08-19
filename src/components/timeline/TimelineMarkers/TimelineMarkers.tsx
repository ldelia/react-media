import React, { useContext } from 'react';
import styled from 'styled-components';
import { ZoomContext, ZoomContextType } from '../ZoomContext/ZoomContext';
import { secondsToPixel } from '../utils/utils';

const MarkerContainer = styled.div`
    position: relative;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
`;
const MarkerInner = styled.div`
    & {
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 20px solid #4CAF50; /* Green color */
        position: absolute;
    }
`;

interface Props {
  markers: number[];
}
export const TimelineMarkers = ({ markers }: Props) => {
  const zoomContextValue: ZoomContextType = useContext(ZoomContext);
  return (
    <>
      {
        markers.map((marker, index) => (
          <MarkerContainer key={index} style={{ left: secondsToPixel(zoomContextValue, marker) }} className={'media-timeline-marker'}>
            <MarkerInner />
          </MarkerContainer>
        ))
      }
    </>
  )
}