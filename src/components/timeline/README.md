# Timeline

<!-- STORY -->

<hr>

A component for displaying the duration of a media file (mp3, mp4, etc.) and the current reproduction position. It also allows selecting a range for reproduction looping purposes.

## Installation

### NPM

```
npm i @bit/ldelia.react-media.timeline
```

### YARN

```
yarn add @bit/ldelia.react-media.timeline
```

### BIT

```
bit import ldelia.react-media/timeline
```

## Import

```js
import Timeline from '@bit/ldelia.react-media.timeline';
```

## Usage

```jsx
<Timeline
  duration={301}
  value={15}
  onChange={() => 'Do something'}
  onRangeChange={() => 'Do something'}
/>
```

##### Required props

| Name       | Type     | Description                       |
| ---------- | -------- | --------------------------------- |
| `duration` | `number` | The media file duration           |
| `value`    | `number` | The current reproduction position |

##### Optional props

| Name            | Type       | Default    | Description                                        |
| --------------- | ---------- | ---------- | -------------------------------------------------- |
| `onChange`      | `function` | `() => {}` | Fired when the user double-clicks on the timeline  |
| `onRangeChange` | `function` | `() => {}` | Fired when the user select a range in the timeline |
| `selectedRange` | `array`    | `[]`       | The current selected range                         |
| `zoomLevel`     | `number`   | `0`        | `The current timeline zoom level`                  |

## Customization

#### Timeline widget

```
const StyledTimeline = styled(Timeline)`
    background-color: green;
`;
```

#### Value bar

```
const StyledTimeline = styled(Timeline)`
  .media-timeline-value-line {
    background-color: red;
    width: 5px;
  }
`;
```

#### Tick-time labels

```
const StyledTimeline = styled(Timeline)`
  .media-timeline-tick-time {
    color: red;
  }
`;
```

#### Tick-time/Value bar container

```
const StyledTimeline = styled(Timeline)`
  .media-timeline-value-line-canvas {
    color: red;
  }
`;
```

#### Range selector

```
const StyledTimeline = styled(Timeline)`
  .media-timeline-range-selector-canvas {
    color: red;
  }
`;
```
