import React, { useCallback, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  getComputedElementWidth,
  numberToPxString,
  secondsToPixel,
} from '../utils/utils';
import { ZoomContext, ZoomContextType } from '../ZoomContext/ZoomContext';

const PreValueLine = styled.span`
  position: absolute;
  left: 0;
  height: 100%;
`;

const ValueLine = styled.span`
  position: absolute;
  width: 1px;
  height: 100%;
  background-color: #575757;
`;

const PostValueLine = styled.span`
  position: absolute;
  height: 100%;
`;

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  value: number;
}

export const TimelineValue: React.FC<Props> = ({ canvasRef, value }) => {
  const preValueLineRef = useRef(null);
  const valueLineRef = useRef(null);
  const postValueLineRef = useRef(null);

  const zoomContextValue: ZoomContextType = useContext(ZoomContext);

  const showValueLine = useCallback(() => {
    const canvas: HTMLCanvasElement = canvasRef.current!;

    const preValueLineElement: HTMLElement = preValueLineRef.current!;
    const valueLineElement: HTMLElement = valueLineRef.current!;
    const postValueLineElement: HTMLElement = postValueLineRef.current!;

    const valueLineWidth: number = getComputedElementWidth(valueLineElement);
    const linePosition: number = secondsToPixel(zoomContextValue, value);
    const valueLinePositionBeginningConsideringWidth: number =
      linePosition - valueLineWidth / 2;

    // configure preValueLineElement
    preValueLineElement.style.width = numberToPxString(
      valueLinePositionBeginningConsideringWidth,
    );

    // configure valueLineElement
    valueLineElement.style.left = numberToPxString(
      valueLinePositionBeginningConsideringWidth,
    );

    // configure postValueLineElement
    const postValueLinePosition =
      valueLinePositionBeginningConsideringWidth + valueLineWidth;
    const postValueLineWidth = canvas.width - postValueLinePosition;
    postValueLineElement.style.left = numberToPxString(postValueLinePosition);
    postValueLineElement.style.width = numberToPxString(postValueLineWidth);
  }, [canvasRef, value, zoomContextValue]);

  useEffect(() => {
    showValueLine();
  }, [showValueLine]);

  return (
    <>
      <PreValueLine
        ref={preValueLineRef}
        className={'media-timeline-pre-value-line'}
      />
      <ValueLine ref={valueLineRef} className={'media-timeline-value-line'} />
      <PostValueLine
        ref={postValueLineRef}
        className={'media-timeline-post-value-line'}
      />
    </>
  );
};
