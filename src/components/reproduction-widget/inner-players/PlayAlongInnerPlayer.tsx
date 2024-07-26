import React, { useEffect } from 'react';

interface Props {
  onReady: (event: { target: string }) => void;
}
export const PlayAlongInnerPlayer = ({ onReady }: Props) => {
  useEffect(() => onReady({ target: 'mock' }), []);

  return <div></div>;
};
