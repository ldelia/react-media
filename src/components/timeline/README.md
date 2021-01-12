# TimeLine

<!-- STORY -->

<hr>

A component for displaying the duration of a media file (mp3, mp4, etc.) and the current reproduction position. It also allows selecting a range for reproduction looping purposes.

## Import

```js
import { TimeLine } from 'library-name';
```

## Usage

```jsx
<TimeLine duration={301} value={15} onChange={() => 'Do something'} onRangeChange={() => 'Do something'} />
```

##### Required props

| Name       | Type   | Description                 |
| ---------- | ------ | --------------------------- |
| `duration` | `number` | The media file duration |
| `value` | `number` | The current reproduction position |

##### Optional props

| Name         | Type       | Default    | Description               |
| ------------ | ---------- | ---------- | ------------------------- |
| `onChange`   | `function` | `() => {}` | Fired when the user double-clicks on the timeline |
| `onRangeChange`   | `function`  | `() => {}`    | Fired when the user select a range in the timeline |
| `selectedRange`       | `array`   | `[]`   | The current selected range |
| `zoomLevel`      | `number`   | `0`   | `The current timeline zoom level` |

## Customization

#### Timeline widget
``` 
const StyledTimeLine = styled(TimeLine)`
    background-color: green;
`;
``` 

#### Value bar
``` 
const StyledTimeLine = styled(TimeLine)`
  .media-timeline-value-line {
    color: red;
  }
`;
``` 

#### Tick-time labels
``` 
const StyledTimeLine = styled(TimeLine)`
  .media-timeline-tick-time {
    color: red;
  }
`;
``` 

#### Range selector
``` 
const StyledTimeLine = styled(TimeLine)`
  .media-timeline-range-selector-canvas {
    color: red;
  }
`;
``` 
