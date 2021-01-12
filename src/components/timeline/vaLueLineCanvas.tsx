import * as React from 'react';
import styled from "styled-components";

import {ZoomContext, ZoomContextType} from "./index";
import {useCallback, useContext, useEffect, useRef} from "react";
import {secondsToPixel} from "./utils/utils";

export interface VaLueLineCanvasProps {
    blockStartingTimes: number[],
    value: number
}

const OverlayCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #c9c9c9;
`;
const FakeValueLine = styled.span`
  display: none;
  color: #575757;
`;

const VaLueLineCanvas: React.FC<VaLueLineCanvasProps> = ({ blockStartingTimes = [], value}) => {

    const canvasRef = useRef(null);
    const valueLineRef = useRef(null);
    const zoomContextValue: ZoomContextType = useContext(ZoomContext);

    const showBlocks = useCallback((canvas: HTMLCanvasElement) => {
        const blockHeight = 20;
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

        for (const blockStartingTime of blockStartingTimes) {
            const x0Pixel = secondsToPixel(zoomContextValue, blockStartingTime);
            const x1Pixel = secondsToPixel(zoomContextValue, blockStartingTime + zoomContextValue.blockOffset);

            context.beginPath();
            context.moveTo(x0Pixel, canvas.height);
            context.lineTo(x0Pixel,canvas.height - blockHeight);
            context.lineTo(x1Pixel,canvas.height - blockHeight);
            context.lineTo(x1Pixel, canvas.height);

            context.strokeStyle = window.getComputedStyle(canvas).getPropertyValue('color');
            context.stroke();
        }
    },[blockStartingTimes, zoomContextValue]);

    const showValueLine = useCallback((canvas: HTMLCanvasElement) => {
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        const linePosition: number = secondsToPixel(zoomContextValue, value);

        const valueLineFakeElement: HTMLElement = valueLineRef.current!;

        context.beginPath();
        context.moveTo(linePosition,0);
        context.lineTo(linePosition, context.canvas.height);
        context.strokeStyle = window.getComputedStyle(valueLineFakeElement).getPropertyValue('color');
        context.stroke();

    },[value, zoomContextValue]);

    useEffect(() => {
        const canvas: HTMLCanvasElement = canvasRef.current!;

        // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        showBlocks(canvas);
        showValueLine(canvas);

    }, [showBlocks, showValueLine]);

    return (
        <>
            <OverlayCanvas
                ref={canvasRef}
                className={'media-timeline-value-line-canvas'}
            />
            <FakeValueLine
                ref={valueLineRef}
                className={'media-timeline-value-line'}>
            </FakeValueLine>
        </>
    );
};
export default VaLueLineCanvas;
