import React from 'react';
import styled from 'styled-components';

export type Props = {
  start: number;
  leftPosition: string;
};

interface TickTimeContainerProps {
  left: string;
}

const TickTimeContainer = styled.span.attrs<TickTimeContainerProps>(
  (props) => ({
    style: {
      left: props.left,
    },
  }),
)<TickTimeContainerProps>`
  background: transparent;
  position: absolute;
  padding-left: 8px;
  color: #646464;
  user-select: none;
  min-width: 20px;
  max-width: 20px;
  align-self: flex-end;
`;

const TickTime: React.FC<Props> = ({ start, leftPosition }) => {
  const minutes = Math.floor(start / 60);
  let seconds = start - minutes * 60;
  let secondsFormatted: string =
    seconds < 10 ? '0' + seconds : seconds.toString();
  return (
    <TickTimeContainer
      left={leftPosition}
      className={'media-timeline-tick-time'}
    >
      {minutes}:{secondsFormatted}
    </TickTimeContainer>
  );
};

export default TickTime;
