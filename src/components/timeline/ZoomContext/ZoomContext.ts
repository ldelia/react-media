import React from 'react';

export type ZoomContextType = {
  blockOffset: number;
  pixelsInSecond: number;
  //secondsPerPixel: number;
};
export const ZoomContext = React.createContext<ZoomContextType>({
  blockOffset: 0,
  pixelsInSecond: 0,
  //secondsPerPixel: 0,
});
