import React from 'react';
import styled from "styled-components";

import {ZoomContext, ZoomContextType} from "./index";
import {useCallback, useContext, useEffect, useMemo, useRef} from "react";
import {pixelToSeconds, secondsToPixel} from "./utils/utils";

export interface RangeSelectorCanvasProps {
    selectedRange: number[];
    onChange: (value: number) => void;
    onRangeChange: (value: number[]) => void;
}

const OverlayCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: cadetblue;
`;

const RangeSelectorCanvas: React.FC<RangeSelectorCanvasProps> = ({
                                                                 selectedRange,
                                                                 onChange,
                                                                 onRangeChange,
                                                            }) => {
    const canvasRef = useRef(null);
    const zoomContextValue: ZoomContextType = useContext(ZoomContext);

    let isSelectingRange: boolean = false;
    let selectedRangeInPixels: number[] = useMemo(() => [], []);
    if (selectedRange.length === 2) {
        selectedRangeInPixels = [secondsToPixel(zoomContextValue, selectedRange[0]), secondsToPixel(zoomContextValue, selectedRange[1])];
    }

    const getMousePointerPixelPosition = (e: { clientX: number; }) => {
        const canvas: HTMLCanvasElement = canvasRef.current!;
        let rect = canvas.getBoundingClientRect();
        return e.clientX - rect.left;
    }

    const showSelectedRange = useCallback(() => {
        if (selectedRangeInPixels.length === 0) return;
        drawRect(selectedRangeInPixels[0], selectedRangeInPixels[1]);
    },[selectedRangeInPixels]);

    const drawRect = (pixelX0 : number, pixelX1: number) => {
        const canvas: HTMLCanvasElement = canvasRef.current!;
        const context: CanvasRenderingContext2D = canvas.getContext('2d')!;

        context.globalAlpha = 0.3;
        context.fillStyle = window.getComputedStyle(canvas).getPropertyValue('color');
        context.fillRect(pixelX0, 0, pixelX1 - pixelX0, context.canvas.height);
        context.globalAlpha = 1.0;
    }

    const onCanvasDoubleClick = (e: { clientX: number; }) => {
        const x0 = getMousePointerPixelPosition(e);
        onChange(pixelToSeconds(zoomContextValue, x0));
        selectedRangeInPixels = [];
    }

    const isPixelNearSelectedRange = (x0: number) => {
        if (selectedRangeInPixels.length === 2) {
            const diff = Math.min(Math.abs(selectedRangeInPixels[0] - x0), Math.abs(selectedRangeInPixels[1] - x0));
            return diff <= zoomContextValue.pixelsInSecond / 2;
        }
        return false;
    }

    const onCanvasMouseDown = (e: { clientX: number; }) => {
        const canvas: HTMLCanvasElement = canvasRef.current!;
        const mouseCurrentPosition = getMousePointerPixelPosition(e);

        if (! isPixelNearSelectedRange(mouseCurrentPosition)) {
            // Clean the canvas for removing the previously selected range.
            const context = canvas.getContext('2d')!
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Keep track of the first position of the new range.
            selectedRangeInPixels = [mouseCurrentPosition, mouseCurrentPosition]
        }
        isSelectingRange = true;
    }

    const onCanvasMouseMove = (e: { clientX: number; }) => {
        const canvas: HTMLCanvasElement = canvasRef.current!;
        const context = canvas.getContext('2d')!
        const mouseCurrentPosition = getMousePointerPixelPosition(e);

        if (selectedRangeInPixels.length === 2) {
            const diff = Math.min(Math.abs(selectedRangeInPixels[0] - mouseCurrentPosition), Math.abs(selectedRangeInPixels[1] - mouseCurrentPosition));
            // Change the mouse's cursor if it's near a selected range.
            canvas.style.cursor = (diff <= zoomContextValue.pixelsInSecond / 2) ? 'col-resize' : 'default';

            if (! isSelectingRange) return;

            if (mouseCurrentPosition < selectedRangeInPixels[0]) {
                // The left side must be enlarged.
                drawRect(mouseCurrentPosition, selectedRangeInPixels[0]);
                selectedRangeInPixels[0] = mouseCurrentPosition;
            } else if (mouseCurrentPosition > selectedRangeInPixels[1]) {
                // The right side must be enlarged.
                drawRect(selectedRangeInPixels[1], mouseCurrentPosition);
                selectedRangeInPixels[1] = mouseCurrentPosition;
            }  else {
                const diffX0 = mouseCurrentPosition - selectedRangeInPixels[0];
                const diffX1 = selectedRangeInPixels[1] - mouseCurrentPosition;
                if (diffX0 < diffX1) {
                    // The left side must be shrunk.
                    context.clearRect(selectedRangeInPixels[0], 0, diffX0, canvas.height);
                    selectedRangeInPixels[0] = mouseCurrentPosition;
                } else {
                    // The right side must be shrunk.
                    context.clearRect(selectedRangeInPixels[1] - diffX1, 0, diffX1, canvas.height);
                    selectedRangeInPixels[1] = mouseCurrentPosition;
                }
            }
        }
    }

    const onCanvasMouseUp = (e: { clientX: number; }) => {
        if (selectedRangeInPixels.length !== 2) return;

        const mouseCurrentPosition = getMousePointerPixelPosition(e);
        const pixelRange = [Math.min(selectedRangeInPixels[0], mouseCurrentPosition), Math.max(selectedRangeInPixels[1], mouseCurrentPosition)];

        onRangeChange([pixelToSeconds(zoomContextValue, pixelRange[0]), pixelToSeconds(zoomContextValue, pixelRange[1])]);
        isSelectingRange = false;
    }

    useEffect(() => {
        const canvas: HTMLCanvasElement = canvasRef.current!;

        // https://stackoverflow.com/questions/8696631/canvas-drawings-like-lines-are-blurry
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        showSelectedRange();
    }, [showSelectedRange]);

    return (
        <OverlayCanvas
            ref={canvasRef}
            onDoubleClick={onCanvasDoubleClick}
            onMouseDown={onCanvasMouseDown}
            onMouseMove={onCanvasMouseMove}
            onMouseUp={onCanvasMouseUp}
            className={'media-timeline-range-selector-canvas'}
        />
    );
};
export default RangeSelectorCanvas;
