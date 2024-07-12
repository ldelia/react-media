import React from 'react';

export type ZoomContextType = {
  blockOffset: number;
  pixelsInSecond: number;
  timelineWrapperWidth: number;
};
export const ZoomContext = React.createContext<ZoomContextType>(
  null as unknown as ZoomContextType,
);
